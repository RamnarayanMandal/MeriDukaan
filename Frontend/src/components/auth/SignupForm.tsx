"use client"

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react'
import { showSuccess, showError } from '@/lib/sweetAlert'
import { useSignup, useFirebaseAuth } from '@/hooks/useAuth'
import { useFirebaseAuth as useFirebaseAuthHook } from '@/hooks/useFirebaseAuth'
import { useRouter } from 'next/navigation'
import { UserRoles, Gender } from '@/types'
import { motion } from 'framer-motion'
import {
  StaggerContainer,
  StaggerItem,
  HoverLift,
  FadeIn,
} from '@/components/ui/motion'

const signupSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, 'Phone number must be 10 digits starting with 6-9'),
  gender: z.nativeEnum(Gender),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type SignupValues = z.infer<typeof signupSchema>

interface SignupFormProps {
  onSuccess?: (user: any, token: string) => void;
  defaultRole?: UserRoles;
}

export function SignupForm({ onSuccess, defaultRole = UserRoles.CUSTOMER }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter();

  const signupMutation = useSignup()
  const firebaseAuthMutation = useFirebaseAuth()
  const { signInWithGoogle } = useFirebaseAuthHook()

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      gender: Gender.MALE,
      agreeToTerms: false
    }
  })

  const emailValue = watch('email')
  const phoneValue = watch('phoneNumber')

  const onSubmit = (values: SignupValues) => {
    const { confirmPassword, ...userData } = values
    const signupData = { ...userData, confirmPassword, role: defaultRole }
    signupMutation.mutate(signupData as any)
  }

  React.useEffect(() => {
    if (signupMutation.isSuccess) {
      const { token, user } = signupMutation.data?.data || {};
      if (onSuccess && token && user) {
        onSuccess(user, token);
      } else if (!onSuccess) {
        showSuccess('Account Created Successfully!', 'You can now log in to your account.')
        setTimeout(() => {
          // If we are in the AuthModal, it will be handled by onSuccess
          // If we are on a standalone page, redirect to login
          router.push('/auth/login')
        }, 2000)
      }
    }
  }, [signupMutation.isSuccess, signupMutation.data, router, emailValue, phoneValue, onSuccess])

  React.useEffect(() => {
    if (firebaseAuthMutation.isSuccess) {
      const responseData = firebaseAuthMutation.data?.data || firebaseAuthMutation.data
      const { token, user } = responseData || {}

      if (token && user) {
        showSuccess('Login Successful', `Welcome, ${user.firstName}!`)
        if (onSuccess) {
          onSuccess(user, token)
        } else {
          const userRole = user.role?.toLowerCase() || 'customer'
          router.push(userRole === 'customer' ? '/customer/dashboard' : `/${userRole}`)
        }
      }
    }
  }, [firebaseAuthMutation.isSuccess, firebaseAuthMutation.data, router, onSuccess])

  React.useEffect(() => {
    if (signupMutation.isError || firebaseAuthMutation.isError) {
      const error = signupMutation.isError ? signupMutation.error : firebaseAuthMutation.error
      const errorMessage = error?.response?.data?.message || error?.message || 'Authentication failed'
      showError('Authentication Failed', errorMessage)
    }
  }, [signupMutation.isError, signupMutation.error, firebaseAuthMutation.isError, firebaseAuthMutation.error])

  const handleFirebaseGoogleSignup = async () => {
    try {
      console.log('--- Google Signup Process Started ---');
      const firebaseUser = await signInWithGoogle()
      console.log('Google Auth Result:', firebaseUser);

      if (firebaseUser) {
        console.log('Fetching ID Token...');
        const idToken = await firebaseUser.getIdToken()
        console.log('ID Token retrieved, calling backend...');
        firebaseAuthMutation.mutate(idToken)
      }
    } catch (error: any) {
      console.error('Detailed Google Signup Error:', error);
      const errorMessage = error?.message || 'Failed to sign in with Google.';
      showError('Google Signup Failed', errorMessage);
    }
  }

  const inputClass = (name: keyof SignupValues) => `pl-10 h-11 transition-all duration-200 ${errors[name] ? 'border-red-500 focus:border-red-500 bg-red-50' : 'focus:border-blue-500'}`

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <StaggerContainer>
        <StaggerItem>
          <HoverLift>
            <Button type="button" variant="outline" className="w-full h-11" onClick={handleFirebaseGoogleSignup} disabled={firebaseAuthMutation.isPending}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {firebaseAuthMutation.isPending ? 'Signing up...' : 'Continue with Google'}
            </Button>
          </HoverLift>
        </StaggerItem>

        <StaggerItem className="relative py-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500 font-medium">Or continue with</span></div>
        </StaggerItem>

        <div className="grid grid-cols-2 gap-4">
          <StaggerItem className="space-y-1.5">
            <Label htmlFor="firstName">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Input id="firstName" {...register('firstName')} placeholder="John" className={inputClass('firstName')} />
            </div>
            {errors.firstName && <FadeIn className="text-xs text-red-500 mt-1">⚠️ {errors.firstName.message}</FadeIn>}
          </StaggerItem>
          <StaggerItem className="space-y-1.5">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register('lastName')} placeholder="Doe" className={`h-11 transition-all duration-200 ${errors.lastName ? 'border-red-500 bg-red-50' : ''}`} />
            {errors.lastName && <FadeIn className="text-xs text-red-500 mt-1">⚠️ {errors.lastName.message}</FadeIn>}
          </StaggerItem>
        </div>

        <StaggerItem className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            <Input id="email" type="email" {...register('email')} placeholder="john.doe@example.com" className={inputClass('email')} />
          </div>
          {errors.email && <FadeIn className="text-xs text-red-500 mt-1">⚠️ {errors.email.message}</FadeIn>}
        </StaggerItem>

        <StaggerItem className="space-y-1.5">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
            <Input id="phoneNumber" type="tel" {...register('phoneNumber')} placeholder="9876543210" maxLength={10} className={inputClass('phoneNumber')} />
          </div>
          {errors.phoneNumber && <FadeIn className="text-xs text-red-500 mt-1">⚠️ {errors.phoneNumber.message}</FadeIn>}
        </StaggerItem>

        <StaggerItem className="space-y-1.5">
          <Label htmlFor="gender">Gender</Label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-11 focus:border-blue-500 rounded-xl">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Gender.MALE}>Male</SelectItem>
                  <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                  <SelectItem value={Gender.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </StaggerItem>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StaggerItem className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Input id="password" type={showPassword ? 'text' : 'password'} {...register('password')} placeholder="••••••••" className={`${inputClass('password')} pr-10`} />
              <motion.button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </motion.button>
            </div>
            {errors.password && <FadeIn className="text-xs text-red-500 mt-1">⚠️ {errors.password.message}</FadeIn>}
          </StaggerItem>

          <StaggerItem className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm</Label>
            <div className="relative">
              <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} {...register('confirmPassword')} placeholder="••••••••" className={`${inputClass('confirmPassword')} pr-10 pl-4`} />
              <motion.button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </motion.button>
            </div>
            {errors.confirmPassword && <FadeIn className="text-xs text-red-500 mt-1">⚠️ {errors.confirmPassword.message}</FadeIn>}
          </StaggerItem>
        </div>

        <StaggerItem className="flex items-center space-x-2 py-1">
          <Checkbox id="agreeToTerms" onCheckedChange={(checked) => setValue('agreeToTerms', !!checked)} />
          <Label htmlFor="agreeToTerms" className="text-xs font-medium cursor-pointer">I agree to the <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a></Label>
        </StaggerItem>
        {errors.agreeToTerms && <FadeIn className="text-xs text-red-500 mt-1">⚠️ {errors.agreeToTerms.message}</FadeIn>}

        <StaggerItem className="pt-2">
          <HoverLift>
            <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200" disabled={signupMutation.isPending}>
              {signupMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</> : 'Create Account'}
            </Button>
          </HoverLift>
        </StaggerItem>
      </StaggerContainer>
    </form>
  )
}
