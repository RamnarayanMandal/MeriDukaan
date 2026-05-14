"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateBill } from "@/hooks/useBills";
import { useProducts } from "@/hooks/useProducts";
import { useShop } from "@/hooks/useShop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { CreateBillItem } from "@/types/bill";
import { Product } from "@/types/product";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

type BillValues = z.infer<typeof billSchema>;

export default function NewBillPage() {
  const router = useRouter();
  const { data: shop } = useShop();
  const { data: productsData } = useProducts(shop ? { shopId: shop._id, page: 1, limit: 1000 } : undefined);
  const products = productsData?.items || [];
  const createBill = useCreateBill();

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<BillValues>({
    resolver: zodResolver(billSchema) as any,
    defaultValues: {
      customerName: "", customerAddress: "", customerPhone: "",
      billDate: new Date().toISOString().split("T")[0],
      tax: 0, items: [{ productId: "", quantity: 0, rate: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");
  const watchedTax = watch("tax");

  const onSubmit = async (values: BillValues) => {
    if (!shop?._id) return;
    const validItems = values.items.filter(item => item.productId && item.quantity > 0);
    await createBill.mutateAsync({ ...values, items: validItems, shopId: shop._id as any });
    router.push("/admin/bills");
  };

  const calculateSubtotal = () => watchedItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const calculateTax = () => (calculateSubtotal() * (watchedTax || 0)) / 100;
  const calculateTotal = () => calculateSubtotal() + calculateTax();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>Customer Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Customer Name *</Label><Input {...register("customerName")} /><p className="text-xs text-red-500">{errors.customerName?.message}</p></div>
                <div className="space-y-2"><Label>Address</Label><Input {...register("customerAddress")} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Phone</Label><Input {...register("customerPhone")} /></div>
                  <div className="space-y-2"><Label>Bill Date *</Label><Input type="date" {...register("billDate")} /></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between items-center flex-row"><CardTitle>Items</CardTitle><Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", quantity: 0, rate: 0 })}><Plus className="h-4 w-4 mr-2" />Add Item</Button></CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5 space-y-2">
                      <Label>Product *</Label>
                      <Controller name={`items.${index}.productId`} control={control} render={({ field }) => (
                        <Select value={field.value} onValueChange={(val) => { field.onChange(val); const p = products.find(p => p._id === val); if (p) setValue(`items.${index}.rate`, p.price); }}>
                          <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                          <SelectContent>{products.map(p => <SelectItem key={p._id} value={p._id}>{p.name} ({p.stockQty} in stock)</SelectItem>)}</SelectContent>
                        </Select>
                      )} />
                    </div>
                    <div className="col-span-2 space-y-2"><Label>Qty</Label><Input type="number" step="0.01" {...register(`items.${index}.quantity`, { valueAsNumber: true })} /></div>
                    <div className="col-span-2 space-y-2"><Label>Rate</Label><Input type="number" step="0.01" {...register(`items.${index}.rate`, { valueAsNumber: true })} /></div>
                    <div className="col-span-2 space-y-2"><Label>Amount</Label><Input value={(watchedItems[index].quantity * watchedItems[index].rate).toFixed(2)} disabled className="bg-gray-50" /></div>
                    <div className="col-span-1"><Button type="button" variant="outline" size="sm" onClick={() => remove(index)} disabled={fields.length === 1}><Trash2 className="h-4 w-4" /></Button></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="h-fit">
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Tax (%)</Label><Input type="number" {...register("tax", { valueAsNumber: true })} /></div>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between"><span>Subtotal:</span><span className="font-semibold">₹{calculateSubtotal().toFixed(2)}</span></div>
                {watchedTax > 0 && <div className="flex justify-between"><span>Tax ({watchedTax}%):</span><span className="font-semibold">₹{calculateTax().toFixed(2)}</span></div>}
                <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>Total:</span><span className="text-blue-600">₹{calculateTotal().toFixed(2)}</span></div>
              </div>
              <Button type="submit" className="w-full" disabled={createBill.isPending}><Save className="h-4 w-4 mr-2" />{createBill.isPending ? "Creating..." : "Create Bill"}</Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
