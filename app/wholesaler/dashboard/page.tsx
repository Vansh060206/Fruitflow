"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  TrendingUp,
  Activity,
  Sparkles,
  Menu,
  X,
  CreditCard,
} from "lucide-react"

// Sample data for sales chart
const salesData = [
  { name: "Mon", sales: 4200 },
  { name: "Tue", sales: 3800 },
  { name: "Wed", sales: 5100 },
  { name: "Thu", sales: 4600 },
  { name: "Fri", sales: 6200 },
  { name: "Sat", sales: 7400 },
  { name: "Sun", sales: 5800 },
]

// Recent activity data
const recentActivity = [
  { id: 1, action: "New order placed", time: "2 min ago", type: "order" },
  { id: 2, action: "Stock replenished", time: "15 min ago", type: "stock" },
  { id: 3, action: "Payment received", time: "1 hour ago", type: "payment" },
  { id: 4, action: "Low stock alert", time: "2 hours ago", type: "alert" },
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
      className={`bg-white/5 backdrop-blur-sm border-white/10 p-6 transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white/60 text-sm font-medium">{title}</h3>
        <Icon className="w-5 h-5 text-emerald-500" />
      </div>
      <p className="text-3xl font-bold text-white">
        {value.includes("$") && "$"}
        {Math.floor(count).toLocaleString()}
        {value.includes("kg") && " kg"}
      </p>
    </Card>
  )
}

function WholesalerDashboardContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chartMounted, setChartMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  useEffect(() => {
    const timer = setTimeout(() => setChartMounted(true), 400)
    return () => clearTimeout(timer)
  }, [])

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
      {
        emoji: "🍌",
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className="relative z-10 flex">
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

            <nav className="space-y-2 relative">
              <Link
                href="/wholesaler/dashboard"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg relative overflow-hidden transition-all duration-300 ${
                  pathname === "/wholesaler/dashboard"
                    ? "text-emerald-500 font-medium"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {pathname === "/wholesaler/dashboard" && (
                  <div className="absolute inset-0 bg-emerald-500/10 rounded-lg animate-in fade-in duration-300" />
                )}
                {pathname === "/wholesaler/dashboard" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-in slide-in-from-left duration-300" />
                )}
                <LayoutDashboard className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Dashboard</span>
              </Link>
              <Link
                href="/wholesaler/inventory"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg relative overflow-hidden transition-all duration-300 ${
                  pathname === "/wholesaler/inventory"
                    ? "text-emerald-500 font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {pathname === "/wholesaler/inventory" && (
                  <div className="absolute inset-0 bg-emerald-500/10 rounded-lg animate-in fade-in duration-300" />
                )}
                {pathname === "/wholesaler/inventory" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-in slide-in-from-left duration-300" />
                )}
                <Package className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Inventory</span>
              </Link>
              <Link
                href="/wholesaler/orders"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg relative overflow-hidden transition-all duration-300 ${
                  pathname === "/wholesaler/orders"
                    ? "text-emerald-500 font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {pathname === "/wholesaler/orders" && (
                  <div className="absolute inset-0 bg-emerald-500/10 rounded-lg animate-in fade-in duration-300" />
                )}
                {pathname === "/wholesaler/orders" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-in slide-in-from-left duration-300" />
                )}
                <ShoppingCart className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Orders</span>
              </Link>
              <Link
                href="/wholesaler/payments"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg relative overflow-hidden transition-all duration-300 ${
                  pathname === "/wholesaler/payments"
                    ? "text-emerald-500 font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {pathname === "/wholesaler/payments" && (
                  <div className="absolute inset-0 bg-emerald-500/10 rounded-lg animate-in fade-in duration-300" />
                )}
                {pathname === "/wholesaler/payments" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-in slide-in-from-left duration-300" />
                )}
                <CreditCard className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Payments</span>
              </Link>
              <Link
                href="/wholesaler/analytics"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg relative overflow-hidden transition-all duration-300 ${
                  pathname === "/wholesaler/analytics"
                    ? "text-emerald-500 font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {pathname === "/wholesaler/analytics" && (
                  <div className="absolute inset-0 bg-emerald-500/10 rounded-lg animate-in fade-in duration-300" />
                )}
                {pathname === "/wholesaler/analytics" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-in slide-in-from-left duration-300" />
                )}
                <BarChart3 className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Analytics</span>
              </Link>
              <Link
                href="/wholesaler/settings"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg relative overflow-hidden transition-all duration-300 ${
                  pathname === "/wholesaler/settings"
                    ? "text-emerald-500 font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {pathname === "/wholesaler/settings" && (
                  <div className="absolute inset-0 bg-emerald-500/10 rounded-lg animate-in fade-in duration-300" />
                )}
                {pathname === "/wholesaler/settings" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-in slide-in-from-left duration-300" />
                )}
                <Settings className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Settings</span>
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

        <main className="flex-1 min-h-screen">
          <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/60 hover:text-white">
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-white">Dashboard</h2>
                  <p className="text-white/60 text-sm">Welcome back to FruitFlow</p>
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
              <StatCard title="Today's Sales" value="$12,450" icon={TrendingUp} delay={0} />
              <StatCard title="Active Orders" value="38" icon={ShoppingCart} delay={100} />
              <StatCard title="Stock Remaining" value="2,450kg" icon={Package} delay={200} />
              <StatCard title="AI Demand Prediction" value="3,200kg" icon={Sparkles} delay={300} />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-white/5 backdrop-blur-sm border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Sales Trends</h3>
                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                </div>
                <div className={`transition-all duration-700 ${chartMounted ? "opacity-100" : "opacity-0"}`}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(10, 10, 10, 0.9)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: "#10b981", r: 4 }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-sm border-emerald-500/20 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-semibold text-white">AI Insights</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/80 text-sm">Mango demand expected to rise by 35% next week</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/80 text-sm">Consider restocking citrus fruits before Friday</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white/80 text-sm">Peak sales hours: 10 AM - 2 PM</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                  </div>
                  <div className="space-y-3">
                    {recentActivity.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            item.type === "alert" ? "bg-red-500" : "bg-emerald-500"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-white/80 text-sm">{item.action}</p>
                          <p className="text-white/40 text-xs mt-1">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default function WholesalerDashboard() {
  return (
    <ProtectedRoute allowedRole="wholesaler">
      <WholesalerDashboardContent />
    </ProtectedRoute>
  )
}
