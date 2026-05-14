"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, CalendarCheck, ChevronUp } from 'lucide-react';
import { useShopSettings } from '@/hooks/useShopSettings';

export function FloatingButtons() {
  const [showScroll, setShowScroll] = useState(false);
  const { data: settings } = useShopSettings();
  
  const phone = settings?.phone || '7827871342';
  const shopName = settings?.shopName || 'Mukesh Auto Garage';

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
      {/* Scroll to Top */}
      {showScroll && (
        <button 
          onClick={scrollToTop}
          className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 transition-all"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      {/* Book Service (Mobile Only) */}
      <Link href="/book-service" className="md:hidden">
        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30">
          <CalendarCheck className="w-6 h-6" />
        </div>
      </Link>

      {/* WhatsApp Floating */}
      <a 
        href={`https://wa.me/91${phone}?text=Hi%20${encodeURIComponent(shopName)},%20I%20want%20to%20book%20a%20bike%20service.`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:bg-green-600 hover:scale-105 transition-all duration-300"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle className="w-8 h-8" />
      </a>
    </div>
  );
}
