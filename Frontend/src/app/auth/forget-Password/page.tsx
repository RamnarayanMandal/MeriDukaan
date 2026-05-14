"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent  } from '@/components/ui/card'
import { showSuccess, showError } from '@/lib/sweetAlert'
import { useForgotPassword } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { 
  Scale, 
  StaggerContainer, 
  StaggerItem, 
  HoverLift, 
  FadeIn,
} from '@/components/ui/motion'
import { Mail, ArrowLeft, Lock } from 'lucide-react'

// Zod validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

const ForgotPassword = () => {
  const router = useRouter()
  const forgotPasswordMutation = useForgotPassword()

  const { register, handleSubmit, formState: { errors, touchedFields } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  })

  const onSubmit = (values: ForgotPasswordValues) => {
    forgotPasswordMutation.mutate(values)
  }

  React.useEffect(() => {
    if (forgotPasswordMutation.isSuccess) {
      showSuccess('Reset Link Sent!', 'Check your inbox for the password reset link.')
      router.push('/auth/login')
    }
  }, [forgotPasswordMutation.isSuccess, router])

  React.useEffect(() => {
    if (forgotPasswordMutation.isError) {
      showError('Failed to Send Link', forgotPasswordMutation.error?.message || 'Check your email and try again.')
    }
  }, [forgotPasswordMutation.isError, forgotPasswordMutation.error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <Scale className="w-full max-w-lg">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden relative">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="absolute top-4 left-4 text-white hover:bg-white/20"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
            <div className="flex justify-center mb-4"><div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"><Lock className="h-10 w-10 text-white" /></div></div>
            <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
            <p className="text-blue-100 text-lg">Enter your email to receive a password reset link</p>
          </div>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <StaggerContainer>
                <StaggerItem>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-700">
                    <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
                    <ul className="space-y-1"><li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>Enter your email address</li><li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>Receive a secure reset link</li><li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full"></span>Set a new password</li></ul>
                  </div>
                </StaggerItem>

                <StaggerItem className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input id="email" {...register('email')} placeholder="you@example.com" className={`pl-12 h-12 rounded-xl border-2 transition-all ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
                  </div>
                  {errors.email && <FadeIn className="text-sm text-red-500 flex items-center gap-2 bg-red-50 p-3 rounded-lg">⚠️ {errors.email.message}</FadeIn>}
                </StaggerItem>

                <StaggerItem className="pt-4">
                  <HoverLift><Button type="submit" className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg" disabled={forgotPasswordMutation.isPending}>{forgotPasswordMutation.isPending ? 'Sending...' : 'Send Reset Link'}</Button></HoverLift>
                </StaggerItem>

                <StaggerItem className="text-center pt-4"><div className="text-sm text-gray-600">Remember your password? <a href="/auth/login" className="text-blue-600 hover:underline font-medium">Sign in here</a></div></StaggerItem>
              </StaggerContainer>
            </form>
          </CardContent>
        </Card>
      </Scale>
    </div>
  )
}

export default ForgotPassword
