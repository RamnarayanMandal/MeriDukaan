"use client";

import { useRef } from "react";
import { useParams } from "next/navigation";
import { usePublicInvoice } from "@/hooks/useInvoices";
import { useSettings } from "@/context/ShopSettingsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Download, CheckCircle2 } from "lucide-react";

export default function PublicInvoicePage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const { data: invoice, isLoading: isInvoiceLoading } = usePublicInvoice(invoiceId);
  const { settings, isLoading: isSettingsLoading } = useSettings();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const isLoading = isInvoiceLoading || isSettingsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Fetching details...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <Card className="max-w-md w-full text-center p-8">
          <div className="bg-red-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Invoice Not Found</h2>
          <p className="text-gray-500 mt-2">The invoice you're looking for doesn't exist or may have been removed.</p>
          <Button className="mt-6 w-full" onClick={() => window.location.href = '/'}>Go to Homepage</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      {/* Global Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .print-hidden {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 print-hidden">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: settings.themeColors.primary }}>
              {settings.logo ? (
                <img src={settings.logo} alt={settings.shopName} className="h-8 w-8 object-contain" />
              ) : (
                <CheckCircle2 className="text-white h-6 w-6" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{settings.shopName}</h1>
              <p className="text-sm text-gray-500">Official Invoice</p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={handlePrint} className="flex-1 sm:flex-none bg-white">
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
            <Button className="flex-1 sm:flex-none text-white shadow-md" style={{ backgroundColor: settings.themeColors.primary }}>
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
          </div>
        </div>

        <div className="print-container">
          <Card className="shadow-2xl sm:shadow-xl print:shadow-none border-none overflow-hidden" ref={printRef}>
            <CardContent className="p-8 md:p-16 bg-white">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between border-b pb-10">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">{settings.shopName}</h1>
                  <p className="text-gray-500 mt-2 font-medium">{settings.address}</p>
                  <p className="text-gray-500 font-medium">{settings.city}, {settings.state} - {settings.pincode}</p>
                  <div className="mt-4 flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full w-fit text-sm font-bold" style={{ color: settings.themeColors.primary, backgroundColor: `${settings.themeColors.primary}10` }}>
                    Phone: +91 {settings.phone}
                  </div>
                </div>
                <div className="mt-10 md:mt-0 md:text-right">
                  <h2 className="text-6xl font-black text-gray-100 uppercase tracking-tighter mb-4">INVOICE</h2>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Invoice Number</p>
                  <p className="text-lg font-black text-gray-900">#{invoice.invoiceNumber}</p>
                  <div className="mt-4">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Date Issued</p>
                    <p className="text-gray-900 font-bold">{new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`mt-8 px-6 py-3 rounded-xl flex items-center justify-between border ${invoice.paymentStatus === 'paid' ? 'bg-green-50 border-green-100 text-green-700' :
                  invoice.paymentStatus === 'partial' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' :
                    'bg-red-50 border-red-100 text-red-700'
                }`}>
                <span className="font-bold uppercase tracking-widest text-xs">Payment Status</span>
                <span className="font-black text-sm uppercase">{invoice.paymentStatus}</span>
              </div>

              {/* Customer Details */}
              <div className="py-12 grid grid-cols-1 md:grid-cols-2 gap-12 border-b">
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Billed To</h3>
                  <p className="text-2xl font-black text-gray-900">{invoice.customerName}</p>
                  <p className="text-gray-500 font-bold mt-2">{invoice.customerPhone}</p>
                </div>
                <div>
                  {invoice.vehicleModel && (
                    <>
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Vehicle Identity</h3>
                      <p className="text-2xl font-black text-gray-900">{invoice.vehicleModel}</p>
                      <div className="h-1 w-12 mt-4" style={{ backgroundColor: settings.themeColors.primary }}></div>
                    </>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="py-10">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b-2 border-gray-900">
                      <th className="py-4">Service / Product</th>
                      <th className="py-4 text-center">Qty</th>
                      <th className="py-4 text-right">Price</th>
                      <th className="py-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoice.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-6">
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{item.itemType}</p>
                        </td>
                        <td className="py-6 text-center text-gray-600 font-black">{item.quantity}</td>
                        <td className="py-6 text-right text-gray-500 font-bold">₹{item.rate.toLocaleString('en-IN')}</td>
                        <td className="py-6 text-right font-black text-gray-900 text-lg">₹{(item.quantity * item.rate).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Calculations */}
              <div className="flex flex-col md:flex-row justify-between items-start mt-10 pt-10 border-t-4 border-gray-900">
                <div className="w-full md:w-1/3 mb-10 md:mb-0">
                  {invoice.qrCodeUrl && (
                    <div className="bg-gray-50 p-6 rounded-3xl inline-block border-2 border-dashed border-gray-200">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(invoice.qrCodeUrl)}`}
                        alt="Pay Now"
                        className="w-32 h-32 mix-blend-multiply"
                      />
                      <p className="text-[9px] font-black text-center mt-4 text-gray-400 uppercase tracking-widest">Secure UPI Payment</p>
                    </div>
                  )}
                </div>

                <div className="w-full md:w-1/2 space-y-4">
                  <div className="flex justify-between text-gray-500 font-bold uppercase text-[11px] tracking-wider">
                    <span>Net Subtotal</span>
                    <span className="text-gray-900">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-green-600 font-bold uppercase text-[11px] tracking-wider">
                      <span>Loyalty Discount</span>
                      <span>-₹{invoice.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {invoice.gstRate > 0 && (
                    <div className="flex justify-between text-gray-500 font-bold uppercase text-[11px] tracking-wider">
                      <span>GST ({invoice.gstRate}%)</span>
                      <span className="text-gray-900">₹{invoice.gstAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4">
                    <span className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Total Payable</span>
                    <span className="text-4xl font-black tracking-tighter" style={{ color: settings.themeColors.primary }}>₹{invoice.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                  {invoice.paymentStatus === 'partial' && (
                    <div className="flex justify-between text-red-600 font-black uppercase text-[11px] tracking-wider pt-2">
                      <span>Balance Remaining</span>
                      <span>₹{(invoice.grandTotal - (invoice.amountPaid || 0)).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Thank you */}
              <div className="mt-24 text-center border-t border-dashed pt-12 border-gray-200">
                <h4 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-3">Drive Safe!</h4>
                <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">{settings.invoiceFooter}</p>
                <div className="mt-8 flex justify-center items-center gap-6 text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">
                  <span>Official Copy</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-200"></div>
                  <span>{settings.shopName}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
