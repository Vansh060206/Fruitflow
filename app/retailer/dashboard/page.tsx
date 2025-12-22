"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Heart,
  Settings,
  LogOut,
  TrendingDown,
  Clock,
  DollarSign,
  Menu,
  X,
  Star,
  Package,
} from "lucide-react"

// Sample recommended fruits data
const recommendedFruits = [
  {
    id: 1,
    name: "Fresh Mangoes",
    price: "$4.50",
    unit: "/kg",
    image: "🥭",
    rating: 4.8,
    discount: "15% OFF",
  },
  {
    id: 2,
    name: "Sweet Oranges",
    price: "$3.20",
    unit: "/kg",
    image: "🍊",
    rating: 4.6,
    discount: null,
  },
  {
    id: 3,
    name: "Red Apples",
    price: "$5.00",
    unit: "/kg",
    image: "🍎",
    rating: 4.9,
    discount: "10% OFF",
  },
  {
    id: 4,
    name: "Bananas",
    price: "$2.80",
    unit: "/kg",
    image: "🍌",
    rating: 4.7,
    discount: null,
  },
]

// Quick reorder items
const quickReorderItems = [
  { id: 1, name: "Watermelon", image: "🍉", lastOrder: "2 days ago" },
  { id: 2, name: "Grapes", image: "🍇", lastOrder: "4 days ago" },
  { id: 3, name: "Strawberries", image: "🍓", lastOrder: "1 week ago" },
]

// Stat card with animated counter
function StatCard({
  title,
  value,
  icon: Icon,
  delay,
  suffix = "",
}: {
  title: string
  value: string
  icon: any
  delay: number
  suffix?: string
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
      <p className="text-3xl font-bold text-white">
        {value.includes("$") && "$"}
        {Math.floor(count).toLocaleString()}
        {suffix}
      </p>
    </Card>
  )
}

function RetailerDashboardContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()
  const { logout } = useAuth()
  const pathname = usePathname()

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

            <nav className="space-y-2 relative">
              <Link
                href="/retailer/dashboard"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg relative overflow-hidden transition-all duration-300 ${
                  pathname === "/retailer/dashboard" ? "text-purple-500 font-medium" : "text-white/60 hover:text-white"
                }`}
              >
                {pathname === "/retailer/dashboard" && (
                  <div className="absolute inset-0 bg-purple-500/10 rounded-lg animate-in fade-in duration-300" />
                )}
                {pathname === "/retailer/dashboard" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-in slide-in-from-left duration-300" />
                )}
                <LayoutDashboard className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Dashboard</span>
              </Link>
              <Link
                href="/retailer/browse"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg relative overflow-hidden transition-all duration-300 ${
                  pathname === "/retailer/browse"
                    ? "text-purple-500 font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {pathname === "/retailer/browse" && (
                  <div className="absolute inset-0 bg-purple-500/10 rounded-lg animate-in fade-in duration-300" />
                )}
                {pathname === "/retailer/browse" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-in slide-in-from-left duration-300" />
                )}
                <ShoppingBag className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Browse Products</span>
              </Link>
              <Link
                href="/retailer/orders"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg relative overflow-hidden transition-all duration-300 ${
                  pathname === "/retailer/orders"
                    ? "text-purple-500 font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {pathname === "/retailer/orders" && (
                  <div className="absolute inset-0 bg-purple-500/10 rounded-lg animate-in fade-in duration-300" />
                )}
                {pathname === "/retailer/orders" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-in slide-in-from-left duration-300" />
                )}
                <Package className="w-5 h-5 relative z-10" />
                <span className="relative z-10">My Orders</span>
              </Link>
              <Link
                href="/retailer/favorites"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg relative overflow-hidden transition-all duration-300 ${
                  pathname === "/retailer/favorites"
                    ? "text-purple-500 font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {pathname === "/retailer/favorites" && (
                  <div className="absolute inset-0 bg-purple-500/10 rounded-lg animate-in fade-in duration-300" />
                )}
                {pathname === "/retailer/favorites" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-in slide-in-from-left duration-300" />
                )}
                <Heart className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Favorites</span>
              </Link>
              <Link
                href="/retailer/payments"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg relative overflow-hidden transition-all duration-300 ${
                  pathname === "/retailer/payments"
                    ? "text-purple-500 font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {pathname === "/retailer/payments" && (
                  <div className="absolute inset-0 bg-purple-500/10 rounded-lg animate-in fade-in duration-300" />
                )}
                {pathname === "/retailer/payments" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-in slide-in-from-left duration-300" />
                )}
                <CreditCard className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Payments</span>
              </Link>
              <Link
                href="/retailer/settings"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg relative overflow-hidden transition-all duration-300 ${
                  pathname === "/retailer/settings"
                    ? "text-purple-500 font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {pathname === "/retailer/settings" && (
                  <div className="absolute inset-0 bg-purple-500/10 rounded-lg animate-in fade-in duration-300" />
                )}
                {pathname === "/retailer/settings" && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-500 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-in slide-in-from-left duration-300" />
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
                  <h2 className="text-2xl font-bold text-white">Welcome Back!</h2>
                  <p className="text-white/60 text-sm">Ready to order fresh fruits today?</p>
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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Today's Best Prices" value="24" icon={TrendingDown} delay={0} suffix=" items" />
              <StatCard title="Active Orders" value="3" icon={Clock} delay={100} />
              <StatCard title="Pending Payments" value="$245" icon={DollarSign} delay={200} />
            </div>

            {/* Recommended Fruits */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Recommended for You</h3>
                <Link href="/retailer/browse" className="text-purple-500 hover:text-purple-400 text-sm font-medium">
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedFruits.map((fruit, index) => (
                  <Card
                    key={fruit.id}
                    className={`bg-white/5 backdrop-blur-sm border-purple-500/10 p-6 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all duration-500 cursor-pointer group ${
                      mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                    style={{ transitionDelay: `${index * 100 + 400}ms` }}
                  >
                    {fruit.discount && (
                      <div className="absolute top-3 right-3 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {fruit.discount}
                      </div>
                    )}
                    <div className="text-6xl mb-4 transition-transform duration-300 group-hover:scale-110">
                      {fruit.image}
                    </div>
                    <h4 className="text-white font-semibold mb-2">{fruit.name}</h4>
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-white/60 text-sm">{fruit.rating}</span>
                    </div>
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-purple-500">{fruit.price}</span>
                        <span className="text-white/40 text-sm">{fruit.unit}</span>
                      </div>
                    </div>
                    <button className="w-full bg-purple-500/20 hover:bg-purple-500 text-purple-400 hover:text-white font-medium py-2 rounded-lg transition-colors duration-300">
                      Add to Cart
                    </button>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Reorder Section */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Quick Reorder</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickReorderItems.map((item, index) => (
                  <Card
                    key={item.id}
                    className={`bg-white/5 backdrop-blur-sm border-purple-500/10 p-6 hover:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all duration-500 cursor-pointer group ${
                      mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                    style={{ transitionDelay: `${index * 100 + 900}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-5xl transition-transform duration-300 group-hover:scale-110">
                        {item.image}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{item.name}</h4>
                        <p className="text-white/40 text-sm">Last ordered {item.lastOrder}</p>
                      </div>
                      <button className="bg-purple-500/20 hover:bg-purple-500 text-purple-400 hover:text-white w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300">
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Promotional Banner */}
            <Card className="bg-gradient-to-r from-purple-600/20 to-violet-600/20 backdrop-blur-sm border-purple-500/20 p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Special Offer Today!</h3>
                  <p className="text-white/60">Get 20% off on bulk orders over $500. Limited time offer.</p>
                </div>
                <button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300 whitespace-nowrap">
                  Shop Now
                </button>
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

export default function RetailerDashboard() {
  return (
    <ProtectedRoute allowedRole="retailer">
      <RetailerDashboardContent />
    </ProtectedRoute>
  )
}
