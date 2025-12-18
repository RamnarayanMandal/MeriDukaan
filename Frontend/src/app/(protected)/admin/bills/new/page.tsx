"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBill } from "@/hooks/useBills";
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
import { ArrowLeft, Plus, Trash2, Save, Receipt } from "lucide-react";
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

export default function NewBillPage() {
  const router = useRouter();
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
  const createBill = useCreateBill();

  const formik = useFormik({
    initialValues: {
      customerName: "",
      customerAddress: "",
      customerPhone: "",
      billDate: new Date().toISOString().split("T")[0],
      tax: 0,
      items: [{ productId: "", quantity: 0, rate: 0 }] as CreateBillItem[],
    },
    validationSchema: toFormikValidationSchema(billSchema),
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

        await createBill.mutateAsync({
          customerName: values.customerName,
          customerAddress: values.customerAddress,
          customerPhone: values.customerPhone,
          billDate: values.billDate,
          tax: values.tax,
          items: validItems,
          // @ts-expect-error backend expects shopId
          shopId: shop._id,
        });
        router.push("/admin/bills");
      } catch (error) {
        // Error handled by hook
      }
    },
  });

  // Use formik values for items - declared after formik initialization
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <form onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
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
                  disabled={createBill.isPending || items.length === 0 || !items.some(item => item.productId)}
                >
                  {createBill.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Bill
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
