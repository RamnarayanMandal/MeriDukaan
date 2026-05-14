"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  useAllShops,
  useShopById,
  useUpdateShopById,
  useUpdateLogoById,
  useCheckDeleteDependencies,
  useDeleteShop,
  useCreateShop,
} from "@/hooks/useShop";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import { Building2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShopCard } from "@/components/shop/ShopCard";
import { DeleteConfirmationModal } from "@/components/shop/DeleteConfirmationModal";
import CreateShopFrom from "@/components/shop/CreateShopFrom";

const shopSchema = z.object({
  shopName: z.string().min(1, "Shop name is required"),
  address: z.string().optional(),
  ownerName: z.string().min(1, "Owner name is required"),
  mobileNumbers: z.array(z.string().min(1, "Mobile number is required")).min(1),
  gstNo: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

type ShopValues = z.infer<typeof shopSchema>;

export default function ShopManagementPage() {
  const router = useRouter();
  const { data: shops, isLoading: isLoadingShops, refetch: refetchShops } = useAllShops();
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const { data: selectedShop } = useShopById(selectedShopId);
  
  const updateShopMutation = useUpdateShopById();
  const updateLogoMutation = useUpdateLogoById();
  const checkDeleteMutation = useCheckDeleteDependencies();
  const deleteShopMutation = useDeleteShop();
  const createShopMutation = useCreateShop();

  const [mobileNumbers, setMobileNumbers] = useState<string[]>([""]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const [showShopForm, setShowShopForm] = useState(false);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<ShopValues>({
    resolver: zodResolver(shopSchema),
    defaultValues: { shopName: "", address: "", ownerName: "", mobileNumbers: [""], gstNo: "", email: "" }
  });

  useEffect(() => {
    if (selectedShop && !isCreating) {
      const numbers = selectedShop.mobileNumbers?.length ? selectedShop.mobileNumbers : [""];
      reset({
        shopName: selectedShop.shopName || "",
        address: selectedShop.address || "",
        ownerName: selectedShop.ownerName || "",
        mobileNumbers: numbers,
        gstNo: selectedShop.gstNo || "",
        email: selectedShop.email || "",
      });
      setMobileNumbers(numbers);
      setLogoPreview(selectedShop.logoUrl || selectedShop.logo || null);
    }
  }, [selectedShop, isCreating, reset]);

  const onSubmit = async (values: ShopValues) => {
    const payload = { ...values, mobileNumbers: values.mobileNumbers.filter(n => n.trim() !== "") };
    if (isCreating) {
      const newShop = await createShopMutation.mutateAsync(payload);
      if (pendingLogoFile) await updateLogoMutation.mutateAsync({ id: newShop._id, file: pendingLogoFile });
      setIsCreating(false); setSelectedShopId(newShop._id); setShowShopForm(false); refetchShops();
    } else if (selectedShopId) {
      await updateShopMutation.mutateAsync({ id: selectedShopId, data: payload });
      setShowShopForm(false); refetchShops();
    }
  };

  const handleAddNewShop = () => {
    setIsCreating(true); setSelectedShopId(null); setMobileNumbers([""]); setLogoPreview(null); setPendingLogoFile(null);
    setShowShopForm(true); reset({ shopName: "", address: "", ownerName: "", mobileNumbers: [""], gstNo: "", email: "" });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onloadend = () => setLogoPreview(reader.result as string); reader.readAsDataURL(file);
    if (isCreating) { setPendingLogoFile(file); } else if (selectedShopId) { updateLogoMutation.mutate({ id: selectedShopId, file }); }
  };

  const updateMobileNumber = (i: number, val: string) => {
    const arr = [...mobileNumbers]; arr[i] = val; setMobileNumbers(arr); setValue("mobileNumbers", arr);
  };

  const addMobileNumber = () => { const arr = [...mobileNumbers, ""]; setMobileNumbers(arr); setValue("mobileNumbers", arr); };
  const removeMobileNumber = (i: number) => { const arr = mobileNumbers.filter((_, idx) => idx !== i); const final = arr.length ? arr : [""]; setMobileNumbers(final); setValue("mobileNumbers", final); };

  const handleDeleteClick = async () => {
    if (!selectedShopId) return;
    const res = await checkDeleteMutation.mutateAsync(selectedShopId);
    setDeleteWarning(res.canDelete ? undefined : res.reason);
    setShowDeleteModal(true);
  };

  if (isLoadingShops) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div></div>

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-3xl font-bold">Shop Management</h1><p className="text-gray-600">Manage your shops.</p></div>
        <Button onClick={handleAddNewShop}><Plus className="h-4 w-4 mr-2" />Add New Shop</Button>
      </div>

      {shops?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map(shop => (
            <ShopCard key={shop._id} shop={shop} isSelected={selectedShopId === shop._id} onClick={() => setSelectedShopId(shop._id)} onEdit={() => { setSelectedShopId(shop._id); setIsCreating(false); setShowShopForm(true); }} onDelete={() => { setSelectedShopId(shop._id); handleDeleteClick(); }} onView={() => router.push(`/admin/shop/${shop._id}`)} />
          ))}
        </div>
      ) : (
        <Card><CardContent className="py-12 text-center"><Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" /><h3>No shops found</h3><Button onClick={handleAddNewShop} className="mt-4">Add Your First Shop</Button></CardContent></Card>
      )}

      <CreateShopFrom open={showShopForm} onOpenChange={setShowShopForm} register={register} errors={errors} handleSubmit={handleSubmit(onSubmit)} logoPreview={logoPreview} handleLogoChange={handleLogoChange} isPending={isCreating ? createShopMutation.isPending : updateShopMutation.isPending} updateLogoPending={updateLogoMutation.isPending} mobileNumbers={mobileNumbers} addMobileNumber={addMobileNumber} removeMobileNumber={removeMobileNumber} updateMobileNumber={updateMobileNumber} isCreating={isCreating} />

      {selectedShop && (
        <DeleteConfirmationModal isOpen={showDeleteModal} shopName={selectedShop.shopName} warningMessage={deleteWarning} onConfirm={async () => { if (!deleteWarning) { await deleteShopMutation.mutateAsync(selectedShopId!); setShowDeleteModal(false); refetchShops(); } }} onCancel={() => setShowDeleteModal(false)} isDeleting={deleteShopMutation.isPending} />
      )}
    </div>
  );
}
