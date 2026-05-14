import { NavItemType } from '@/components/ui/nav-item'
import {
  Home,
  Store,
  Package,
  Receipt,
  BarChart3,
  Info,
  Wrench,
  Calendar,
  Settings,
  MessageSquare
} from 'lucide-react'

export const adminNavigation: NavItemType[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home
  },
  {
    title: "Shop Management",
    href: "/admin/shop",
    icon: Store
  },
  {
    title: "Product Management",
    href: "/admin/products",
    icon: Package
  },
  {
    title: "Smart Billing",
    href: "/admin/invoices",
    icon: Receipt
  },
  {
    title: "Garage Services",
    href: "/admin/services",
    icon: Wrench
  },
  {
    title: "Appointments",
    href: "/admin/appointments",
    icon: Calendar
  },
  {
    title: "Customer Support",
    href: "/admin/chat",
    icon: MessageSquare
  },
  {
    title: "Inventory History",
    href: "/admin/inventory",
    icon: BarChart3
  },
  {
    title: "About",
    href: "/admin/about",
    icon: Info
  },
  {
    title: "Shop Settings",
    href: "/admin/settings",
    icon: Settings
  }
] 