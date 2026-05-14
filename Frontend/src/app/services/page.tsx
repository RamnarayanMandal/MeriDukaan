"use client";

import React from 'react';
import { useServices, Service } from '@/hooks/useServices';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/context/ShopSettingsContext';

export default function PublicServicesPage() {
  const { data: services, isLoading } = useServices({ isActive: true });
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Our Professional <span className="text-blue-600">Services</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl">
              We offer a wide range of premium services to keep your ride smooth and safe. Every service is performed by certified experts using genuine parts.
            </p>
          </div>
          <div className="hidden md:block">
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                   <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                   <div className="text-sm font-bold text-slate-900">Best Quality</div>
                   <div className="text-xs text-slate-500 font-medium">Guaranteed Satisfaction</div>
                </div>
             </div>
          </div>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium animate-pulse">Loading amazing services...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services?.map((service: Service) => (
              <Card key={service._id} className="group border-none shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full bg-white">
                {/* Image Header */}
                <div className="relative h-56 overflow-hidden bg-slate-100">
                  {service.image ? (
                    <img 
                      src={service.image} 
                      alt={service.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
                      <Wrench className="w-16 h-16 text-blue-200" />
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm border border-blue-100">
                      {service.category}
                    </span>
                  </div>
                  {/* Price Tag */}
                  <div className="absolute bottom-4 right-4">
                    <div className="px-4 py-2 bg-slate-900/90 backdrop-blur-sm text-white rounded-xl shadow-lg font-bold">
                       ₹{service.basePrice}
                    </div>
                  </div>
                </div>

                <CardContent className="p-8 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300">
                      {service.name}
                    </h3>
                  </div>

                  <p className="text-slate-600 leading-relaxed flex-grow text-sm mb-8">
                    {service.description || `Experience world-class ${service.name} service with our expert technicians in ${settings?.city || 'Madhubani'}.`}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-wide">
                      <Wrench className="w-4 h-4 mr-2 text-blue-500" />
                      {service.estimatedDuration} Minutes
                    </div>
                    <Link href={`/book-service?serviceId=${service._id}`}>
                      <Button className="bg-blue-600 hover:bg-slate-900 text-white shadow-lg shadow-blue-200 hover:shadow-none transition-all duration-300 px-6">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        {!isLoading && services?.length > 0 && (
          <div className="mt-20 p-8 rounded-3xl bg-slate-900 text-white text-center">
             <h2 className="text-2xl md:text-3xl font-bold mb-4">Don't See What You Need?</h2>
             <p className="text-slate-400 mb-8 max-w-xl mx-auto">
               Contact us directly for custom repairs or specific requirements. We handle all types of two-wheeler issues.
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-slate-900 w-full sm:w-auto" asChild>
                   <Link href={`https://wa.me/91${settings?.whatsapp || settings?.phone}`}>
                      Chat on WhatsApp
                   </Link>
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" asChild>
                   <Link href={`tel:+91${settings?.phone}`}>
                      Call Support
                   </Link>
                </Button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
