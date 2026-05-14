"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useService, useUpdateService } from "@/hooks/useServices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ImageUpload } from "@/components/common/ImageUpload";
import { showSuccess, showError } from "@/lib/sweetAlert";

const CATEGORIES = ['General', 'Engine', 'Washing', 'Brakes', 'Electrical', 'Tires', 'Body', 'Other'];

const serviceSchema = Yup.object().shape({
  name: Yup.string().min(2, "Name must be at least 2 characters").required("Required"),
  category: Yup.string().required("Category is required"),
  description: Yup.string(),
  basePrice: Yup.number().min(0, "Price must be 0 or greater").required("Required"),
  estimatedDuration: Yup.number().min(5, "Duration must be at least 5 minutes").required("Required"),
  isActive: Yup.boolean().default(true),
  image: Yup.string().optional(),
  seoTitle: Yup.string().optional(),
  seoDescription: Yup.string().optional(),
  seoKeywords: Yup.string().optional(),
});

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { data: service, isLoading } = useService(id);
  const updateService = useUpdateService();

  const formik = useFormik({
    initialValues: {
      name: "",
      category: CATEGORIES[0],
      description: "",
      basePrice: 0,
      estimatedDuration: 60,
      isActive: true,
      image: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
    },
    validationSchema: serviceSchema,
    onSubmit: async (values) => {
      try {
        await updateService.mutateAsync({ id, data: values });
        showSuccess("Service updated successfully");
        router.push("/admin/services");
      } catch (error) {
        showError("Failed to update service");
      }
    },
  });

  useEffect(() => {
    if (service) {
      formik.setValues({
        name: service.name,
        category: service.category,
        description: service.description || "",
        basePrice: service.basePrice,
        estimatedDuration: service.estimatedDuration,
        isActive: service.isActive,
        image: service.image || "",
        seoTitle: service.seoTitle || "",
        seoDescription: service.seoDescription || "",
        seoKeywords: service.seoKeywords || "",
      });
    }
  }, [service]);

  if (isLoading) return <div className="p-12 text-center">Loading service data...</div>;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Service</CardTitle>
          <CardDescription>Update details for {service?.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-sm text-red-500">{formik.errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formik.values.category}
                onValueChange={(value) => formik.setFieldValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (₹) *</Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  value={formik.values.basePrice}
                  onChange={(e) => formik.setFieldValue("basePrice", parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">Duration (minutes) *</Label>
                <Input
                  id="estimatedDuration"
                  name="estimatedDuration"
                  type="number"
                  value={formik.values.estimatedDuration}
                  onChange={(e) => formik.setFieldValue("estimatedDuration", parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <ImageUpload
                label="Service Image"
                value={formik.values.image}
                onChange={(url) => formik.setFieldValue("image", url)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formik.values.isActive}
                onChange={formik.handleChange}
                className="h-4 w-4"
              />
              <Label htmlFor="isActive" className="cursor-pointer">Service is active</Label>
            </div>

            <div className="pt-6 border-t space-y-4">
              <h3 className="font-bold text-lg">SEO Information</h3>
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Meta Title</Label>
                <Input
                  id="seoTitle"
                  name="seoTitle"
                  value={formik.values.seoTitle}
                  onChange={formik.handleChange}
                  placeholder="e.g. Expert Engine Repair"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoDescription">Meta Description</Label>
                <textarea
                  id="seoDescription"
                  name="seoDescription"
                  value={formik.values.seoDescription}
                  onChange={formik.handleChange}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoKeywords">Keywords (comma separated)</Label>
                <Input
                  id="seoKeywords"
                  name="seoKeywords"
                  value={formik.values.seoKeywords}
                  onChange={formik.handleChange}
                  placeholder="bike repair, etc."
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateService.isPending}>
                {updateService.isPending ? "Updating..." : <><Save className="h-4 w-4 mr-2" /> Update Service</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
