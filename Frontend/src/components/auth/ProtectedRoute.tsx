"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuthContext()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    if (authLoading) return

    // Check if user is authenticated
    if (!user) {
      router.push(redirectTo)
      return
    }

    // If no specific roles are required, allow access
    if (allowedRoles.length === 0) {
      setHasAccess(true)
      return
    }

    // Check if user has required role
    const userRole = user.role?.toLowerCase()
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Only admin role exists in shop management system
      if (userRole === 'admin') {
        router.push('/admin')
      } else if (userRole === 'customer') {
        router.push('/customer/dashboard')
      } else {
        router.push(redirectTo)
      }
      return
    }

    setHasAccess(true)
  }, [user, authLoading, router, allowedRoles, redirectTo])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return null
  }

  return <>{children}</>
} 