import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useMutation } from '@tanstack/react-query';
import authService from '@/service/authService';
import { AuthResponse } from '@/types';
import { setAuthData, clearAuthData } from '@/lib/auth';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      clearAuthData();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    logout
  };
};

// Hook for Firebase signup with backend
export const useFirebaseSignup = () => {
  return useMutation({
    mutationFn: async (idToken: string) => {
      const response = await authService.firebaseAuth(idToken);
      return response;
    },
    onSuccess: (data: AuthResponse) => {
      console.log('Firebase signup successful:', data);
      const resData = data.data || data;
      if (resData.token && resData.user) {
        setAuthData(resData.token, resData.user);
      }
    },
    onError: (error) => {
      console.error('Firebase signup error:', error);
    }
  });
};

// Hook for Firebase login with backend
export const useFirebaseLogin = () => {
  return useMutation({
    mutationFn: async (idToken: string) => {
      const response = await authService.firebaseLogin(idToken);
      return response;
    },
    onSuccess: (data: AuthResponse) => {
      console.log('Firebase login successful:', data);
      const resData = data.data || data;
      if (resData.token && resData.user) {
        setAuthData(resData.token, resData.user);
      }
    },
    onError: (error) => {
      console.error('Firebase login error:', error);
    }
  });
};

// Hook for Firebase signup/login with backend (legacy - for backward compatibility)
export const useFirebaseAuthMutation = () => {
  return useMutation({
    mutationFn: async (idToken: string) => {
      const response = await authService.firebaseAuth(idToken);
      return response;
    },
    onSuccess: (data: AuthResponse) => {
      console.log('Firebase auth successful:', data);
      const resData = data.data || data;
      if (resData.token && resData.user) {
        setAuthData(resData.token, resData.user);
      }
    },
    onError: (error) => {
      console.error('Firebase auth error:', error);
    }
  });
};
 