"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import {
  Scale,
  StaggerItem,
} from '@/components/ui/motion'
import { SignupForm } from '@/components/auth/SignupForm'

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <Scale className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader className="space-y-1 pt-8 px-8">
            <StaggerItem>
              <CardTitle className="text-3xl font-black text-center text-slate-900 tracking-tight">Create Account</CardTitle>
            </StaggerItem>
            <StaggerItem>
              <CardDescription className="text-center text-slate-500 font-medium">
                Join Mukesh Auto for premium bike care
              </CardDescription>
            </StaggerItem>
          </CardHeader>
          <CardContent className="p-8">
            <SignupForm defaultRole="customer" />
            
            <StaggerItem className="text-center text-sm mt-8">
              <span className="text-slate-500">Already have an account? </span>
              <a href="/auth/login" className="text-blue-600 hover:underline font-bold">Sign In</a>
            </StaggerItem>
          </CardContent>
        </Card>
      </Scale>
    </div>
  )
}

export default SignUpPage
