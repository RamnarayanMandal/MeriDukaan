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
import { useFormik } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
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

export default function ShopManagementPage() {
  const router = useRouter();
  const { data: shops, isLoading: isLoadingShops, refetch: refetchShops } = useAllShops();
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const { data: selectedShop, isLoading: isLoadingShop } = useShopById(selectedShopId);
  const updateShopMutation = useUpdateShopById();
  const updateLogoMutation = useUpdateLogoById();
  const checkDeleteMutation = useCheckDeleteDependencies();
  const deleteShopMutation = useDeleteShop();
  const createShopMutation = useCreateShop();
  const [mobileNumbers, setMobileNumbers] = useState<string[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string | undefined>();
  const [isCreating, setIsCreating] = useState(false);
  const [showShopForm, setShowShopForm] = useState(false);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const lastLoadedShopId = useRef<string | null>(null);

  // Backend already filters shops by owner ID, so we can use shops directly
  const displayShops = shops || [];

  const formik = useFormik({
    initialValues: {
      shopName: "",
      address: "",
      ownerName: "",
      mobileNumbers: [""] as string[],
      gstNo: "",
      email: "",
    },
    validationSchema: toFormikValidationSchema(shopSchema),
    enableReinitialize: true,
    onSubmit: async (values) => {
      // Ensure mobileNumbers is always an array
      const mobileNumbersArray = Array.isArray(values.mobileNumbers) 
        ? values.mobileNumbers.filter((num) => num && num.trim() !== "")
        : [""];
      
      if (mobileNumbersArray.length === 0) {
        formik.setFieldError("mobileNumbers", "At least one mobile number is required");
        return;
      }

      const payload = {
        ...values,
        mobileNumbers: mobileNumbersArray,
      };

      if (isCreating) {
        const newShop = await createShopMutation.mutateAsync({
          shopName: payload.shopName,
          ownerName: payload.ownerName,
          mobileNumbers: payload.mobileNumbers,
          address: payload.address,
          gstNo: payload.gstNo,
          email: payload.email,
        });
        
        // Upload logo if one was selected during creation
        if (pendingLogoFile) {
          try {
            await updateLogoMutation.mutateAsync({ id: newShop._id, file: pendingLogoFile });
            setPendingLogoFile(null);
          } catch (error) {
            // Logo upload failed but shop was created - continue
            console.error("Failed to upload logo:", error);
          }
        }
        
        setIsCreating(false);
        setSelectedShopId(newShop._id);
        setShowShopForm(false);
        refetchShops();
      } else {
        if (!selectedShopId) return;
        await updateShopMutation.mutateAsync({
          id: selectedShopId,
          data: payload,
        });
        setShowShopForm(false);
        refetchShops();
      }
    },
  });

  // Auto-select first shop when shops load (if not currently creating)
  useEffect(() => {
    if (displayShops && displayShops.length > 0 && !selectedShopId && !isCreating) {
      setSelectedShopId(displayShops[0]._id);
    }
  }, [displayShops, selectedShopId, isCreating]);

  // Load selected shop data into form when an existing shop is selected
  useEffect(() => {
    if (selectedShop && !isCreating && selectedShopId && selectedShop._id !== lastLoadedShopId.current) {
      lastLoadedShopId.current = selectedShop._id;
      const numbers = Array.isArray(selectedShop.mobileNumbers) && selectedShop.mobileNumbers.length > 0 
        ? selectedShop.mobileNumbers 
        : [""];
      formik.setValues({
        shopName: selectedShop.shopName || "",
        address: selectedShop.address || "",
        ownerName: selectedShop.ownerName || "",
        mobileNumbers: numbers,
        gstNo: selectedShop.gstNo || "",
        email: selectedShop.email || "",
      });
      setLogoPreview(selectedShop.logoUrl || selectedShop.logo || null);
      setMobileNumbers(numbers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShop?._id, isCreating, selectedShopId]);

  const handleShopSelect = (shopId: string) => {
    setSelectedShopId(shopId);
    setIsCreating(false);
    setShowShopForm(false);
    setShowDeleteModal(false);
    setDeleteWarning(undefined);
  };

  const handleAddNewShop = () => {
    setIsCreating(true);
    setSelectedShopId(null);
    lastLoadedShopId.current = null;
    const numbers = [""];
    setMobileNumbers(numbers);
    setLogoPreview(null);
    setPendingLogoFile(null);
    setShowShopForm(true);
    formik.resetForm({
      values: {
        shopName: "",
        address: "",
        ownerName: "",
        mobileNumbers: numbers,
        gstNo: "",
        email: "",
      },
    });
  };

  const handleEditShop = (shopId: string) => {
    setSelectedShopId(shopId);
    setIsCreating(false);
    setShowShopForm(true);
    setPendingLogoFile(null);
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (isCreating) {
      // Store file for later upload after shop creation
      setPendingLogoFile(file);
    } else if (selectedShopId) {
      // Upload immediately for existing shop
      updateLogoMutation.mutate({ id: selectedShopId, file });
    }
  };

  const addMobileNumber = () => {
    const currentNumbers = Array.isArray(mobileNumbers) ? mobileNumbers : [""];
    const newNumbers = [...currentNumbers, ""];
    setMobileNumbers(newNumbers);
    formik.setFieldValue("mobileNumbers", newNumbers);
  };

  const removeMobileNumber = (index: number) => {
    const currentNumbers = Array.isArray(mobileNumbers) ? mobileNumbers : [""];
    const newNumbers = currentNumbers.filter((_, i) => i !== index);
    // Ensure at least one mobile number field remains
    const finalNumbers = newNumbers.length > 0 ? newNumbers : [""];
    setMobileNumbers(finalNumbers);
    formik.setFieldValue("mobileNumbers", finalNumbers);
  };

  const updateMobileNumber = (index: number, value: string) => {
    const currentNumbers = Array.isArray(mobileNumbers) ? mobileNumbers : [""];
    const newNumbers = [...currentNumbers];
    newNumbers[index] = value;
    setMobileNumbers(newNumbers);
    formik.setFieldValue("mobileNumbers", newNumbers);
  };

  const handleDeleteClick = async () => {
    if (!selectedShopId) return;

    try {
      const result = await checkDeleteMutation.mutateAsync(selectedShopId);
      if (result.canDelete) {
        setDeleteWarning(undefined);
      } else {
        setDeleteWarning(result.reason);
      }
      setShowDeleteModal(true);
    } catch (error: any) {
      setDeleteWarning(error.message || "Failed to check delete dependencies");
      setShowDeleteModal(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedShopId || deleteWarning) return;

    try {
      await deleteShopMutation.mutateAsync(selectedShopId);
      setShowDeleteModal(false);
      
      // Auto-select next available shop
      const remainingShops = displayShops.filter((s) => s._id !== selectedShopId);
      if (remainingShops.length > 0) {
        setSelectedShopId(remainingShops[0]._id);
      } else {
        setSelectedShopId(null);
      }
      refetchShops();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleViewShop = (shopId: string) => {
    setSelectedShopId(shopId);
    setIsCreating(false);
    setShowShopForm(false);
    setShowDeleteModal(false);
    setDeleteWarning(undefined);
    router.push(`/admin/shop/${shopId}`);
  };

  if (isLoadingShops) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop Management</h1>
          <p className="text-gray-600 mt-1">Manage all your shops - add, edit, or delete shops</p>
          </div>
        <Button
          type="button"
          onClick={handleAddNewShop}
          disabled={createShopMutation.isPending}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Shop
        </Button>
            </div>

      {/* Shop Cards List */}
      {displayShops && displayShops.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">All Shops</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayShops.map((shop) => (
              <ShopCard
                key={shop._id}
                shop={shop}
                isSelected={!isCreating && selectedShopId === shop._id}
                onClick={() => handleShopSelect(shop._id)}
                onEdit={() => handleEditShop(shop._id)}
                onDelete={async () => {
                  setSelectedShopId(shop._id);
                  await handleDeleteClick();
                }}
                onView={() => handleViewShop(shop._id)}
              />
            ))}
            </div>
                </div>
      ) : (
        /* No shops message */
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No shops found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first shop.</p>
              <Button
                type="button"
                onClick={handleAddNewShop}
                disabled={createShopMutation.isPending}
                className="flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Add Your First Shop
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shop Form Dialog - for both create and edit */}
      <CreateShopFrom
        open={showShopForm}
        onOpenChange={(open) => {
          setShowShopForm(open);
          if (!open) {
            setIsCreating(false);
          }
        }}
        formik={formik}
        logoPreview={logoPreview}
        handleLogoChange={handleLogoChange}
        updateLogoMutation={updateLogoMutation}
        createShopMutation={createShopMutation}
        updateShopMutation={updateShopMutation}
        mobileNumbers={mobileNumbers}
        addMobileNumber={addMobileNumber}
        removeMobileNumber={removeMobileNumber}
        updateMobileNumber={updateMobileNumber}
        isCreating={isCreating}
      />

      {/* Delete Confirmation Modal */}
      {selectedShop && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          shopName={selectedShop.shopName}
          warningMessage={deleteWarning}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteWarning(undefined);
          }}
          isDeleting={deleteShopMutation.isPending}
        />
      )}
    </div>
  );
}

