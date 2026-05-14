"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import { productService } from "@/service/productService";
import { useProducts } from "@/hooks/useProducts";
import { useServices } from "@/hooks/useServices";
import { useCreateInvoice } from "@/hooks/useInvoices";
import QRScanner from "@/components/scanner/QRScanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShop } from "@/hooks/useShop";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { ArrowLeft, Save, Plus, Trash2, ScanLine, Keyboard } from "lucide-react";
import { showError, showSuccess } from "@/lib/sweetAlert";
import Swal from "sweetalert2";

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

export default function NewInvoicePage() {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);
  const createInvoice = useCreateInvoice();

  const { data: shop } = useShop();
  const { data: productsData } = useProducts({ limit: 1000 });
  const { data: servicesData } = useServices({ limit: 100 });

  const shopId = shop?._id || "";

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
    onSubmit: async (values) => {
      try {
        await createInvoice.mutateAsync({ ...values, shopId } as any);
        showSuccess("Invoice created successfully");
        router.push("/admin/invoices");
      } catch (error) {
        showError("Failed to create invoice");
      }
    },
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const lastScan = useRef<string>("");
  const lastScanTime = useRef<number>(0);

  const handleScan = async (decodedText: string) => {
    console.log("Barcode Scanned:", decodedText, "ShopId:", shopId);
    
    if (!shopId) {
      showError("Wait", "Shop data is still loading...");
      return;
    }

    // Prevent multiple simultaneous processing
    if (isProcessing) return;

    // Debounce duplicate scans within 500ms
    if (lastScan.current === decodedText && Date.now() - lastScanTime.current < 500) {
      return;
    }
    
    lastScan.current = decodedText;
    lastScanTime.current = Date.now();
    setIsProcessing(true);

    try {
      // Fetch product by barcode via API
      const foundProduct = await productService.getProductByBarcode(decodedText, shopId);
      
      if (foundProduct) {
        // Play success beep
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        } catch (e) {}

        const items = [...formik.values.items];
        
        // Remove the empty manual row if it's the only one and untouched
        if (items.length === 1 && items[0].itemType === "manual" && !items[0].name && items[0].rate === 0) {
          items.pop();
        }

        const existingIdx = items.findIndex((i: any) => i.productId === foundProduct._id);
        
        if (existingIdx >= 0) {
          // Auto increment quantity
          items[existingIdx].quantity += 1;
          showSuccess(`Increased ${foundProduct.name} quantity`);
        } else {
          // Add new product
          items.push({
            itemType: "product",
            productId: foundProduct._id,
            name: foundProduct.name,
            quantity: 1,
            rate: foundProduct.price,
            amount: foundProduct.price
          } as any);

          if (foundProduct.isDraftProduct) {
            showSuccess(`Imported: ${foundProduct.name}`, "Verify price before saving");
          } else {
            showSuccess(`Added: ${foundProduct.name}`);
          }
        }
        
        formik.setFieldValue("items", items);
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        // Show a more prominent alert for missing products so user knows scanning worked
        Swal.fire({
          title: 'Not Found',
          text: `Scanned code: ${decodedText}. This product is not in your inventory or global database.`,
          icon: 'info',
          confirmButtonText: 'OK'
        });
      } else {
        showError("Server Error", "Failed to fetch product details");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // USB Barcode Scanner Hook
  useBarcodeScanner((barcode) => {
    handleScan(barcode);
  });

  // Keyboard shortcut Ctrl+S to save
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        formik.handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [formik]);

  const calculateSubtotal = () => {
    return formik.values.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  };

  const subtotal = calculateSubtotal();
  const discount = Number(formik.values.discount) || 0;
  const afterDiscount = subtotal - discount;
  const gstAmount = (afterDiscount * (Number(formik.values.gstRate) || 0)) / 100;
  const grandTotal = Math.round(afterDiscount + gstAmount);

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Customer & Settings */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Customer Name *</Label>
                    <Input
                      name="customerName"
                      value={formik.values.customerName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.customerName && formik.errors.customerName && (
                      <p className="text-sm text-red-500">{formik.errors.customerName as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input
                      name="customerPhone"
                      value={formik.values.customerPhone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      maxLength={10}
                    />
                    {formik.touched.customerPhone && formik.errors.customerPhone && (
                      <p className="text-sm text-red-500">{formik.errors.customerPhone as string}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicle Model (Optional)</Label>
                    <Input
                      name="vehicleModel"
                      value={formik.values.vehicleModel}
                      onChange={formik.handleChange}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={formik.values.paymentStatus}
                    onValueChange={(val) => formik.setFieldValue("paymentStatus", val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Invoice Items & Totals */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Invoice Items</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Input
                        placeholder="Manual Barcode"
                        className="w-40 h-8 text-xs pr-8"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleScan((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <ScanLine className="h-3 w-3 absolute right-2 top-2.5 text-gray-400" />
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowScanner(true)}>
                      <ScanLine className="h-4 w-4 mr-2" />
                      Camera Scan
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <FieldArray name="items">
                    {({ push, remove }) => (
                      <div className="space-y-4">
                        <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-gray-500 pb-2 border-b">
                          <div className="col-span-2">Type</div>
                          <div className="col-span-4">Item Name</div>
                          <div className="col-span-2">Qty</div>
                          <div className="col-span-2">Rate</div>
                          <div className="col-span-1">Amt</div>
                          <div className="col-span-1"></div>
                        </div>

                        {formik.values.items.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 items-center">
                            
                            {/* Item Type */}
                            <div className="col-span-2">
                              <Select
                                value={item.itemType}
                                onValueChange={(val) => {
                                  formik.setFieldValue(`items.${index}.itemType`, val);
                                  formik.setFieldValue(`items.${index}.name`, "");
                                  formik.setFieldValue(`items.${index}.rate`, 0);
                                  formik.setFieldValue(`items.${index}.productId`, undefined);
                                  formik.setFieldValue(`items.${index}.serviceId`, undefined);
                                }}
                              >
                                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="manual">Manual</SelectItem>
                                  <SelectItem value="product">Product</SelectItem>
                                  <SelectItem value="service">Service</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Item Name / Selection */}
                            <div className="col-span-4">
                              {item.itemType === 'manual' && (
                                <Input
                                  className="h-9"
                                  name={`items.${index}.name`}
                                  value={item.name}
                                  onChange={formik.handleChange}
                                  placeholder="Enter name"
                                />
                              )}
                              {item.itemType === 'product' && (
                                <Select
                                  value={(item as any).productId || ""}
                                  onValueChange={(val) => {
                                    const p = productsData?.items?.find((x: any) => x._id === val);
                                    if (p) {
                                      formik.setFieldValue(`items.${index}.productId`, p._id);
                                      formik.setFieldValue(`items.${index}.name`, p.name);
                                      formik.setFieldValue(`items.${index}.rate`, p.price);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-9"><SelectValue placeholder="Select product" /></SelectTrigger>
                                  <SelectContent>
                                    {productsData?.items?.map((p: any) => (
                                      <SelectItem key={p._id} value={p._id}>{p.name} ({p.stockQty} in stock)</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              {item.itemType === 'service' && (
                                <Select
                                  value={(item as any).serviceId || ""}
                                  onValueChange={(val) => {
                                    const s = servicesData?.services?.find((x: any) => x._id === val);
                                    if (s) {
                                      formik.setFieldValue(`items.${index}.serviceId`, s._id);
                                      formik.setFieldValue(`items.${index}.name`, s.name);
                                      formik.setFieldValue(`items.${index}.rate`, s.basePrice);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-9"><SelectValue placeholder="Select service" /></SelectTrigger>
                                  <SelectContent>
                                    {servicesData?.services?.map((s: any) => (
                                      <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>

                            {/* Quantity */}
                            <div className="col-span-2">
                              <Input
                                type="number"
                                className="h-9"
                                name={`items.${index}.quantity`}
                                value={item.quantity}
                                onChange={formik.handleChange}
                              />
                            </div>

                            {/* Rate */}
                            <div className="col-span-2">
                              <Input
                                type="number"
                                className="h-9"
                                name={`items.${index}.rate`}
                                value={item.rate}
                                onChange={formik.handleChange}
                              />
                            </div>

                            {/* Amount */}
                            <div className="col-span-1 font-medium text-sm">
                              ₹{(item.quantity * item.rate).toFixed(2)}
                            </div>

                            {/* Remove */}
                            <div className="col-span-1 text-right">
                              <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-red-500 p-0 h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                          onClick={() => push({ itemType: "manual", name: "", quantity: 1, rate: 0, amount: 0 })}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Row
                        </Button>
                        {typeof formik.errors.items === 'string' && (
                           <p className="text-sm text-red-500">{formik.errors.items}</p>
                        )}
                      </div>
                    )}
                  </FieldArray>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="w-full max-w-xs ml-auto space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Discount (₹)</span>
                      <Input
                        type="number"
                        name="discount"
                        value={formik.values.discount}
                        onChange={formik.handleChange}
                        className="w-24 h-8 text-right"
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">GST Rate (%)</span>
                      <Select
                        value={formik.values.gstRate.toString()}
                        onValueChange={(val) => formik.setFieldValue("gstRate", Number(val))}
                      >
                        <SelectTrigger className="w-24 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="12">12%</SelectItem>
                          <SelectItem value="18">18%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>GST Amount</span>
                      <span>₹{gstAmount.toFixed(2)}</span>
                    </div>

                    <div className="pt-3 border-t space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Payment Status</span>
                        <Select
                          value={formik.values.paymentStatus}
                          onValueChange={(val) => {
                            formik.setFieldValue("paymentStatus", val);
                            if (val === 'paid') formik.setFieldValue("amountPaid", grandTotal);
                            if (val === 'pending') formik.setFieldValue("amountPaid", 0);
                          }}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="partial">Partial</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formik.values.paymentStatus === 'partial' && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Amount Paid (₹)</span>
                          <Input
                            type="number"
                            name="amountPaid"
                            value={formik.values.amountPaid}
                            onChange={formik.handleChange}
                            className="w-24 h-8 text-right"
                          />
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-bold">Grand Total</span>
                        <span className="text-xl font-bold text-blue-700">₹{grandTotal.toFixed(2)}</span>
                      </div>

                      {formik.values.paymentStatus === 'partial' && (
                        <div className="flex justify-between items-center text-red-600 font-medium pt-1">
                          <span>Remaining Balance</span>
                          <span>₹{(grandTotal - formik.values.amountPaid).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={createInvoice.isPending} className="bg-blue-600 hover:bg-blue-700">
                      {createInvoice.isPending ? "Generating..." : "Generate Invoice"}
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
