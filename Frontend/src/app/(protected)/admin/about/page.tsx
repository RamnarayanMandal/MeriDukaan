"use client";

import { useEffect } from "react";
import { useAbout, useUpdateAbout } from "@/hooks/useAbout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";

const aboutSchema = z.object({
  shopDescription: z.string().min(1, "Shop description is required"),
  shopMission: z.string().optional(),
  ownerInfo: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type AboutValues = z.infer<typeof aboutSchema>;

export default function AboutPage() {
  const { data: about, isLoading } = useAbout();
  const updateAboutMutation = useUpdateAbout();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AboutValues>({
    resolver: zodResolver(aboutSchema),
    defaultValues: { shopDescription: "", shopMission: "", ownerInfo: "", additionalInfo: "" }
  });

  useEffect(() => {
    if (about) reset(about);
  }, [about, reset]);

  const onSubmit = async (values: AboutValues) => {
    await updateAboutMutation.mutateAsync(values);
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div></div>

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><Info className="h-6 w-6" /><CardTitle>About Section</CardTitle></div>
          <CardDescription>Manage the about content for your shop.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2"><Label>Shop Description *</Label><Textarea {...register("shopDescription")} rows={4} /><p className="text-xs text-red-500">{errors.shopDescription?.message}</p></div>
            <div className="space-y-2"><Label>Shop Mission</Label><Textarea {...register("shopMission")} rows={3} /></div>
            <div className="space-y-2"><Label>Owner Information</Label><Textarea {...register("ownerInfo")} rows={3} /></div>
            <div className="space-y-2"><Label>Additional Information</Label><Textarea {...register("additionalInfo")} rows={3} /></div>
            <div className="flex justify-end pt-4"><Button type="submit" disabled={updateAboutMutation.isPending}>{updateAboutMutation.isPending ? "Saving..." : <><Save className="h-4 w-4 mr-2" />Save Changes</>}</Button></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
