"use client"

import React from 'react'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter, 
  SidebarMobile 
} from '@/components/ui/sidebar'
import { Navigation } from '@/components/ui/nav-item'
import { adminNavigation } from '@/data/navigation/adminNav'
import { 
  Building2, 
 
  Settings, 
  LogOut, 
  User,
  Bell,
  
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { clearAuthData, getUser } from '@/lib/auth'
import { useEffect, useState } from 'react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { UserData } from '@/types/auth'

interface AdminLayoutProps {
  children: React.ReactNode
}

import { useSettings } from '@/context/ShopSettingsContext'

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const { settings } = useSettings()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const { data: notificationData } = useNotifications()
  const unreadCount = notificationData?.unreadCount || 0

  useEffect(() => {
    const userData = getUser()
    setUser(userData)
  }, [])

  const handleLogout = () => {
    clearAuthData()
    router.push('/auth/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
          <SidebarHeader>
            <div className="flex items-center space-x-3 px-4">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: settings.themeColors.primary }}>
                {settings.logo ? (
                  <img
                    src={settings.logo}
                    alt={settings.shopName}
                    className="h-7 w-7 object-contain"
                  />
                ) : (
                  <Building2 className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Control Panel
                </span>
                <span className="text-sm font-bold text-gray-900 truncate">
                  {settings.shopName}
                </span>
              </div>
            </div>

          </SidebarHeader>
          
          <SidebarContent>
            <Sidebar>
              <Navigation navigation={adminNavigation} />
            </Sidebar>
          </SidebarContent>

          <SidebarFooter>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </SidebarFooter>
        </div>
      </div>

      

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <SidebarMobile>
                <Navigation navigation={adminNavigation} />
              </SidebarMobile>
              <div className="hidden sm:flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store</span>
                <span className="text-sm font-bold text-gray-900 truncate max-w-[180px]">
                  {settings.shopName}
                </span>
              </div>
            </div>
            
            <div className="flex justify-end items-center space-x-4">
              <button 
                onClick={() => setIsNotificationOpen(true)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profilePicture || "/avatars/admin.png"} alt={user?.firstName || "Admin"} />
                      <AvatarFallback>{user?.firstName?.charAt(0)?.toUpperCase() || "A"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Admin User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || 'admin@hostelhub.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="space-y-6">
            <Breadcrumb className="mb-4" />
            {children}
          </div>
        </main>
      </div>
      <NotificationDrawer 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </div>
  )
} 