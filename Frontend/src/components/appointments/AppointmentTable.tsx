'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MoreHorizontal, Search, Filter, ArrowUpDown,
  Calendar, Phone, Bike, Clock, CheckCircle2, XCircle,
  MessageSquare, User, ChevronLeft, ChevronRight, Hash,
  Wrench, AlertCircle, History
} from 'lucide-react';
import { StatusBadge, AppointmentStatus } from './StatusBadge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Appointment {
  _id: string;
  customerName: string;
  phoneNumber: string;
  bikeModel: string;
  serviceId: { _id: string; name: string };
  appointmentDate: string;
  timeSlot: string;
  status: AppointmentStatus;
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
}

interface AppointmentTableProps {
  data: Appointment[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  onStatusUpdate: (id: string, status: AppointmentStatus) => void;
  onViewDetails: (id: string) => void;
  onChat: (id: string) => void;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status: string) => void;
}

export const AppointmentTable: React.FC<AppointmentTableProps> = ({
  data, total, page, limit, isLoading,
  onStatusUpdate, onViewDetails, onChat,
  onPageChange, onSearchChange, onStatusFilterChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, onSearchChange]);

  const totalPages = Math.ceil(total / limit);

  const STATUS_OPTIONS = [
    { label: 'All Status', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Ready', value: 'bike-ready' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Skeleton className="h-10 w-full sm:w-[350px] rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <TableHead key={i} className="py-4"><Skeleton className="h-4 w-20" /></TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map(i => (
                <TableRow key={i}>
                  {[1, 2, 3, 4, 5, 6, 7].map(j => (
                    <TableCell key={j} className="py-4"><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full lg:w-[400px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by customer, phone or bike..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-blue-500 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 rounded-xl border-slate-200 gap-2 font-semibold">
                <Filter className="w-4 h-4" />
                {STATUS_OPTIONS.find(s => s.value === statusFilter)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
              {STATUS_OPTIONS.map(opt => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => {
                    setStatusFilter(opt.value);
                    onStatusFilterChange(opt.value === 'all' ? '' : opt.value);
                  }}
                  className={cn("rounded-lg font-medium", statusFilter === opt.value && "bg-blue-50 text-blue-600")}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" className="h-11 rounded-xl border-slate-200 gap-2 font-semibold">
            <Calendar className="w-4 h-4" />
            Date Filter
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-slate-200 rounded-2xl bg-white shadow-xl shadow-slate-200/20 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="font-black text-slate-800 uppercase text-[11px] tracking-wider py-4 px-6">Customer</TableHead>
                <TableHead className="font-black text-slate-800 uppercase text-[11px] tracking-wider py-4 px-6">Phone</TableHead>
                <TableHead className="font-black text-slate-800 uppercase text-[11px] tracking-wider py-4 px-6">Service</TableHead>
                <TableHead className="font-black text-slate-800 uppercase text-[11px] tracking-wider py-4 px-6">Bike Model</TableHead>
                <TableHead className="font-black text-slate-800 uppercase text-[11px] tracking-wider py-4 px-6">Schedule</TableHead>
                <TableHead className="font-black text-slate-800 uppercase text-[11px] tracking-wider py-4 px-6">Status</TableHead>
                <TableHead className="font-black text-slate-800 uppercase text-[11px] tracking-wider py-4 px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-80 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="w-10 h-10 opacity-20" />
                      </div>
                      <p className="text-xl font-black text-slate-900">No appointments found</p>
                      <p className="text-sm mt-1">Try adjusting your search or status filters</p>
                      <Button
                        variant="link"
                        className="mt-4 text-blue-600 font-bold"
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                          onSearchChange('');
                          onStatusFilterChange('');
                        }}
                      >
                        Clear all filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((appointment) => (
                  <TableRow key={appointment._id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 group">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                          {appointment.customerName.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900">{appointment.customerName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center text-slate-600 font-medium text-sm">
                        <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        {appointment.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center text-slate-900 font-bold text-sm bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-100 inline-flex">
                        <Wrench className="w-3.5 h-3.5 mr-2 text-blue-600" />
                        {appointment.serviceId?.name || 'General Service'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center text-slate-700 font-semibold text-sm">
                        <Bike className="w-3.5 h-3.5 mr-2 text-slate-400" />
                        {appointment.bikeModel}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">
                          {format(new Date(appointment.appointmentDate), 'dd MMM, yyyy')}
                        </span>
                        <div className="flex items-center text-xs text-slate-500 mt-1">
                          <Clock className="w-3 h-3 mr-1" /> {appointment.timeSlot}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <StatusBadge status={appointment.status} />
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-transparent rounded-xl"
                          onClick={() => onChat(appointment._id)}
                        >
                          <MessageSquare className="w-4.5 h-4.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-transparent">
                              <MoreHorizontal className="w-4.5 h-4.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-2xl">
                            <DropdownMenuItem onClick={() => onViewDetails(appointment._id)} className="rounded-xl h-11 font-semibold">
                              <User className="w-4 h-4 mr-3 text-slate-400" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl h-11 font-semibold">
                              <History className="w-4 h-4 mr-3 text-slate-400" /> History
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1.5" />
                            <DropdownMenuItem
                              className="text-blue-600 font-bold rounded-xl h-11"
                              onClick={() => onStatusUpdate(appointment._id, 'confirmed')}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-3" /> Confirm
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-indigo-600 font-bold rounded-xl h-11"
                              onClick={() => onStatusUpdate(appointment._id, 'in-progress')}
                            >
                              <Wrench className="w-4 h-4 mr-3" /> Start Service
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-green-600 font-bold rounded-xl h-11"
                              onClick={() => onStatusUpdate(appointment._id, 'bike-ready')}
                            >
                              <Bike className="w-4 h-4 mr-3" /> Mark Ready
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 font-bold rounded-xl h-11"
                              onClick={() => onStatusUpdate(appointment._id, 'cancelled')}
                            >
                              <XCircle className="w-4 h-4 mr-3" /> Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm gap-4">
        <p className="text-sm font-semibold text-slate-500">
          Showing <span className="text-slate-900">{(page - 1) * limit + 1}</span> to <span className="text-slate-900">{Math.min(page * limit, total)}</span> of <span className="text-slate-900 font-black">{total}</span> results
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="h-10 rounded-xl px-4 border-slate-200 font-bold disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>

          <div className="flex items-center gap-1 mx-2">
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i + 1}
                variant={page === i + 1 ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(i + 1)}
                className={cn(
                  "w-10 h-10 rounded-xl font-bold transition-all",
                  page === i + 1 ? "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200" : "hover:bg-slate-100"
                )}
              >
                {i + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages || totalPages === 0}
            className="h-10 rounded-xl px-4 border-slate-200 font-bold disabled:opacity-50"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

