import { UserData } from '@/types';

// Get stored token
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || localStorage.getItem('customerToken');
  }
  return null;
};

// Get stored user data
export const getUser = (): UserData | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user') || localStorage.getItem('customerUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Ensure customer users have the 'customer' role if missing
        if (localStorage.getItem('customerUser') && !user.role) {
          user.role = 'customer';
        }
        return user;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
  }
  return null;
};

// Set authentication data
export const setAuthData = (token: string, user: UserData): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Also set token in cookies for middleware access
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
  }
};

// Clear authentication data
export const clearAuthData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
    
    // Also clear token from cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

// Get user role
export const getUserRole = (): string | null => {
  const user = getUser();
  return user?.role || null;
};

// Check if user has specific role
export const hasRole = (role: string): boolean => {
  const userRole = getUserRole();
  return userRole === role;
};

// Check if user is admin
export const isAdmin = (): boolean => {
  return hasRole('admin');
};

// Check if user is staff
export const isStaff = (): boolean => {
  return hasRole('staff');
};

// Check if user is customer
export const isCustomer = (): boolean => {
  return hasRole('customer');
};

// Check if user email is verified
export const isEmailVerified = (): boolean => {
  const user = getUser();
  return user?.isEmailVerified || false;
}; 