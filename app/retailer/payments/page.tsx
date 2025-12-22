"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  Clock,
  CheckCircle2,
  Package,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"

// Sample payment history data
const paymentHistory = [
  {
    id: "ORD-2024-156",
    amount: 245.5,
    date: "2024-01-15",
    status: "paid",
  },
  {
    id: "ORD-2024-142",
    amount: 180.0,
    date: "2024-01-12",
    status: "pending",
  },
  {
    id: "ORD-2024-128",
    amount: 320.75,
    date: "2024-01-08",
    status: "paid",
  },
  {
    id: "ORD-2024-115",
    amount: 150.0,
    date: "2024-01-05",
    status: "paid",
  },
  {
    id: "ORD-2024-098",
    amount: 275.25,
    date: "2024-01-01",
    status: "pending",
  },
  {
    id: "ORD-2023-987",
    amount: 195.5,
    date: "2023-12-28",
    status: "paid",
  },
  {
    id: "ORD-2023-965",
    amount: 420.0,
    date: "2023-12-25",
    status: "paid",
  },
  {
    id: "ORD-2023-942",
    amount: 310.75,
    date: "2023-12-20",
    status: "paid",
  },
]

// Stat card with animated counter
function StatCard({
  title,
  value,
  icon: Icon,
  delay,
}: {
  title: string
  value: string
  icon: any
  delay: number
}) {
  const [mounted, setMounted] = useState(false)
  const [count, setCount] = useState(0)
  const targetValue = Number.parseFloat(value.replace(/[^0-9.]/g, ""))

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!mounted) return

    const duration = 1500
    const increment = targetValue / (duration / 16)
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= targetValue) {
        setCount(targetValue)
        clearInterval(timer)
      } else {
        setCount(current)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [mounted, targetValue])

  return (
    <Card
      className={`bg-white/5 backdrop-blur-sm border-purple-500/10 p-6 transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white/60 text-sm font-medium">{title}</h3>
        <Icon className="w-5 h-5 text-purple-500" />
      </div>
      <p className="text-3xl font-bold text-white">${count.toFixed(2)}</p>
    </Card>
  )
}

function PaymentsContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()
  const { logout } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

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
        emoji: "🍇",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedX: 0.15,
        speedY: 0.1,
        rotation: 0,
        rotationSpeed: 0.005,
      },
      {
        emoji: "🍎",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedX: -0.1,
        speedY: 0.15,
        rotation: 0,
        rotationSpeed: -0.005,
      },
      {
        emoji: "🍊",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedX: 0.12,
        speedY: -0.12,
        rotation: 0,
        rotationSpeed: 0.007,
      },
      {
        emoji: "🍓",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedX: -0.15,
        speedY: -0.1,
        rotation: 0,
        rotationSpeed: -0.006,
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

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Calculate totals
  const totalPaid = paymentHistory.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)
  const totalPending = paymentHistory.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)

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
                href="/retailer/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                href="/retailer/browse"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                Browse Products
              </Link>
              <Link
                href="/retailer/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Package className="w-5 h-5" />
                My Orders
              </Link>
              <Link
                href="/retailer/favorites"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Heart className="w-5 h-5" />
                Favorites
              </Link>
              <Link
                href="/retailer/payments"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-500/10 text-purple-500 font-medium"
              >
                <CreditCard className="w-5 h-5" />
                Payments
              </Link>
              <Link
                href="/retailer/settings"
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
                  <h2 className="text-2xl font-bold text-white">Payments</h2>
                  <p className="text-white/60 text-sm">View your payment history and pending dues</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-500 font-semibold">RT</span>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard title="Total Paid" value={totalPaid.toFixed(2)} icon={CheckCircle2} delay={0} />
              <StatCard title="Pending Amount" value={totalPending.toFixed(2)} icon={Clock} delay={100} />
            </div>

            {/* Payment History */}
            <Card className="bg-white/5 backdrop-blur-sm border-purple-500/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">Payment History</h3>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Order ID</th>
                      <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Amount</th>
                      <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Date</th>
                      <th className="text-left px-6 py-4 text-white/60 text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment, index) => (
                      <tr
                        key={payment.id}
                        className={`border-t border-white/5 hover:bg-white/5 transition-all duration-300 ${
                          mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                        }`}
                        style={{ transitionDelay: `${index * 50 + 200}ms` }}
                      >
                        <td className="px-6 py-4 text-white font-medium">{payment.id}</td>
                        <td className="px-6 py-4 text-white">${payment.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-white/60">
                          {new Date(payment.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          {payment.status === "paid" ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {paymentHistory.map((payment, index) => (
                  <Card
                    key={payment.id}
                    className={`bg-white/5 backdrop-blur-sm border-purple-500/10 p-4 transition-all duration-500 ${
                      mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                    style={{ transitionDelay: `${index * 50 + 200}ms` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-semibold">{payment.id}</span>
                      {payment.status === "paid" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Amount</span>
                        <span className="text-white font-semibold">${payment.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">Date</span>
                        <span className="text-white/60 text-sm">
                          {new Date(payment.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
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

export default function RetailerPayments() {
  return (
    <ProtectedRoute allowedRole="retailer">
      <PaymentsContent />
    </ProtectedRoute>
  )
}
