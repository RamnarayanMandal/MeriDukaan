'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AuthModal from './AuthModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  return (
    <AuthModal 
      isOpen={isOpen} 
      onClose={onClose} 
      onSuccess={onSuccess} 
      defaultTab="login"
      title="Welcome Back"
    />
  );
}
