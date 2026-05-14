import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '@/lib/axiosClient';


export interface CustomerUser {
  _id: string;
  firstName: string;
  lastName?: string;
  name: string;
  phone: string;
  email?: string;
  bikeModel: string[];
  address?: string;
  totalVisits: number;
  isActive: boolean;
  loginMethod?: 'phone' | 'email';
  createdAt?: string;
}

// ── Signup ──────────────────────────────────────────────────────────────────
export const useCustomerSignup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      phone: string;
      email?: string;
      password: string;
      bikeModel?: string;
      address?: string;
      loginMethod?: 'phone' | 'email';
    }) => {
      const res = await axiosClient.post('/customer-auth/signup', data);
      return res.data.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('customerToken', data.token);
      localStorage.setItem('customerUser', JSON.stringify(data.user));
      queryClient.invalidateQueries({ queryKey: ['customerProfile'] });
    },
  });
};

// ── Login ────────────────────────────────────────────────────────────────────
export const useCustomerLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { identifier: string; password: string }) => {
      const res = await axiosClient.post('/customer-auth/login', data);
      return res.data.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('customerToken', data.token);
      localStorage.setItem('customerUser', JSON.stringify(data.user));
      queryClient.invalidateQueries({ queryKey: ['customerProfile'] });
    },
  });
};

// ── Logout ───────────────────────────────────────────────────────────────────
export const useCustomerLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await axiosClient.post('/customer-auth/logout');
    },
    onSuccess: () => {
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerUser');
      queryClient.clear();
      window.location.href = '/auth/login';
    },
    onError: () => {
      // Even on error, clear local state
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerUser');
      queryClient.clear();
      window.location.href = '/auth/login';
    },
  });
};

// ── Profile ──────────────────────────────────────────────────────────────────
export const useCustomerProfile = () => {
  return useQuery<CustomerUser>({
    queryKey: ['customerProfile'],
    queryFn: async () => {
      const res = await axiosClient.get('/customer-auth/me');
      return res.data.data.customer;
    },
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('customerToken'),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// ── Update Profile ───────────────────────────────────────────────────────────
export const useUpdateCustomerProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<CustomerUser & { bikeModel: string }>) => {
      const res = await axiosClient.patch('/customer-auth/me', data);
      return res.data.data.customer;
    },
    onSuccess: (data) => {
      localStorage.setItem('customerUser', JSON.stringify(data));
      queryClient.invalidateQueries({ queryKey: ['customerProfile'] });
    },
  });
};

// ── Change Password ─────────────────────────────────────────────────────────
export const useCustomerChangePassword = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosClient.put('/customer-auth/change-password', data);
      return res.data;
    },
  });
};

// ── Utility: Get customer from localStorage (instant, no network) ─────────────
export const getStoredCustomer = (): CustomerUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('customerUser');
    console.log('Raw customerUser from storage:', raw);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Error parsing customerUser:', err);
    return null;
  }
};


export const isCustomerLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('customerToken');
};
