"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, X, Image } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formik: any;
  logoPreview: string | null;
  handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateLogoMutation: any;
  createShopMutation: any;
  updateShopMutation: any;
  mobileNumbers: string[];
  addMobileNumber: () => void;
  removeMobileNumber: (index: number) => void;
  updateMobileNumber: (index: number, value: string) => void;
  isCreating: boolean;
};

const CreateShopFrom = ({
  open,
  onOpenChange,
  formik,
  logoPreview,
  handleLogoChange,
  updateLogoMutation,
  createShopMutation,
  updateShopMutation,
  mobileNumbers,
  addMobileNumber,
  removeMobileNumber,
  updateMobileNumber,
  isCreating,
}: Props) => {
  const isPending = isCreating
    ? createShopMutation.isPending
    : updateShopMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isCreating ? "Create New Shop" : "Edit Shop Details"}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <form
          onSubmit={formik.handleSubmit}
          className="flex-1 overflow-y-auto space-y-6 pr-2"
        >
          {/* Logo */}
          <div className="space-y-2">
            <Label>Shop Logo</Label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Shop logo preview"
                  className="h-20 w-20 rounded-xl object-cover border"
                />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-gray-100 border flex items-center justify-center text-gray-400">
                  <Image className="h-8 w-8" />
                </div>
              )}
              <div className="space-y-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  disabled={updateLogoMutation.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name *</Label>
              <Input
                id="shopName"
                name="shopName"
                value={formik.values.shopName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.shopName && formik.errors.shopName && (
                <p className="text-sm text-red-500">
                  {formik.errors.shopName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name *</Label>
              <Input
                id="ownerName"
                name="ownerName"
                value={formik.values.ownerName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.ownerName && formik.errors.ownerName && (
                <p className="text-sm text-red-500">
                  {formik.errors.ownerName}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
            />
          </div>

          {/* Mobile Numbers */}
          <div className="space-y-3">
            <Label>Mobile Numbers *</Label>
            {mobileNumbers.map((number, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={number}
                  onChange={(e) =>
                    updateMobileNumber(index, e.target.value)
                  }
                  placeholder="Enter mobile number"
                />
                {mobileNumbers.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeMobileNumber(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addMobileNumber}
              className="w-full"
            >
              + Add Mobile Number
            </Button>
          </div>

          {/* GST & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gstNo">GST No.</Label>
              <Input
                id="gstNo"
                name="gstNo"
                value={formik.values.gstNo}
                onChange={formik.handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-500">
                  {formik.errors.email}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="gap-3 pt-4 sticky bottom-0 bg-background">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[140px]"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  {isCreating ? "Creating..." : "Saving..."}
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isCreating ? "Create Shop" : "Save Changes"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateShopFrom;
