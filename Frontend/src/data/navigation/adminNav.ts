import { 
  Building2, 
  Users, 
  Home, 
  Settings, 
  User,
  FileText,
  Calendar,
  BarChart3,
  Shield,
  Bell,
  CreditCard,
  MessageSquare,
  HelpCircle,
  Store,
  Package,
  Receipt,
  Info
} from 'lucide-react'
import { NavItemType } from '@/components/ui/nav-item'

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
    title: "Billing",
    href: "/admin/bills",
    icon: Receipt
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
  }
] 