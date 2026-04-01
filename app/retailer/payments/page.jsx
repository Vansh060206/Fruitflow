"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, Search } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { useLanguage } from "@/lib/language-context";

import { useAuth } from "@/lib/auth-context";
import { ref, onValue } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

function StatCard({ title, value, icon: Icon, delay }) {
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(0);
  const targetValue = typeof value === "string" ? Number.parseFloat(value.replace(/[^0-9.]/g, "")) : value;

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!mounted) return;
    const duration = 1500;
    const increment = targetValue / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        setCount(targetValue);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [mounted, targetValue]);

  return (
    <Card className={`bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 dark:bg-white/5 dark:border-purple-500/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-muted-foreground text-sm font-medium dark:text-white/60">{title}</h3>
        <Icon className="w-5 h-5 text-purple-500" />
      </div>
      <p className="text-3xl font-bold text-foreground dark:text-white">₹{count.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </Card>
  );
}

function PaymentsContent() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
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
          amount: data[key].totalAmount || 0,
          date: data[key].createdAt ? new Date(data[key].createdAt).toISOString().split('T')[0] : "2024-01-01",
          status: data[key].paymentStatus || "pending"
        }));
        // Sort by newest first
        setPayments(dataArray.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } else {
        setPayments([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching payments:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.uid]);

  // Calculate totals
  const totalPaid = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

  // Filter payments based on search query
  const filteredPayments = payments.filter((payment) => {
    const query = searchQuery.toLowerCase();
    return (
      payment.id.toLowerCase().includes(query) ||
      payment.amount.toString().includes(query) ||
      payment.date.includes(query) ||
      payment.status.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
          <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground font-medium">Fetching payment history...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard title={t("totalPaid")} value={`₹${totalPaid.toFixed(2)}`} icon={CheckCircle2} delay={0} />
            <StatCard title={t("pendingAmount")} value={`₹${totalPending.toFixed(2)}`} icon={Clock} delay={100} />
          </div>

          {/* Payment History */}
          <Card className="bg-card/50 backdrop-blur-sm border-border overflow-hidden dark:bg-white/5 dark:border-purple-500/10">
            <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 dark:border-white/10">
              <h3 className="text-xl font-bold text-foreground dark:text-white">{t("paymentHistory")}</h3>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-white/40" />
                <input
                  type="text"
                  placeholder={t("searchPayments")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 transition-colors dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted dark:bg-white/5">
                  <tr>
                    <th className="text-left px-6 py-4 text-muted-foreground text-sm font-medium dark:text-white/60">{t("orderId")}</th>
                    <th className="text-left px-6 py-4 text-muted-foreground text-sm font-medium dark:text-white/60">{t("amount")}</th>
                    <th className="text-left px-6 py-4 text-muted-foreground text-sm font-medium dark:text-white/60">{t("date")}</th>
                    <th className="text-left px-6 py-4 text-muted-foreground text-sm font-medium dark:text-white/60">{t("status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment, index) => (
                      <tr key={payment.id} className={`border-t border-border hover:bg-muted transition-all duration-300 dark:border-white/5 dark:hover:bg-white/5 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`} style={{ transitionDelay: `${index * 50 + 200}ms` }}>
                        <td className="px-6 py-4 text-foreground font-medium dark:text-white">{payment.id}</td>
                        <td className="px-6 py-4 text-foreground dark:text-white">₹{payment.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-muted-foreground dark:text-white/60">
                          {new Date(payment.date).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="px-6 py-4">
                          {payment.status === "paid" ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              {t("paid")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 border border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30">
                              <Clock className="w-3 h-3" />
                              {t("pending")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground dark:text-white/40">
                        {t("noPaymentsFound")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment, index) => (
                  <Card key={payment.id} className={`bg-card/50 backdrop-blur-sm border-border p-4 transition-all duration-500 dark:bg-white/5 dark:border-purple-500/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: `${index * 50 + 200}ms` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-foreground font-semibold dark:text-white">{payment.id}</span>
                      {payment.status === "paid" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          {t("paid")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 border border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30">
                          <Clock className="w-3 h-3" />
                          {t("pending")}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm dark:text-white/60">{t("amount")}</span>
                        <span className="text-foreground font-semibold dark:text-white">₹{payment.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm dark:text-white/60">{t("date")}</span>
                        <span className="text-muted-foreground text-sm dark:text-white/60">
                          {new Date(payment.date).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground dark:text-white/40">
                  {t("noPaymentsFound")}
                </div>
              )}
            </div>
          </Card>
        </>
      )
      }
    </div >
  );
}

export default function RetailerPayments() {
  return (
    <ProtectedRoute allowedRole="retailer">
      <PaymentsContent />
    </ProtectedRoute>
  );
}
