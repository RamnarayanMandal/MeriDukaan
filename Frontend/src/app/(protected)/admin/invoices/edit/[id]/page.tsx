"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import { productService } from "@/service/productService";
import { useProducts } from "@/hooks/useProducts";
import { useServices } from "@/hooks/useServices";
import { useInvoice, useUpdateInvoice } from "@/hooks/useInvoices";
import QRScanner from "@/components/scanner/QRScanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { ArrowLeft, Save, Plus, Trash2, ScanLine } from "lucide-react";
import { showError, showSuccess } from "@/lib/sweetAlert";
import Swal from "sweetalert2";
import { useSettings } from "@/context/ShopSettingsContext";

const invoiceSchema = Yup.object().shape({
  customerName: Yup.string().required("Required"),
  customerPhone: Yup.string().matches(/^[6-9]\d{9}$/, "Invalid phone number").required("Required"),
  vehicleModel: Yup.string(),
  items: Yup.array().of(
    Yup.object().shape({
      itemType: Yup.string().oneOf(['product', 'service', 'manual']).required("Required"),
      name: Yup.string().required("Required"),
      quantity: Yup.number().min(0.1, "Min 0.1").required("Required"),
      rate: Yup.number().min(0, "Min 0").required("Required"),
    })
  ).min(1, "At least one item is required"),
  discount: Yup.number().min(0).default(0),
  gstRate: Yup.number().min(0).default(0),
  paymentStatus: Yup.string().oneOf(['pending', 'paid', 'partial']).default('pending'),
  amountPaid: Yup.number().min(0).when('paymentStatus', {
    is: 'partial',
    then: (schema) => schema.required('Required for partial payment'),
    otherwise: (schema) => schema.optional()
  }),
});

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [showScanner, setShowScanner] = useState(false);
  const { data: invoice, isLoading: isInvoiceLoading } = useInvoice(invoiceId);
  const updateInvoice = useUpdateInvoice();

  const { settings, isLoading: isSettingsLoading } = useSettings();
  const { data: productsData } = useProducts({ limit: 1000 });
  const { data: servicesData } = useServices({ limit: 100 });

  const shopId = settings?.shopId || "";

  const formik = useFormik({
    initialValues: {
      customerName: "",
      customerPhone: "",
      vehicleModel: "",
      items: [{ itemType: "manual" as any, name: "", quantity: 1, rate: 0, amount: 0 }],
      discount: 0,
      gstRate: 0,
      paymentStatus: "paid" as any,
      amountPaid: 0,
    },
    validationSchema: invoiceSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await updateInvoice.mutateAsync({ id: invoiceId, data: values as any });
        showSuccess("Invoice updated successfully");
        router.push(`/admin/invoices/${invoiceId}`);
      } catch (error) {
        showError("Failed to update invoice");
      }
    },
  });

  // Populate form when invoice data loads
  useEffect(() => {
    if (invoice) {
      formik.setValues({
        customerName: invoice.customerName,
        customerPhone: invoice.customerPhone,
        vehicleModel: invoice.vehicleModel || "",
        items: invoice.items.map(item => ({
          itemType: item.itemType,
          name: item.name,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          productId: item.productId,
          serviceId: item.serviceId
        })),
        discount: invoice.discount,
        gstRate: invoice.gstRate,
        paymentStatus: invoice.paymentStatus,
        amountPaid: Number(invoice.amountPaid) || 0,
      });
    }
  }, [invoice]);

  const [isProcessing, setIsProcessing] = useState(false);
  const lastScan = useRef<string>("");
  const lastScanTime = useRef<number>(0);

  const handleScan = async (decodedText: string) => {
    if (!shopId || isProcessing) return;
    if (lastScan.current === decodedText && Date.now() - lastScanTime.current < 500) return;

    lastScan.current = decodedText;
    lastScanTime.current = Date.now();
    setIsProcessing(true);

    try {
      const foundProduct = await productService.getProductByBarcode(decodedText, shopId as any);
      if (foundProduct) {
        const items = [...formik.values.items];
        if (items.length === 1 && items[0].itemType === "manual" && !items[0].name && items[0].rate === 0) {
          items.pop();
        }

        const existingIdx = items.findIndex((i: any) => i.productId === foundProduct._id);
        if (existingIdx >= 0) {
          items[existingIdx].quantity += 1;
        } else {
          items.push({
            itemType: "product",
            productId: foundProduct._id,
            name: foundProduct.name,
            quantity: 1,
            rate: foundProduct.price,
            amount: foundProduct.price
          } as any);
        }
        formik.setFieldValue("items", items);
        showSuccess(`Added: ${foundProduct.name}`);
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        Swal.fire({ title: 'Not Found', text: `Scanned code: ${decodedText} not found.`, icon: 'info' });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  useBarcodeScanner(handleScan);

  const isLoading = isInvoiceLoading || isSettingsLoading;

  if (isLoading) return <div className="p-12 text-center">Loading Invoice Data...</div>;
  if (!invoice) return <div className="p-12 text-center text-red-500">Invoice not found</div>;

  const subtotal = formik.values.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const discount = Number(formik.values.discount) || 0;
  const afterDiscount = subtotal - discount;
  const gstAmount = (afterDiscount * (Number(formik.values.gstRate) || 0)) / 100;
  const grandTotal = Math.round(afterDiscount + gstAmount);

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Invoice #{invoice.invoiceNumber}</h1>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader><CardTitle>Customer Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Customer Name *</Label>
                    <Input name="customerName" value={formik.values.customerName} onChange={formik.handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input name="customerPhone" value={formik.values.customerPhone} onChange={formik.handleChange} maxLength={10} />
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicle Model</Label>
                    <Input name="vehicleModel" value={formik.values.vehicleModel} onChange={formik.handleChange} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Payment Status</CardTitle></CardHeader>
                <CardContent>
                  <Select value={formik.values.paymentStatus} onValueChange={(val) => formik.setFieldValue("paymentStatus", val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Invoice Items</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowScanner(true)}>
                    <ScanLine className="h-4 w-4 mr-2" /> Scan Barcode
                  </Button>
                </CardHeader>
                <CardContent>
                  <FieldArray name="items">
                    {({ push, remove }) => (
                      <div className="space-y-4">
                        <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b">
                          <div className="col-span-2">Type</div>
                          <div className="col-span-4">Item</div>
                          <div className="col-span-2">Qty</div>
                          <div className="col-span-2">Rate</div>
                          <div className="col-span-2 text-right">Amt</div>
                        </div>

                        {formik.values.items.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-2">
                              <Select value={item.itemType} onValueChange={(val) => {
                                formik.setFieldValue(`items.${index}.itemType`, val);
                                formik.setFieldValue(`items.${index}.name`, "");
                                formik.setFieldValue(`items.${index}.rate`, 0);
                              }}>
                                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="manual">Manual</SelectItem>
                                  <SelectItem value="product">Product</SelectItem>
                                  <SelectItem value="service">Service</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="col-span-4">
                              {item.itemType === 'manual' ? (
                                <Input className="h-9" name={`items.${index}.name`} value={item.name} onChange={formik.handleChange} />
                              ) : item.itemType === 'product' ? (
                                <Select value={(item as any).productId || ""} onValueChange={(val) => {
                                  const p = productsData?.items?.find((x: any) => x._id === val);
                                  if (p) {
                                    formik.setFieldValue(`items.${index}.productId`, p._id);
                                    formik.setFieldValue(`items.${index}.name`, p.name);
                                    formik.setFieldValue(`items.${index}.rate`, p.price);
                                  }
                                }}>
                                  <SelectTrigger className="h-9"><SelectValue placeholder="Select product" /></SelectTrigger>
                                  <SelectContent>
                                    {productsData?.items?.map((p: any) => (
                                      <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Select value={(item as any).serviceId || ""} onValueChange={(val) => {
                                  const s = servicesData?.services?.find((x: any) => x._id === val);
                                  if (s) {
                                    formik.setFieldValue(`items.${index}.serviceId`, s._id);
                                    formik.setFieldValue(`items.${index}.name`, s.name);
                                    formik.setFieldValue(`items.${index}.rate`, s.basePrice);
                                  }
                                }}>
                                  <SelectTrigger className="h-9"><SelectValue placeholder="Select service" /></SelectTrigger>
                                  <SelectContent>
                                    {servicesData?.services?.map((s: any) => (
                                      <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>

                            <div className="col-span-2"><Input type="number" className="h-9" name={`items.${index}.quantity`} value={item.quantity} onChange={formik.handleChange} /></div>
                            <div className="col-span-2"><Input type="number" className="h-9" name={`items.${index}.rate`} value={item.rate} onChange={formik.handleChange} /></div>
                            <div className="col-span-2 flex items-center justify-between">
                              <span className="font-bold">₹{(item.quantity * item.rate).toFixed(0)}</span>
                              <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-red-500 h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        ))}

                        <Button type="button" variant="outline" size="sm" onClick={() => push({ itemType: "manual", name: "", quantity: 1, rate: 0, amount: 0 })}>
                          <Plus className="h-4 w-4 mr-1" /> Add Item
                        </Button>
                      </div>
                    )}
                  </FieldArray>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="w-full max-w-xs ml-auto space-y-3">
                    <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">₹{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span>Discount</span><Input type="number" name="discount" value={formik.values.discount} onChange={formik.handleChange} className="w-24 h-8 text-right" /></div>
                    <div className="flex justify-between items-center">
                      <span>GST (%)</span>
                      <Select value={formik.values.gstRate.toString()} onValueChange={(val) => formik.setFieldValue("gstRate", Number(val))}>
                        <SelectTrigger className="w-24 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[0, 5, 12, 18].map(r => <SelectItem key={r} value={r.toString()}>{r}%</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="text-lg font-bold">Grand Total</span>
                      <span className="text-xl font-bold text-blue-700">₹{grandTotal.toFixed(2)}</span>
                    </div>

                    {formik.values.paymentStatus === 'partial' && (
                      <div className="flex justify-between items-center pt-2">
                        <span>Amount Paid</span>
                        <Input type="number" name="amountPaid" value={formik.values.amountPaid} onChange={formik.handleChange} className="w-24 h-8 text-right" />
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={updateInvoice.isPending} className="text-white shadow-md" style={{ backgroundColor: settings?.themeColors?.primary || '#2563eb' }}>
                      {updateInvoice.isPending ? "Updating..." : "Update Invoice"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </FormikProvider>

      {showScanner && (
        <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
