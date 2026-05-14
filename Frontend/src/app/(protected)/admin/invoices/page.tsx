"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useInvoices, useDeleteInvoice } from "@/hooks/useInvoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Search,
  FileText,
  MoreVertical,
  MessageSquare,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { showError, showSuccess } from "@/lib/sweetAlert";
import Swal from "sweetalert2";

export default function InvoicesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useInvoices({
    search: search || undefined,
    status: status !== "all" ? status : undefined,
    page,
    limit,
  });

  const deleteInvoice = useDeleteInvoice();

  const handleWhatsApp = (inv: any) => {
    const publicUrl = `${window.location.origin}/public/invoices/${inv._id}`;
    const message = `*Invoice: ${inv.invoiceNumber}*\nHello ${inv.customerName},\nYour invoice for ₹${inv.grandTotal} from Mukesh Auto Garage is ready.\n\nView and Download Invoice: ${publicUrl}\n\nThank you for choosing us!`;
    const url = `https://wa.me/91${inv.customerPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteInvoice.mutateAsync(id);
        showSuccess("Invoice deleted successfully");
      } catch (error) {
        showError("Failed to delete invoice");
      }
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Smart Invoices</h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">Manage billing for services and parts</p>
        </div>
        <Button
          onClick={() => router.push("/admin/invoices/new")}
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <Card className="mb-6 rounded-2xl border-none shadow-sm bg-gray-50/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full rounded-xl bg-white border-gray-200"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full md:w-[180px] rounded-xl bg-white border-gray-200">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : data &&
        (Array.isArray(data) ? data.length > 0 : data.invoices?.length > 0) ? (
        <div className="space-y-4">
          {/* Mobile Card List */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {(Array.isArray(data) ? data : data.invoices).map((inv: any) => (
              <div
                key={inv._id}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-blue-600 font-bold">#{inv.invoiceNumber}</div>
                    <div className="text-xs text-gray-500">{new Date(inv.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${inv.paymentStatus === "paid"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : inv.paymentStatus === "partial"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                  >
                    {inv.paymentStatus.toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-y border-gray-50">
                  <div>
                    <div className="font-semibold text-gray-900">{inv.customerName}</div>
                    <div className="text-xs text-gray-500">{inv.customerPhone}</div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">₹{inv.grandTotal}</div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg h-9 gap-2"
                    onClick={() => router.push(`/admin/invoices/${inv._id}`)}
                  >
                    <FileText className="h-4 w-4" /> View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg h-9 gap-2 text-green-600 border-green-100 hover:bg-green-50"
                    onClick={() => handleWhatsApp(inv)}
                  >
                    <MessageSquare className="h-4 w-4" /> WhatsApp
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg border">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => router.push(`/admin/invoices/edit/${inv._id}`)}>
                        <Edit className="h-4 w-4 mr-2" /> Update Invoice
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(inv._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete Invoice
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden border border-gray-100">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-900">Invoice No.</th>
                  <th className="px-6 py-4 font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-4 font-semibold text-gray-900">Customer</th>
                  <th className="px-6 py-4 font-semibold text-gray-900">Total Amount</th>
                  <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(Array.isArray(data) ? data : data.invoices).map((inv: any) => (
                  <tr key={inv._id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-blue-600">#{inv.invoiceNumber}</td>
                    <td className="px-6 py-4">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{inv.customerName}</div>
                      <div className="text-xs text-gray-500">{inv.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold">₹{inv.grandTotal}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${inv.paymentStatus === "paid"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : inv.paymentStatus === "partial"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                      >
                        {inv.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8  rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => router.push(`/admin/invoices/${inv._id}`)}>
                            <FileText className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/invoices/edit/${inv._id}`)}>
                            <Edit className="h-4 w-4 mr-2" /> Update Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleWhatsApp(inv)} className="text-green-600">
                            <MessageSquare className="h-4 w-4 mr-2" /> Send to WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(inv._id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="bg-gray-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No invoices found
            </h3>
            <p className="text-gray-500 mb-6">
              Start by creating your first customer invoice.
            </p>
            <Button
              onClick={() => router.push("/admin/invoices/new")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Invoice
            </Button>
          </CardContent>
        </Card>
      )}

      {data && !Array.isArray(data) && data.total > data.limit && (
        <div className="flex justify-end items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {Math.ceil(data.total / data.limit)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page * limit >= data.total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
