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
  Share2,
  Copy,
  Check,
  MessageCircle,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { showSuccess } from "@/lib/sweetAlert"

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

    const [isCopied, setIsCopied] = useState(false)
    const websiteUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : ''

    const handleCopyLink = () => {
      navigator.clipboard.writeText(websiteUrl)
      setIsCopied(true)
      showSuccess("Copied!", "Link copied to clipboard")
      setTimeout(() => setIsCopied(false), 2000)
    }

    const shareOnWhatsApp = () => {
      const text = encodeURIComponent(`Check out ${settings.shopName}!\n\nVisit Website: ${websiteUrl}\nDownload Mobile App: ${websiteUrl}/download`)
      window.open(`https://wa.me/?text=${text}`, '_blank')
    }

    const shareViaEmail = () => {
      const subject = encodeURIComponent(`Check out ${settings.shopName}`)
      const body = encodeURIComponent(`I thought you might be interested in ${settings.shopName}.\n\nVisit Website: ${websiteUrl}\nDownload Mobile App: ${websiteUrl}/download`)
      window.location.href = `mailto:?subject=${subject}&body=${body}`
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
              <Dialog>
                <DialogTrigger asChild>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative group">
                    <Share2 className="h-5 w-5" />
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Share Website
                    </span>
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      <Share2 className="h-5 w-5 text-blue-600" />
                      Share
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Website Link Section */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Website Link</label>
                      <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                          <Input
                            id="link"
                            defaultValue={websiteUrl}
                            readOnly
                            className="bg-gray-50 border-gray-200 rounded-xl"
                          />
                        </div>
                        <Button size="sm" className="px-3 rounded-xl bg-blue-600 hover:bg-blue-700" onClick={handleCopyLink}>
                          <span className="sr-only">Copy</span>
                          {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* App Download Link Section */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">App Download Link</label>
                      <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                          <Input
                            id="app-link"
                            defaultValue={`${websiteUrl}/download`}
                            readOnly
                            className="bg-gray-50 border-gray-200 rounded-xl"
                          />
                        </div>
                        <Button size="sm" className="px-3 rounded-xl bg-blue-600 hover:bg-blue-700" onClick={() => {
                          navigator.clipboard.writeText(`${websiteUrl}/download`)
                          showSuccess("Copied!", "App download link copied")
                        }}>
                          <span className="sr-only">Copy App Link</span>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <Button 
                        variant="outline" 
                        className="rounded-2xl h-12 gap-2 border-green-100 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                        onClick={shareOnWhatsApp}
                      >
                        <MessageCircle className="h-5 w-5 text-green-500" />
                        WhatsApp
                      </Button>
                      <Button 
                        variant="outline" 
                        className="rounded-2xl h-12 gap-2 border-blue-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                        onClick={shareViaEmail}
                      >
                        <Mail className="h-5 w-5 text-blue-500" />
                        Email
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

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