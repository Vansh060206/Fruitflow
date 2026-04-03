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
  ShoppingCart,
  DollarSign,
  Loader2,
  Navigation,
  MapPin
} from "lucide-react";

import { useLanguage } from "@/lib/language-context";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { ref, onValue } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { DeliveryTracking } from "@/components/delivery-tracking";
import { jsPDF } from "jspdf";

import { toast } from "sonner";

function RetailerOrdersContent() {
  const [mounted, setMounted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [showInvoiceToast, setShowInvoiceToast] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
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
        const initialOrders = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          date: new Date(data[key].createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        })).sort((a, b) => {
          const aStatus = (a.status || 'pending').toLowerCase();
          const bStatus = (b.status || 'pending').toLowerCase();

          // 1. REJECTED IS ALWAYS BOTTOMEST (User doesn't need to see dead orders)
          const aRejected = aStatus === 'rejected_negotiation';
          const bRejected = bStatus === 'rejected_negotiation';
          if (aRejected !== bRejected) return aRejected ? 1 : -1;

          // 2. RECENCY IS NOW KING (The last thing I did/saw is at the top)
          return b.createdAt - a.createdAt;
        });
        
        setOrders(initialOrders);
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

  // LIVE STATUS SYNC from Wholesaler's official node
  useEffect(() => {
    if (orders.length === 0) return;

    const activeOrderIds = orders
      .filter(o => o.status !== 'delivered' && o.wholesalerId)
      .map(o => ({ id: o.id, wid: o.wholesalerId }));

    if (activeOrderIds.length === 0) return;

    const unsubscribes = activeOrderIds.map(({ id, wid }) => {
      const sharedRef = ref(realtimeDb, `orders/${wid}/${id}`);
      return onValue(sharedRef, (snap) => {
        if (snap.exists()) {
          const liveData = snap.val();
          setOrders(prev => prev.map(o => o.id === id ? { ...o, ...liveData } : o));
        }
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [orders.length]); // Re-run when order count changes

  // Sync selected order for live delivery view
  useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find(o => o.id === selectedOrder.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedOrder)) {
        setSelectedOrder(updated);
      }
    }
  }, [orders]);

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

  const handlePayOrder = async (order) => {
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: order.items,
          userData: userData,
          totalAmount: order.totalAmount,
          orderId: order.id,
          wholesalerId: order.wholesalerId
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create Stripe Checkout Session");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Payment Initiation Error:", error);
      toast.error("Payment initiation failed. Please try again.");
      setIsCheckingOut(false);
    }
  };

  const handleDownloadInvoice = (order) => {
    setDownloadingInvoice(true);
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(147, 51, 234); // Purple
    doc.text("FruitFlow", 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("B2B Official Invoice", 14, 28);

    // Line
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 35, 196, 35);

    // Order details
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Order ID: ${order.id}`, 14, 45);
    doc.text(`Date: ${order.date}`, 14, 52);
    doc.text(`Retailer ID: ${userData?.uid || 'Unknown'}`, 14, 59);

    // Items table header
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 70, 182, 10, 'F');
    doc.setFont(undefined, 'bold');
    doc.text("Item Name", 16, 77);
    doc.text("Qty (kg)", 100, 77);
    doc.text("Price/kg", 140, 77);
    doc.text("Total", 175, 77);

    // Items
    doc.setFont(undefined, 'normal');
    let yPos = 88;
    if (order.items) {
      order.items.forEach(item => {
        doc.text(item.name || "Fruit", 16, yPos);
        doc.text(item.quantity?.toString() || "0", 100, yPos);
        doc.text(`Rs. ${(item.price || 0).toFixed(2)}`, 140, yPos);
        doc.text(`Rs. ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}`, 175, yPos);
        yPos += 10;
      });
    }

    // Line
    doc.line(14, yPos, 196, yPos);
    yPos += 10;

    // Totals
    const subtotal = order.subtotal || order.totalAmount / 1.1; // Estimate if missing
    const tax = order.tax || subtotal * 0.1;

    doc.text("Subtotal:", 140, yPos);
    doc.text(`Rs. ${subtotal.toFixed(2)}`, 175, yPos);
    yPos += 8;

    doc.text("Tax (10%):", 140, yPos);
    doc.text(`Rs. ${tax.toFixed(2)}`, 175, yPos);
    yPos += 8;

    doc.setFont(undefined, 'bold');
    doc.text("Grand Total:", 140, yPos);
    doc.text(`Rs. ${(order.totalAmount || 0).toFixed(2)}`, 175, yPos);

    // Footer
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for using FruitFlow B2B Marketplace.", 105, 280, { align: "center" });

    doc.save(`Invoice_${order.id}.pdf`);

    setDownloadingInvoice(false);
    setShowInvoiceToast(true);
    setTimeout(() => {
      setShowInvoiceToast(false);
    }, 3000);
  };

  return (
    <div className="p-2 sm:p-6 max-w-full overflow-x-hidden">
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
          <div className="fixed inset-x-0 bottom-0 top-[15%] sm:right-0 sm:top-0 sm:left-auto sm:bottom-0 h-[85vh] sm:h-full w-full max-w-full sm:max-w-2xl bg-background/95 backdrop-blur-xl border-t sm:border-l border-border z-[70] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-right duration-500 rounded-t-[2.5rem] sm:rounded-none dark:bg-[#0a0a0a]/95 dark:border-purple-500/20">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border dark:border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-foreground dark:text-white">{t("orderDetails")}</h2>
                  <p className="text-muted-foreground text-sm mt-1 dark:text-white/60">{t("completeOrderInfo")}</p>
                </div>
                <div className="flex items-center gap-3">
                  {['delivered', 'accepted'].includes(selectedOrder.status?.toLowerCase()) && (
                    <button
                      onClick={() => handleDownloadInvoice(selectedOrder)}
                      disabled={downloadingInvoice}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 rounded-lg transition-colors font-medium text-sm dark:bg-purple-500/20 dark:hover:bg-purple-500/30 dark:text-purple-400 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      {downloadingInvoice ? "Generating..." : "Invoice"}
                    </button>
                  )}
                  <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/60 dark:hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
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
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${selectedOrder.status?.toLowerCase() === "delivered"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : selectedOrder.status === "accepted_negotiation" 
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                    : "bg-orange-500/10 text-orange-600 dark:text-orange-400"}`}>
                    {selectedOrder.status?.toLowerCase() === "delivered" ? (<>
                      <CheckCircle2 className="w-3 h-3" />
                      {t("delivered")}
                    </>) : selectedOrder.status === "accepted_negotiation" ? (<>
                      <CheckCircle2 className="w-3 h-3" />
                      Offer Accepted
                    </>) : (<>
                      <Clock className="w-3 h-3" />
                      {selectedOrder.status === 'pending_negotiation' ? "Negotiating" : t("pending")}
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
                        <h4 className="text-foreground font-semibold dark:text-white truncate">{t(item.name)}</h4>
                        <p className="text-muted-foreground text-sm dark:text-white/60">
                          {item.quantity} kg × ₹{(item.proposedPrice || item.price || 0).toFixed(2)}/kg
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground font-bold text-lg dark:text-white">₹{((item.quantity || 0) * (item.proposedPrice || item.price || 0)).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>))}
                </Card>
              </div>

              {/* LIVE DELIVERY TRACKING */}
              {selectedOrder.delivery && (
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 mt-8" style={{ animationDelay: "300ms" }}>
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black text-foreground flex items-center gap-3 dark:text-white uppercase tracking-tighter">
                         <div className="p-2 bg-purple-500/10 rounded-xl"><Truck className="w-6 h-6 text-purple-600 dark:text-purple-400" /></div>
                         Delivery Insight
                      </h3>
                      <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase rounded-full animate-pulse border border-emerald-500/20">Live Sync</div>
                   </div>
                   <DeliveryTracking order={selectedOrder} />
                </div>
              )}


              <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6">
                {(selectedOrder.paymentStatus || 'pending') !== "paid" && (['accepted', 'accepted_negotiation', 'picked_up', 'in_transit', 'delivered'].includes(selectedOrder.status?.toLowerCase())) && (<button onClick={() => handlePayOrder(selectedOrder)} disabled={isCheckingOut} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-4 rounded-xl transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105 disabled:opacity-70 animate-pulse">
                  {isCheckingOut ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><DollarSign className="w-5 h-5" /> Pay Now (₹{selectedOrder.totalAmount?.toFixed(2)})</>}
                </button>)}
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
            <Card key={order.id} className={`bg-card/50 backdrop-blur-sm border-border p-3 sm:p-6 transition-all duration-500 dark:bg-white/5 dark:border-purple-500/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${index * 100}ms` }}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-foreground dark:text-white truncate max-w-[120px] sm:max-w-none">#{order.id.slice(-10)}</h3>
                    <p className="text-muted-foreground text-sm dark:text-white/60">{t("orderedOn")} {order.date}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="text-left sm:text-right">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹{(order.totalAmount || 0).toFixed(2)}</p>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${order.status?.toLowerCase() === "delivered" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : order.status === "accepted_negotiation" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-orange-500/10 text-orange-600 dark:text-orange-400"}`}>
                      {order.status?.toLowerCase() === "delivered" ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          {t("delivered")}
                        </>
                      ) : order.status === "accepted_negotiation" ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Offer Accepted
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4" />
                          {order.status === 'pending_negotiation' ? "Negotiating" : t(order.status || "pending")}
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <button onClick={() => setSelectedOrder(order)} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 font-bold border ${['picked_up', 'in_transit', 'assigned'].includes(order.delivery?.status) ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]' : 'bg-muted hover:bg-muted/80 border-border text-foreground dark:bg-white/5 dark:hover:bg-white/10 dark:border-purple-500/20 dark:text-white'}`}>
                      {['picked_up', 'in_transit', 'assigned'].includes(order.delivery?.status) ? <><Navigation className="w-4 h-4 animate-pulse" /> Track Order</> : t("viewDetails")}
                    </button>
                    {(order.paymentStatus || 'pending') !== "paid" && (['accepted', 'accepted_negotiation', 'picked_up', 'in_transit', 'delivered'].includes(order.status?.toLowerCase())) && (
                      <button onClick={() => handlePayOrder(order)} disabled={isCheckingOut} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-lg transition-all duration-300 disabled:opacity-70 shadow-lg animate-pulse">
                         {isCheckingOut ? <Loader2 className="w-4 h-4 animate-spin"/> : <DollarSign className="w-4 h-4" />} Pay Now
                      </button>
                    )}
                    {['delivered', 'accepted'].includes(order.status?.toLowerCase()) && (
                      <button onClick={() => handleDownloadInvoice(order)} disabled={downloadingInvoice} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 border border-border text-foreground font-semibold px-6 py-3 rounded-lg transition-all duration-300 dark:bg-white/5 dark:hover:bg-white/10 dark:border-purple-500/20 dark:text-white disabled:opacity-50">
                        <Download className="w-4 h-4" />
                        Invoice
                      </button>
                    )}
                    {order.status?.toLowerCase() === "delivered" && (
                      <button onClick={() => handleReorder(order.items)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                        <RefreshCw className="w-4 h-4" />
                        {t("reorder")}
                      </button>
                    )}
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
