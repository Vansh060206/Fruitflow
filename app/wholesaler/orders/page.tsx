"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Search,
  ShoppingCart,
  LogOut,
  LayoutDashboard,
  Package,
  BarChart3,
  Settings,
  Menu,
  X,
  CheckCircle2,
  Clock,
  DollarSign,
  Truck,
  CreditCard,
} from "lucide-react"

// Sample orders data
const ordersData = [
  {
    id: "ORD-1001",
    retailerName: "Fresh Mart",
    totalAmount: 1245.5,
    paymentStatus: "paid",
    orderStatus: "delivered",
    date: "2024-01-15",
  },
  {
    id: "ORD-1002",
    retailerName: "Green Grocers",
    totalAmount: 856.0,
    paymentStatus: "pending",
    orderStatus: "pending",
    date: "2024-01-16",
  },
  {
    id: "ORD-1003",
    retailerName: "City Market",
    totalAmount: 2340.75,
    paymentStatus: "paid",
    orderStatus: "delivered",
    date: "2024-01-16",
  },
  {
    id: "ORD-1004",
    retailerName: "Healthy Foods Co.",
    totalAmount: 645.25,
    paymentStatus: "paid",
    orderStatus: "pending",
    date: "2024-01-17",
  },
  {
    id: "ORD-1005",
    retailerName: "Downtown Deli",
    totalAmount: 1523.0,
    paymentStatus: "pending",
    orderStatus: "pending",
    date: "2024-01-17",
  },
  {
    id: "ORD-1006",
    retailerName: "Organic Junction",
    totalAmount: 987.5,
    paymentStatus: "paid",
    orderStatus: "delivered",
    date: "2024-01-18",
  },
  {
    id: "ORD-1007",
    retailerName: "Quick Stop",
    totalAmount: 432.75,
    paymentStatus: "pending",
    orderStatus: "pending",
    date: "2024-01-18",
  },
  {
    id: "ORD-1008",
    retailerName: "Super Fresh",
    totalAmount: 1876.25,
    paymentStatus: "paid",
    orderStatus: "delivered",
    date: "2024-01-19",
  },
]

function OrdersPageContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter orders based on search
  const filteredOrders = ordersData.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.retailerName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Calculate stats
  const totalOrders = ordersData.length
  const pendingOrders = ordersData.filter((o) => o.orderStatus === "pending").length
  const totalRevenue = ordersData.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + o.totalAmount, 0)
  const pendingPayments = ordersData
    .filter((o) => o.paymentStatus === "pending")
    .reduce((sum, o) => sum + o.totalAmount, 0)

  // Floating fruit background animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    interface Fruit {
      emoji: string
      x: number
      y: number
      speedX: number
      speedY: number
      rotation: number
      rotationSpeed: number
    }

    const fruits: Fruit[] = [
      {
        emoji: "🍎",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedX: 0.15,
        speedY: 0.1,
        rotation: 0,
        rotationSpeed: 0.005,
      },
      {
        emoji: "🍊",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedX: -0.1,
        speedY: 0.15,
        rotation: 0,
        rotationSpeed: -0.005,
      },
      {
        emoji: "🥭",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedX: 0.12,
        speedY: -0.12,
        rotation: 0,
        rotationSpeed: 0.007,
      },
    ]

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      fruits.forEach((fruit) => {
        fruit.x += fruit.speedX
        fruit.y += fruit.speedY
        fruit.rotation += fruit.rotationSpeed

        if (fruit.x < -50 || fruit.x > canvas.width + 50) fruit.speedX *= -1
        if (fruit.y < -50 || fruit.y > canvas.height + 50) fruit.speedY *= -1

        ctx.save()
        ctx.translate(fruit.x, fruit.y)
        ctx.rotate(fruit.rotation)
        ctx.globalAlpha = 0.05
        ctx.font = "64px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(fruit.emoji, 0, 0)
        ctx.restore()
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Subtle floating fruit background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 h-screen bg-white/5 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-50 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } w-64`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-white">FruitFlow</h1>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-2">
              <Link
                href="/wholesaler/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                href="/wholesaler/inventory"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Package className="w-5 h-5" />
                Inventory
              </Link>
              <Link
                href="/wholesaler/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-500 font-medium"
              >
                <ShoppingCart className="w-5 h-5" />
                Orders
              </Link>
              <Link
                href="/wholesaler/payments"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <CreditCard className="w-5 h-5" />
                Payments
              </Link>
              <Link
                href="/wholesaler/analytics"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                Analytics
              </Link>
              <Link
                href="/wholesaler/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
            </nav>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen">
          {/* Header */}
          <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/60 hover:text-white">
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-white">Orders Management</h2>
                  <p className="text-white/60 text-sm">Track and manage your orders</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-500 font-semibold">WS</span>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white/60 text-sm font-medium">Total Orders</h3>
                  <ShoppingCart className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-3xl font-bold text-white">{totalOrders}</p>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white/60 text-sm font-medium">Pending Orders</h3>
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-white">{pendingOrders}</p>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white/60 text-sm font-medium">Total Revenue</h3>
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-3xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white/60 text-sm font-medium">Pending Payments</h3>
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-white">${pendingPayments.toFixed(2)}</p>
              </Card>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search by Order ID or Retailer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Desktop Table View */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-white/80">Order ID</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-white/80">Retailer</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-white/80">Date</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-white/80">Amount</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-white/80">Payment Status</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-white/80">Order Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, index) => (
                      <tr
                        key={order.id}
                        className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                          mounted ? "opacity-100" : "opacity-0"
                        }`}
                        style={{
                          transitionDelay: `${index * 30}ms`,
                        }}
                      >
                        <td className="px-6 py-4">
                          <span className="text-white font-medium">{order.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white/80">{order.retailerName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white/60 text-sm">{order.date}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-emerald-400 font-semibold">${order.totalAmount.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              order.paymentStatus === "paid"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            }`}
                          >
                            {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              order.orderStatus === "delivered"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}
                          >
                            {order.orderStatus === "delivered" ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Delivered
                              </>
                            ) : (
                              <>
                                <Truck className="w-3 h-3" />
                                Pending
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Mobile Card View */}
            <div className="grid gap-4 md:hidden">
              {filteredOrders.map((order, index) => (
                <Card
                  key={order.id}
                  className={`bg-white/5 backdrop-blur-sm border-white/10 p-4 hover:bg-white/10 transition-all ${
                    mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
                  style={{
                    transitionDelay: `${index * 30}ms`,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{order.id}</h3>
                      <p className="text-white/60 text-sm">{order.retailerName}</p>
                    </div>
                    <span className="text-emerald-400 font-bold">${order.totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Date:</span>
                      <span className="text-white/80">{order.date}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Payment:</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          order.paymentStatus === "paid"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        }`}
                      >
                        {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Status:</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          order.orderStatus === "delivered"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        }`}
                      >
                        {order.orderStatus === "delivered" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Delivered
                          </>
                        ) : (
                          <>
                            <Truck className="w-3 h-3" />
                            Pending
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* No results message */}
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg">No orders found matching your search</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <ProtectedRoute allowedRole="wholesaler">
      <OrdersPageContent />
    </ProtectedRoute>
  )
}
