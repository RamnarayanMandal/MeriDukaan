"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, Image as ImageIcon, Plus } from "lucide-react";
import axiosInstance from "@/lib/axiosClient";
import { showError } from "@/lib/sweetAlert";

export interface UploadedImage {
  url: string;
  public_id: string;
}

interface ImageUploadProps {
  value: string | string[] | undefined;
  onChange: (value: string | string[] | undefined) => void;
  onUploadComplete?: (data: UploadedImage | UploadedImage[]) => void;
  label?: string;
  description?: string;
  multiple?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onUploadComplete,
  label,
  description,
  multiple = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = Array.isArray(value) ? value : value ? [value] : [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUrls: string[] = [...images];
    const newUploads: UploadedImage[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith("image/")) {
          showError("Invalid File", `File "${file.name}" is not an image.`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          showError("File Too Large", `"${file.name}" exceeds 5MB limit.`);
          continue;
        }

        const formData = new FormData();
        formData.append("image", file);

        const { data } = await axiosInstance.post("/upload/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (data.success) {
          newUrls.push(data.data.url);
          newUploads.push({
            url: data.data.url,
            public_id: data.data.public_id
          });
          if (!multiple) break; 
        }
      }

      if (multiple) {
        onChange(newUrls);
        if (onUploadComplete) onUploadComplete(newUploads);
      } else {
        const lastUrl = newUrls[newUrls.length - 1] || "";
        onChange(lastUrl);
        if (onUploadComplete && newUploads.length > 0) onUploadComplete(newUploads[0]);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      showError("Upload Failed", "Failed to upload one or more images.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    if (multiple) {
      onChange(newImages);
    } else {
      onChange("");
    }
  };

  return (
    <div className="space-y-3">
      {label && <Label className="text-sm font-medium text-gray-700">{label}</Label>}
      
      <div className="flex flex-wrap gap-4">
        {images.map((url, index) => (
          <div key={url + index} className="relative h-24 w-24 rounded-lg border border-gray-200 overflow-hidden group shadow-sm bg-gray-50">
            <img src={url} alt="Uploaded" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {(multiple || images.length === 0) && (
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple={multiple}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="h-24 w-24 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center gap-2 transition-all"
            >
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              ) : (
                <>
                  <Plus className="h-6 w-6 text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Add</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {!multiple && (
        <div className="relative max-w-md">
          <Input
            type="text"
            placeholder="Or paste image URL here..."
            value={typeof value === 'string' ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            className="text-xs h-8 pr-8"
          />
          {value && (
             <button onClick={() => onChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                <X size={14} />
             </button>
          )}
        </div>
      )}

      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
};
