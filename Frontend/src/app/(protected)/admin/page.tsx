"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Package, 
  Store, 
  Receipt, 
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react'
import { 
  StaggerContainer, 
  StaggerItem, 
  FadeIn, 
  SlideUp, 
  HoverLift
} from '@/components/ui/motion'
import { useProducts } from '@/hooks/useProducts'
import { useBills } from '@/hooks/useBills'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()
  const { data: products } = useProducts()
  const { data: bills } = useBills()

  const totalProducts = products?.items?.length || 0
  const totalBills = bills?.items?.length || 0
  const totalRevenue = bills?.items?.reduce((sum: number, bill) => sum + bill.grandTotal, 0) || 0
  const lowStockProducts = products?.items?.filter((p) => p.stockQty < 10).length || 0

  const stats = [
    {
      title: "Total Products",
      value: totalProducts.toString(),
      change: "+5",
      trend: "up" as const,
      icon: Package,
      description: "Products in inventory"
    },
    {
      title: "Total Bills",
      value: totalBills.toString(),
      change: "+12",
      trend: "up" as const,
      icon: Receipt,
      description: "Bills generated"
    },
    {
      title: "Total Revenue",
      value: `₹${(totalRevenue / 100000).toFixed(1)}L`,
      change: "+15%",
      trend: "up" as const,
      icon: DollarSign,
      description: "Total revenue"
    },
    {
      title: "Low Stock",
      value: lowStockProducts.toString(),
      change: lowStockProducts > 0 ? "Alert" : "OK",
      trend: lowStockProducts > 0 ? ("down" as const) : ("up" as const),
      icon: Store,
      description: "Products needing restock"
    }
  ]

  return (
    <div className="space-y-6">
      <SlideUp>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your shop.</p>
        </div>
      </SlideUp>

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
                    <stat.icon className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="flex items-center space-x-2">
                      {stat.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500">from last month</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              </HoverLift>
            </StaggerItem>
          ))}
        </div>
      </StaggerContainer>

      {/* Recent Activity */}
      <StaggerContainer>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StaggerItem>
            <FadeIn>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bills</CardTitle>
                  <CardDescription>Latest generated bills</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bills?.items && bills.items.slice(0, 5).map((bill) => (
                      <div key={bill._id} className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Receipt className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{bill.billNumber} - {bill.customerName}</p>
                          <p className="text-xs text-gray-500">₹{bill.grandTotal.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    {(!bills?.items || bills.items.length === 0) && (
                      <p className="text-sm text-gray-500">No bills yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </StaggerItem>

          <StaggerItem>
            <FadeIn>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common admin tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <HoverLift>
                      <button 
                        onClick={() => router.push('/admin/products/new')}
                        className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Package className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Add New Product</p>
                            <p className="text-sm text-gray-500">Add product to inventory</p>
                          </div>
                        </div>
                      </button>
                    </HoverLift>
                    <HoverLift>
                      <button 
                        onClick={() => router.push('/admin/bills/new')}
                        className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Receipt className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">Create New Bill</p>
                            <p className="text-sm text-gray-500">Generate invoice for customer</p>
                          </div>
                        </div>
                      </button>
                    </HoverLift>
                    <HoverLift>
                      <button 
                        onClick={() => router.push('/admin/shop')}
                        className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Store className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="font-medium">Shop Settings</p>
                            <p className="text-sm text-gray-500">Update shop details</p>
                          </div>
                        </div>
                      </button>
                    </HoverLift>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </StaggerItem>
        </div>
      </StaggerContainer>
    </div>
  )
}
