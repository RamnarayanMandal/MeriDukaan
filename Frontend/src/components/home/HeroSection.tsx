"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck, PhoneCall, CalendarCheck } from 'lucide-react';
import { useShopSettings } from '@/hooks/useShopSettings';

export function HeroSection() {
  const { data: settings } = useShopSettings();

  const shopName = settings?.shopName || 'Mukesh Auto Garage';
  const phone = settings?.phone || '7827871342';
  const displayLocation = settings?.city ? `${settings.address}, ${settings.city}, ${settings.pincode}` : 'Hat Parsa, Harlakhi, Madhubani, Bihar 847230';

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white min-h-[90vh] flex items-center pt-20">
      {/* Background Image / Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent z-10" />
        <img
          src={settings?.banner || "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2070&auto=format&fit=crop"}
          alt={`${shopName} Background`}
          className="w-full h-full object-cover opacity-60"
        />
      </div>

      <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-medium text-sm mb-6 border border-blue-500/30">
            <ShieldCheck className="w-4 h-4" /> Trusted by Riders in {settings?.city || 'Hat Parsa, Harlakhi, Madhubani, Bihar 847230'}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            {shopName}
            <span className="block text-blue-500 mt-2 text-3xl md:text-5xl">Expert Bike Service & Repair</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl leading-relaxed">
            Fast, reliable, and affordable two-wheeler servicing in {displayLocation}. From general service to engine rebuilding, your bike is in expert hands.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <Link href="/book-service" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg h-14 px-8 rounded-xl">
                <CalendarCheck className="mr-2 h-5 w-5" /> Book Service Now
              </Button>
            </Link>

            <a href={`tel:${phone}`} className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full border-slate-600 text-slate-900 bg-white hover:bg-slate-100 text-lg h-14 px-8 rounded-xl">
                <PhoneCall className="mr-2 h-5 w-5" /> Call: {phone}
              </Button>
            </a>
          </div>

          {/* Quick Stats / Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-slate-700/50">
            <div>
              <div className="text-3xl font-bold text-white mb-1">10+</div>
              <div className="text-sm text-slate-400">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">Same Day</div>
              <div className="text-sm text-slate-400">Delivery Available</div>
            </div>
            <div className="hidden md:block">
              <div className="text-3xl font-bold text-white mb-1">100%</div>
              <div className="text-sm text-slate-400">Genuine Parts</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
