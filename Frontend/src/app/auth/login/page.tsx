"use client"

import React, { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'
import { isAuthenticated, getUser } from '@/lib/auth'
import { 
  Scale, 
  StaggerItem, 
} from '@/components/ui/motion'
import { LoginForm } from '@/components/auth/LoginForm'

const LoginPageContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  // Redirect authenticated users
  React.useEffect(() => {
    if (isAuthenticated()) {
      const user = getUser()
      const userRole = user?.role?.toLowerCase() || 'customer'
      const redirectPath = redirectTo && redirectTo !== '/' ? redirectTo : 
        userRole === 'customer' ? '/customer/dashboard' : `/${userRole}`
      router.replace(redirectPath)
    }
  }, [router, redirectTo])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <Scale className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pt-8 px-8">
            <StaggerItem>
              <CardTitle className="text-3xl font-black text-center text-slate-900 tracking-tight">Welcome Back</CardTitle>
            </StaggerItem>
            <StaggerItem>
              <CardDescription className="text-center text-slate-500 font-medium">
                Sign in to manage your appointments and bikes
              </CardDescription>
            </StaggerItem>
          </CardHeader>
          <CardContent className="p-8">
            <LoginForm redirectTo={redirectTo} />
            
            <StaggerItem className="text-center text-sm mt-8">
              <span className="text-slate-500">Don&apos;t have an account? </span>
              <a href="/auth/signup" className="text-blue-600 hover:underline font-bold">Create Account</a>
            </StaggerItem>
          </CardContent>
        </Card>
      </Scale>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-400">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}
