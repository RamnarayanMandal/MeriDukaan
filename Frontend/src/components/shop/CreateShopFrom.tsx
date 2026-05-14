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
import { Save, X, Image as ImageIcon } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  register: any;
  errors: any;
  handleSubmit: any;
  logoPreview: string | null;
  handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPending: boolean;
  updateLogoPending: boolean;
  mobileNumbers: string[];
  addMobileNumber: () => void;
  removeMobileNumber: (index: number) => void;
  updateMobileNumber: (index: number, value: string) => void;
  isCreating: boolean;
};

const CreateShopFrom = ({
  open,
  onOpenChange,
  register,
  errors,
  handleSubmit,
  logoPreview,
  handleLogoChange,
  isPending,
  updateLogoPending,
  mobileNumbers,
  addMobileNumber,
  removeMobileNumber,
  updateMobileNumber,
  isCreating,
}: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isCreating ? "Create New Shop" : "Edit Shop Details"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Shop Logo</Label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <img src={logoPreview} alt="Preview" className="h-20 w-20 rounded-xl object-cover border" />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-gray-100 border flex items-center justify-center text-gray-400">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
              <div className="space-y-1">
                <Input type="file" accept="image/*" onChange={handleLogoChange} disabled={updateLogoPending} />
                <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Shop Name *</Label>
              <Input {...register("shopName")} />
              {errors.shopName && <p className="text-sm text-red-500">{errors.shopName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Owner Name *</Label>
              <Input {...register("ownerName")} />
              {errors.ownerName && <p className="text-sm text-red-500">{errors.ownerName.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input {...register("address")} />
          </div>

          {/* Mobile Numbers */}
          <div className="space-y-3">
            <Label>Mobile Numbers *</Label>
            {mobileNumbers.map((num, i) => (
              <div key={i} className="flex gap-2">
                <Input value={num} onChange={(e) => updateMobileNumber(i, e.target.value)} placeholder="Enter mobile number" />
                {mobileNumbers.length > 1 && (
                  <Button type="button" variant="outline" size="icon" onClick={() => removeMobileNumber(i)}><X className="h-4 w-4" /></Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addMobileNumber} className="w-full">+ Add Mobile Number</Button>
            {errors.mobileNumbers && <p className="text-sm text-red-500">{errors.mobileNumbers.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>GST No.</Label><Input {...register("gstNo")} /></div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4 sticky bottom-0 bg-background">
            <DialogClose asChild><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button></DialogClose>
            <Button type="submit" disabled={isPending} className="min-w-[140px]">
              {isPending ? (
                <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />{isCreating ? "Creating..." : "Saving..."}</span>
              ) : (
                <><Save className="h-4 w-4 mr-2" />{isCreating ? "Create Shop" : "Save Changes"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateShopFrom;
