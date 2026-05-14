'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarCheck, MessageSquare, Wrench, Bike, ArrowRight, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useAppointments } from '@/hooks/useAppointments';
import { useAuthContext } from '@/context/AuthContext';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  'in-progress': 'bg-purple-100 text-purple-700',
  'ready-for-pickup': 'bg-cyan-100 text-cyan-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function CustomerDashboardPage() {
  const { user } = useAuthContext();
  const { data: appointments, isLoading } = useAppointments({ limit: 3 });
  const recentBookings = Array.isArray(appointments) ? appointments.slice(0, 3) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-3xl p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              Welcome back, {user?.firstName || 'Rider'}! 👋
            </h1>
            <p className="text-slate-300 text-sm">
              You have <strong>{user?.totalVisits || 0}</strong> service visits. Your bike is in good hands.
            </p>
          </div>
          <Link href="/book-service">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shrink-0">
              <Wrench className="w-4 h-4 mr-2" /> Book a Service
            </Button>
          </Link>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-black">{user?.totalVisits || 0}</div>
            <div className="text-xs text-slate-300 font-semibold uppercase tracking-wider mt-1">Total Visits</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-black">{user?.bikeModel || 0}</div>
            <div className="text-xs text-slate-300 font-semibold uppercase tracking-wider mt-1">Registered Bikes</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm col-span-2 sm:col-span-1">
            <div className="text-2xl font-black">{recentBookings.filter((b: any) => b.status === 'pending').length}</div>
            <div className="text-xs text-slate-300 font-semibold uppercase tracking-wider mt-1">Pending Bookings</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/book-service">
            <Card className="hover:shadow-lg transition-all border-slate-100 cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <CalendarCheck className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Book Service</div>
                  <div className="text-xs text-slate-500">Schedule appointment</div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/customer/bookings">
            <Card className="hover:shadow-lg transition-all border-slate-100 cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                  <Clock className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">My Bookings</div>
                  <div className="text-xs text-slate-500">View & track status</div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/customer/chat">
            <Card className="hover:shadow-lg transition-all border-slate-100 cursor-pointer group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <MessageSquare className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Chat Support</div>
                  <div className="text-xs text-slate-500">Talk to our team</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Registered Bikes */}
      {user?.bikeModel && user.bikeModel.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Your Bikes</h2>
          <div className="flex flex-wrap gap-3">
            {user.bikeModel.map((bike, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                <Bike className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-slate-800">{bike}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Bookings</h2>
          <Link href="/customer/dashboard/bookings" className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : recentBookings.length === 0 ? (
          <Card className="border-dashed border-slate-200">
            <CardContent className="py-12 text-center">
              <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No bookings yet</p>
              <Link href="/book-service">
                <Button size="sm" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                  Book Your First Service
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((apt: any) => (
              <Card key={apt._id} className="border-slate-100 hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Wrench className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {apt.serviceId?.name || 'Service'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(apt.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' '} · {apt.timeSlot}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full shrink-0 ${statusColors[apt.status] || 'bg-slate-100 text-slate-600'}`}>
                    {apt.status.replace('-', ' ')}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
