"use client";

import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useShopSettings } from '@/hooks/useShopSettings';

export function LocationSection() {
  const { data: settings } = useShopSettings();



  const shopName = settings?.shopName || 'Mukesh Auto Garage';
  const address = settings?.address || 'Hat Parsa';
  const city = settings?.city || 'Harlakhi, Madhubani';
  const state = settings?.state || 'Bihar';
  const pincode = settings?.pincode || '847225';
  const phone = settings?.phone || '7827871342';
  const email = settings?.email;
  const googleMapLink = settings?.googleMapLink || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1371.9694842093834!2d85.92562719620086!3d26.571676599696346!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ec47138fca737d%3A0xd75558ec58305314!2sMukesh%20auto%20garage%20centre%20Hat%20parsa%20%2F%20beta%20parsa!5e0!3m2!1sen!2sin!4v1778583316904!5m2!1sen!2sin";
  const openingHours = settings?.openingHours || '09:00 AM';
  const closingHours = settings?.closingHours || '08:00 PM';

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Contact Details */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Visit Our Workshop</h2>
            <p className="text-lg text-slate-600 mb-8">
              {shopName} is conveniently located in {city}. Drop by for a quick checkup or leave your bike with us for major repairs.
            </p>

            <div className="space-y-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Address</h4>
                    <p className="text-slate-600 mt-1">{shopName}, {address},<br />{city}, {state} {pincode}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Phone / WhatsApp</h4>
                    <a href={`tel:${phone}`} className="text-slate-600 mt-1 hover:text-green-600">+91 {phone}</a>
                  </div>
                </CardContent>
              </Card>

              {email && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Email</h4>
                      <a href={`mailto:${email}`} className="text-slate-600 mt-1 hover:text-indigo-600">{email}</a>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Working Hours</h4>
                    <p className="text-slate-600 mt-1">Mon - Sun: {openingHours} - {closingHours}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Google Maps Embed */}
          <div className="h-[400px] lg:h-[500px] w-full bg-slate-200 rounded-2xl overflow-hidden shadow-md">
            <iframe
              src={googleMapLink}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

        </div>
      </div>
    </section>
  );
}
