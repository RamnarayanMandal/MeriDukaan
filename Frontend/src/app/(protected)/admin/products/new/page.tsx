"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateProduct } from "@/hooks/useProducts";
import { useAllShops } from "@/hooks/useShop";
import axiosClient from "@/lib/axiosClient";
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
import { useFormik } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ProductCategory, ProductUnit } from "@/types/product";
import { useProducts } from "@/hooks/useProducts";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Default categories for suggestions
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
  productCode: z.string().optional(),
  price: z.number().min(0, "Price must be 0 or greater"),
  stockQty: z.number().min(0, "Stock quantity must be 0 or greater").default(0),
  unit: z.nativeEnum(ProductUnit),
  description: z.string().optional(),
});

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const { data: shops } = useAllShops();
  
  // Get all products to extract unique categories
  const { data: productsData } = useProducts({ limit: 1000 });
  const existingCategories = productsData?.items
    ? Array.from(new Set(productsData.items.map((p) => p.category))).sort()
    : [];
  
  // Combine default categories with existing categories, remove duplicates
  const allCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...existingCategories])
  ).sort();

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState<number | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [categoryInput, setCategoryInput] = useState<string>("");
  const [showCategoryInput, setShowCategoryInput] = useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      shopId: shops && shops.length > 0 ? shops[0]._id : "",
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
        if (!values.shopId) {
          return;
        }

        if (imageFiles.length === 0) {
          setImageError("Thumbnail image is required");
          return;
        }

        if (thumbnailIndex === null || thumbnailIndex < 0 || thumbnailIndex >= imageFiles.length) {
          setImageError("Please select one thumbnail image");
          return;
        }

        const createdProduct = await createProduct.mutateAsync({
          ...values,
          shopId: values.shopId,
        });

        // upload images if any
        if (createdProduct && imageFiles.length > 0) {
          const formData = new FormData();
          imageFiles.forEach((file) => {
            formData.append("images", file);
          });

          const uploadResponse = await axiosClient.post(
            `/products/${createdProduct._id}/images`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );

          const productWithImages = uploadResponse.data.data as {
            images?: { fileId: string }[];
          };

          const images = productWithImages.images || [];
          const thumbnailImage = images[thumbnailIndex];

          if (thumbnailImage) {
            await axiosClient.patch(`/products/${createdProduct._id}/thumbnail`, {
              imageFileId: thumbnailImage.fileId,
            });
          }
        }

        router.push("/admin/products");
      } catch {
        // Error handled by hook / axios interceptor
      }
    },
  });

  // Auto-select first shop when shops load (if not already set)
  useEffect(() => {
    if (shops && shops.length > 0 && !formik.values.shopId) {
      formik.setFieldValue("shopId", shops[0]._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shops]);

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
          <CardTitle>Add New Product</CardTitle>
          <CardDescription>Enter product details to add to inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopId">Shop *</Label>
              <Select
                value={formik.values.shopId}
                onValueChange={(value) => formik.setFieldValue("shopId", value)}
                onBlur={() => formik.setFieldTouched("shopId", true)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a shop" />
                </SelectTrigger>
                <SelectContent>
                  {shops?.map((shop) => (
                    <SelectItem key={shop._id} value={shop._id}>
                      {shop.shopName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.shopId && formik.errors.shopId && (
                <p className="text-sm text-red-500">{formik.errors.shopId}</p>
              )}
              {(!shops || shops.length === 0) && (
                <p className="text-sm text-yellow-600">
                  No shops available. Please create a shop first.
                </p>
              )}
            </div>

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
                          formik.setFieldValue("category", DEFAULT_CATEGORIES[0] || "");
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
                          formik.setFieldValue("category", DEFAULT_CATEGORIES[0] || "");
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
                          formik.setFieldValue("category", DEFAULT_CATEGORIES[0] || "");
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
                <Label htmlFor="stockQty">Initial Stock *</Label>
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

            <div className="space-y-3">
              <Label>Product Images</Label>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(event) => {
                  const files = event.target.files;
                  if (!files) return;

                  const validFiles: File[] = [];
                  const previews: string[] = [];
                  let error: string | null = null;

                  Array.from(files).forEach((file) => {
                    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                      error = "Only JPG, PNG, and WEBP images are allowed";
                      return;
                    }

                    if (file.size > MAX_IMAGE_SIZE_BYTES) {
                      error = "Image size must be less than 5MB";
                      return;
                    }

                    validFiles.push(file);
                    previews.push(URL.createObjectURL(file));
                  });

                  if (error) {
                    setImageError(error);
                    return;
                  }

                  setImageError(null);
                  setImageFiles(validFiles);
                  setImagePreviews(previews);
                  setThumbnailIndex(validFiles.length > 0 ? 0 : null);
                }}
              />
              {imageError && (
                <p className="text-sm text-red-500">{imageError}</p>
              )}

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {imagePreviews.map((src, index) => (
                    <button
                      type="button"
                      key={src}
                      className={`relative rounded-md border overflow-hidden ${
                        thumbnailIndex === index ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => setThumbnailIndex(index)}
                    >
                      <img
                        src={src}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-full object-cover"
                      />
                      <div className="absolute bottom-1 left-1 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                        <input
                          type="radio"
                          className="h-3 w-3"
                          checked={thumbnailIndex === index}
                          onChange={() => setThumbnailIndex(index)}
                        />
                        <span>Thumbnail</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createProduct.isPending}>
                {createProduct.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
