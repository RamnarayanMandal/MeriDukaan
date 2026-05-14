'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Wrench,
  ChevronRight,
  MessageSquare,
  Bike,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppointments } from '@/hooks/useAppointments';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  'in-progress': 'bg-purple-100 text-purple-700 border-purple-200',
  'ready-for-pickup': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export default function CustomerBookingsPage() {
  const { data: appointments, isLoading } = useAppointments();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-slate-500 text-sm">Track and manage your service appointments</p>
        </div>
        <Link href="/book-service">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-md rounded-xl px-6">
            <Plus className="w-4 h-4 mr-2" /> New Booking
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <Card className="border-slate-100 shadow-sm overflow-hidden">
        <CardContent className="p-4 bg-slate-50/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by bike or service..."
                className="pl-10 bg-white border-slate-200 rounded-xl focus-visible:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-xl border-slate-200 bg-white">
                <Filter className="w-4 h-4 mr-2 text-slate-500" /> Filter
              </Button>
              <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-blue-500">
                <option>All Status</option>
                <option>Pending</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
            <p className="text-slate-500 font-medium">Loading your bookings...</p>
          </div>
        ) : !appointments || appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center px-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings found</h3>
            <p className="text-slate-500 mb-8 max-w-sm">
              You haven't booked any services yet. Start by scheduling your first bike service!
            </p>
            <Link href="/book-service">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-8 py-6 h-auto text-lg font-bold">
                Book Your First Service
              </Button>
            </Link>
          </div>
        ) : (
          appointments.map((appointment: any) => (
            <Card key={appointment._id} className="group hover:shadow-md transition-all border-slate-100 overflow-hidden cursor-pointer">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Status & Date Side */}
                  <div className={cn(
                    "p-5 sm:w-48 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-slate-50 bg-slate-50/30",
                    appointment.status === 'completed' && "bg-green-50/30",
                    appointment.status === 'cancelled' && "bg-red-50/30"
                  )}>
                    <div className="text-sm  text-slate-500  mb-1">
                      {format(new Date(appointment.appointmentDate), 'MMM d, yyyy')}
                    </div>
                    <div className="text-md  text-slate-900">
                      {format(new Date(appointment.appointmentDate), 'hh:mm a')}
                    </div>
                    <Badge variant="outline" className={cn(
                      "mt-3 justify-center py-1 font-bold rounded-lg border-0",
                      statusColors[appointment.status] || 'bg-slate-100 text-slate-700'
                    )}>
                      {appointment.status.replace('-', ' ')}
                    </Badge>
                  </div>

                  {/* Details Side */}
                  <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                          <Bike className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-black text-slate-900">{appointment.bikeModel || 'Unknown Bike'}</div>
                          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{appointment.bikeNumber || 'No Number'}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                          <Wrench className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{appointment.serviceType || 'General Service'}</div>
                          <div className="text-sm text-slate-500 line-clamp-1">{appointment.additionalNotes || 'Standard maintenance check'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link href={`/customer/chat?appointmentId=${appointment._id}`}>
                        <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-green-100 text-slate-600 hover:text-green-600 transition-all">
                          <MessageSquare className="w-5 h-5" />
                        </Button>
                      </Link>
                      <Button className="w-12 h-12 rounded-2xl bg-slate-900 text-white hover:bg-blue-600 transition-all p-0">
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
