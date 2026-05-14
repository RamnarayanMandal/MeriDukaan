"use client"

import { useState, useEffect } from 'react';
import { getToken, getUser, isAuthenticated, clearAuthData } from '@/lib/auth';
import { UserData, UserRoles } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
  loading: boolean;
}

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      const user = getUser();
      const authenticated = isAuthenticated();

      setAuthState({
        isAuthenticated: authenticated,
        user,
        token,
        loading: false,
      });
    };

    checkAuth();

    // Listen for storage changes (when token/user is updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const logout = () => {
    clearAuthData();
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
    });
  };

  const updateAuthState = (token: string, user: UserData) => {
    setAuthState({
      isAuthenticated: true,
      user,
      token,
      loading: false,
    });
  };

  return {
    ...authState,
    logout,
    updateAuthState,
  };
};

// Hook for checking specific roles
export function useRole(requiredRole: UserRoles) {
  const { user, isAuthenticated } = useAuthState()
  
  return {
    hasRole: user?.role === requiredRole,
    isAuthenticated,
    user
  }
}

// Hook for checking multiple roles
export function useRoles(requiredRoles: UserRoles[]) {
  const { user, isAuthenticated } = useAuthState()
  
  return {
    hasAnyRole: user?.role ? requiredRoles.includes(user.role as any) : false,
    hasAllRoles: user?.role ? requiredRoles.every(role => user.role === role) : false,
    isAuthenticated,
    user
  }
}

// Hook for admin access
export function useAdmin() {
  return useRole(UserRoles.ADMIN)
}

// Hook for mechanic access
export function useMechanic() {
  const { user, isAuthenticated } = useAuthState()
  
  return {
    hasRole: user?.role === UserRoles.MECHANIC || user?.role === UserRoles.ADMIN,
    isAuthenticated,
    user
  }
}

// Hook for staff access
export function useStaff() {
  const { user, isAuthenticated } = useAuthState()
  
  return {
    hasRole: user?.role === UserRoles.STAFF || user?.role === UserRoles.ADMIN,
    isAuthenticated,
    user
  }
}

// Hook for customer access
export function useCustomer() {
  return useRole(UserRoles.CUSTOMER)
}

// Hook for checking if user can access a specific route
export function useRouteAccess(route: string) {
  const { user, isAuthenticated } = useAuthState()
  
  const canAccess = () => {
    if (!isAuthenticated) return false

    if (route.startsWith('/admin')) {
      return user?.role === UserRoles.ADMIN
    }

    if (route.startsWith('/staff')) {
      return user?.role === UserRoles.STAFF || user?.role === UserRoles.ADMIN
    }

    if (route.startsWith('/customer')) {
      return user?.role === UserRoles.CUSTOMER
    }

    return true
  }

  return {
    canAccess: canAccess(),
    isAuthenticated,
    user
  }
}

// Hook for token management
export function useToken() {
  const [token, setToken] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    const checkToken = () => {
      const currentToken = getToken()
      // For now, just check if token exists
      const tokenValid = !!currentToken
      
      setToken(currentToken)
      setIsValid(tokenValid)
    }

    checkToken()

    // Check token periodically
    const interval = setInterval(checkToken, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return {
    token,
    isValid,
    isExpiringSoon: false // Simplified for now
  }
} 