"use client";

import { Shop } from "@/types/shop";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Phone, Mail, MapPin, Calendar, Edit, Trash2, Eye } from "lucide-react";

interface ShopCardProps {
  shop: Shop & { logoUrl?: string };
  isSelected: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
}

export function ShopCard({ shop, isSelected, onClick, onEdit, onDelete, onView }: ShopCardProps) {
  const primaryMobile = shop.mobileNumbers?.[0] || "N/A";
  const logoUrl = shop.logoUrl || shop.logo;

  return (
    <Card
      className={`
        transition-all duration-200
        hover:shadow-lg hover:-translate-y-0.5
        ${
          isSelected
            ? "border-primary ring-2 ring-primary/30"
            : "border-gray-200"
        }
      `}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div onClick={onClick} className="cursor-pointer">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={shop.shopName}
                className="h-16 w-16 rounded-xl object-cover border bg-white"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-gray-100 border flex items-center justify-center">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {shop.shopName}
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  Owner: <span className="font-medium">{shop.ownerName}</span>
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                {onEdit && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                {
                  onView && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView();
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )
                }
              </div>
            </div>

            {/* Meta info */}
            <div 
              onClick={onClick} 
              className="cursor-pointer grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-3 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {primaryMobile}
              </div>

              {shop.email && (
                <div className="flex items-center gap-2 truncate">
                  <Mail className="h-4 w-4" />
                  {shop.email}
                </div>
              )}

              {shop.address && (
                <div className="flex items-center gap-2 truncate sm:col-span-2">
                  <MapPin className="h-4 w-4" />
                  {shop.address}
                </div>
              )}

              {shop.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(shop.createdAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
