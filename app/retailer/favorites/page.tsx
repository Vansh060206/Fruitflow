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
  ShoppingCart,
  Package,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"

// Sample favorite fruits data
const initialFavoritesData = [
  {
    id: 1,
    name: "Fresh Mangoes",
    price: 4.5,
    image: "🥭",
    freshness: 95,
    inStock: true,
  },
  {
    id: 2,
    name: "Sweet Oranges",
    price: 3.2,
    image: "🍊",
    freshness: 88,
    inStock: true,
  },
  {
    id: 3,
    name: "Red Apples",
    price: 5.0,
    image: "🍎",
    freshness: 92,
    inStock: true,
  },
  {
    id: 4,
    name: "Watermelon",
    price: 3.5,
    image: "🍉",
    freshness: 90,
    inStock: true,
  },
  {
    id: 5,
    name: "Green Grapes",
    price: 6.0,
    image: "🍇",
    freshness: 78,
    inStock: true,
  },
  {
    id: 6,
    name: "Strawberries",
    price: 7.5,
    image: "🍓",
    freshness: 70,
    inStock: true,
  },
]

function FavoritesContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [favorites, setFavorites] = useState(initialFavoritesData)
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

  // Get freshness color and label
  const getFreshnessColor = (freshness: number) => {
    if (freshness >= 85) return "bg-emerald-500"
    if (freshness >= 70) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getFreshnessLabel = (freshness: number) => {
    if (freshness >= 85) return "Excellent"
    if (freshness >= 70) return "Good"
    return "Fair"
  }

  // Remove from favorites
  const handleRemoveFavorite = (id: number) => {
    setFavorites(favorites.filter((fruit) => fruit.id !== id))
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-500/10 text-purple-500 font-medium"
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
                  <h2 className="text-2xl font-bold text-white">My Favorites</h2>
                  <p className="text-white/60 text-sm">Your saved fruits for quick reordering</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative text-white/60 hover:text-white">
                  <ShoppingCart className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-500 font-semibold">RT</span>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6">
            {/* Favorites Grid */}
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favorites.map((fruit, index) => (
                  <Card
                    key={fruit.id}
                    className={`relative bg-white/5 backdrop-blur-sm border-purple-500/10 p-6 hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-500 cursor-pointer group overflow-hidden ${
                      mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    {/* Remove from Favorites Button */}
                    <button
                      onClick={() => handleRemoveFavorite(fruit.id)}
                      className="absolute top-3 right-3 w-8 h-8 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 z-10"
                      title="Remove from favorites"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>

                    {/* Stock Badge */}
                    {fruit.inStock && (
                      <div className="absolute top-3 left-3 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded border border-emerald-500/30">
                        In Stock
                      </div>
                    )}

                    {/* Fruit Image */}
                    <div className="relative mb-4 overflow-hidden rounded-lg mt-6">
                      <div className="text-7xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 flex items-center justify-center py-6">
                        {fruit.image}
                      </div>
                    </div>

                    {/* Fruit Name */}
                    <h3 className="text-lg font-semibold text-white mb-3">{fruit.name}</h3>

                    {/* Freshness Indicator */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-sm">Freshness</span>
                        <span className="text-white/80 text-sm font-medium">{getFreshnessLabel(fruit.freshness)}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${getFreshnessColor(fruit.freshness)} transition-all duration-1000 rounded-full`}
                          style={{
                            width: mounted ? `${fruit.freshness}%` : "0%",
                            transitionDelay: `${index * 50 + 200}ms`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-purple-500">${fruit.price.toFixed(2)}</span>
                      <span className="text-white/40 text-sm ml-1">/kg</span>
                    </div>

                    {/* Add to Cart Button */}
                    <button className="w-full bg-purple-500/20 hover:bg-purple-500 text-purple-400 hover:text-white font-medium py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                  </Card>
                ))}
              </div>
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-8xl mb-6 opacity-20">💜</div>
                <h3 className="text-2xl font-bold text-white mb-2">No Favorites Yet</h3>
                <p className="text-white/60 mb-8 text-center max-w-md">
                  Start adding your favorite fruits for quick access and easy reordering.
                </p>
                <Link
                  href="/retailer/browse"
                  className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300 flex items-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Browse Products
                </Link>
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

export default function RetailerFavorites() {
  return (
    <ProtectedRoute allowedRole="retailer">
      <FavoritesContent />
    </ProtectedRoute>
  )
}
