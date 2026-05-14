"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench } from 'lucide-react';
import { useServices, Service } from '@/hooks/useServices';

export function ServicesSection() {
  const { data, isLoading } = useServices({ limit: 6, isActive: true });
  const services = data || [];

  return (
    <section className="py-20 bg-white" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Premium Garage Services</h2>
          <p className="text-lg text-slate-600">
            From quick washes to complete engine overhauls, we provide transparent pricing and expert handling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} className="border-slate-100 animate-pulse">
                <CardContent className="p-6 h-48 bg-slate-50 rounded-xl" />
              </Card>
            ))
          ) : services.map((service: Service) => (
            <Card key={service._id} className="hover:shadow-2xl transition-all duration-500 border-slate-100 group overflow-hidden flex flex-col h-full">
              <div className="relative h-48 overflow-hidden bg-slate-100">
                {service.image ? (
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50">
                    <Wrench className="w-12 h-12 text-blue-200" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                    {service.category}
                  </span>
                </div>
              </div>
              
              <CardContent className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{service.name}</h3>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">₹{service.basePrice}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{service.estimatedDuration} mins</div>
                  </div>
                </div>

                <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-grow">{service.description || 'Professional bike service and maintenance for optimal performance.'}</p>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                  <Link href={`/book-service?serviceId=${service._id}`} className="w-full">
                    <Button className="w-full bg-slate-900 hover:bg-blue-600 text-white transition-all duration-300">
                      Book Appointment
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/services">
            <Button size="lg" className="bg-slate-900 text-white hover:bg-slate-800">
              View All Services
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
