'use client';

import React, { useState, useEffect } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useChatRooms, useStartCustomerChat } from '@/hooks/useChat';
import { useAppointments } from '@/hooks/useAppointments';
import {
  MessageSquare, User, ChevronRight,
  Search, Filter, Clock, Bike, Wrench, AlertCircle,
  Plus, Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useGetCustomers } from '@/hooks/useAuth';

export default function AdminChatPage() {
  const { data: chatRooms, isLoading: isLoadingRooms } = useChatRooms();
  const { data: appointmentsData, isLoading: isLoadingApts } = useAppointments({ limit: 100 });
  const { data: customersData, isLoading: isLoadingCustomers } = useGetCustomers();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);

  const startChatMutation = useStartCustomerChat();

  const handleStartChat = () => {
    if (selectedCustomerId) {
      startChatMutation.mutate(selectedCustomerId, {
        onSuccess: (room) => {
          setSelectedRoomId(room._id);
        }
      });
    }
  };

  const customers = customersData?.data || [];
  const appointments = (appointmentsData as any)?.appointments || [];

  // Merge customers with their chat rooms
  const customerList = customers.map((customer: any) => {
    const room = chatRooms?.find(r => r.customerId === customer._id || r.customerId?._id === customer._id);
    const apt = appointments.find((a: any) => a.customerId === customer._id);
    return {
      ...customer,
      room,
      lastAppointment: apt,
      unreadCount: room?.unreadCount?.admin || 0
    };
  });

  // Filter based on search
  const filteredCustomers = customerList.filter((c: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      c.firstName?.toLowerCase().includes(searchLower) ||
      c.lastName?.toLowerCase().includes(searchLower) ||
      c.phoneNumber?.includes(searchTerm) ||
      c.email?.toLowerCase().includes(searchLower)
    );
  });

  // Auto-select the first customer on desktop
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (filteredCustomers.length > 0 && !selectedCustomerId && !isMobile) {
      setSelectedCustomerId(filteredCustomers[0]._id);
      if (filteredCustomers[0].room) {
        setSelectedRoomId(filteredCustomers[0].room._id);
      }
      setShowMobileList(false);
    }
  }, [filteredCustomers, selectedCustomerId]);

  const handleSelectCustomer = (customer: any) => {
    setSelectedCustomerId(customer._id);
    setSelectedRoomId(customer.room?._id || null);
    setShowMobileList(false);
  };

  const selectedCustomer = customers.find((c: any) => c._id === selectedCustomerId);
  const selectedRoom = chatRooms?.find(r => r._id === selectedRoomId);

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-120px)] flex flex-col gap-4 md:gap-6 p-4 md:p-0">
      {/* Page Header */}
      <div className={cn(
        "flex justify-between items-center bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm transition-all",
        !showMobileList && "hidden md:flex"
      )}>
        <div>
          <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            Shop Support
          </h1>
          <p className="hidden md:block text-sm text-slate-500 mt-1 font-medium">Chat with all registered customers from one place.</p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] md:text-xs font-bold text-slate-600">Active</span>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0 relative">
        {/* Customers Sidebar */}
        <div className={cn(
          "w-full md:w-96 flex flex-col gap-4 shrink-0 transition-all duration-300",
          !showMobileList && "hidden md:flex"
        )}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search all customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-white border-slate-200 rounded-2xl shadow-sm focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {isLoadingCustomers || isLoadingRooms ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl flex gap-4">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))
            ) : filteredCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <User className="w-16 h-16 mb-4 opacity-10" />
                <p className="text-base font-bold text-slate-600">No customers found</p>
              </div>
            ) : (
              filteredCustomers.map((customer: any) => {
                const isActive = selectedCustomerId === customer._id;

                return (
                  <Card
                    key={customer._id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 border-slate-100 hover:shadow-md rounded-2xl overflow-hidden",
                      isActive ? "ring-2 ring-blue-600 bg-blue-50" : "bg-white"
                    )}
                    onClick={() => handleSelectCustomer(customer)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200",
                          isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                        )}>
                          {customer.profilePicture ? (
                            <img src={customer.profilePicture} alt="" className="w-full h-full object-cover rounded-2xl" />
                          ) : (
                            <User className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-black text-slate-900 truncate text-sm">
                              {customer.firstName} {customer.lastName}
                            </h4>
                            {customer.unreadCount > 0 && (
                              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                                {customer.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col mt-0.5">
                            <p className="text-[11px] text-slate-500 truncate font-bold">
                              {customer.email}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {customer.phoneNumber || 'No phone'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn(
          "flex-1 bg-white rounded-3xl md:rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col transition-all duration-300",
          showMobileList && "hidden md:flex"
        )}>
          {selectedCustomerId ? (
            <>
              {/* Mobile Back Button */}
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
                  <h3 className="font-black text-slate-900 text-sm truncate">{selectedCustomer?.firstName} {selectedCustomer?.lastName}</h3>
                </div>
              </div>

              {selectedRoomId ? (
                <ChatWindow
                  chatRoomId={selectedRoomId}
                  recipientName={`${selectedCustomer?.firstName} ${selectedCustomer?.lastName}`}
                  recipientImage={selectedCustomer?.profilePicture || undefined}
                  onClose={() => setShowMobileList(true)}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/30">
                  <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-slate-200/50 mb-8 border border-slate-50">
                    <MessageSquare className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">No Conversation Yet</h3>
                  <p className="text-sm max-w-sm mt-3 leading-relaxed font-medium">
                    You haven't started a conversation with {selectedCustomer?.firstName} {selectedCustomer?.lastName} yet.
                  </p>

                  <Button
                    className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl px-8 h-12 shadow-lg shadow-blue-200 flex items-center gap-2"
                    onClick={handleStartChat}
                    disabled={startChatMutation.isPending}
                  >
                    {startChatMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                    Start Conversation
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/30">
              <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-2xl shadow-slate-200/50 mb-8 border border-slate-50">
                <MessageSquare className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select a conversation</h3>
              <p className="text-sm max-w-sm mt-3 leading-relaxed font-medium">
                Choose a customer from the list to start chatting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
