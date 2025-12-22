"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Search,
  Package,
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  X,
  CreditCard,
} from "lucide-react"

// Sample inventory data
const inventoryData = [
  {
    id: 1,
    name: "Red Apples",
    quantity: 450,
    maxQuantity: 500,
    freshness: 95,
    pricePerKg: 3.5,
    status: "in-stock",
    image: "🍎",
  },
  {
    id: 2,
    name: "Bananas",
    quantity: 35,
    maxQuantity: 400,
    freshness: 88,
    pricePerKg: 2.2,
    status: "low-stock",
    image: "🍌",
  },
  {
    id: 3,
    name: "Oranges",
    quantity: 380,
    maxQuantity: 450,
    freshness: 92,
    pricePerKg: 2.8,
    status: "in-stock",
    image: "🍊",
  },
  {
    id: 4,
    name: "Mangoes",
    quantity: 15,
    maxQuantity: 300,
    freshness: 78,
    pricePerKg: 4.5,
    status: "low-stock",
    image: "🥭",
  },
  {
    id: 5,
    name: "Grapes",
    quantity: 285,
    maxQuantity: 350,
    freshness: 90,
    pricePerKg: 5.2,
    status: "in-stock",
    image: "🍇",
  },
  {
    id: 6,
    name: "Strawberries",
    quantity: 8,
    maxQuantity: 200,
    freshness: 65,
    pricePerKg: 6.8,
    status: "low-stock",
    image: "🍓",
  },
  {
    id: 7,
    name: "Watermelon",
    quantity: 125,
    maxQuantity: 150,
    freshness: 94,
    pricePerKg: 1.8,
    status: "in-stock",
    image: "🍉",
  },
  {
    id: 8,
    name: "Pineapple",
    quantity: 220,
    maxQuantity: 250,
    freshness: 87,
    pricePerKg: 3.9,
    status: "in-stock",
    image: "🍍",
  },
  {
    id: 9,
    name: "Cherries",
    quantity: 95,
    maxQuantity: 180,
    freshness: 85,
    pricePerKg: 7.5,
    status: "in-stock",
    image: "🍒",
  },
]

function InventoryPageContent() {
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

  // Filter inventory based on search
  const filteredInventory = inventoryData.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

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
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-500 font-medium"
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
                  <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
                  <p className="text-white/60 text-sm">Track and manage your fruit stock</p>
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
            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search fruits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInventory.map((item, index) => {
                const quantityPercentage = (item.quantity / item.maxQuantity) * 100
                const isLowStock = item.status === "low-stock"

                return (
                  <Card
                    key={item.id}
                    className={`bg-white/5 backdrop-blur-sm border-white/10 p-6 hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group ${
                      mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
                    } ${isLowStock ? "animate-pulse-soft" : ""}`}
                    style={{
                      transitionDelay: `${index * 50}ms`,
                    }}
                  >
                    {/* Fruit Image */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="text-7xl group-hover:rotate-12 transition-transform duration-300">
                        {item.image}
                      </div>
                    </div>

                    {/* Fruit Name */}
                    <h3 className="text-xl font-semibold text-white mb-4 text-center">{item.name}</h3>

                    {/* Quantity Indicator */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Stock Level</span>
                        <span className="text-white font-medium">
                          {item.quantity} / {item.maxQuantity} kg
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            quantityPercentage > 50
                              ? "bg-emerald-500"
                              : quantityPercentage > 20
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{
                            width: mounted ? `${quantityPercentage}%` : "0%",
                          }}
                        />
                      </div>
                    </div>

                    {/* Freshness Indicator */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Freshness</span>
                        <span className="text-white font-medium">{item.freshness}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            item.freshness > 85
                              ? "bg-emerald-500"
                              : item.freshness > 70
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{
                            width: mounted ? `${item.freshness}%` : "0%",
                          }}
                        />
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/60 text-sm">Price per kg</span>
                      <span className="text-2xl font-bold text-emerald-500">${item.pricePerKg}</span>
                    </div>

                    {/* Stock Status Badge */}
                    <div className="flex items-center justify-center">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                          isLowStock
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {isLowStock ? "Low Stock" : "In Stock"}
                      </span>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* No results message */}
            {filteredInventory.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg">No fruits found matching your search</p>
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

      <style jsx global>{`
        @keyframes pulse-soft {
          0%,
          100% {
            border-color: rgba(239, 68, 68, 0.3);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.2);
          }
          50% {
            border-color: rgba(239, 68, 68, 0.5);
            box-shadow: 0 0 20px 0 rgba(239, 68, 68, 0.3);
          }
        }
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default function InventoryPage() {
  return (
    <ProtectedRoute allowedRole="wholesaler">
      <InventoryPageContent />
    </ProtectedRoute>
  )
}
