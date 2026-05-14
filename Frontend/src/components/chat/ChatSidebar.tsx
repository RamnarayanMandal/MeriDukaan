'use client';

import React, { useState } from 'react';
import { useChatRooms } from '@/hooks/useChat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ChatSidebarProps {
  activeRoomId?: string;
  onSelectRoom: (room: any) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ activeRoomId, onSelectRoom }) => {
  const { data: rooms, isLoading } = useChatRooms();
  const [search, setSearch] = useState('');

  const filteredRooms = rooms?.filter(room => 
    room.customerId?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    room.customerId?.lastName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-4 border-b">
        <h2 className="text-xl font-black text-slate-900 mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search chats..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 border-none h-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 animate-pulse" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRooms?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 px-6 text-center">
            <MessageSquare className="w-12 h-12 mb-3 opacity-10" />
            <p className="text-sm font-medium">No active chats</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredRooms?.map((room) => (
              <div 
                key={room._id}
                onClick={() => onSelectRoom(room)}
                className={cn(
                  "flex gap-3 p-4 cursor-pointer transition-colors hover:bg-slate-50",
                  activeRoomId === room._id && "bg-blue-50/50 border-l-4 border-l-blue-600"
                )}
              >
                <Avatar className="w-12 h-12 border border-white shadow-sm">
                  <AvatarImage src={room.customerId?.profilePicture} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-bold uppercase">
                    {room.customerId?.firstName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {room.customerId?.firstName} {room.customerId?.lastName}
                    </h4>
                    {room.updatedAt && (
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(room.updatedAt), { addSuffix: false })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate leading-relaxed">
                    {room.lastMessage?.content || "No messages yet"}
                  </p>
                </div>
                {room.unreadCount?.admin > 0 && (
                  <div className="ml-2 self-center">
                    <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                      {room.unreadCount.admin}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
