"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/card'
import { showSuccess, showError } from '@/lib/sweetAlert'
import { useResetPassword } from '@/hooks/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Scale, 
  StaggerContainer, 
  StaggerItem, 
  FadeIn,
} from '@/components/ui/motion'
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

// Zod validation schema
const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

const ResetPasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  let token = searchParams.get('token')
  if (!token && typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    token = urlParams.get('token')
  }

  const resetPasswordMutation = useResetPassword();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' }
  })

  useEffect(() => {
    if (!token) {
      showError('Invalid Link', 'Password reset link is missing.')
      setIsLoading(false)
      return
    }
    setIsTokenValid(true)
    setIsLoading(false)
  }, [token])

  const onSubmit = (values: ResetPasswordValues) => {
    if (token) {
      resetPasswordMutation.mutate({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      })
    }
  }

  React.useEffect(() => {
    if (resetPasswordMutation.isSuccess) {
      showSuccess('Success', 'Password reset successfully.')
      setTimeout(() => router.push('/auth/login'), 2000)
    }
  }, [resetPasswordMutation.isSuccess, router])

  React.useEffect(() => {
    if (resetPasswordMutation.isError) {
      showError('Failed', resetPasswordMutation.error?.message || 'Failed to reset password.')
    }
  }, [resetPasswordMutation.isError, resetPasswordMutation.error])

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4"><div className="w-full max-w-md bg-white p-8 rounded-lg animate-pulse h-64"></div></div>

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Invalid Link</h2>
          <p className="text-gray-600 mb-6">This link is invalid or expired.</p>
          <Button onClick={() => router.push('/auth/forget-Password')} className="w-full">Request New Link</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <StaggerContainer className="w-full max-w-md">
        <Scale>
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-8">
              <StaggerItem><CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle></StaggerItem>
              <StaggerItem><CardDescription className="text-center">Enter your new password below</CardDescription></StaggerItem>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <StaggerItem>
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input id="password" type={showPassword ? 'text' : 'password'} {...register('password')} className="pl-10 pr-10 h-12 border-2" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                </StaggerItem>

                <StaggerItem>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} {...register('confirmPassword')} className="pl-10 pr-10 h-12 border-2" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                </StaggerItem>

                <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" disabled={resetPasswordMutation.isPending}>
                  {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
              <div className="text-center mt-4 text-sm"><a href="/auth/login" className="text-blue-600 hover:underline">Back to sign in</a></div>
            </CardContent>
          </Card>
        </Scale>
      </StaggerContainer>
    </div>
  )
}

const ResetPassword = () => (<Suspense fallback={<div>Loading...</div>}><ResetPasswordForm /></Suspense>)

export default ResetPassword
