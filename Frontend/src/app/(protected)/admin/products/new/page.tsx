"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateProduct, useProducts } from "@/hooks/useProducts";
import { useAllShops } from "@/hooks/useShop";
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
import { ScanLine, ArrowLeft, Save } from "lucide-react";
import QRScanner from "@/components/scanner/QRScanner";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { productService } from "@/service/productService";
import { showError, showSuccess, showInfo } from "@/lib/sweetAlert";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProductCategory, ProductUnit } from "@/types/product";
import { ImageUpload, UploadedImage } from "@/components/common/ImageUpload";

const DEFAULT_CATEGORIES = [
  ProductCategory.TILES,
  ProductCategory.MARBLE,
  ProductCategory.GRANITE,
  ProductCategory.ACCESSORIES,
];

const productSchema = z.object({
  shopId: z.string().min(1, "Please select a shop"),
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Product category is required"),
  barcode: z.string().min(1, "Barcode is required"),
  brand: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().min(0, "Price must be 0 or greater"),
  stockQty: z.number().min(0, "Stock quantity must be 0 or greater").default(0),
  unit: z.nativeEnum(ProductUnit),
  description: z.string().optional(),
  gstRate: z.number().min(0).default(0),
});

type ProductValues = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const { data: shops } = useAllShops();
  const { data: productsData } = useProducts({ limit: 1000 });
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...(productsData?.items?.map(p => p.category) || [])])).sort();

  const [categoryInput, setCategoryInput] = useState<string>("");
  const [showCategoryInput, setShowCategoryInput] = useState<boolean>(false);
  const [showScanner, setShowScanner] = useState(false);
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<ProductValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: { shopId: "", name: "", category: DEFAULT_CATEGORIES[0], barcode: "", brand: "", sku: "", price: 0, stockQty: 0, unit: ProductUnit.PIECE, description: "", gstRate: 0 }
  });

  const shopId = watch("shopId");

  useEffect(() => {
    if (shops?.length && !shopId) setValue("shopId", shops[0]._id);
  }, [shops, setValue, shopId]);

  const handleBarcodeScan = async (barcode: string) => {
    if (!shopId) { showError("Please select a shop first"); return; }
    try {
      const product = await productService.getProductByBarcode(barcode, shopId);
      if (product) {
        setValue("name", product.name); setValue("category", product.category);
        setValue("brand", product.brand || ""); setValue("barcode", barcode);
        setValue("sku", product.sku || ""); setValue("description", product.description || "");
        setValue("price", product.price || 0); setValue("unit", product.unit || ProductUnit.PIECE);
        setValue("gstRate", product.gstRate || 0);
        showSuccess(`Auto-filled: ${product.name}`);
      }
    } catch (error: any) {
      setValue("barcode", barcode);
      if (error?.response?.status === 404) showInfo("New Product", "Barcode not found. Enter details manually.");
    } finally { setShowScanner(false); }
  };

  useBarcodeScanner(handleBarcodeScan);

  const onSubmit = async (values: ProductValues) => {
    const images = productImages.map((img, i) => ({ fileId: img.public_id, url: img.url, isThumbnail: i === 0 }));
    await createProduct.mutateAsync({ ...values, images, thumbnailImage: images[0] });
    showSuccess("Product Created"); router.push("/admin/products");
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
          <div><CardTitle className="text-2xl font-bold">Add New Product</CardTitle></div>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowScanner(true)}><ScanLine className="h-4 w-4 mr-2" /> Scan Barcode</Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2"><Label>Shop *</Label>
                <Controller name="shopId" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select a shop" /></SelectTrigger>
                    <SelectContent>{shops?.map(s => <SelectItem key={s._id} value={s._id}>{s.shopName}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
                {errors.shopId && <p className="text-xs text-red-500">{errors.shopId.message}</p>}
              </div>
              <div className="space-y-2"><Label>Barcode *</Label><div className="relative"><Input {...register("barcode")} className="pr-10" /><ScanLine className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /></div></div>
            </div>
            <div className="space-y-2"><Label>Product Name *</Label><Input {...register("name")} />{errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}</div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2"><Label>Brand</Label><Input {...register("brand")} /></div>
              <div className="space-y-2"><Label>Category *</Label>
                {showCategoryInput ? (
                  <Input value={categoryInput} onChange={(e) => { setCategoryInput(e.target.value); setValue("category", e.target.value); }} onBlur={() => { if (!categoryInput.trim()) setShowCategoryInput(false); }} autoFocus />
                ) : (
                  <Controller name="category" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={(v) => v === "__NEW__" ? setShowCategoryInput(true) : field.onChange(v)}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>{allCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}<SelectItem value="__NEW__" className="text-blue-600 font-bold">+ Add New</SelectItem></SelectContent>
                    </Select>
                  )} />
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2"><Label>Price *</Label><Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} /></div>
              <div className="space-y-2"><Label>Stock *</Label><Input type="number" {...register("stockQty", { valueAsNumber: true })} /></div>
              <div className="space-y-2"><Label>Unit *</Label>
                <Controller name="unit" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.values(ProductUnit).map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <ImageUpload label="Product Images" value={productImages.map(i => i.url)} onChange={() => { }} onUploadComplete={(d) => setProductImages(p => [...p, ...(Array.isArray(d) ? d : [d])])} multiple />
            <div className="space-y-2"><Label>Description</Label><Textarea {...register("description")} /></div>
            <div className="flex justify-end gap-4 pt-6 border-t"><Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button><Button type="submit" disabled={createProduct.isPending}>{createProduct.isPending ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Product</>}</Button></div>
          </form>
        </CardContent>
      </Card>
      {showScanner && <QRScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />}
    </div>
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm" />
}
