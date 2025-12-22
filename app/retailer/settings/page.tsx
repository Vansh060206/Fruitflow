"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  User,
  Mail,
  Store,
  Globe,
  Bell,
  Lock,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Heart,
  Settings,
  Menu,
  X,
  Package,
} from "lucide-react"

function SettingsPageContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <CreditCard className="w-5 h-5" />
                Payments
              </Link>
              <Link
                href="/retailer/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-500/10 text-purple-500 font-medium"
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
                  <h2 className="text-2xl font-bold text-white">Settings</h2>
                  <p className="text-white/60 text-sm">Manage your account preferences</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-500 font-semibold">RT</span>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6 max-w-4xl">
            {/* Profile Settings */}
            <Card
              className={`bg-white/5 backdrop-blur-sm border-white/10 p-6 transition-all duration-700 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "0ms" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Profile Settings</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="shop-name" className="block text-sm font-medium text-white/60 mb-2">
                    Shop Name
                  </label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      id="shop-name"
                      type="text"
                      defaultValue="Fresh Market Store"
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/60 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      id="email"
                      type="email"
                      defaultValue="retailer@freshmarket.com"
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                <button className="w-full sm:w-auto px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/30">
                  Save Changes
                </button>
              </div>
            </Card>

            {/* Preferences */}
            <Card
              className={`bg-white/5 backdrop-blur-sm border-white/10 p-6 transition-all duration-700 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Preferences</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-white font-medium">Push Notifications</p>
                        <p className="text-white/60 text-sm">Receive price alerts and order updates</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        notificationsEnabled ? "bg-purple-500" : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                          notificationsEnabled ? "translate-x-7" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </label>
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-white/60 mb-2">
                    Language
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <select
                      id="language"
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    >
                      <option value="en" className="bg-[#0a0a0a] text-white">
                        English
                      </option>
                      <option value="es" className="bg-[#0a0a0a] text-white">
                        Spanish
                      </option>
                      <option value="fr" className="bg-[#0a0a0a] text-white">
                        French
                      </option>
                      <option value="de" className="bg-[#0a0a0a] text-white">
                        German
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Security */}
            <Card
              className={`bg-white/5 backdrop-blur-sm border-white/10 p-6 transition-all duration-700 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-white">Security</h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-white font-medium mb-1">Password</p>
                      <p className="text-white/60 text-sm">Last changed 2 months ago</p>
                    </div>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/10 border border-white/10">
                      Change Password
                    </button>
                  </div>
                </div>
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

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedRole="retailer">
      <SettingsPageContent />
    </ProtectedRoute>
  )
}
