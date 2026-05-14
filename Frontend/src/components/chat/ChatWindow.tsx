'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Send, Image as ImageIcon, Smile,
  Phone, Video, X,
  MessageSquare, Pencil, Trash2, Check, X as XIcon,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChatMessages, useSendMessage, useMarkChatRead, useEditMessage, useDeleteMessage } from '@/hooks/useChat';
import { getUser } from '@/lib/auth';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import axiosInstance from '@/lib/axiosClient';

// Lazy load emoji picker (heavy bundle)
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface ChatWindowProps {
  chatRoomId: string;
  recipientName: string;
  recipientImage?: string;
  onClose?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatRoomId, recipientName, recipientImage, onClose
}) => {
  const currentUser = getUser();
  const currentUserId = String(currentUser?._id || currentUser?.id || '').trim();
  const currentUserRole = currentUser?.role || 'customer';

  const { data: messages, isLoading } = useChatMessages(chatRoomId);
  const sendMessage = useSendMessage();
  const markRead = useMarkChatRead();
  const editMessage = useEditMessage(chatRoomId);
  const deleteMessage = useDeleteMessage(chatRoomId);

  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (chatRoomId) markRead.mutate(chatRoomId);
  }, [chatRoomId]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage.mutate({ chatRoomId, content: inputText.trim() });
    setInputText('');
    setShowEmoji(false);
  };

  const handleEmojiClick = (emojiData: any) => {
    setInputText(prev => prev + emojiData.emoji);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await axiosInstance.post('/upload/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const imageUrl = data.data?.url;
      if (imageUrl) {
        // Send the image as a message with content showing it's an image
        sendMessage.mutate({
          chatRoomId,
          content: '📷 Image',
          attachments: [imageUrl]
        });
      }
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEdit = (msg: any) => {
    setEditingId(msg._id);
    setEditingText(msg.content);
  };

  const handleEditSave = () => {
    if (!editingId || !editingText.trim()) return;
    editMessage.mutate({ messageId: editingId, content: editingText.trim() });
    setEditingId(null);
    setEditingText('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleDelete = (messageId: string) => {
    if (confirm('Delete this message?')) {
      deleteMessage.mutate(messageId);
    }
  };

  const canEdit = (msg: any) => {
    const msgSenderId = String(msg.senderId?._id || msg.senderId || '').trim();
    if (msgSenderId !== currentUserId) return false;
    const ageMs = Date.now() - new Date(msg.createdAt).getTime();
    return ageMs <= 30 * 60 * 1000;
  };

  const canDelete = (msg: any) => {
    if (currentUserRole === 'admin') return true;
    const msgSenderId = String(msg.senderId?._id || msg.senderId || '').trim();
    if (msgSenderId !== currentUserId) return false;
    const ageMs = Date.now() - new Date(msg.createdAt).getTime();
    return ageMs <= 30 * 60 * 1000;
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 border-2 border-white shadow">
            <AvatarImage src={recipientImage} />
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-sm">
              {recipientName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-sm font-black text-slate-900">{recipientName}</h4>
            <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
            <Phone className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
            <Video className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-3 bg-[#f0f2f5]">
        <div className="space-y-1">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <span className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : messages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center">
              <MessageSquare className="w-12 h-12 mb-3 opacity-10" />
              <p className="text-sm font-medium">No messages yet. Say hi! 👋</p>
            </div>
          ) : (
            messages?.map((msg: any) => {
              const msgSenderId = String(msg.senderId?._id || msg.senderId || '').trim();
              const isMe = msgSenderId === currentUserId && currentUserId !== '';
              const isEditing = editingId === msg._id;
              const hasImage = msg.attachments?.length > 0;

              return (
                <div
                  key={msg._id}
                  className={cn("flex mb-1 group", isMe ? "justify-end" : "justify-start")}
                  onMouseEnter={() => setHoveredId(msg._id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Action buttons on hover */}
                  {hoveredId === msg._id && !isEditing && (
                    <div className={cn(
                      "flex items-center gap-1 self-center mx-2",
                      isMe ? "order-first" : "order-last"
                    )}>
                      {canEdit(msg) && !hasImage && (
                        <button
                          onClick={() => handleEdit(msg)}
                          className="w-6 h-6 rounded-full bg-white shadow border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                      {canDelete(msg) && (
                        <button
                          onClick={() => handleDelete(msg._id)}
                          className="w-6 h-6 rounded-full bg-white shadow border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Bubble */}
                  <div className={cn(
                    "max-w-[75%] px-3 py-2 shadow-sm",
                    hasImage ? "p-1.5" : "",
                    isMe
                      ? "bg-[#dcf8c6] text-slate-800 rounded-2xl rounded-tr-sm"
                      : "bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-100"
                  )}>
                    {/* Image attachment */}
                    {hasImage && (
                      <img
                        src={msg.attachments[0]}
                        alt="Image"
                        className="rounded-xl max-w-[220px] max-h-[220px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => window.open(msg.attachments[0], '_blank')}
                      />
                    )}

                    {/* Text content */}
                    {isEditing ? (
                      <div className="flex items-center gap-2 min-w-[180px] px-1">
                        <input
                          className="flex-1 bg-transparent outline-none text-[13px] border-b border-blue-400 pb-0.5"
                          value={editingText}
                          onChange={e => setEditingText(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleEditSave();
                            if (e.key === 'Escape') handleEditCancel();
                          }}
                          autoFocus
                        />
                        <button onClick={handleEditSave} className="text-green-600 hover:text-green-700">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={handleEditCancel} className="text-slate-400 hover:text-red-500">
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      !hasImage && <p className="text-[13px] leading-snug">{msg.content}</p>
                    )}

                    {/* Timestamp */}
                    <div className="flex justify-end items-center gap-1 mt-0.5 px-1">
                      {msg.isEdited && (
                        <span className="text-[9px] text-slate-400 italic">edited</span>
                      )}
                      <span className="text-[9px] text-slate-400 font-medium">
                        {format(new Date(msg.createdAt), 'hh:mm a')}
                      </span>
                      {isMe && <span className="text-blue-500 text-[10px] font-bold">✓✓</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      {/* Input Area — relative so emoji picker anchors to it */}
      <div className="p-3 bg-white border-t border-slate-100 relative">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Emoji Picker — anchored above the input bar */}
        {showEmoji && (
          <div ref={emojiRef} className="absolute bottom-full left-2 mb-2 z-50 shadow-2xl rounded-2xl overflow-hidden">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              skinTonesDisabled
              searchDisabled={false}
              height={350}
              width={300}
            />
          </div>
        )}

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus-within:bg-white focus-within:border-blue-300 transition-all">
          {/* Emoji button */}
          <button
            type="button"
            onClick={() => setShowEmoji(prev => !prev)}
            className={cn(
              "h-7 w-7 flex items-center justify-center rounded-full shrink-0 transition-colors",
              showEmoji ? "text-yellow-500 bg-yellow-50" : "text-slate-400 hover:text-yellow-500"
            )}
            title="Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>

          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-sm px-0 h-7"
          />

          {/* Image upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="h-7 w-7 flex items-center justify-center rounded-full shrink-0 text-slate-400 hover:text-blue-500 transition-colors disabled:opacity-50"
            title="Send image"
          >
            {uploadingImage ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
          </button>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!inputText.trim() || sendMessage.isPending}
            size="icon"
            className="h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
