'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserData } from '@/types/auth';
import axios from 'axios';

// Standardized axios instance for auth
const authAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

interface AuthContextType {
  user: UserData | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  setUser: (user: UserData | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isLoading: true,
  setUser: () => { },
  logout: () => { },
  refreshUser: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // Try universal profile first
      const res = await authAxios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data?.success) {
        const userData = res.data.data.user;
        setUserState(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
      // If profile fails, check if we should logout
      // logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          setUserState(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('user');
        }
        await refreshUser();
      } else {
        setIsLoading(false);
      }
    };

    hydrate();
  }, [refreshUser]);

  const setUser = useCallback((u: UserData | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('user', JSON.stringify(u));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, []);

  const logout = useCallback(() => {
    setUserState(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear cookie via API
    authAxios.post('/auth/logout').finally(() => {
      window.location.href = '/auth/login';
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, isLoading, setUser, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
