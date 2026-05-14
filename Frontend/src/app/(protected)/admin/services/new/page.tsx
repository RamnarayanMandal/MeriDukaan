"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateService } from "@/hooks/useServices";
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

export default function NewServicePage() {
  const router = useRouter();
  const createService = useCreateService();

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
        await createService.mutateAsync(values);
        router.push("/admin/services");
      } catch (error) {
        // Handled by react-query and axios interceptors
      }
    },
  });

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add New Service</CardTitle>
          <CardDescription>Enter details for the garage service</CardDescription>
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
                placeholder="e.g. Full Oil Change"
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
              {formik.touched.category && formik.errors.category && (
                <p className="text-sm text-red-500">{formik.errors.category}</p>
              )}
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
                  onBlur={formik.handleBlur}
                />
                {formik.touched.basePrice && formik.errors.basePrice && (
                  <p className="text-sm text-red-500">{formik.errors.basePrice}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">Duration (minutes) *</Label>
                <Input
                  id="estimatedDuration"
                  name="estimatedDuration"
                  type="number"
                  value={formik.values.estimatedDuration}
                  onChange={(e) => formik.setFieldValue("estimatedDuration", parseInt(e.target.value) || 0)}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.estimatedDuration && formik.errors.estimatedDuration && (
                  <p className="text-sm text-red-500">{formik.errors.estimatedDuration}</p>
                )}
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
                placeholder="Enter service details"
              />
            </div>

            <div className="space-y-2">
              <ImageUpload
                label="Service Image"
                value={formik.values.image}
                onChange={(url) => formik.setFieldValue("image", url)}
                description="Upload a photo representing this service."
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
              <Label htmlFor="isActive" className="cursor-pointer">Service is active and available for booking</Label>
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
                  placeholder="e.g. Expert Engine Repair in Madhubani"
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
                  placeholder="Describe this service for Google search results"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoKeywords">Keywords (comma separated)</Label>
                <Input
                  id="seoKeywords"
                  name="seoKeywords"
                  value={formik.values.seoKeywords}
                  onChange={formik.handleChange}
                  placeholder="bike repair, engine service, etc."
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={createService.isPending}>
                {createService.isPending ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Service</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
