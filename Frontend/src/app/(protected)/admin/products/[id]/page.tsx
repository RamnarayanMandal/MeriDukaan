"use client";

import { useRouter, useParams } from "next/navigation";
import { useProduct, useUpdateProduct } from "@/hooks/useProducts";
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
import { ProductImage } from "@/types/product";
import { useFormik } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ProductCategory, ProductUnit } from "@/types/product";
import { useProducts } from "@/hooks/useProducts";
import { useEffect, useState } from "react";

// Default categories for suggestions
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: product, isLoading } = useProduct(id);
  const updateProduct = useUpdateProduct();
  const [images, setImages] = useState<ProductImage[]>([]);
  
  // Get all products to extract unique categories
  const { data: productsData } = useProducts({ limit: 1000 });
  const existingCategories = productsData?.items
    ? Array.from(new Set(productsData.items.map((p) => p.category))).sort()
    : [];
  
  // Combine default categories with existing categories, remove duplicates
  const allCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...existingCategories])
  ).sort();

  const [categoryInput, setCategoryInput] = useState<string>("");
  const [showCategoryInput, setShowCategoryInput] = useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      category: DEFAULT_CATEGORIES[0] || "",
      productCode: "",
      price: 0,
      stockQty: 0,
      unit: ProductUnit.SQ_FT,
      description: "",
    },
    validationSchema: toFormikValidationSchema(productSchema),
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await updateProduct.mutateAsync({ id, data: values });
        router.push("/admin/products");
      } catch (error) {
        // Error handled by hook
      }
    },
  });

  useEffect(() => {
    if (product) {
      formik.setValues({
        name: product.name,
        category: product.category,
        productCode: product.productCode || "",
        price: product.price,
        stockQty: product.stockQty,
        unit: product.unit,
        description: product.description || "",
      });
      setImages(product.images || []);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Product not found</p>
            <Button className="mt-4" onClick={() => router.push("/admin/products")}>
              Back to Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
          <CardDescription>Update product details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter product name"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-sm text-red-500">{formik.errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                {formik.values.category === "__NEW__" || showCategoryInput ? (
                  <div className="flex gap-2">
                    <Input
                      id="category"
                      name="category"
                      value={categoryInput}
                      onChange={(e) => {
                        setCategoryInput(e.target.value);
                        formik.setFieldValue("category", e.target.value);
                      }}
                      onBlur={() => {
                        formik.setFieldTouched("category", true);
                        if (!categoryInput.trim()) {
                          setShowCategoryInput(false);
                          setCategoryInput("");
                          formik.setFieldValue("category", product?.category || DEFAULT_CATEGORIES[0] || "");
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (categoryInput.trim()) {
                            formik.setFieldValue("category", categoryInput.trim());
                            setShowCategoryInput(false);
                            setCategoryInput("");
                          }
                        } else if (e.key === "Escape") {
                          setShowCategoryInput(false);
                          setCategoryInput("");
                          formik.setFieldValue("category", product?.category || DEFAULT_CATEGORIES[0] || "");
                        }
                      }}
                      placeholder="Enter new category name"
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (categoryInput.trim()) {
                          formik.setFieldValue("category", categoryInput.trim());
                        } else {
                          formik.setFieldValue("category", product?.category || DEFAULT_CATEGORIES[0] || "");
                        }
                        setShowCategoryInput(false);
                        setCategoryInput("");
                      }}
                    >
                      Done
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={formik.values.category}
                    onValueChange={(value) => {
                      if (value === "__NEW__") {
                        setShowCategoryInput(true);
                        setCategoryInput("");
                        formik.setFieldValue("category", "__NEW__");
                      } else {
                        formik.setFieldValue("category", value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select or add category" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                      <SelectItem value="__NEW__" className="text-blue-600 font-medium">
                        + Add New Category
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {formik.touched.category && formik.errors.category && (
                  <p className="text-sm text-red-500">{formik.errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select
                  value={formik.values.unit}
                  onValueChange={(value) => formik.setFieldValue("unit", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProductUnit.SQ_FT}>Sq ft</SelectItem>
                    <SelectItem value={ProductUnit.SQ_M}>Sq m</SelectItem>
                    <SelectItem value={ProductUnit.BOX}>Box</SelectItem>
                    <SelectItem value={ProductUnit.PIECE}>Piece</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productCode">Product Code (Optional)</Label>
              <Input
                id="productCode"
                name="productCode"
                value={formik.values.productCode}
                onChange={formik.handleChange}
                placeholder="Enter product code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price per Unit *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formik.values.price}
                  onChange={(e) => formik.setFieldValue("price", parseFloat(e.target.value) || 0)}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.price && formik.errors.price && (
                  <p className="text-sm text-red-500">{formik.errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockQty">Stock Quantity *</Label>
                <Input
                  id="stockQty"
                  name="stockQty"
                  type="number"
                  value={formik.values.stockQty}
                  onChange={(e) => formik.setFieldValue("stockQty", parseFloat(e.target.value) || 0)}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.stockQty && formik.errors.stockQty && (
                  <p className="text-sm text-red-500">{formik.errors.stockQty}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateProduct.isPending}>
                {updateProduct.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Product
                  </>
                )}
              </Button>
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="text-sm font-medium">Images</h3>
              <div className="space-y-2">
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={async (event) => {
                    const files = event.target.files;
                    if (!files || !files.length) return;
                    const formData = new FormData();
                    Array.from(files).forEach((file) => {
                      formData.append("images", file);
                    });
                    await axiosClient.post(`/products/${id}/images`, formData, {
                      headers: { "Content-Type": "multipart/form-data" },
                    });
                    // refetch product
                    if (product) {
                      const refreshed = await axiosClient.get(`/products/${id}`);
                      setImages(refreshed.data.data.images || []);
                    }
                  }}
                />
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((img) => (
                    <button
                      type="button"
                      key={img.fileId}
                      className={`relative group rounded-md border overflow-hidden ${
                        img.isThumbnail ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={async () => {
                        await axiosClient.patch(`/products/${id}/thumbnail`, {
                          imageFileId: img.fileId,
                        });
                        setImages((prev) =>
                          prev.map((p) => ({
                            ...p,
                            isThumbnail: p.fileId === img.fileId,
                          }))
                        );
                      }}
                    >
                      <img
                        src={img.url}
                        alt="Product"
                        className="h-28 w-full object-cover"
                      />
                      {img.isThumbnail && (
                        <span className="absolute bottom-1 left-1 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white">
                          Thumbnail
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
