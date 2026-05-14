"use client";

import { useState } from "react";
import { useAppointments, useUpdateAppointmentStatus } from "@/hooks/useAppointments";
import { AppointmentTable } from "@/components/appointments/AppointmentTable";
import { NotificationDrawer } from "@/components/notifications/NotificationDrawer";
import { AdminChatOverlay } from "@/components/chat/AdminChatOverlay";
import { Button } from "@/components/ui/button";
import { RefreshCw, Bell, MessageSquare, Calendar } from "lucide-react";
import { showError, showSuccess } from "@/lib/sweetAlert";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export default function AppointmentsPage() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeAppointmentId, setActiveAppointmentId] = useState<string | null>(null);
  const [activeChatName, setActiveChatName] = useState("");

  // Table state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const limit = 10;

  const { data, isLoading, refetch } = useAppointments({ page, limit, search, status });
  const { data: notificationsData } = useNotifications();
  const updateStatus = useUpdateAppointmentStatus();

  const handleStatusUpdate = async (id: string, status: any) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      showSuccess("Status updated successfully");
    } catch {
      showError("Failed to update status");
    }
  };

  const handleChat = (id: string) => {
    const apt = (data as any)?.find((a: any) => a._id === id);
    if (apt) {
      setActiveAppointmentId(id);
      setActiveChatName(apt.customerName);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto pb-24">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            Appointments
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Manage service bookings and customer communication</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            className="h-12 rounded-2xl gap-2 font-bold px-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all relative"
            onClick={() => setIsNotificationsOpen(true)}
          >
            <Bell className="w-4 h-4 text-blue-600" />
            Notifications
            {notificationsData?.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-black">
                {notificationsData.length}
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            className="h-12 rounded-2xl gap-2 font-bold px-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all"
            onClick={() => refetch()}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Appointment Table */}
      <AppointmentTable
        data={(data as any) || []}
        total={(data as any)?.total || 0}
        page={page}
        limit={limit}
        isLoading={isLoading}
        onStatusUpdate={handleStatusUpdate}
        onViewDetails={(id) => console.log('View details', id)}
        onChat={handleChat}
        onPageChange={setPage}
        onSearchChange={setSearch}
        onStatusFilterChange={setStatus}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Chat Overlay */}
      {activeAppointmentId && (
        <AdminChatOverlay
          appointmentId={activeAppointmentId}
          recipientName={activeChatName}
          onClose={() => setActiveAppointmentId(null)}
        />
      )}
    </div>
  );
}
