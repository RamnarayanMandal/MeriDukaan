'use client';

import React from 'react';
import { ChatWindow } from './ChatWindow';
import { useGetChatRoom } from '@/hooks/useChat';
import { Loader2 } from 'lucide-react';

interface AdminChatOverlayProps {
  appointmentId: string;
  recipientName: string;
  onClose: () => void;
}

export const AdminChatOverlay: React.FC<AdminChatOverlayProps> = ({
  appointmentId, recipientName, onClose
}) => {
  const { data: room, isLoading } = useGetChatRoom(appointmentId);

  if (isLoading) {
    return (
      <div className="fixed bottom-6 right-6 w-96 h-[500px] z-50 bg-white border rounded-2xl shadow-2xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-bold text-slate-400">Opening Chat...</p>
        </div>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] z-50">
      <ChatWindow
        chatRoomId={room._id}
        recipientName={recipientName}
        onClose={onClose}
      />
    </div>
  );
};
