"use client"

import { useDashboardAnalytics } from '@/hooks/useAnalytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Store, 
  Receipt, 
  Calendar,
  AlertTriangle,
  IndianRupee,
  Activity,
  Plus
} from 'lucide-react'
import { 
  StaggerContainer, 
  StaggerItem, 
  FadeIn, 
  HoverLift
} from '@/components/ui/motion'
import { useRouter } from 'next/navigation'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { Button } from '@/components/ui/button'

export default function AdminDashboard() {
  const router = useRouter()
  const { data: analytics, isLoading } = useDashboardAnalytics()

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  }

  const m = analytics?.metrics || {}
  const lowStock = analytics?.lowStockProducts || []
  const chartData = analytics?.revenueChart || []

  // Reverse chart data so oldest is on the left
  const chronologicalChartData = [...chartData].reverse()

  const stats = [
    {
      title: "Today's Revenue",
      value: `₹${m.todayRevenue?.toLocaleString() || 0}`,
      icon: IndianRupee,
      description: "Total revenue for today",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Monthly Revenue",
      value: `₹${m.monthlyRevenue?.toLocaleString() || 0}`,
      icon: Activity,
      description: "Total revenue this month",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Pending Appointments",
      value: m.pendingAppointments?.toString() || "0",
      icon: Calendar,
      description: "Bookings waiting confirmation",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Active Jobs",
      value: m.activeAppointments?.toString() || "0",
      icon: Store,
      description: "Vehicles currently in-progress",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ]

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Garage Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of your workshop performance</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/admin/invoices/new')}>
              <Plus className="h-4 w-4 mr-2" /> New Invoice
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Stats Grid */}
      <StaggerContainer>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StaggerItem key={index}>
              <HoverLift>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stat.bgColor}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              </HoverLift>
            </StaggerItem>
          ))}
        </div>
      </StaggerContainer>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <FadeIn>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Revenue (Last 7 Days)</CardTitle>
                <CardDescription>Daily income breakdown</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chronologicalChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <Tooltip 
                      formatter={(value: any) => [`₹${value}`, "Revenue"]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        {/* Actionable Insights */}
        <div className="space-y-6">
          <FadeIn>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Low Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lowStock.length > 0 ? (
                    lowStock.map((product: any) => (
                      <div key={product._id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.productCode}</p>
                        </div>
                        <span className="bg-red-100 text-red-700 font-semibold px-2 py-1 rounded text-xs">
                          {product.stockQty} left
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">All inventory looks good!</p>
                  )}
                  {lowStock.length > 0 && (
                    <Button variant="link" className="w-full text-xs text-blue-600" onClick={() => router.push('/admin/products')}>
                      View Inventory
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  CRM Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Total Customers</p>
                    <p className="text-2xl font-bold">{m.totalCustomers}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Monthly Jobs</p>
                    <p className="text-2xl font-bold">{m.completedAppointmentsMonth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

      </div>
    </div>
  )
}
