import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axiosClient";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";

export interface Message {
  _id: string;
  chatRoomId: string;
  senderId: string;
  senderRole: 'admin' | 'customer';
  content: string;
  attachments?: string[];
  isRead: boolean;
  createdAt: string;
}

export interface ChatRoom {
  _id: string;
  appointmentId: string;
  customerId: any;
  adminId: any;
  lastMessage?: Message;
  unreadCount: { customer: number; admin: number };
  updatedAt: string;
}

export const useChatRooms = () => {
  return useQuery({
    queryKey: ["chat-rooms"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/chat/rooms");
      return data.data as ChatRoom[];
    },
  });
};

export const useChatMessages = (chatRoomId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!chatRoomId) return;

    const socket = getSocket();
    socket.emit('join-chat', chatRoomId);

    const handleNewMessage = (message: Message) => {
      console.log('📬 New message received via socket:', message);
      if (String(message.chatRoomId) === String(chatRoomId)) {
        queryClient.setQueryData(["chat-messages", chatRoomId], (old: any) => {
          const exists = old?.some((m: any) => m._id === message._id);
          if (exists) return old;
          return [...(old || []), message];
        });
        queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
      }
    };

    const handleMessageUpdated = (updated: any) => {
      queryClient.setQueryData(["chat-messages", chatRoomId], (old: any) =>
        old?.map((m: any) => m._id === updated._id ? updated : m)
      );
    };

    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
      queryClient.setQueryData(["chat-messages", chatRoomId], (old: any) =>
        old?.filter((m: any) => m._id !== messageId)
      );
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_updated', handleMessageUpdated);
    socket.on('message_deleted', handleMessageDeleted);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_updated', handleMessageUpdated);
      socket.off('message_deleted', handleMessageDeleted);
      socket.emit('leave-chat', chatRoomId);
    };
  }, [chatRoomId, queryClient]);

  return useQuery({
    queryKey: ["chat-messages", chatRoomId],
    queryFn: async () => {
      if (!chatRoomId) return [];
      const { data } = await axiosInstance.get(`/chat/messages/${chatRoomId}`);
      return data.data.reverse() as Message[]; // Reverse to show oldest first for chat flow
    },
    enabled: !!chatRoomId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ chatRoomId, content, attachments }: { chatRoomId: string; content: string; attachments?: string[] }) => {
      const { data } = await axiosInstance.post(`/chat/messages/${chatRoomId}`, { content, attachments });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
    },
  });
};

export const useEditMessage = (chatRoomId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      const { data } = await axiosInstance.patch(`/chat/message/${messageId}`, { content });
      return data.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["chat-messages", chatRoomId], (old: any) =>
        old?.map((m: any) => m._id === updated._id ? updated : m)
      );
    },
  });
};

export const useDeleteMessage = (chatRoomId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      await axiosInstance.delete(`/chat/message/${messageId}`);
      return messageId;
    },
    onSuccess: (messageId) => {
      queryClient.setQueryData(["chat-messages", chatRoomId], (old: any) =>
        old?.filter((m: any) => m._id !== messageId)
      );
      queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
    },
  });
};

export const useMarkChatRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chatRoomId: string) => {
      await axiosInstance.patch(`/chat/messages/${chatRoomId}/read`);
    },
    onSuccess: (_, chatRoomId) => {
      queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useStartCustomerChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customerId: string) => {
      const { data } = await axiosInstance.post(`/chat/rooms/customer/${customerId}`);
      return data.data as ChatRoom;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
    },
  });
};

export const useStartSupportChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post('/chat/rooms/support');
      return data.data as ChatRoom;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
    },
  });
};

export const useGetChatRoom = (appointmentId: string) => {
  return useQuery({
    queryKey: ["chat-room", appointmentId],
    queryFn: async () => {
      if (!appointmentId) return null;
      const { data } = await axiosInstance.get(`/chat/rooms/${appointmentId}`);
      return data.data as ChatRoom;
    },
    enabled: !!appointmentId,
  });
};
