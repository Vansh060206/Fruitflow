"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  Package,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
} from "lucide-react"

function RetailerCartContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [cart, setCart] = useState<any[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  useEffect(() => {
    setMounted(true)
    const savedCart = JSON.parse(localStorage.getItem("retailer_cart") || "[]")
    if (savedCart.length > 0) {
      setCart(savedCart)
    } else {
      setCart([
        { id: 1, name: "Fresh Mangoes", price: 4.5, quantity: 10, image: "🥭" },
        { id: 2, name: "Sweet Oranges", price: 3.2, quantity: 15, image: "🍊" },
        { id: 3, name: "Red Apples", price: 5.0, quantity: 8, image: "🍎" },
      ])
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("retailer_cart", JSON.stringify(cart))
    }
  }, [cart, mounted])

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

  const updateQuantity = (id: number, change: number) => {
    setCart(cart.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item)))
  }

  const removeItem = (id: number) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

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
                href="/retailer/cart"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-500/10 text-purple-500 font-medium"
              >
                <ShoppingCart className="w-5 h-5" />
                Cart
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

        <main className="flex-1 min-h-screen">
          <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/60 hover:text-white">
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-white">Shopping Cart</h2>
                  <p className="text-white/60 text-sm">Review and checkout your items</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-500 font-semibold">RT</span>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6">
            {cart.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingCart className="w-20 h-20 text-white/20 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Your cart is empty</h3>
                <p className="text-white/60 mb-6">Add some fruits to get started!</p>
                <Link
                  href="/retailer/browse"
                  className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item, index) => (
                    <Card
                      key={item.id}
                      className={`bg-white/5 backdrop-blur-sm border-purple-500/10 p-6 transition-all duration-500 ${
                        mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
                      }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-6">
                        <div className="text-6xl">{item.image}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-1">{item.name}</h3>
                          <p className="text-purple-400 font-semibold">${item.price.toFixed(2)}/kg</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-white font-semibold w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right min-w-[100px]">
                            <p className="text-2xl font-bold text-white">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div>
                  <Card
                    className={`bg-white/5 backdrop-blur-sm border-purple-500/10 p-6 sticky top-6 transition-all duration-700 ${
                      mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                  >
                    <h3 className="text-xl font-semibold text-white mb-6">Order Summary</h3>
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Subtotal</span>
                        <span className="text-white font-semibold">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Tax (10%)</span>
                        <span className="text-white font-semibold">${tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-white/10 pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-lg font-semibold">Total</span>
                          <span className="text-purple-400 text-2xl font-bold">${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                      Proceed to Checkout
                    </button>
                    <Link
                      href="/retailer/browse"
                      className="block text-center text-purple-400 hover:text-purple-300 text-sm mt-4 transition-colors"
                    >
                      Continue Shopping
                    </Link>
                  </Card>
                </div>
              </div>
            )}
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

export default function RetailerCart() {
  return (
    <ProtectedRoute allowedRole="retailer">
      <RetailerCartContent />
    </ProtectedRoute>
  )
}
