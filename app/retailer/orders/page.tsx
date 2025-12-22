"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
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
  ShoppingCart,
  CheckCircle2,
  Clock,
  RefreshCw,
  Download,
  FileText,
  Truck,
} from "lucide-react"

// Sample orders data
const ordersData = [
  {
    id: "ORD-001",
    date: "2024-01-15",
    status: "delivered",
    total: 156.5,
    items: [
      { id: 1, name: "Fresh Mangoes", price: 4.5, quantity: 10, image: "🥭" },
      { id: 2, name: "Sweet Oranges", price: 3.2, quantity: 15, image: "🍊" },
      { id: 3, name: "Red Apples", price: 5.0, quantity: 8, image: "🍎" },
    ],
  },
  {
    id: "ORD-002",
    date: "2024-01-10",
    status: "delivered",
    total: 234.0,
    items: [
      { id: 4, name: "Bananas", price: 2.8, quantity: 20, image: "🍌" },
      { id: 5, name: "Grapes", price: 6.5, quantity: 12, image: "🍇" },
    ],
  },
  {
    id: "ORD-003",
    date: "2024-01-08",
    status: "pending",
    total: 89.0,
    items: [
      { id: 6, name: "Watermelon", price: 3.5, quantity: 5, image: "🍉" },
      { id: 7, name: "Pineapple", price: 4.2, quantity: 8, image: "🍍" },
    ],
  },
  {
    id: "ORD-004",
    date: "2024-01-05",
    status: "delivered",
    total: 178.5,
    items: [
      { id: 8, name: "Strawberries", price: 7.5, quantity: 10, image: "🍓" },
      { id: 9, name: "Blueberries", price: 8.0, quantity: 8, image: "🫐" },
    ],
  },
]

function RetailerOrdersContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [downloadingInvoice, setDownloadingInvoice] = useState(false)
  const [showInvoiceToast, setShowInvoiceToast] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<(typeof ordersData)[0] | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pathname = usePathname()
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedOrder) {
        setSelectedOrder(null)
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [selectedOrder])

  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [selectedOrder])

  const handleReorder = (orderItems: (typeof ordersData)[0]["items"]) => {
    const existingCart = JSON.parse(localStorage.getItem("retailer_cart") || "[]")
    const updatedCart = [...existingCart, ...orderItems]
    localStorage.setItem("retailer_cart", JSON.stringify(updatedCart))
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      router.push("/retailer/cart")
    }, 2000)
  }

  const calculateSubtotal = (items: (typeof ordersData)[0]["items"]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const handleReorderFromDrawer = (orderItems: (typeof ordersData)[0]["items"]) => {
    setSelectedOrder(null)
    handleReorder(orderItems)
  }

  const handleDownloadInvoice = () => {
    if (!selectedOrder) return

    setDownloadingInvoice(true)

    // Simulate PDF generation delay
    setTimeout(() => {
      // Create a simple HTML invoice content
      const invoiceContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice - ${selectedOrder.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
              background: white;
              color: #000;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #a855f7;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #a855f7;
              margin: 0;
              font-size: 36px;
            }
            .header p {
              color: #666;
              margin: 5px 0 0 0;
            }
            .invoice-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .info-block {
              flex: 1;
            }
            .info-block h3 {
              color: #a855f7;
              margin: 0 0 10px 0;
              font-size: 14px;
              text-transform: uppercase;
            }
            .info-block p {
              margin: 5px 0;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
            }
            th {
              background: #a855f7;
              color: white;
              padding: 12px;
              text-align: left;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #ddd;
            }
            .total-section {
              margin-top: 30px;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: flex-end;
              padding: 8px 0;
            }
            .total-row span:first-child {
              margin-right: 40px;
              color: #666;
            }
            .grand-total {
              font-size: 24px;
              color: #a855f7;
              font-weight: bold;
              border-top: 2px solid #a855f7;
              padding-top: 15px;
              margin-top: 15px;
            }
            .footer {
              text-align: center;
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #ddd;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🍎 FruitFlow</h1>
            <p>Your Fresh Produce Partner</p>
          </div>
          
          <div class="invoice-info">
            <div class="info-block">
              <h3>Invoice Details</h3>
              <p><strong>Invoice Number:</strong> INV-${selectedOrder.id}</p>
              <p><strong>Order Date:</strong> ${selectedOrder.date}</p>
              <p><strong>Payment Status:</strong> Paid</p>
            </div>
            <div class="info-block">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> Retailer Customer</p>
              <p><strong>Order ID:</strong> ${selectedOrder.id}</p>
              <p><strong>Delivery Status:</strong> ${selectedOrder.status === "delivered" ? "Delivered" : "Pending"}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price/kg</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${selectedOrder.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity} kg</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${calculateSubtotal(selectedOrder.items).toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>Delivery Fee:</span>
              <span>$5.00</span>
            </div>
            <div class="total-row grand-total">
              <span>Grand Total:</span>
              <span>$${selectedOrder.total.toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p>For any queries, please contact us at support@fruitflow.com</p>
          </div>
        </body>
        </html>
      `

      // Create blob and trigger download
      const blob = new Blob([invoiceContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `FruitFlow-Invoice-${selectedOrder.id}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setDownloadingInvoice(false)
      setShowInvoiceToast(true)
      setTimeout(() => setShowInvoiceToast(false), 3000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {showToast && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-5 duration-300">
          <Card className="bg-purple-500/90 backdrop-blur-xl border-purple-400/20 px-6 py-4 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <p className="text-white font-semibold">Items added to cart</p>
            </div>
          </Card>
        </div>
      )}

      {showInvoiceToast && (
        <div className="fixed top-6 right-6 z-[80] animate-in slide-in-from-top-4 duration-500">
          <div className="bg-purple-500/90 backdrop-blur-xl border border-purple-400/20 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">Invoice downloaded successfully!</span>
          </div>
        </div>
      )}

      {selectedOrder && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-[#0a0a0a]/95 backdrop-blur-xl border-l border-purple-500/20 z-[70] overflow-y-auto animate-in slide-in-from-right duration-500">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white">Order Details</h2>
                  <p className="text-white/60 text-sm mt-1">Complete order information</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card
                  className="bg-white/5 backdrop-blur-sm border-purple-500/10 p-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: "100ms" }}
                >
                  <p className="text-white/60 text-sm mb-1">Order ID</p>
                  <p className="text-white font-bold text-lg">{selectedOrder.id}</p>
                </Card>
                <Card
                  className="bg-white/5 backdrop-blur-sm border-purple-500/10 p-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: "200ms" }}
                >
                  <p className="text-white/60 text-sm mb-1">Order Date</p>
                  <p className="text-white font-bold text-lg">{selectedOrder.date}</p>
                </Card>
                <Card
                  className="bg-white/5 backdrop-blur-sm border-purple-500/10 p-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: "300ms" }}
                >
                  <p className="text-white/60 text-sm mb-1">Delivery Status</p>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedOrder.status === "delivered"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-orange-500/10 text-orange-400"
                    }`}
                  >
                    {selectedOrder.status === "delivered" ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Delivered
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        Pending
                      </>
                    )}
                  </span>
                </Card>
                <Card
                  className="bg-white/5 backdrop-blur-sm border-purple-500/10 p-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: "400ms" }}
                >
                  <p className="text-white/60 text-sm mb-1">Payment Status</p>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Paid
                  </span>
                </Card>
              </div>

              <div
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: "500ms" }}
              >
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-400" />
                  Delivery Timeline
                </h3>
                <Card className="bg-white/5 backdrop-blur-sm border-purple-500/10 p-6">
                  <div className="relative space-y-8">
                    {/* Timeline Line */}
                    <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-white/10" />

                    {/* Animated Progress Line */}
                    <div
                      className="absolute left-[15px] top-4 w-0.5 bg-gradient-to-b from-purple-500 to-purple-400 animate-in slide-in-from-top duration-1000"
                      style={{
                        height: selectedOrder.status === "delivered" ? "calc(100% - 32px)" : "40%",
                        animationDelay: "600ms",
                      }}
                    />

                    {/* Timeline Steps */}
                    {[
                      {
                        label: "Order Placed",
                        time: selectedOrder.date,
                        icon: ShoppingCart,
                        status: "completed",
                      },
                      {
                        label: "Confirmed",
                        time: selectedOrder.date,
                        icon: CheckCircle2,
                        status: "completed",
                      },
                      {
                        label: "Packed",
                        time: selectedOrder.date,
                        icon: Package,
                        status: selectedOrder.status === "delivered" ? "completed" : "current",
                      },
                      {
                        label: "Out for Delivery",
                        time: selectedOrder.status === "delivered" ? selectedOrder.date : "Pending",
                        icon: Truck,
                        status: selectedOrder.status === "delivered" ? "completed" : "pending",
                      },
                      {
                        label: "Delivered",
                        time: selectedOrder.status === "delivered" ? selectedOrder.date : "Pending",
                        icon: CheckCircle2,
                        status: selectedOrder.status === "delivered" ? "completed" : "pending",
                      },
                    ].map((step, index) => {
                      const Icon = step.icon
                      const isCompleted = step.status === "completed"
                      const isCurrent = step.status === "current"
                      const isPending = step.status === "pending"

                      return (
                        <div
                          key={step.label}
                          className="relative flex items-start gap-4 animate-in fade-in slide-in-from-left-4 duration-500"
                          style={{ animationDelay: `${700 + index * 100}ms` }}
                        >
                          {/* Timeline Node */}
                          <div
                            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                              isCompleted
                                ? "bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                                : isCurrent
                                  ? "bg-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-pulse"
                                  : "bg-white/10 border border-white/20"
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isCompleted || isCurrent ? "text-white" : "text-white/40"}`} />
                          </div>

                          {/* Timeline Content */}
                          <div className="flex-1 pb-2">
                            <div className="flex items-center justify-between">
                              <h4
                                className={`font-semibold ${isCompleted || isCurrent ? "text-white" : "text-white/40"}`}
                              >
                                {step.label}
                              </h4>
                              <span
                                className={`text-sm ${isCompleted || isCurrent ? "text-white/60" : "text-white/30"}`}
                              >
                                {step.time}
                              </span>
                            </div>
                            {isCurrent && <p className="text-purple-400 text-sm mt-1 animate-pulse">In progress...</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>

              <div
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: "750ms" }}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Invoice
                </h3>
                <Card className="bg-white/5 backdrop-blur-sm border-purple-500/10 p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/60 text-sm">Invoice Number</p>
                      <p className="text-white font-semibold">INV-{selectedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Order Date</p>
                      <p className="text-white font-semibold">{selectedOrder.date}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Customer Name</p>
                      <p className="text-white font-semibold">Retailer Customer</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Payment Status</p>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Paid
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadInvoice}
                    disabled={downloadingInvoice}
                    className="w-full flex items-center justify-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 font-semibold px-4 py-3 rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingInvoice ? (
                      <>
                        <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                        Generating Invoice...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download Invoice
                      </>
                    )}
                  </button>
                </Card>
              </div>

              <div
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: "800ms" }}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-400" />
                  Order Items
                </h3>
                <Card className="bg-white/5 backdrop-blur-sm border-purple-500/10 divide-y divide-white/5">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-white/5 transition-colors animate-in fade-in duration-300"
                      style={{ animationDelay: `${600 + index * 100}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{item.image}</div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{item.name}</h4>
                          <p className="text-white/60 text-sm">
                            {item.quantity} kg × ${item.price.toFixed(2)}/kg
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold text-lg">${(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </Card>
              </div>

              <div
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: "900ms" }}
              >
                <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
                <Card className="bg-white/5 backdrop-blur-sm border-purple-500/10 p-6 space-y-4">
                  <div className="flex items-center justify-between text-white/80">
                    <span>Subtotal</span>
                    <span className="font-semibold">${calculateSubtotal(selectedOrder.items).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/80">
                    <span>Delivery Fee</span>
                    <span className="font-semibold">$5.00</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-xl">Grand Total</span>
                    <span className="text-purple-400 font-bold text-2xl">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </Card>
              </div>

              <div
                className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: "1000ms" }}
              >
                {selectedOrder.status === "delivered" && (
                  <button
                    onClick={() => handleReorderFromDrawer(selectedOrder.items)}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 py-4 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Reorder Items
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-6 py-4 rounded-lg transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

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
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                Cart
              </Link>
              <Link
                href="/retailer/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-500/10 text-purple-500 font-medium"
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
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white w-full"
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
                  <h2 className="text-2xl font-bold text-white">My Orders</h2>
                  <p className="text-white/60 text-sm">View and manage your order history</p>
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
            <div className="space-y-6">
              {ordersData.map((order, index) => (
                <Card
                  key={order.id}
                  className={`bg-white/5 backdrop-blur-sm border-purple-500/10 p-6 transition-all duration-500 ${
                    mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Package className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{order.id}</h3>
                        <p className="text-white/60 text-sm">Ordered on {order.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-400">${order.total.toFixed(2)}</p>
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === "delivered"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-orange-500/10 text-orange-400"
                          }`}
                        >
                          {order.status === "delivered" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Delivered
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Pending
                            </>
                          )}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-purple-500/20 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                        >
                          View Details
                        </button>
                        {order.status === "delivered" && (
                          <button
                            onClick={() => handleReorder(order.items)}
                            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Reorder
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                      >
                        <div className="text-4xl">{item.image}</div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{item.name}</h4>
                          <p className="text-white/60 text-sm">
                            {item.quantity} kg × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">${(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
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

export default function RetailerOrdersPage() {
  return (
    <ProtectedRoute allowedRole="retailer">
      <RetailerOrdersContent />
    </ProtectedRoute>
  )
}
