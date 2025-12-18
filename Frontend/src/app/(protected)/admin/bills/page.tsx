"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBills, useDeleteBill } from "@/hooks/useBills";
import { useShop } from "@/hooks/useShop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Eye, Trash2, Receipt, Printer } from "lucide-react";
// Date formatting helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export default function BillsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data: shop } = useShop();
  const { data, isLoading } = useBills(
    shop
      ? {
          shopId: shop._id,
          customerName: search || undefined,
          page,
          limit,
        }
      : undefined
  );
  const deleteBill = useDeleteBill();

  const handleDelete = async (id: string, billNumber: string) => {
    if (confirm(`Are you sure you want to delete bill "${billNumber}"?`)) {
      try {
        await deleteBill.mutateAsync(id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bills</h1>
          <p className="text-gray-600 mt-1">Manage customer invoices</p>
        </div>
        <Button onClick={() => router.push("/admin/bills/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Bill
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search bills by customer name or bill number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="space-y-4">
          {data.items.map((bill) => (
            <Card key={bill._id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold">{bill.billNumber}</h3>
                      <span className="text-sm text-gray-500">
                        {formatDate(bill.billDate)}
                      </span>
                    </div>
                    <p className="text-gray-700 font-medium mb-1">{bill.customerName}</p>
                    {bill.customerAddress && (
                      <p className="text-sm text-gray-600 mb-1">{bill.customerAddress}</p>
                    )}
                    {bill.customerPhone && (
                      <p className="text-sm text-gray-600">Phone: {bill.customerPhone}</p>
                    )}
                    <div className="mt-3">
                      <p className="text-lg font-bold text-blue-600">
                        ₹{bill.grandTotal.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">{bill.items.length} items</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/bills/${bill._id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/bills/${bill._id}/print`)}
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(bill._id, bill.billNumber)}
                      disabled={deleteBill.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No bills found</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/admin/bills/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Bill
            </Button>
          </CardContent>
        </Card>
      )}

      {data && data.totalCount > data.limit && (
        <div className="flex justify-end items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {data.page} of {Math.ceil(data.totalCount / data.limit)}
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
  );
}
