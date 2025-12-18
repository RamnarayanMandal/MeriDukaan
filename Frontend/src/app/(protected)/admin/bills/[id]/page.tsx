"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useBill, useUpdateBill } from "@/hooks/useBills";
import { useProducts } from "@/hooks/useProducts";
import { useShop } from "@/hooks/useShop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Save, Printer } from "lucide-react";
import { CreateBillItem } from "@/types/bill";
import { Product } from "@/types/product";
import { useFormik } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";

const billSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerAddress: z.string().optional(),
  customerPhone: z.string().optional(),
  billDate: z.string().min(1, "Bill date is required"),
  items: z.array(z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
    rate: z.number().min(0, "Rate must be 0 or greater"),
  })).min(1, "At least one item is required"),
  tax: z.number().min(0).max(100).optional(),
});

export default function EditBillPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: bill, isLoading } = useBill(id);
  const { data: shop } = useShop();
  const { data: productsData } = useProducts(
    shop
      ? {
          shopId: shop._id,
          page: 1,
          limit: 1000,
        }
      : undefined
  );
  const products = productsData?.items || [];
  const updateBill = useUpdateBill();

  const formik = useFormik({
    initialValues: {
      customerName: "",
      customerAddress: "",
      customerPhone: "",
      billDate: new Date().toISOString().split("T")[0],
      tax: 0,
      items: [] as CreateBillItem[],
    },
    validationSchema: toFormikValidationSchema(billSchema),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        // Filter out empty items before submitting
        const validItems = values.items.filter(item => item.productId && item.quantity > 0);
        if (validItems.length === 0) {
          formik.setFieldError("items", "At least one item is required");
          return;
        }
        
        if (!shop?._id) {
          return;
        }

        // inventory-aware validation: ensure sufficient stock on client
        for (const item of validItems) {
          const product = products.find((p: Product) => p._id === item.productId);
          if (product && item.quantity > product.stockQty) {
            formik.setFieldError(
              "items",
              `Insufficient stock for ${product.name}. Available: ${product.stockQty} ${product.unit}`
            );
            return;
          }
        }

        await updateBill.mutateAsync({
          id,
          data: {
            customerName: values.customerName,
            customerAddress: values.customerAddress,
            customerPhone: values.customerPhone,
            billDate: values.billDate,
            tax: values.tax,
            items: validItems,
            // @ts-expect-error backend expects shopId
            shopId: shop._id,
          },
        });
        router.push("/admin/bills");
      } catch (error) {
        // Error handled by hook
      }
    },
  });

  useEffect(() => {
    if (bill) {
      // Convert bill items to CreateBillItem format
      const billItems: CreateBillItem[] = bill.items.map((item: any) => ({
        productId: typeof item.product === "string" ? item.product : item.product?._id || "",
        quantity: item.quantity,
        rate: item.rate,
      }));

      formik.setValues({
        customerName: bill.customerName,
        customerAddress: bill.customerAddress || "",
        customerPhone: bill.customerPhone || "",
        billDate: bill.billDate.split("T")[0],
        tax: 0, // Tax is calculated separately
        items: billItems.length > 0 ? billItems : [{ productId: "", quantity: 0, rate: 0 }],
      });
    }
  }, [bill]);

  const items = formik.values.items;

  const addItem = () => {
    formik.setFieldValue("items", [...items, { productId: "", quantity: 0, rate: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      formik.setFieldValue("items", items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof CreateBillItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill rate when product is selected
    if (field === "productId" && value) {
      const product = products?.find((p: Product) => p._id === value);
      if (product) {
        newItems[index].rate = product.price;
      }
    }
    
    formik.setFieldValue("items", newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      return sum + (item.quantity * item.rate);
    }, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return (subtotal * (formik.values.tax || 0)) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Bill not found</p>
            <Button className="mt-4" onClick={() => router.push("/admin/bills")}>
              Back to Bills
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/bills/${id}/print`)}
        >
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      <form onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bill #{bill.billNumber}</CardTitle>
                <CardDescription>Edit bill details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={formik.values.customerName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter customer name"
                  />
                  {formik.touched.customerName && formik.errors.customerName && (
                    <p className="text-sm text-red-500">{formik.errors.customerName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerAddress">Address</Label>
                  <Input
                    id="customerAddress"
                    name="customerAddress"
                    value={formik.values.customerAddress}
                    onChange={formik.handleChange}
                    placeholder="Enter customer address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone</Label>
                    <Input
                      id="customerPhone"
                      name="customerPhone"
                      value={formik.values.customerPhone}
                      onChange={formik.handleChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billDate">Bill Date *</Label>
                    <Input
                      id="billDate"
                      name="billDate"
                      type="date"
                      value={formik.values.billDate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.billDate && formik.errors.billDate && (
                      <p className="text-sm text-red-500">{formik.errors.billDate}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Items</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5 space-y-2">
                      <Label>Product *</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(value) => updateItem(index, "productId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.map((product: Product) => (
                            <SelectItem key={product._id} value={product._id}>
                              {product.name} ({product.stockQty} {product.unit} in stock)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.quantity || ""}
                        onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                        placeholder="Qty"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Rate *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.rate || ""}
                        onChange={(e) => updateItem(index, "rate", parseFloat(e.target.value) || 0)}
                        placeholder="Rate"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        value={(item.quantity * item.rate).toFixed(2)}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tax">Tax (%)</Label>
                  <Input
                    id="tax"
                    name="tax"
                    type="number"
                    step="0.01"
                    value={formik.values.tax || 0}
                    onChange={formik.handleChange}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  {formik.values.tax && formik.values.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax ({formik.values.tax}%):</span>
                      <span className="font-semibold">₹{calculateTax().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-blue-600">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateBill.isPending || items.length === 0 || !items.some(item => item.productId)}
                >
                  {updateBill.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Bill
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
