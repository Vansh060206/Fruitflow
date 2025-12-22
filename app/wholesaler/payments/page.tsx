"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import {
  Search,
  DollarSign,
  AlertCircle,
  LogOut,
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  X,
  CreditCard,
  TrendingUp,
  Users,
  Bell,
  Check,
} from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

const creditCustomers = [
  {
    id: 1,
    retailerName: "Fresh Mart",
    totalCredit: 4200.0,
    lastPaymentDate: "2024-01-10",
    daysOverdue: 15,
    status: "overdue",
  },
  {
    id: 2,
    retailerName: "Green Grocers",
    totalCredit: 8560.0,
    lastPaymentDate: "2024-01-22",
    daysOverdue: 0,
    status: "ontime",
  },
  {
    id: 3,
    retailerName: "Healthy Foods Co.",
    totalCredit: 2150.0,
    lastPaymentDate: "2024-01-05",
    daysOverdue: 20,
    status: "overdue",
  },
  {
    id: 4,
    retailerName: "Downtown Deli",
    totalCredit: 15230.0,
    lastPaymentDate: "2024-01-20",
    daysOverdue: 3,
    status: "ontime",
  },
  {
    id: 5,
    retailerName: "Quick Stop",
    totalCredit: 4327.75,
    lastPaymentDate: "2023-12-10",
    daysOverdue: 45,
    status: "overdue",
  },
  {
    id: 6,
    retailerName: "Super Fresh",
    totalCredit: 5800.0,
    lastPaymentDate: "2024-01-23",
    daysOverdue: 0,
    status: "ontime",
  },
  {
    id: 7,
    retailerName: "Organic Junction",
    totalCredit: 3450.0,
    lastPaymentDate: "2024-01-18",
    daysOverdue: 5,
    status: "ontime",
  },
  {
    id: 8,
    retailerName: "City Market",
    totalCredit: 6780.5,
    lastPaymentDate: "2024-01-15",
    daysOverdue: 8,
    status: "overdue",
  },
]

const paymentHistory = [
  {
    id: 1,
    retailerName: "Fresh Mart",
    amountPaid: 8250.5,
    date: "2024-01-10",
    paymentMethod: "UPI",
  },
  {
    id: 2,
    retailerName: "City Market",
    amountPaid: 23407.75,
    date: "2024-01-18",
    paymentMethod: "Cash",
  },
  {
    id: 3,
    retailerName: "Organic Junction",
    amountPaid: 9875.5,
    date: "2024-01-22",
    paymentMethod: "Credit",
  },
  {
    id: 4,
    retailerName: "Super Fresh",
    amountPaid: 12962.25,
    date: "2024-01-15",
    paymentMethod: "UPI",
  },
  {
    id: 5,
    retailerName: "Green Grocers",
    amountPaid: 5430.0,
    date: "2024-01-23",
    paymentMethod: "Cash",
  },
]

function WholesalerPaymentsContent() {
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

  const filteredCustomers = creditCustomers.filter((customer) =>
    customer.retailerName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalOutstanding = creditCustomers.reduce((sum, c) => sum + c.totalCredit, 0)
  const overdueCustomers = creditCustomers.filter((c) => c.status === "overdue")
  const overdueAmount = overdueCustomers.reduce((sum, c) => sum + c.totalCredit, 0)
  const paymentsToday = paymentHistory.filter((p) => p.date === "2024-01-23").reduce((sum, p) => sum + p.amountPaid, 0)
  const activeCreditCustomers = creditCustomers.length

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
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                Orders
              </Link>
              <Link
                href="/wholesaler/payments"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-500 font-medium"
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
                  <h2 className="text-2xl font-bold text-white">Payments & Credit</h2>
                  <p className="text-white/60 text-sm">Monitor customer credit and payment status</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card
                className={`bg-white/5 backdrop-blur-sm border-white/10 p-6 transition-all duration-700 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white/60 text-sm font-medium">Total Outstanding</h3>
                  <DollarSign className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-white">₹{totalOutstanding.toLocaleString()}</p>
                <p className="text-orange-400 text-xs mt-2">Pending from customers</p>
              </Card>

              <Card
                className={`bg-red-500/10 backdrop-blur-sm border-red-500/30 p-6 transition-all duration-700 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: "100ms" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white/60 text-sm font-medium">Overdue Payments</h3>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-3xl font-bold text-white">₹{overdueAmount.toLocaleString()}</p>
                <p className="text-red-400 text-xs mt-2">{overdueCustomers.length} overdue accounts</p>
              </Card>

              <Card
                className={`bg-white/5 backdrop-blur-sm border-emerald-500/30 p-6 transition-all duration-700 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white/60 text-sm font-medium">Payments Received Today</h3>
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-3xl font-bold text-white">₹{paymentsToday.toLocaleString()}</p>
                <p className="text-emerald-400 text-xs mt-2">Today&apos;s collections</p>
              </Card>

              <Card
                className={`bg-white/5 backdrop-blur-sm border-white/10 p-6 transition-all duration-700 ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: "300ms" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white/60 text-sm font-medium">Active Credit Customers</h3>
                  <Users className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-3xl font-bold text-white">{activeCreditCustomers}</p>
                <p className="text-emerald-400 text-xs mt-2">Total credit accounts</p>
              </Card>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search by retailer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">Customer Credit Tracking</h3>
                <p className="text-white/60 text-sm mt-1">Monitor outstanding payments and credit status</p>
              </div>

              {/* Desktop Table View */}
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-white/80">Retailer Name</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-white/80">Total Credit</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-white/80">Last Payment</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-white/80">Days Overdue</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-white/80">Status</th>
                      <th className="text-left px-6 py-4 text-sm font-semibold text-white/80">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer, index) => (
                      <tr
                        key={customer.id}
                        className={`border-b border-white/5 transition-all duration-500 ${
                          mounted ? "opacity-100" : "opacity-0"
                        } ${
                          customer.status === "overdue"
                            ? "bg-red-500/5 hover:bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                            : "bg-emerald-500/5 hover:bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
                        }`}
                        style={{
                          transitionDelay: `${index * 30}ms`,
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {customer.status === "overdue" && (
                              <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
                            )}
                            <span className="text-white font-medium">{customer.retailerName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white/80 font-semibold">₹{customer.totalCredit.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white/60 text-sm">{customer.lastPaymentDate}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-semibold ${
                              customer.daysOverdue > 7
                                ? "text-red-400"
                                : customer.daysOverdue > 0
                                  ? "text-orange-400"
                                  : "text-emerald-400"
                            }`}
                          >
                            {customer.daysOverdue > 0 ? `${customer.daysOverdue} days` : "On time"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              customer.status === "ontime"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {customer.status === "ontime" ? "On Time" : "Overdue"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-medium transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                              <Check className="w-3 h-3" />
                              Mark Paid
                            </button>
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white text-xs font-medium transition-all hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                              <Bell className="w-3 h-3" />
                              Remind
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="grid gap-4 p-4 md:hidden">
                {filteredCustomers.map((customer, index) => (
                  <div
                    key={customer.id}
                    className={`backdrop-blur-sm p-4 rounded-xl transition-all ${
                      mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    } ${
                      customer.status === "overdue"
                        ? "bg-red-500/10 border border-red-500/30"
                        : "bg-emerald-500/10 border border-emerald-500/30"
                    }`}
                    style={{
                      transitionDelay: `${index * 30}ms`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {customer.status === "overdue" && <AlertCircle className="w-4 h-4 text-red-500" />}
                        <h3 className="text-white font-semibold">{customer.retailerName}</h3>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          customer.status === "ontime"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {customer.status === "ontime" ? "On Time" : "Overdue"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Total Credit:</span>
                        <span className="text-white font-semibold">₹{customer.totalCredit.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Last Payment:</span>
                        <span className="text-white/80">{customer.lastPaymentDate}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Days Overdue:</span>
                        <span
                          className={`font-semibold ${
                            customer.daysOverdue > 7
                              ? "text-red-400"
                              : customer.daysOverdue > 0
                                ? "text-orange-400"
                                : "text-emerald-400"
                          }`}
                        >
                          {customer.daysOverdue > 0 ? `${customer.daysOverdue} days` : "On time"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-medium transition-all">
                        <Check className="w-3 h-3" />
                        Mark Paid
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white text-xs font-medium transition-all">
                        <Bell className="w-3 h-3" />
                        Remind
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">Payment History</h3>
                <p className="text-white/60 text-sm mt-1">Recent payments received from retailers</p>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {paymentHistory.map((payment, index) => (
                    <div
                      key={payment.id}
                      className={`flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all ${
                        mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                      }`}
                      style={{
                        transitionDelay: `${index * 50}ms`,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{payment.retailerName}</p>
                          <p className="text-white/60 text-sm">{payment.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-bold">+₹{payment.amountPaid.toLocaleString()}</p>
                        <span className="inline-block px-2 py-0.5 bg-white/10 rounded text-white/60 text-xs mt-1">
                          {payment.paymentMethod}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function WholesalerPaymentsPage() {
  return (
    <ProtectedRoute requiredRole="wholesaler">
      <WholesalerPaymentsContent />
    </ProtectedRoute>
  )
}
