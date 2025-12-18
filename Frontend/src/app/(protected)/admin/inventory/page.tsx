"use client";

import { useState } from "react";
import { useShop } from "@/hooks/useShop";
import { useProducts } from "@/hooks/useProducts";
import { useInventoryHistory } from "@/hooks/useInventoryHistory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventoryHistoryItem } from "@/service/inventoryService";
import { Product } from "@/types/product";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

const months = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
];

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function InventoryHistoryPage() {
  const { data: shop } = useShop();
  const [page, setPage] = useState(1);
  const limit = 10;

  const [productId, setProductId] = useState<string | undefined>();
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();
  const [month, setMonth] = useState<number | undefined>();
  const [year, setYear] = useState<number | undefined>();

  const { data: productsData } = useProducts(
    shop
      ? {
          shopId: shop._id,
          page: 1,
          limit: 1000,
        }
      : undefined
  );
  const products = productsData?.items || [];

  const { data, isLoading } = useInventoryHistory(
    shop
      ? {
          shopId: shop._id,
          productId,
          fromDate,
          toDate,
          month,
          year,
          page,
          limit,
        }
      : undefined
  );

  const resolveProductName = (item: InventoryHistoryItem): string => {
    if (typeof item.productId === "string") return item.productId;
    return item.productId.name;
  };

  const resolveProductCode = (item: InventoryHistoryItem): string | undefined => {
    if (typeof item.productId === "string") return undefined;
    return item.productId.productCode;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory History</h1>
          <p className="text-gray-600 mt-1">
            Track all stock changes across your products.
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Product
              </label>
              <Select
                value={productId ?? "all"}
                onValueChange={(value) => {
                  setProductId(value === "all" ? undefined : value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All products</SelectItem>
                  {products.map((p: Product) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name} ({p.stockQty} {p.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                From date
              </label>
              <Input
                type="date"
                value={fromDate || ""}
                onChange={(e) => {
                  setFromDate(e.target.value || undefined);
                  setPage(1);
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                To date
              </label>
              <Input
                type="date"
                value={toDate || ""}
                onChange={(e) => {
                  setToDate(e.target.value || undefined);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Month
              </label>
              <Select
                value={month ? String(month) : "all"}
                onValueChange={(value) => {
                  setMonth(value === "all" ? undefined : Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All months</SelectItem>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Year
              </label>
              <Select
                value={year ? String(year) : "all"}
                onValueChange={(value) => {
                  setYear(value === "all" ? undefined : Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setProductId(undefined);
                  setFromDate(undefined);
                  setToDate(undefined);
                  setMonth(undefined);
                  setYear(undefined);
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : data && data.items.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-3 py-2 text-left font-medium text-gray-700">
                        Date
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">
                        Product
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">
                        Action
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700">
                        Qty Change
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700">
                        Previous Stock
                      </th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700">
                        Current Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item) => (
                      <tr key={item._id} className="border-b last:border-0">
                        <td className="px-3 py-2 whitespace-nowrap">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {resolveProductName(item)}
                            </span>
                            {resolveProductCode(item) && (
                              <span className="text-xs text-gray-500">
                                Code: {resolveProductCode(item)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              item.actionType === "SALE"
                                ? "text-red-600 font-semibold"
                                : item.actionType === "ADD"
                                ? "text-green-600 font-semibold"
                                : "text-blue-600 font-semibold"
                            }
                          >
                            {item.actionType}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          {item.quantityChange > 0 ? "+" : ""}
                          {item.quantityChange}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {item.previousStock}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {item.newStock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data.totalCount > data.limit && (
                <div className="flex justify-end items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {data.page} of{" "}
                    {Math.ceil(data.totalCount / data.limit)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.page * data.limit >= data.totalCount}
                    onClick={() => {
                      if (data.page * data.limit < data.totalCount) {
                        setPage((p) => p + 1);
                      }
                    }}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-600">
              No inventory history found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


