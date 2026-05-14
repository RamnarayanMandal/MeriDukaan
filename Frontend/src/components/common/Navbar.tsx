"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wrench, Menu, X, UserCircle, LogIn, Bell } from "lucide-react";
import { useAuthState } from "@/hooks/useAuthState";
import { NotificationDrawer } from "@/components/notifications/NotificationDrawer";
import { useNotifications } from "@/hooks/useNotifications";
import AuthModal from "@/components/auth/AuthModal";
import { UserRoles } from "@/types";

export function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, logout } = useAuthState();
  const { data: notificationData } = useNotifications();
  const unreadCount = notificationData?.unreadCount || 0;

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    router.refresh();
  };



  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center cursor-pointer" onClick={() => router.push("/")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-200">
              <Wrench className="h-6 w-6" />
            </div>
            <span className="ml-3 text-xl font-bold tracking-tight text-gray-900">
              Mukesh Auto
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/services" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Services
            </Link>
            <Link href="/#location" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              Contact
            </Link>

            <div className="flex items-center space-x-4 border-l border-gray-200 pl-6">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600 flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <UserCircle className="w-4 h-4 mr-2 text-blue-600" />
                    {(user as any).firstName || 'User'}
                  </span>

                  {/* Notification Icon */}
                  <button
                    onClick={() => setIsNotificationOpen(true)}
                    className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <Button variant="outline" size="sm" className="rounded-lg h-9" onClick={() => {
                    if (logout) logout();
                    router.refresh();
                    router.push('/');
                  }}>
                    Logout
                  </Button>
                  <Button size="sm" className="rounded-lg h-9 bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={() => {
                    user?.role === UserRoles.CUSTOMER ? router.push('/customer/dashboard') : router.push('/admin')
                  }}>
                    Dashboard
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="bg-gray-900 hover:bg-gray-800 rounded-lg h-9 px-5 shadow-lg shadow-gray-200"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Notification Icon (Mobile) */}
            {user && (
              <button
                onClick={() => setIsNotificationOpen(true)}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1 pb-3 pt-2 px-4">
            <Link
              href="/#services"
              className="block rounded-md py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/#location"
              className="block rounded-md py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
          <div className="border-t border-gray-200 pb-6 pt-4 px-4 space-y-3">
            {user ? (
              <>
                <div className="flex items-center px-2 py-2 text-base font-bold text-gray-900 bg-gray-50 rounded-xl mb-4">
                  <UserCircle className="w-6 h-6 mr-3 text-blue-600" />
                  {(user as any).firstName || 'Logged in'}
                </div>
                <Button className="w-full justify-center h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 rounded-xl" onClick={() => {
                  setIsMobileMenuOpen(false);
                  user?.role === 'customer' ? router.push('/customer/dashboard') : router.push('/admin')
                }}>
                  Dashboard
                </Button>
                <Button variant="outline" className="w-full justify-center h-12 text-base font-bold rounded-xl" onClick={() => {
                  if (logout) logout();
                  setIsMobileMenuOpen(false);
                  router.refresh();
                  router.push('/');
                }}>
                  Logout
                </Button>
              </>
            ) : (
              <Button
                className="w-full justify-center h-12 text-base font-bold bg-gray-900 hover:bg-gray-800 text-white rounded-xl shadow-lg shadow-gray-200"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
              >
                Login / Sign Up
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </nav>
  );
}
