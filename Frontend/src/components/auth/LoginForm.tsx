"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Mail, Lock, Loader2, Phone } from 'lucide-react'
import { showSuccess, showError } from '@/lib/sweetAlert'
import { useLogin, useFirebaseAuth } from '@/hooks/useAuth'
import { useFirebaseAuth as useFirebaseAuthHook } from '@/hooks/useFirebaseAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { setAuthData } from '@/lib/auth'
import { useAuthContext } from '@/context/AuthContext'
import {
  StaggerContainer,
  StaggerItem,
  HoverLift,
  FadeIn,
} from '@/components/ui/motion'
import { UserRoles } from '@/types'

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
})

type LoginValues = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSuccess?: (user: any, token: string) => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo = '/' }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const loginMutation = useLogin()
  const firebaseAuthMutation = useFirebaseAuth()
  const { signInWithGoogle } = useFirebaseAuthHook()
  const { setUser } = useAuthContext()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false
    }
  })

  const onSubmit = (values: LoginValues) => {
    const loginData = {
      identifier: values.identifier,
      password: values.password,
      rememberMe: values.rememberMe
    }
    loginMutation.mutate(loginData as any)
  }

  React.useEffect(() => {
    if (loginMutation.isSuccess) {
      const { token, user } = loginMutation.data?.data || {}
      if (token && user) {
        localStorage.setItem('token', token);
        document.cookie = `token=${token}; path=/; max-age=604800`;
        setUser(user);

        showSuccess('Login Successful', `Welcome back, ${user.firstName}!`)

        if (onSuccess) {
          onSuccess(user, token)
        } else {
          const userRole = user.role?.toLowerCase() || 'customer'
          const path = redirectTo && redirectTo !== '/' ? redirectTo :
            userRole === 'customer' ? '/customer/dashboard' : `/${userRole}`
          router.push(path)
        }
      }
    }
  }, [loginMutation.isSuccess, loginMutation.data, router, redirectTo, onSuccess])

  React.useEffect(() => {
    if (firebaseAuthMutation.isSuccess) {
      const responseData = firebaseAuthMutation.data?.data || firebaseAuthMutation.data
      const { token, user } = responseData || {}

      if (token && user) {
        localStorage.setItem('token', token);
        document.cookie = `token=${token}; path=/; max-age=604800`;
        setUser(user);

        showSuccess('Login Successful', `Welcome back, ${user.firstName}!`)

        if (onSuccess) {
          onSuccess(user, token)
        }

        if (user.role === UserRoles.ADMIN) {
          router.push('/admin')
          return;
        }

        else if (user.role === UserRoles.CUSTOMER) {
          router.push('/customer/dashboard')
          return;
        }
      }
    }
  }, [firebaseAuthMutation.isSuccess, firebaseAuthMutation.data, router, redirectTo, onSuccess])

  React.useEffect(() => {
    if (loginMutation.isError || firebaseAuthMutation.isError) {
      const error = loginMutation.isError ? loginMutation.error : firebaseAuthMutation.error
      const errorMessage = error?.response?.data?.message || error?.message || 'Authentication failed'
      showError('Authentication Failed', errorMessage)
    }
  }, [loginMutation.isError, loginMutation.error, firebaseAuthMutation.isError, firebaseAuthMutation.error])

  const handleFirebaseGoogleLogin = async () => {
    try {
      console.log('--- Google Login Process Started ---');
      const result = await signInWithGoogle()
      console.log('Google Auth Result:', result);

      if (result) {
        console.log('Fetching ID Token...');
        const idToken = await result.getIdToken()
        console.log('ID Token retrieved, calling backend...');
        firebaseAuthMutation.mutate(idToken)
      }
    } catch (error: any) {
      console.error('Detailed Google Login Error:', error);
      const errorMessage = error?.message || 'Failed to sign in with Google.';
      showError('Google Login Failed', errorMessage);
    }
  }

  const inputClass = (name: keyof LoginValues) => `pl-10 transition-all duration-200 ${errors[name] ? 'border-red-500 focus:border-red-500 bg-red-50' : 'focus:border-blue-500'}`

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <StaggerContainer>
        <StaggerItem>
          <HoverLift>
            <Button type="button" variant="outline" className="w-full h-11" onClick={handleFirebaseGoogleLogin} disabled={firebaseAuthMutation.isPending}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {firebaseAuthMutation.isPending ? 'Logging in...' : 'Continue with Google'}
            </Button>
          </HoverLift>
        </StaggerItem>

        <StaggerItem className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500 font-medium">Or continue with</span>
          </div>
        </StaggerItem>

        <StaggerItem className="space-y-2">
          <Label htmlFor="identifier">Email or Phone Number</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input id="identifier" {...register('identifier')} placeholder="email@example.com or 9876543210" className={inputClass('identifier')} />
          </div>
          {errors.identifier && <FadeIn className="text-sm text-red-500 flex items-center gap-1 mt-1">⚠️ {errors.identifier.message}</FadeIn>}
        </StaggerItem>

        <StaggerItem className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="/auth/forget-Password" className="text-xs text-blue-600 hover:underline font-medium">Forgot password?</a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input id="password" type={showPassword ? 'text' : 'password'} {...register('password')} placeholder="••••••••" className={`${inputClass('password')} pr-10`} />
            <motion.button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </motion.button>
          </div>
          {errors.password && <FadeIn className="text-sm text-red-500 flex items-center gap-1 mt-1">⚠️ {errors.password.message}</FadeIn>}
        </StaggerItem>

        <StaggerItem className="flex items-center space-x-2 py-1">
          <Checkbox id="rememberMe" {...register('rememberMe')} />
          <Label htmlFor="rememberMe" className="text-sm font-medium leading-none cursor-pointer">Remember me for 30 days</Label>
        </StaggerItem>

        <StaggerItem className="pt-2">
          <HoverLift>
            <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </Button>
          </HoverLift>
        </StaggerItem>
      </StaggerContainer>
    </form>
  )
}
