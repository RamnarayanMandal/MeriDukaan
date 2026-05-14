"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useShopSettings, useUpdateShopSettings } from "@/hooks/useShopSettings"
import { Save, Store, MapPin, Search, Link as LinkIcon, Navigation } from "lucide-react"
import { ImageUpload } from "@/components/common/ImageUpload"
import { showError, showSuccess } from "@/lib/sweetAlert"

const settingsSchema = z.object({
  shopName: z.string().min(2, "Shop Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  whatsapp: z.string().optional(),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().optional(),
  country: z.string().default("India"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  openingHours: z.string().min(2, "Opening hours required"),
  closingHours: z.string().min(2, "Closing hours required"),
  googleMapLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  favicon: z.string().optional(),
  socialLinks: z.object({
    facebook: z.string().url("Invalid URL").optional().or(z.literal("")),
    instagram: z.string().url("Invalid URL").optional().or(z.literal("")),
    twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
  }).optional(),
  gstNumber: z.string().optional(),
  invoiceFooter: z.string().optional(),
  themeColors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
  }).optional(),
})

type SettingsValues = z.infer<typeof settingsSchema>

export default function ShopSettingsPage() {
  const { data: settings, isLoading } = useShopSettings()
  const updateSettings = useUpdateShopSettings()
  const [isFetchingLocation, setIsFetchingLocation] = useState(false)

  const { register, handleSubmit, setValue, reset, control, formState: { errors } } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      shopName: "", phone: "", whatsapp: "", email: "", address: "", city: "", state: "", pincode: "",
      openingHours: "", closingHours: "", googleMapLink: "", seoTitle: "", seoDescription: "",
      seoKeywords: "", logo: "", banner: "", favicon: "", latitude: "", longitude: "", country: "India",
      gstNumber: "", invoiceFooter: "",
      themeColors: { primary: "#2563eb", secondary: "#1e40af", accent: "#f59e0b" },
      socialLinks: { facebook: "", instagram: "", twitter: "" },
    }
  })

  useEffect(() => {
    if (settings) reset(settings)
  }, [settings, reset])

  const onSubmit = async (values: SettingsValues) => {
    await updateSettings.mutateAsync(values)
  }

  const handleFetchLocation = () => {
    if (!navigator.geolocation) { showError("Geolocation not supported"); return; }
    setIsFetchingLocation(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords
      setValue("latitude", latitude.toString()); setValue("longitude", longitude.toString())
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
        const data = await res.json()
        if (data?.address) {
          setValue("address", data.display_name || ""); setValue("city", data.address.city || data.address.town || "");
          setValue("state", data.address.state || ""); setValue("pincode", data.address.postcode || "");
          showSuccess("Location fetched!")
        }
      } catch (err) { console.error(err) } finally { setIsFetchingLocation(false) }
    }, (err) => { setIsFetchingLocation(false); showError(err.message) })
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <h1 className="text-3xl font-bold">Shop Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-[750px]">
            <TabsTrigger value="general"><Store className="w-4 h-4 mr-2" /> General</TabsTrigger>
            <TabsTrigger value="branding"><Save className="w-4 h-4 mr-2" /> Branding</TabsTrigger>
            <TabsTrigger value="location"><MapPin className="w-4 h-4 mr-2" /> Location</TabsTrigger>
            <TabsTrigger value="seo"><Search className="w-4 h-4 mr-2" /> SEO</TabsTrigger>
            <TabsTrigger value="social"><LinkIcon className="w-4 h-4 mr-2" /> Social</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="general">
              <Card><CardHeader><CardTitle>General Information</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Shop Name</Label><Input {...register("shopName")} /></div>
                  <div className="space-y-2"><Label>Phone Number</Label><Input {...register("phone")} /></div>
                  <div className="space-y-2"><Label>WhatsApp</Label><Input {...register("whatsapp")} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" {...register("email")} /></div>
                  <div className="space-y-2"><Label>GST Number</Label><Input {...register("gstNumber")} /></div>
                  <div className="space-y-2"><Label>Opening Time</Label><Input {...register("openingHours")} /></div>
                  <div className="space-y-2"><Label>Closing Time</Label><Input {...register("closingHours")} /></div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding">
              <Card><CardHeader><CardTitle>Branding & Theme</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Controller name="logo" control={control} render={({ field }) => <ImageUpload label="Logo" value={field.value} onChange={field.onChange} />} />
                    <Controller name="banner" control={control} render={({ field }) => <ImageUpload label="Banner" value={field.value} onChange={field.onChange} />} />
                    <Controller name="favicon" control={control} render={({ field }) => <ImageUpload label="Favicon" value={field.value} onChange={field.onChange} />} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
                    <div className="space-y-2"><Label>Primary</Label><Input type="color" {...register("themeColors.primary")} /></div>
                    <div className="space-y-2"><Label>Secondary</Label><Input type="color" {...register("themeColors.secondary")} /></div>
                    <div className="space-y-2"><Label>Accent</Label><Input type="color" {...register("themeColors.accent")} /></div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location">
              <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Location</CardTitle><Button type="button" variant="outline" size="sm" onClick={handleFetchLocation} disabled={isFetchingLocation}><Navigation className="w-4 h-4 mr-2" />{isFetchingLocation ? "Fetching..." : "Fetch My Location"}</Button></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Full Address</Label><Textarea {...register("address")} /></div>
                  <div className="grid grid-cols-3 gap-4"><Input placeholder="City" {...register("city")} /><Input placeholder="State" {...register("state")} /><Input placeholder="Pincode" {...register("pincode")} /></div>
                  <div className="grid grid-cols-2 gap-4"><Input placeholder="Latitude" {...register("latitude")} /><Input placeholder="Longitude" {...register("longitude")} /></div>
                  <div className="space-y-2"><Label>Google Maps Embed Link</Label><Input {...register("googleMapLink")} /></div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              <Card><CardHeader><CardTitle>SEO Optimization</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2"><Label>Meta Title</Label><Input {...register("seoTitle")} /></div>
                  <div className="space-y-2"><Label>Meta Description</Label><Textarea {...register("seoDescription")} rows={3} /></div>
                  <div className="space-y-2"><Label>Keywords</Label><Input {...register("seoKeywords")} /></div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social">
              <Card><CardHeader><CardTitle>Social Media</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Facebook URL" {...register("socialLinks.facebook")} />
                  <Input placeholder="Instagram URL" {...register("socialLinks.instagram")} />
                  <Input placeholder="Twitter URL" {...register("socialLinks.twitter")} />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
          <div className="mt-8 flex justify-end"><Button type="submit" disabled={updateSettings.isPending} size="lg"><Save className="w-4 h-4 mr-2" /> {updateSettings.isPending ? "Saving..." : "Save Settings"}</Button></div>
        </Tabs>
      </form>
    </div>
  )
}
