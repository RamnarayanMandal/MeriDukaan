"use client";

import { useParams, useRouter } from "next/navigation";
import { useBill } from "@/hooks/useBills";
import { useShop } from "@/hooks/useShop";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";
import Image from "next/image";

// Date formatting helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export default function PrintBillPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: bill, isLoading } = useBill(id);
  const { data: shop } = useShop();

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-gray-600">Bill not found</p>
        <Button className="mt-4" onClick={() => router.push("/admin/bills")}>
          Back to Bills
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Print Controls - Hidden when printing */}
      <div className="max-w-4xl mx-auto mb-6 print:hidden">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Bill
          </Button>
        </div>
      </div>

      {/* Bill Content */}
      <div className="max-w-4xl mx-auto bg-white p-8 border border-gray-200 shadow-lg print:shadow-none print:border-0">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b-2 border-yellow-500 pb-4">
          <div className="flex-1">
            {shop?.logo && (
              <img
                src={shop.logo}
                alt="Shop Logo"
                className="h-20 mb-4 object-contain"
              />
            )}
            <h1 className="text-3xl font-bold text-yellow-700">
              {shop?.shopName || "Shop Name"}
            </h1>
            {shop?.address && (
              <p className="text-gray-700 mt-2">{shop.address}</p>
            )}
            <div className="mt-2 space-y-1 text-gray-700">
              {shop?.mobileNumbers?.map((mobile, index) => (
                <p key={index}>Mobile: {mobile}</p>
              ))}
              {shop?.gstNo && (
                <p>GST No: {shop.gstNo}</p>
              )}
              {shop?.email && (
                <p>Email: {shop.email}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-yellow-700 mb-4">TAX INVOICE</h2>
            <div className="space-y-1 text-sm text-gray-700">
              <p className="font-semibold">Bill No: {bill.billNumber}</p>
              <p>Date: {formatDate(bill.billDate)}</p>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-8 border-b border-gray-200 pb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
          <p className="text-gray-700 font-medium">{bill.customerName}</p>
          {bill.customerAddress && (
            <p className="text-gray-600">{bill.customerAddress}</p>
          )}
          {bill.customerPhone && (
            <p className="text-gray-600">Phone: {bill.customerPhone}</p>
          )}
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-yellow-100 text-yellow-800 text-left font-semibold">
                <th className="py-2 px-4 border border-yellow-200">Sl. No</th>
                <th className="py-2 px-4 border border-yellow-200">Particulars</th>
                <th className="py-2 px-4 border border-yellow-200">Quantity</th>
                <th className="py-2 px-4 border border-yellow-200">Rate</th>
                <th className="py-2 px-4 border border-yellow-200 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item: any, index: number) => {
                const productName = typeof item.product === "string"
                  ? "Product"
                  : item.product?.name || "Product";
                const unit = typeof item.product === "string"
                  ? ""
                  : item.product?.unit || "";
                const amount = item.quantity * item.rate;

                return (
                  <tr key={item._id || index} className="even:bg-gray-50">
                    <td className="py-2 px-4 border border-gray-200">{index + 1}</td>
                    <td className="py-2 px-4 border border-gray-200">{productName}</td>
                    <td className="py-2 px-4 border border-gray-200">{item.quantity} {unit}</td>
                    <td className="py-2 px-4 border border-gray-200">₹{item.rate.toFixed(2)}</td>
                    <td className="py-2 px-4 border border-gray-200 text-right">₹{amount.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals and Amount in Words */}
        <div className="flex justify-between items-end">
          <div className="w-1/2 pr-4">
            <p className="font-semibold text-gray-800 mb-2">Amount in Words:</p>
            <p className="text-gray-700 italic">{bill.amountInWords} Only</p>
          </div>
          <div className="w-1/2 pl-4">
            <div className="border border-yellow-300 bg-yellow-50 p-4 space-y-2">
              <div className="flex justify-between font-semibold text-gray-800">
                <span>Subtotal:</span>
                <span>₹{bill.subtotal?.toFixed(2) || bill.grandTotal.toFixed(2)}</span>
              </div>
              {bill.tax && bill.tax > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Tax ({bill.tax}%):</span>
                  <span>₹{((bill.subtotal || bill.grandTotal) * bill.tax / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-yellow-800 border-t border-yellow-300 pt-2">
                <span>Grand Total:</span>
                <span>₹{bill.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Thank you for your business!</p>
          <p>This is a computer generated invoice and does not require a signature.</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none;
          }
          .print\\:shadow-none {
            box-shadow: none;
          }
          .print\\:border-0 {
            border: 0;
          }
        }
      `}</style>
    </div>
  );
}
