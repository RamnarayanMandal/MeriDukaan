'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AuthModal from './AuthModal';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
}

export default function SignupModal({ isOpen, onClose, onSuccess }: SignupModalProps) {
  return (
    <AuthModal 
      isOpen={isOpen} 
      onClose={onClose} 
      onSuccess={onSuccess} 
      defaultTab="signup"
      title="Create Your Account"
    />
  );
}
