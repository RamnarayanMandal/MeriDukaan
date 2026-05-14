'use client';

import React from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, Check, MessageSquare, Calendar, Wrench, 
  Trash2, BellOff, ArrowRight
} from 'lucide-react';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'booking_new': return <Calendar className="w-4 h-4 text-blue-600" />;
    case 'chat_message': return <MessageSquare className="w-4 h-4 text-indigo-600" />;
    case 'bike_ready': return <Wrench className="w-4 h-4 text-green-600" />;
    case 'booking_confirmed': return <Check className="w-4 h-4 text-emerald-600" />;
    default: return <Bell className="w-4 h-4 text-slate-600" />;
  }
};

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-xl font-bold">Notifications</SheetTitle>
              {unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-600 hover:text-blue-700 h-8 px-2"
                onClick={() => markAllRead.mutate()}
              >
                Mark all as read
              </Button>
            )}
          </div>
          <SheetDescription>
            Stay updated with your latest bookings and messages.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded w-3/4 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 p-6 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <BellOff className="w-8 h-8 opacity-20" />
              </div>
              <p className="font-semibold text-slate-600">All caught up!</p>
              <p className="text-sm mt-1">No new notifications at the moment.</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification: any) => (
                <div 
                  key={notification._id}
                  className={cn(
                    "p-5 hover:bg-slate-50 transition-colors cursor-pointer relative group",
                    !notification.isRead && "bg-blue-50/30"
                  )}
                  onClick={() => !notification.isRead && markRead.mutate(notification._id)}
                >
                  <div className="flex gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                      !notification.isRead ? "bg-white border-blue-100" : "bg-slate-50 border-slate-100"
                    )}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className={cn(
                          "text-sm leading-none",
                          !notification.isRead ? "font-bold text-slate-900" : "font-medium text-slate-600"
                        )}>
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      {!notification.isRead && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      )}
                      
                      <div className="mt-3 flex items-center text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details <ArrowRight className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t bg-slate-50/50">
          <Button variant="outline" className="w-full h-11 text-slate-600 font-bold border-slate-200">
            View All History
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
