import React from 'react';
import { cn } from '@/lib/utils';

export type AppointmentStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rejected' | 'bike-ready';

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

const statusConfig: Record<AppointmentStatus, { label: string; classes: string }> = {
  pending: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  confirmed: { label: 'Confirmed', classes: 'bg-blue-100 text-blue-700 border-blue-200' },
  'in-progress': { label: 'In Progress', classes: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  'bike-ready': { label: 'Bike Ready', classes: 'bg-green-100 text-green-700 border-green-200 animate-pulse' },
  completed: { label: 'Completed', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', classes: 'bg-red-100 text-red-700 border-red-200' },
  rejected: { label: 'Rejected', classes: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-bold border shrink-0",
      config.classes,
      className
    )}>
      {config.label}
    </span>
  );
};
