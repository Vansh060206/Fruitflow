"use client";
import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/protected-route";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  CheckCircle2,
  Clock,
  RefreshCw,
  Download,
  FileText,
  Truck,
  X,
  ShoppingCart
} from "lucide-react";

import { useLanguage } from "@/lib/language-context";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { ref, onValue } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

function RetailerOrdersContent() {
  const [mounted, setMounted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [showInvoiceToast, setShowInvoiceToast] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { t } = useLanguage();
  const { addMultipleToCart } = useCart();
  const { userData } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userData?.uid) return;

    setIsLoading(true);
    const ordersRef = ref(realtimeDb, `retailer_orders/${userData.uid}`);

    const unsubscribe = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const dataArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          date: new Date(data[key].createdAt).toLocaleDateString()
        }));
        // Sort by newest first
        setOrders(dataArray.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setOrders([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching retailer orders:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.uid]);

  useEffect(() => {
    setMounted(true);
  }, []);


  const handleEsc = (e) => {
    if (e.key === "Escape" && selectedOrder) {
      setSelectedOrder(null);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [selectedOrder]);

  const handleReorder = (orderItems) => {
    addMultipleToCart(orderItems);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      router.push("/retailer/cart");
    }, 2000);
  };

  const handleReorderFromDrawer = (orderItems) => {
    setSelectedOrder(null);
    handleReorder(orderItems);
  };

  return (
    <div className="p-6">
      {showToast && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-5 duration-300">
          <Card className="bg-purple-600/90 backdrop-blur-xl border-purple-400/20 px-6 py-4 shadow-[0_0_30px_rgba(168,85,247,0.3)] dark:bg-purple-500/90">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <p className="text-white font-semibold">{t("itemsAddedToCart")}</p>
            </div>
          </Card>
        </div>
      )}

      {showInvoiceToast && (
        <div className="fixed top-6 right-6 z-[80] animate-in slide-in-from-top-4 duration-500">
          <div className="bg-purple-600/90 backdrop-blur-xl border border-purple-400/20 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 dark:bg-purple-500/90">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">{t("invoiceDownloaded")}</span>
          </div>
        </div>
      )}

      {selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300" onClick={() => setSelectedOrder(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-background/95 backdrop-blur-xl border-l border-border z-[70] overflow-y-auto animate-in slide-in-from-right duration-500 dark:bg-[#0a0a0a]/95 dark:border-purple-500/20">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border dark:border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-foreground dark:text-white">{t("orderDetails")}</h2>
                  <p className="text-muted-foreground text-sm mt-1 dark:text-white/60">{t("completeOrderInfo")}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/60 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-card/50 backdrop-blur-sm border-border p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 dark:bg-white/5 dark:border-purple-500/10" style={{ animationDelay: "100ms" }}>
                  <p className="text-muted-foreground text-sm mb-1 dark:text-white/60">{t("orderId")}</p>
                  <p className="text-foreground font-bold text-lg dark:text-white">{selectedOrder.id}</p>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 dark:bg-white/5 dark:border-purple-500/10" style={{ animationDelay: "200ms" }}>
                  <p className="text-muted-foreground text-sm mb-1 dark:text-white/60">{t("orderDate")}</p>
                  <p className="text-foreground font-bold text-lg dark:text-white">{selectedOrder.date}</p>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 dark:bg-white/5 dark:border-purple-500/10" style={{ animationDelay: "300ms" }}>
                  <p className="text-muted-foreground text-sm mb-1 dark:text-white/60">{t("deliveryStatus")}</p>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${selectedOrder.status === "delivered"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-orange-500/10 text-orange-600 dark:text-orange-400"}`}>
                    {selectedOrder.status === "delivered" ? (<>
                      <CheckCircle2 className="w-3 h-3" />
                      {t("delivered")}
                    </>) : (<>
                      <Clock className="w-3 h-3" />
                      {t("pending")}
                    </>)}
                  </span>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border p-4 animate-in fade-in slide-in-from-bottom-4 duration-500 dark:bg-white/5 dark:border-purple-500/10" style={{ animationDelay: "400ms" }}>
                  <p className="text-muted-foreground text-sm mb-1 dark:text-white/60">{t("paymentStatus")}</p>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${(selectedOrder.paymentStatus || 'pending') === "paid" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-orange-500/10 text-orange-600 dark:text-orange-400"}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {t((selectedOrder.paymentStatus || 'pending'))}
                  </span>
                </Card>
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "800ms" }}>
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 dark:text-white">
                  <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  {t("orderItems")}
                </h3>
                <Card className="bg-card/50 backdrop-blur-sm border-border divide-y divide-border dark:bg-white/5 dark:border-purple-500/10 dark:divide-white/5">
                  {selectedOrder.items.map((item, index) => (<div key={item.id} className="p-4 hover:bg-muted/50 transition-colors animate-in fade-in duration-300 dark:hover:bg-white/5" style={{ animationDelay: `${600 + index * 100}ms` }}>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{item.image}</div>
                      <div className="flex-1">
                        <h4 className="text-foreground font-semibold dark:text-white">{t(item.name)}</h4>
                        <p className="text-muted-foreground text-sm dark:text-white/60">
                          {item.quantity} kg × ₹{item.price.toFixed(2)}/kg
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground font-bold text-lg dark:text-white">₹{(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>))}
                </Card>
              </div>

              <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6">
                {selectedOrder.status === "delivered" && (<button onClick={() => handleReorderFromDrawer(selectedOrder.items)} className="flex-1 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 py-4 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105">
                  <RefreshCw className="w-5 h-5" />
                  {t("reorderItems")}
                </button>)}
                <button onClick={() => setSelectedOrder(null)} className="flex-1 flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 border border-border text-foreground font-semibold px-6 py-4 rounded-lg transition-all duration-300 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-white">
                  <X className="w-5 h-5" />
                  {t("close")}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground font-medium">Fetching your order history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-card/50 backdrop-blur-sm border border-dashed border-border rounded-2xl dark:bg-white/5 dark:border-white/10">
            <ShoppingCart className="w-20 h-20 text-muted-foreground/20 mx-auto mb-4 dark:text-white/20" />
            <h3 className="text-2xl font-bold text-foreground mb-2 dark:text-white">{t("noOrdersFound") || "No orders found"}</h3>
            <p className="text-muted-foreground mb-6 dark:text-white/60">You haven't placed any orders yet.</p>
            <Link href="/retailer/browse" className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              {t("browseProducts")}
            </Link>
          </div>
        ) : (
          orders.map((order, index) => (
            <Card key={order.id} className={`bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-500 dark:bg-white/5 dark:border-purple-500/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${index * 100}ms` }}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground dark:text-white">{order.id}</h3>
                    <p className="text-muted-foreground text-sm dark:text-white/60">{t("orderedOn")} {order.date}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹{(order.totalAmount || 0).toFixed(2)}</p>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${order.status === "delivered" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-orange-500/10 text-orange-600 dark:text-orange-400"}`}>
                      {order.status === "delivered" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          {t("delivered")}
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          {t(order.status || "pending")}
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedOrder(order)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 border border-border text-foreground font-semibold px-6 py-3 rounded-lg transition-all duration-300 dark:bg-white/5 dark:hover:bg-white/10 dark:border-purple-500/20 dark:text-white">
                      {t("viewDetails")}
                    </button>
                    {order.status === "delivered" && (<button onClick={() => handleReorder(order.items)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                      <RefreshCw className="w-4 h-4" />
                      {t("reorder")}
                    </button>)}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default function RetailerOrdersPage() {
  return (
    <ProtectedRoute allowedRole="retailer">
      <RetailerOrdersContent />
    </ProtectedRoute>
  );
}
