'use client';

import React, { useState, useEffect } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useChatRooms, useStartSupportChat } from '@/hooks/useChat';
import { useAppointments } from '@/hooks/useAppointments';
import {
  MessageSquare, ChevronRight,
  Search, Clock, Bike, Wrench,
  Plus, Loader2, ShieldCheck, Headphones
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';


export default function CustomerChatPage() {
  const { data: chatRooms, isLoading: isLoadingRooms } = useChatRooms();
  const { data: appointmentsData, isLoading: isLoadingApts } = useAppointments({ limit: 10 });
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);

  const startSupportMutation = useStartSupportChat();

  const appointments = (appointmentsData as any) || [];

  // Auto-select the first room if none selected on desktop
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (chatRooms && chatRooms.length > 0 && !selectedRoomId && !isMobile) {
      setSelectedRoomId(chatRooms[0]._id);
      setShowMobileList(false);
    }
  }, [chatRooms, selectedRoomId]);

  const handleStartSupportChat = () => {
    startSupportMutation.mutate(undefined, {
      onSuccess: (room) => {
        setSelectedRoomId(room._id);
        setShowMobileList(false);
      }
    });
  };

  // Find the general support room (no appointmentId)
  const supportRoom = chatRooms?.find(r => !r.appointmentId);

  // Filter appointment-based rooms
  const appointmentRooms = chatRooms?.filter(r => !!r.appointmentId) || [];

  const filteredAptRooms = appointmentRooms.filter(room => {
    const apt = appointments.find((a: any) => a._id === room.appointmentId);
    if (!apt) return true;
    return apt.bikeModel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.serviceId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedRoom = chatRooms?.find(r => r._id === selectedRoomId);
  const selectedApt = appointments.find((a: any) => a._id === selectedRoom?.appointmentId);

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-4 md:gap-6">
      {/* Page Header */}
      <div className={cn("px-4 md:px-0", !showMobileList && "hidden md:block")}>
        <h1 className="text-lg  text-slate-900 tracking-tight">Support & Chat</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">Talk to our experts and track your service progress.</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0 relative px-4 md:px-0">
        {/* Rooms Sidebar */}
        <div className={cn(
          "w-full md:w-80 flex flex-col gap-4 shrink-0 transition-all",
          !showMobileList && "hidden md:flex"
        )}>
          {/* Quick Actions */}
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 rounded-xl shadow-lg shadow-blue-100 flex items-center gap-2"
            onClick={handleStartSupportChat}
            disabled={startSupportMutation.isPending}
          >
            {startSupportMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Contact Garage Admin
          </Button>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-blue-600"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {/* General Support Room First */}
            {supportRoom && (
              <Card
                className={cn(
                  "cursor-pointer transition-all border-slate-100 hover:shadow-md rounded-2xl overflow-hidden",
                  selectedRoomId === supportRoom._id ? "ring-2 ring-blue-600 bg-blue-50/50" : "bg-white"
                )}
                onClick={() => { setSelectedRoomId(supportRoom._id); setShowMobileList(false); }}
              >
                <CardContent className="p-4 flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-900 text-sm">Garage Support</h4>
                    <p className="text-[11px] text-slate-500 font-bold">General Assistance</p>
                  </div>
                  {supportRoom.unreadCount.customer > 0 && (
                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {supportRoom.unreadCount.customer}
                    </span>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="pt-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-3">Service Appointments</p>
              {isLoadingRooms || isLoadingApts ? (
                [1, 2].map(i => (
                  <Card key={i} className="border-slate-100 mb-3 rounded-2xl">
                    <CardContent className="p-4 flex gap-4">
                      <Skeleton className="w-12 h-12 rounded-2xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredAptRooms.length === 0 ? (
                !supportRoom && (
                  <div className="text-center py-10 px-4">
                    <MessageSquare className="w-10 h-10 mx-auto text-slate-200 mb-3" />
                    <p className="text-xs text-slate-400 font-medium">No appointment chats yet.</p>
                  </div>
                )
              ) : (
                filteredAptRooms.map((room) => {
                  const apt = appointments.find((a: any) => a._id === room.appointmentId);
                  const isActive = selectedRoomId === room._id;

                  return (
                    <Card
                      key={room._id}
                      className={cn(
                        "cursor-pointer transition-all border-slate-100 hover:shadow-md rounded-2xl mb-3",
                        isActive ? "ring-2 ring-blue-600 bg-blue-50/50" : "bg-white"
                      )}
                      onClick={() => { setSelectedRoomId(room._id); setShowMobileList(false); }}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200",
                            isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                          )}>
                            <Bike className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="font-black text-slate-900 truncate text-sm">
                                {apt?.bikeModel || 'Service Update'}
                              </h4>
                              {room.unreadCount.customer > 0 && (
                                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                  {room.unreadCount.customer}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate font-bold mt-0.5">
                              {apt?.serviceId?.name || 'General Maintenance'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn(
          "flex-1 bg-white rounded-3xl md:rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col transition-all duration-300",
          showMobileList && "hidden md:flex"
        )}>
          {selectedRoomId ? (
            <>
              {/* Mobile Header */}
              <div className="md:hidden flex items-center p-4 border-b border-slate-100 bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 font-bold text-slate-600 pl-0 hover:bg-transparent"
                  onClick={() => setShowMobileList(true)}
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                  Back
                </Button>
                <div className="ml-4 flex-1 truncate">
                  <h3 className="font-black text-slate-900 text-sm truncate">
                    {selectedApt ? selectedApt.bikeModel : "Garage Support"}
                  </h3>
                </div>
              </div>

              <ChatWindow
                chatRoomId={selectedRoomId}
                recipientName={selectedApt ? "Garage Mechanic" : "Garage Support"}
                recipientImage={undefined}
                onClose={() => setShowMobileList(true)}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/20">
              <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-slate-200/50 mb-8 border border-slate-50">
                <ShieldCheck className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Expert Support</h3>
              <p className="text-sm max-w-sm mt-3 leading-relaxed font-medium">
                Select a conversation or start a new support request to chat with our expert mechanics.
              </p>
              <Button
                variant="outline"
                className="mt-8 border-slate-200 text-slate-600 font-bold rounded-2xl h-11 px-6 hover:bg-slate-50"
                onClick={handleStartSupportChat}
              >
                New Support Ticket
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
