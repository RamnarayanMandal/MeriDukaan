"use client";

import { useEffect } from "react";
import { useAbout, useUpdateAbout } from "@/hooks/useAbout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Save } from "lucide-react";
import { useFormik } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { Textarea } from "@/components/ui/textarea";

const aboutSchema = z.object({
  shopDescription: z.string().min(1, "Shop description is required"),
  shopMission: z.string().optional(),
  ownerInfo: z.string().optional(),
  additionalInfo: z.string().optional(),
});

export default function AboutPage() {
  const { data: about, isLoading } = useAbout();
  const updateAboutMutation = useUpdateAbout();

  const formik = useFormik({
    initialValues: {
      shopDescription: "",
      shopMission: "",
      ownerInfo: "",
      additionalInfo: "",
    },
    validationSchema: toFormikValidationSchema(aboutSchema),
    enableReinitialize: true,
    onSubmit: async (values) => {
      await updateAboutMutation.mutateAsync(values);
    },
  });

  useEffect(() => {
    if (about) {
      formik.setValues({
        shopDescription: about.shopDescription || "",
        shopMission: about.shopMission || "",
        ownerInfo: about.ownerInfo || "",
        additionalInfo: about.additionalInfo || "",
      });
    }
  }, [about]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-6 w-6" />
            <CardTitle>About Section</CardTitle>
          </div>
          <CardDescription>
            Manage the about content for your shop. This information will be displayed to customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="shopDescription">Shop Description *</Label>
              <Textarea
                id="shopDescription"
                name="shopDescription"
                value={formik.values.shopDescription}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter shop description"
                rows={4}
                className="resize-none"
              />
              {formik.touched.shopDescription && formik.errors.shopDescription && (
                <p className="text-sm text-red-500">{formik.errors.shopDescription}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopMission">Shop Mission</Label>
              <Textarea
                id="shopMission"
                name="shopMission"
                value={formik.values.shopMission}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter shop mission"
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerInfo">Owner Information</Label>
              <Textarea
                id="ownerInfo"
                name="ownerInfo"
                value={formik.values.ownerInfo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter owner information"
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formik.values.additionalInfo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter any additional information"
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="submit"
                disabled={updateAboutMutation.isPending}
                className="min-w-[120px]"
              >
                {updateAboutMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
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

