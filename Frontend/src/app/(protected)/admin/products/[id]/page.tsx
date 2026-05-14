"use client";

import { useRouter, useParams } from "next/navigation";
import { useProduct, useUpdateProduct, useProducts } from "@/hooks/useProducts";
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
import { ArrowLeft, Save } from "lucide-react";
import axiosClient from "@/lib/axiosClient";
import { ProductImage, ProductCategory, ProductUnit } from "@/types/product";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";

const DEFAULT_CATEGORIES = [
  ProductCategory.TILES,
  ProductCategory.MARBLE,
  ProductCategory.GRANITE,
  ProductCategory.ACCESSORIES,
];

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Product category is required"),
  productCode: z.string().optional(),
  price: z.number().min(0, "Price must be 0 or greater"),
  stockQty: z.number().min(0, "Stock quantity must be 0 or greater").default(0),
  unit: z.nativeEnum(ProductUnit),
  description: z.string().optional(),
});

type ProductValues = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: product, isLoading } = useProduct(id);
  const updateProduct = useUpdateProduct();
  const [images, setImages] = useState<ProductImage[]>([]);
  const [categoryInput, setCategoryInput] = useState<string>("");
  const [showCategoryInput, setShowCategoryInput] = useState<boolean>(false);

  const { data: productsData } = useProducts({ limit: 1000 });
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...(productsData?.items?.map(p => p.category) || [])])).sort();

  const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm<ProductValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "", category: "", productCode: "", price: 0, stockQty: 0, unit: ProductUnit.SQ_FT, description: ""
    }
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        category: product.category as any,
        productCode: product.productCode || "",
        price: product.price,
        stockQty: product.stockQty,
        unit: product.unit,
        description: product.description || "",
      });
      setImages(product.images || []);
    }
  }, [product, reset]);

  const onSubmit = async (values: ProductValues) => {
    await updateProduct.mutateAsync({ id, data: values });
    router.push("/admin/products");
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div></div>
  if (!product) return <div className="p-6 text-center"><Card><CardContent className="py-12"><p>Product not found</p><Button className="mt-4" onClick={() => router.push("/admin/products")}>Back</Button></CardContent></Card></div>

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle>Edit Product</CardTitle><CardDescription>Update product details</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input {...register("name")} placeholder="Enter product name" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                {showCategoryInput ? (
                  <div className="flex gap-2">
                    <Input value={categoryInput} onChange={(e) => { setCategoryInput(e.target.value); setValue("category", e.target.value); }} placeholder="New category" autoFocus />
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowCategoryInput(false)}>Done</Button>
                  </div>
                ) : (
                  <Controller name="category" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={(val) => { if (val === "__NEW__") { setShowCategoryInput(true); } else { field.onChange(val); } }}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {allCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        <SelectItem value="__NEW__" className="text-blue-600">+ Add New</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                )}
                {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Unit *</Label>
                <Controller name="unit" control={control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProductUnit.SQ_FT}>Sq ft</SelectItem>
                      <SelectItem value={ProductUnit.SQ_M}>Sq m</SelectItem>
                      <SelectItem value={ProductUnit.BOX}>Box</SelectItem>
                      <SelectItem value={ProductUnit.PIECE}>Piece</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Product Code</Label>
              <Input {...register("productCode")} placeholder="Enter code" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...register("description")} placeholder="Enter description" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price *</Label>
                <Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
                {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Stock *</Label>
                <Input type="number" {...register("stockQty", { valueAsNumber: true })} />
                {errors.stockQty && <p className="text-sm text-red-500">{errors.stockQty.message}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={updateProduct.isPending}>{updateProduct.isPending ? "Saving..." : "Update Product"}</Button>
            </div>
          </form>

          <div className="mt-8 space-y-4">
            <h3 className="text-sm font-medium">Images</h3>
            <Input type="file" multiple accept="image/*" onChange={async (e) => {
              const files = e.target.files; if (!files?.length) return;
              const fd = new FormData(); Array.from(files).forEach(f => fd.append("images", f));
              await axiosClient.post(`/products/${id}/images`, fd, { headers: { "Content-Type": "multipart/form-data" } });
              const res = await axiosClient.get(`/products/${id}`); setImages(res.data.data.images || []);
            }} />
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {images.map(img => (
                  <button key={img.fileId} className={`relative rounded border overflow-hidden ${img.isThumbnail ? "ring-2 ring-blue-500" : ""}`} onClick={async () => {
                    await axiosClient.patch(`/products/${id}/thumbnail`, { imageFileId: img.fileId });
                    setImages(prev => prev.map(p => ({ ...p, isThumbnail: p.fileId === img.fileId })));
                  }}>
                    <img src={img.url} className="h-28 w-full object-cover" />
                    {img.isThumbnail && <span className="absolute bottom-1 left-1 bg-blue-600 px-2 py-0.5 text-[10px] text-white">Thumbnail</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Minimal Textarea since it wasn't imported from UI
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" />
}
