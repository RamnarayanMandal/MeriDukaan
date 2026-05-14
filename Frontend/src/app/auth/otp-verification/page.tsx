"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { showSuccess, showError } from '@/lib/sweetAlert'
import { useVerifyEmailOTP, useResendEmailOTP } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { 
  Scale, 
  StaggerContainer, 
  StaggerItem, 
  HoverLift, 
  FadeIn,
} from '@/components/ui/motion'
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react'

// Zod validation schema
const otpSchema = z.object({
  otp: z.string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers')
})

type OTPValues = z.infer<typeof otpSchema>

const OTPVerification = () => {
  const [countdown, setCountdown] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const [userData, setUserData] = useState<{ email: string; phoneNumber: string } | null>(null)
  const router = useRouter()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<OTPValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' }
  })

  const otpValue = watch('otp')

  useEffect(() => {
    const storedUserData = localStorage.getItem('signupUserData')
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData))
      } catch (error) {
        console.error('Error parsing stored user data:', error)
      }
    }
  }, [])

  const verifyOTPMutation = useVerifyEmailOTP()
  const resendOTPMutation = useResendEmailOTP()

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return
    const currentOTP = otpValue.split('')
    currentOTP[index] = value
    const otpString = currentOTP.join('')
    setValue('otp', otpString)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValue[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const onSubmit = (values: OTPValues) => {
    verifyOTPMutation.mutate({ 
      otp: values.otp,
      email: userData?.email || '',
    })
  }

  React.useEffect(() => {
    if (verifyOTPMutation.isSuccess) {
      localStorage.removeItem('signupUserData')
      showSuccess('Email Verified Successfully!', 'You can now login to your account.')
      setTimeout(() => router.push('/auth/login'), 2000)
    }
  }, [verifyOTPMutation.isSuccess, router])

  React.useEffect(() => {
    if (verifyOTPMutation.isError) {
      showError('Verification Failed', verifyOTPMutation.error?.message || 'Invalid OTP.')
    }
  }, [verifyOTPMutation.isError, verifyOTPMutation.error])

  const handleResendOTP = () => {
    setIsResending(true)
    resendOTPMutation.mutate({ email: userData?.email || '' })
  }

  React.useEffect(() => {
    if (resendOTPMutation.isSuccess) {
      showSuccess('OTP Resent!', 'Check your email.')
      setCountdown(60)
      setIsResending(false)
    }
  }, [resendOTPMutation.isSuccess])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <Scale className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm relative">
          <CardHeader className="space-y-1">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="absolute top-4 left-4"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
            <div className="flex justify-center mb-4"><div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"><Mail className="h-8 w-8 text-blue-600" /></div></div>
            <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
            <CardDescription className="text-center">
              Enter the 6-digit verification code sent to {userData?.email || 'your email'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex justify-center space-x-2 mb-4">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <Input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    maxLength={1}
                    className={`w-12 h-12 text-center text-lg font-semibold ${errors.otp ? 'border-red-500 bg-red-50' : 'focus:border-blue-500'}`}
                    value={otpValue[index] || ''}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />
                ))}
              </div>
              {errors.otp && <FadeIn className="text-sm text-red-500 flex items-center justify-center gap-1">⚠️ {errors.otp.message}</FadeIn>}

              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={verifyOTPMutation.isPending || otpValue.length !== 6}>
                {verifyOTPMutation.isPending ? 'Verifying...' : 'Verify Email'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Didn&apos;t receive the code?</p>
                <Button type="button" variant="ghost" size="sm" onClick={handleResendOTP} disabled={countdown > 0 || isResending} className="text-blue-600 hover:text-blue-700">
                  {isResending ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isResending ? 'Resending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                </Button>
              </div>

              <div className="text-center text-sm"><a href="/auth/login" className="text-blue-600 hover:underline">Back to login</a></div>
            </form>
          </CardContent>
        </Card>
      </Scale>
    </div>
  )
}

export default OTPVerification
