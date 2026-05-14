"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useInvoice } from "@/hooks/useInvoices";
import { useSettings } from "@/context/ShopSettingsContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  Mail, 
  Phone,
  Building2 
} from "lucide-react";
import html2pdf from "html2pdf.js";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const { data: invoice, isLoading: isInvoiceLoading } = useInvoice(invoiceId);
  const { settings, isLoading: isSettingsLoading } = useSettings();
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!printRef.current || !invoice) return;
    setIsDownloading(true);

    const element = printRef.current;
    const opt = {
      margin:       0.5,
      filename:     `invoice-${invoice.invoiceNumber}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsDownloading(false);
    });
  };

  const isLoading = isInvoiceLoading || isSettingsLoading;

  if (isLoading) {
    return <div className="p-12 text-center">Loading invoice...</div>;
  }

  if (!invoice || !settings) {
    return <div className="p-12 text-center text-red-500">Invoice or settings not found</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
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

      <div className="flex items-center justify-between mb-8 print-hidden">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isDownloading ? "Generating PDF..." : "Download PDF"}
          </Button>
        </div>
      </div>

      <div className="print-container">
        <Card className="border-none shadow-xl print:shadow-none overflow-hidden" ref={printRef}>
          <CardContent className="p-0">
            {/* Header / Brand Bar */}
            <div className="p-8 md:p-12 border-b-8" style={{ borderColor: settings.themeColors?.primary || '#2563eb' }}>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="flex items-center gap-4">
                     <div className="h-16 w-16 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: settings.themeColors?.primary || '#2563eb' }}>
                        {settings.logo ? (
                          <img src={settings.logo} alt={settings.shopName} className="h-10 w-10 object-contain" />
                        ) : (
                          <Building2 className="text-white h-10 w-10" />
                        )}
                     </div>
                     <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">{settings.shopName}</h1>
                        <p className="text-gray-500 font-bold text-sm tracking-widest uppercase">Premium Automotive Solutions</p>
                     </div>
                  </div>
                  <div className="mt-6 md:mt-0 text-left md:text-right">
                     <h2 className="text-5xl font-black text-gray-100 uppercase tracking-tighter absolute right-8 top-12 select-none print:text-gray-50">INVOICE</h2>
                     <div className="relative z-10">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Invoice Number</p>
                        <p className="text-xl font-black text-gray-900">#{invoice.invoiceNumber}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-8 md:p-12">
               {/* Contact Grid */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-gray-100">
                  <div className="space-y-3">
                     <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Our Location</h3>
                     <p className="text-gray-900 font-bold leading-relaxed">
                        {settings.address}<br/>
                        {settings.city}, {settings.state} - {settings.pincode}
                     </p>
                  </div>
                  <div className="space-y-3">
                     <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Direct Contact</h3>
                     <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-gray-900 font-bold">
                           <Phone className="h-3 w-3" style={{ color: settings.themeColors?.primary || '#2563eb' }} /> +91 {settings.phone}
                        </span>
                        <span className="flex items-center gap-2 text-gray-900 font-bold">
                           <Mail className="h-3 w-3" style={{ color: settings.themeColors?.primary || '#2563eb' }} /> {settings.email}
                        </span>
                     </div>
                  </div>
                  <div className="space-y-3 md:text-right">
                     <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Date of Issue</h3>
                     <p className="text-gray-900 font-bold">{new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </div>
               </div>

               {/* Customer Section */}
               <div className="py-12 grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-gray-100 bg-gray-50/50 -mx-12 px-12">
                  <div className="space-y-2">
                     <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Invoice To</h3>
                     <p className="text-3xl font-black text-gray-900 leading-none">{invoice.customerName}</p>
                     <p className="text-lg font-bold text-gray-500">{invoice.customerPhone}</p>
                  </div>
                  {invoice.vehicleModel && (
                    <div className="md:text-right">
                       <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Vehicle Details</h3>
                       <p className="text-2xl font-black text-gray-900">{invoice.vehicleModel}</p>
                       <div className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] font-black text-gray-500 uppercase mt-2">
                          Verified Service
                       </div>
                    </div>
                  )}
               </div>

               {/* Table */}
               <div className="py-10">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b-2 border-gray-900">
                       <th className="py-4">Item Description</th>
                       <th className="py-4 text-center">Qty</th>
                       <th className="py-4 text-right">Rate</th>
                       <th className="py-4 text-right">Amount</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {invoice.items.map((item: any, idx: number) => (
                       <tr key={idx} className="group">
                         <td className="py-6">
                            <p className="font-bold text-gray-900">{item.name}</p>
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">{item.itemType}</p>
                         </td>
                         <td className="py-6 text-center text-gray-600 font-black">{item.quantity}</td>
                         <td className="py-6 text-right text-gray-500 font-bold">₹{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                         <td className="py-6 text-right font-black text-gray-900 text-lg">₹{(item.quantity * item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>

               {/* Totals */}
               <div className="flex flex-col md:flex-row justify-between items-start mt-6 pt-10 border-t-2 border-gray-100">
                  <div className="w-full md:w-1/3 mb-10 md:mb-0">
                    {invoice.qrCodeUrl && (
                      <div className="bg-white p-4 rounded-2xl inline-block border border-gray-100 shadow-sm">
                         <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(invoice.qrCodeUrl)}`} 
                          alt="Payment QR" 
                          className="w-24 h-24"
                         />
                         <p className="text-[8px] font-black text-center mt-3 text-gray-400 uppercase tracking-widest">Scan to Pay</p>
                      </div>
                    )}
                  </div>

                  <div className="w-full md:w-1/2 space-y-3">
                    <div className="flex justify-between items-center text-gray-500 font-bold">
                      <span className="text-sm uppercase tracking-wider">Subtotal</span>
                      <span className="text-gray-900">₹{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {invoice.discount > 0 && (
                      <div className="flex justify-between items-center text-green-600 font-medium">
                        <span className="text-sm uppercase tracking-wider">Discount Applied</span>
                        <span>-₹{invoice.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {invoice.gstRate > 0 && (
                      <div className="flex justify-between items-center text-gray-500 font-medium">
                        <span className="text-sm uppercase tracking-wider">GST ({invoice.gstRate}%)</span>
                        <span className="text-gray-900">₹{invoice.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t-4 border-gray-900 pt-4 mt-4">
                      <span className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Amount Due</span>
                      <span className="text-3xl font-black tracking-tighter" style={{ color: settings.themeColors?.primary || '#2563eb' }}>₹{invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {invoice.paymentStatus === 'partial' && (
                      <div className="flex justify-between items-center text-red-600 pt-1 font-bold">
                        <span className="text-xs uppercase tracking-widest">Balance Pending</span>
                        <span className="text-lg">₹{(invoice.grandTotal - (Number(invoice.amountPaid) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                  </div>
               </div>

               {/* Footer */}
               <div className="mt-20 pt-10 border-t border-dashed border-gray-200 text-center">
                 <p className="font-black text-gray-900 mb-2 uppercase tracking-widest text-xs italic">{settings.invoiceFooter}</p>
                 <div className="flex justify-center items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <span>Original Copy</span>
                    <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                    <span>{settings.shopName}</span>
                    <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                    <span>{new Date().getFullYear()}</span>
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
