"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/protected-route";
import { Search, ShoppingCart, Clock, DollarSign, CheckCircle2, Truck } from "lucide-react";

import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { ref, onValue } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

function OrdersPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
  const { userData } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userData?.uid) return;

    setIsLoading(true);
    const ordersRef = ref(realtimeDb, `orders/${userData.uid}`);

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
      console.error("Error fetching orders:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.uid]);

  // Filter orders based on search
  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.retailerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const totalRevenue = orders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingPayments = orders.filter((o) => o.paymentStatus === "pending").reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border p-6 dark:bg-white/5 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-muted-foreground text-sm font-medium dark:text-white/60">{t("totalOrders")}</h3>
            <ShoppingCart className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-foreground dark:text-white">{totalOrders}</p>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border p-6 dark:bg-white/5 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-muted-foreground text-sm font-medium dark:text-white/60">{t("pendingOrders")}</h3>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-foreground dark:text-white">{pendingOrders}</p>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border p-6 dark:bg-white/5 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-muted-foreground text-sm font-medium dark:text-white/60">{t("totalRevenue")}</h3>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-foreground dark:text-white">₹{totalRevenue.toFixed(2)}</p>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border p-6 dark:bg-white/5 dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-muted-foreground text-sm font-medium dark:text-white/60">{t("pendingPayments")}</h3>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-foreground dark:text-white">₹{pendingPayments.toFixed(2)}</p>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-white/40" />
        <input
          type="text"
          placeholder={t("searchOrderPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card/50 backdrop-blur-sm border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40"
        />
      </div>

      {/* Desktop Table View */}
      <Card className="bg-card/50 backdrop-blur-sm border-border overflow-hidden hidden md:block dark:bg-white/5 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border dark:bg-white/5 dark:border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80 dark:text-white/80">{t("orderId")}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80 dark:text-white/80">{t("retailer")}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80 dark:text-white/80">{t("date")}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80 dark:text-white/80">{t("amount")}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80 dark:text-white/80">{t("paymentStatus")}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80 dark:text-white/80">{t("orderStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr
                  key={order.id}
                  className={`border-b border-border hover:bg-muted transition-colors cursor-pointer dark:border-white/5 dark:hover:bg-white/5 ${mounted ? "opacity-100" : "opacity-0"}`}
                  style={{
                    transitionDelay: `${index * 30}ms`,
                  }}
                >
                  <td className="px-6 py-4">
                    <span className="text-foreground font-medium dark:text-white">{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-foreground/80 dark:text-white/80">{order.retailerName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-muted-foreground text-sm dark:text-white/60">{order.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-600 font-semibold dark:text-emerald-400">₹{order.totalAmount.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${(order.paymentStatus || 'pending') === "paid"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                        : "bg-orange-500/10 text-orange-600 border border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30"
                        }`}
                    >
                      {(order.paymentStatus || 'pending') === "paid" ? t("paid") : t("pending")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${order.status === "delivered"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                        : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30"
                        }`}
                    >
                      {order.status === "delivered" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          {t("delivered")}
                        </>
                      ) : (
                        <>
                          <Truck className="w-3 h-3" />
                          {t(order.status || "pending")}
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {filteredOrders.map((order, index) => (
          <Card
            key={order.id}
            className={`bg-card/50 backdrop-blur-sm border-border p-4 hover:shadow-lg transition-all dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            style={{
              transitionDelay: `${index * 30}ms`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-foreground font-semibold dark:text-white">{order.id}</h3>
                <p className="text-muted-foreground text-sm dark:text-white/60">{order.retailerName}</p>
              </div>
              <span className="text-emerald-600 font-bold dark:text-emerald-400">₹{order.totalAmount.toFixed(2)}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground dark:text-white/60">{t("date")}:</span>
                <span className="text-foreground/80 dark:text-white/80">{order.date}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground dark:text-white/60">{t("paymentStatus")}:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${(order.paymentStatus || 'pending') === "paid"
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                    : "bg-orange-500/10 text-orange-600 border border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30"
                    }`}
                >
                  {(order.paymentStatus || 'pending') === "paid" ? t("paid") : t("pending")}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground dark:text-white/60">{t("orderStatus")}:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${order.status === "delivered"
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                    : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30"
                    }`}
                >
                  {order.status === "delivered" ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      {t("delivered")}
                    </>
                  ) : (
                    <>
                      <Truck className="w-3 h-3" />
                      {t(order.status || "pending")}
                    </>
                  )}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* No results message */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4 dark:text-white/20" />
          <p className="text-muted-foreground text-lg dark:text-white/60">{t("noOrdersFound")}</p>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute allowedRole="wholesaler">
      <OrdersPageContent />
    </ProtectedRoute>
  );
}
