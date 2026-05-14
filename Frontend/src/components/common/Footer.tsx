"use client";

import React from 'react';
import Link from 'next/link';
import { useSettings } from '@/context/ShopSettingsContext';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin, 
  Wrench,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export function Footer() {
  const { settings } = useSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Identity */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <Wrench className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                {settings?.shopName?.split(' ')[0]}<span className="text-blue-500">{settings?.shopName?.split(' ').slice(1).join(' ')}</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Your trusted partner for professional bike servicing and repairs. We ensure your ride stays smooth and safe with certified experts.
            </p>
            <div className="flex items-center gap-4">
              {settings?.socialLinks?.facebook && (
                <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings?.socialLinks?.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all duration-300">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings?.socialLinks?.twitter && (
                <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all duration-300">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
               Quick Navigation
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="hover:text-blue-500 flex items-center group transition-colors">
                  <ChevronRight className="w-4 h-4 mr-2 text-slate-600 group-hover:translate-x-1 transition-transform" />
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-blue-500 flex items-center group transition-colors">
                  <ChevronRight className="w-4 h-4 mr-2 text-slate-600 group-hover:translate-x-1 transition-transform" />
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/book-service" className="hover:text-blue-500 flex items-center group transition-colors font-semibold text-blue-400">
                  <ChevronRight className="w-4 h-4 mr-2 text-slate-600 group-hover:translate-x-1 transition-transform" />
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-blue-500 flex items-center group transition-colors">
                  <ChevronRight className="w-4 h-4 mr-2 text-slate-600 group-hover:translate-x-1 transition-transform" />
                  Staff Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Support / Public Access */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
               Customer Support
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/public/invoices" className="hover:text-blue-500 flex items-center group transition-colors">
                  <ExternalLink className="w-4 h-4 mr-2 text-slate-600" />
                  View Public Invoice
                </Link>
              </li>
              <li>
                <Link href="/track-service" className="hover:text-blue-500 flex items-center group transition-colors">
                  <ExternalLink className="w-4 h-4 mr-2 text-slate-600" />
                  Track Service History
                </Link>
              </li>
              <li className="pt-2">
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                   <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Working Hours</div>
                   <div className="text-sm text-white font-medium">
                     {settings?.openingHours} - {settings?.closingHours}
                   </div>
                   <div className="text-[10px] text-slate-400 mt-1">Mon - Sat (Sunday Closed)</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-sm">
                   <div className="font-bold text-white mb-1">Workshop Address</div>
                   {settings?.address}, {settings?.city}, {settings?.state} {settings?.pincode}
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-sm">
                   <div className="font-bold text-white mb-1">Call Now</div>
                   <a href={`tel:+91${settings?.phone}`} className="hover:text-white transition-colors">
                     +91 {settings?.phone}
                   </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-sm">
                   <div className="font-bold text-white mb-1">Email Support</div>
                   <a href={`mailto:${settings?.email}`} className="hover:text-white transition-colors">
                     {settings?.email}
                   </a>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-4 text-slate-500">
            <span>© {currentYear} {settings?.shopName}. All rights reserved.</span>
            <span className="hidden md:inline text-slate-700">|</span>
            <Link href="/privacy-policy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300">Terms of Service</Link>
          </div>
          <div className="text-slate-500">
            Powered by <span className="text-blue-500 font-bold">MeriDukaan AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
