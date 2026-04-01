"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Search, DollarSign, AlertCircle, TrendingUp, Users, Bell, Check } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { useLanguage } from "@/lib/language-context";

import { useAuth } from "@/lib/auth-context";
import { ref, onValue, update } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { toast } from "sonner";

function WholesalerPaymentsContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("name"); // "name", "credit", "date", "overdue", "status"
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [history, setHistory] = useState([]);
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
        const orders = snapshot.val();
        const retailerMap = {};
        const paymentLogs = [];
        const today = new Date().setHours(0, 0, 0, 0);

        Object.keys(orders).forEach(orderId => {
          const order = orders[orderId];
          const retailerId = order.retailerId || "unknown";
          const retailerName = order.retailerName || "Unnamed Retailer";

          const paymentStatus = order.paymentStatus || "pending";

          if (paymentStatus === "pending") {
            if (!retailerMap[retailerId]) {
              retailerMap[retailerId] = {
                id: retailerId,
                retailerName: retailerName,
                totalCredit: 0,
                lastPaymentDate: "N/A",
                daysOverdue: 0,
                status: "ontime",
                orderIds: []
              };
            }
            retailerMap[retailerId].totalCredit += (order.totalAmount || 0);
            retailerMap[retailerId].orderIds.push(orderId);

            // Calculate overdue (if pending > 7 days)
            const daysDiff = Math.floor((Date.now() - order.createdAt) / (1000 * 60 * 60 * 24));
            if (daysDiff > 7) {
              retailerMap[retailerId].status = "overdue";
              retailerMap[retailerId].daysOverdue = Math.max(retailerMap[retailerId].daysOverdue, daysDiff);
            }
          } else if (paymentStatus === "paid") {
            paymentLogs.push({
              id: orderId,
              retailerName: retailerName,
              amountPaid: order.totalAmount || 0,
              date: new Date(order.updatedAt || order.createdAt).toISOString().split('T')[0],
              timestamp: order.updatedAt || order.createdAt,
              paymentMethod: "UPI/Online"
            });
          }
        });

        setCustomers(Object.values(retailerMap));
        setHistory(paymentLogs.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10));
      } else {
        setCustomers([]);
        setHistory([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.uid]);

  const handleMarkPaid = async (customer) => {
    try {
      const updates = {};
      customer.orderIds.forEach(id => {
        // Update Wholesaler's DB
        updates[`orders/${userData.uid}/${id}/paymentStatus`] = "paid";
        updates[`orders/${userData.uid}/${id}/updatedAt`] = Date.now();

        // Push the update to Retailer's DB too!
        if (customer.id && customer.id !== "unknown") {
          updates[`retailer_orders/${customer.id}/${id}/paymentStatus`] = "paid";
          updates[`retailer_orders/${customer.id}/${id}/updatedAt`] = Date.now();
        }
      });
      await update(ref(realtimeDb), updates);
      toast.success(`Marked all orders from ${customer.retailerName} as paid.`);
    } catch (err) {
      console.error("Mark Paid Error:", err);
      toast.error("Failed to update payment status.");
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;

    if (filterType === "name") {
      return customer.retailerName.toLowerCase().includes(query);
    } else if (filterType === "credit") {
      return customer.totalCredit.toString().includes(query);
    } else if (filterType === "overdue") {
      return customer.daysOverdue.toString().includes(query);
    }
    return true;
  });

  const totalOutstanding = customers.reduce((sum, c) => sum + c.totalCredit, 0);
  const overdueCustomers = customers.filter((c) => c.status === "overdue");
  const overdueAmount = overdueCustomers.reduce((sum, c) => sum + c.totalCredit, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  const paymentsToday = history.filter((p) => p.timestamp >= today).reduce((sum, p) => sum + p.amountPaid, 0);
  const activeCreditCustomers = customers.length;

  return (
    <div className="p-6 space-y-6">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground font-medium">Loading collection data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className={`bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 dark:bg-white/5 dark:border-white/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-muted-foreground text-sm font-medium dark:text-white/60">{t("totalOutstanding")}</h3>
                <DollarSign className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-foreground dark:text-white">₹{totalOutstanding.toLocaleString()}</p>
              <p className="text-orange-600 text-xs mt-2 dark:text-orange-400">{t("pendingFromCustomers")}</p>
            </Card>

            <Card className={`bg-red-500/5 backdrop-blur-sm border-red-500/20 p-6 transition-all duration-700 dark:bg-red-500/10 dark:border-red-500/30 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "100ms" }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-muted-foreground text-sm font-medium dark:text-white/60">{t("overduePayments")}</h3>
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-foreground dark:text-white">₹{overdueAmount.toLocaleString()}</p>
              <p className="text-red-600 text-xs mt-2 dark:text-red-400">{overdueCustomers.length} {t("overdueAccounts")}</p>
            </Card>

            <Card className={`bg-emerald-500/5 backdrop-blur-sm border-emerald-500/20 p-6 transition-all duration-700 dark:bg-white/5 dark:border-emerald-500/30 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "200ms" }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-muted-foreground text-sm font-medium dark:text-white/60">{t("paymentsReceivedToday")}</h3>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-foreground dark:text-white">₹{paymentsToday.toLocaleString()}</p>
              <p className="text-emerald-600 text-xs mt-2 dark:text-emerald-400">{t("todaysCollections")}</p>
            </Card>

            <Card className={`bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 dark:bg-white/5 dark:border-white/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "300ms" }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-muted-foreground text-sm font-medium dark:text-white/60">{t("activeCreditCustomers")}</h3>
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-foreground dark:text-white">{activeCreditCustomers}</p>
              <p className="text-emerald-600 text-xs mt-2 dark:text-emerald-400">{t("totalCreditAccounts")}</p>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilterType("name")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filterType === "name"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
              >
                {t("byName")}
              </button>
              <button
                onClick={() => setFilterType("credit")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filterType === "credit"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
              >
                {t("byCredit")}
              </button>
              <button
                onClick={() => setFilterType("overdue")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${filterType === "overdue"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
              >
                {t("byDaysOverdue")}
              </button>
            </div>

            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-white/40" />
              <input
                type="text"
                placeholder={t("searchRetailerPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card/50 backdrop-blur-sm border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40"
              />
            </div>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-border overflow-hidden dark:bg-white/5 dark:border-white/10">
            <div className="p-6 border-b border-border dark:border-white/10">
              <h3 className="text-xl font-bold text-foreground dark:text-white">{t("customerCreditTracking")}</h3>
              <p className="text-muted-foreground text-sm mt-1 dark:text-white/60">{t("monitorOutstanding")}</p>
            </div>

            <div className="overflow-x-auto hidden md:block">
              <table className="w-full">
                <thead className="bg-muted border-b border-border dark:bg-white/5 dark:border-white/10">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80 dark:text-white/80">Retailer Name</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80 dark:text-white/80">Total Credit</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80 dark:text-white/80">Days Overdue</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80 dark:text-white/80">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80 dark:text-white/80">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length > 0 ? filteredCustomers.map((customer, index) => (
                    <tr
                      key={customer.id}
                      className={`border-b border-border transition-all duration-500 dark:border-white/5 ${mounted ? "opacity-100" : "opacity-0"} ${customer.status === "overdue"
                        ? "bg-red-500/5 hover:bg-red-500/10 dark:bg-red-500/5 dark:hover:bg-red-500/10"
                        : "bg-emerald-500/5 hover:bg-emerald-500/10 dark:bg-emerald-500/5 dark:hover:bg-emerald-500/10"
                        }`}
                      style={{
                        transitionDelay: `${index * 30}ms`,
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {customer.status === "overdue" && <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />}
                          <span className="text-foreground font-medium dark:text-white">{customer.retailerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-foreground/80 font-semibold dark:text-white/80">₹{customer.totalCredit.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-semibold ${customer.daysOverdue > 7
                            ? "text-red-600 dark:text-red-400"
                            : customer.daysOverdue > 0
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-emerald-600 dark:text-emerald-400"
                            }`}
                        >
                          {customer.daysOverdue > 0 ? `${customer.daysOverdue} days` : "On time"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${customer.status === "ontime"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                            : "bg-red-500/10 text-red-600 border border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30"
                            }`}
                        >
                          {customer.status === "ontime" ? "On Time" : "Overdue"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMarkPaid(customer)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-600 font-medium transition-all text-xs dark:text-emerald-400"
                          >
                            <Check className="w-3 h-3" />
                            Mark Paid
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-muted-foreground opacity-50">No active credit customers.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 p-4 md:hidden">
              {filteredCustomers.map((customer, index) => (
                <div
                  key={customer.id}
                  className={`backdrop-blur-sm p-4 rounded-xl border transition-all ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"} ${customer.status === "overdue"
                    ? "bg-red-500/10 border-red-500/30 dark:bg-red-500/10 dark:border-red-500/30"
                    : "bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-500/10 dark:border-emerald-500/30"
                    }`}
                  style={{
                    transitionDelay: `${index * 30}ms`,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {customer.status === "overdue" && <AlertCircle className="w-4 h-4 text-red-500" />}
                      <h3 className="text-foreground font-semibold dark:text-white">{customer.retailerName}</h3>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${customer.status === "ontime"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                        : "bg-red-500/10 text-red-600 border border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30"
                        }`}
                    >
                      {customer.status === "ontime" ? "On Time" : "Overdue"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground dark:text-white/60">Total Credit:</span>
                      <span className="text-foreground font-semibold dark:text-white">₹{customer.totalCredit.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground dark:text-white/60">Days Overdue:</span>
                      <span
                        className={`font-semibold ${customer.daysOverdue > 7
                          ? "text-red-600 dark:text-red-400"
                          : customer.daysOverdue > 0
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-emerald-600 dark:text-emerald-400"
                          }`}
                      >
                        {customer.daysOverdue > 0 ? `${customer.daysOverdue} days` : "On time"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleMarkPaid(customer)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-600 text-xs font-medium transition-all dark:text-emerald-400"
                    >
                      <Check className="w-3 h-3" />
                      Mark Paid
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border overflow-hidden dark:bg-white/5 dark:border-white/10">
            <div className="p-6 border-b border-border dark:border-white/10">
              <h3 className="text-xl font-bold text-foreground dark:text-white">Recent Collections</h3>
              <p className="text-muted-foreground text-sm mt-1 dark:text-white/60">Recent payments received from retailers</p>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {history.length > 0 ? history.map((payment, index) => (
                  <div
                    key={payment.id}
                    className={`flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted transition-all dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                      }`}
                    style={{
                      transitionDelay: `${index * 50}ms`,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center dark:bg-emerald-500/20">
                        <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-foreground font-semibold dark:text-white">{payment.retailerName}</p>
                        <p className="text-muted-foreground text-sm dark:text-white/60">{payment.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-600 font-bold dark:text-emerald-400">+₹{payment.amountPaid.toLocaleString()}</p>
                      <span className="inline-block px-2 py-0.5 bg-muted rounded text-muted-foreground text-xs mt-1 dark:bg-white/10 dark:text-white/60">
                        {payment.paymentMethod}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 opacity-50">No recent collections found.</div>
                )}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export default function WholesalerPaymentsPage() {
  return (
    <ProtectedRoute allowedRole="wholesaler">
      <WholesalerPaymentsContent />
    </ProtectedRoute>
  );
}
