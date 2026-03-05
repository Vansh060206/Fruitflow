"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import {
  ShoppingCart,
  BarChart3,
  TrendingUp,
  Activity,
  Sparkles,
  Package
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";

// Sample initial data for empty state
const emptySalesData = [
  { name: "Mon", sales: 0 },
  { name: "Tue", sales: 0 },
  { name: "Wed", sales: 0 },
  { name: "Thu", sales: 0 },
  { name: "Fri", sales: 0 },
  { name: "Sat", sales: 0 },
  { name: "Sun", sales: 0 },
];
const salesData = [
  { name: "Mon", sales: 4200 },
  { name: "Tue", sales: 3800 },
  { name: "Wed", sales: 5100 },
  { name: "Thu", sales: 4600 },
  { name: "Fri", sales: 6200 },
  { name: "Sat", sales: 7400 },
  { name: "Sun", sales: 5800 },
];

// Recent activity data
const recentActivity = [
  { id: 1, action: "New order placed", time: "2 min ago", type: "order" },
  { id: 2, action: "Stock replenished", time: "15 min ago", type: "stock" },
  { id: 3, action: "Payment received", time: "1 hour ago", type: "payment" },
  { id: 4, action: "Low stock alert", time: "2 hours ago", type: "alert" },
];

// Stat card with animated counter
function StatCard({ title, value, icon: Icon, delay }) {
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(0);
  const targetValue = Number.parseFloat(value.replace(/[^0-9.]/g, ""));

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
    <Card className={`bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 dark:bg-white/5 dark:border-white/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-muted-foreground text-sm font-medium dark:text-white/60">{title}</h3>
        <Icon className="w-5 h-5 text-emerald-500" />
      </div>
      <p className="text-3xl font-bold text-foreground dark:text-white">
        {value.includes("₹") && "₹"}
        {Math.floor(count).toLocaleString()}
        {value.includes("kg") && " kg"}
      </p>
    </Card>
  );
}

function WholesalerDashboardContent() {
  const [chartMounted, setChartMounted] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);

  // Dynamic Metrics State
  const [metrics, setMetrics] = useState({
    todaysSales: 0,
    activeOrderCount: 0,
    totalStockKg: 0,
    isInitialLoad: true,
    salesTrend: emptySalesData,
    recentActivity: [],
    recentOrders: []
  });

  const { t, language } = useLanguage();
  const { userData } = useAuth();

  // 1. Listen to Inventory for Live Stock
  useEffect(() => {
    if (!userData?.uid) return;
    const { ref, onValue } = require("firebase/database");
    const { realtimeDb } = require("@/lib/firebase");

    const inventoryRef = ref(realtimeDb, `inventory/${userData.uid}`);
    return onValue(inventoryRef, (snapshot) => {
      let totalStock = 0;
      let activities = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(key => {
          const item = data[key];
          totalStock += (parseInt(item.quantity) || 0);

          // Add to activity if updated recently (last 2 hours)
          if (item.updatedAt > Date.now() - 7200000) {
            activities.push({
              id: `stock-${key}`,
              action: `Stock updated: ${item.name}`,
              time: new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: "stock",
              timestamp: item.updatedAt
            });
          }
        });
      }
      setMetrics(prev => ({
        ...prev,
        totalStockKg: totalStock,
        isInitialLoad: false,
        recentActivity: [...prev.recentActivity.filter(a => a.type !== "stock"), ...activities].sort((a, b) => b.timestamp - a.timestamp).slice(0, 4)
      }));
    });
  }, [userData?.uid]);

  // 2. Listen to Orders for Sales and Active Count
  useEffect(() => {
    if (!userData?.uid) return;
    const { ref, onValue } = require("firebase/database");
    const { realtimeDb } = require("@/lib/firebase");

    const ordersRef = ref(realtimeDb, `orders/${userData.uid}`);
    return onValue(ordersRef, (snapshot) => {
      let sales = 0;
      let active = 0;
      let activities = [];
      let lastFourOrders = [];
      const trendMap = { "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0, "Sun": 0 };
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const today = new Date().setHours(0, 0, 0, 0);

      // Initialize last 7 days with 0 for trendMap
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        trendMap[days[d.getDay()]] = 0;
      }

      if (snapshot.exists()) {
        const data = snapshot.val();
        const ordersArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); // Sort by creation time descending

        lastFourOrders = ordersArray.slice(0, 4);

        ordersArray.forEach(order => {
          if (order.status === "pending") active++;

          const orderDate = new Date(order.createdAt);
          const isToday = orderDate.toDateString() === new Date().toDateString();
          if (isToday) sales += (order.totalAmount || 0);

          const dayName = days[orderDate.getDay()];
          // Add to trend if within last 7 days
          if (Date.now() - order.createdAt < 7 * 24 * 60 * 60 * 1000) {
            trendMap[dayName] += (order.totalAmount || 0);
          }

          // Activity
          if (order.createdAt > Date.now() - 7200000) { // Last 2 hours
            activities.push({
              id: `order-${order.id}`,
              action: `New order from ${order.retailerName || "Retailer"}`,
              time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: "order",
              timestamp: order.createdAt
            });
          }
        });
      }

      // Format trend for chart (re-order to be chronological ending today)
      const sortedTrend = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const name = days[d.getDay()];
        sortedTrend.push({ name, sales: trendMap[name] });
      }

      setMetrics(prev => ({
        ...prev,
        todaysSales: sales,
        activeOrderCount: active,
        salesTrend: sortedTrend,
        recentOrders: lastFourOrders,
        recentActivity: [...prev.recentActivity.filter(a => a.type !== "order"), ...activities].sort((a, b) => b.timestamp - a.timestamp).slice(0, 4)
      }));
    });
  }, [userData?.uid]);

  // Check if it's a new user (strictly based on lack of activity)
  const isNewUser = metrics.isInitialLoad ? false : (metrics.totalStockKg === 0 && metrics.activeOrderCount === 0 && metrics.todaysSales === 0);

  // Dynamic data based on user state
  const currentSalesData = isNewUser ? emptySalesData : metrics.salesTrend;
  const currentActivity = isNewUser ? [] : metrics.recentActivity;
  const displaySales = "₹" + metrics.todaysSales.toLocaleString();
  const displayOrders = metrics.activeOrderCount.toString();
  const displayStock = metrics.totalStockKg.toLocaleString() + "kg";

  useEffect(() => {
    const timer = setTimeout(() => setChartMounted(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Fetch AI Predictions specific to this user profile
  useEffect(() => {
    if (!userData || !userData.role) return;
    const langName = language === 'hi' ? 'Hindi' : 'English';

    // Auto-fetch insights based on evolving market model
    setIsAiLoading(true);
    fetch("/api/ai/predict", {
      method: "POST",
      body: JSON.stringify({ role: userData.role, userData, language: langName }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.insights && Array.isArray(data.insights)) {
          setAiInsights(data.insights);
        }
        if (data.error && data.insights[0].includes("GEMINI")) {
          toast.warning("AI features disabled. Developer needs to provide GEMINI_API_KEY.");
        }
      })
      .catch(err => console.error("AI Error:", err))
      .finally(() => setIsAiLoading(false));
  }, [userData, language]);

  // Rotate insights every 20 seconds
  useEffect(() => {
    if (aiInsights.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentInsightIndex((prev) => (prev + 1) % aiInsights.length);
    }, 20000);
    return () => clearInterval(interval);
  }, [aiInsights.length]);

  return (
    <div className="p-6 space-y-6">
      {isNewUser && (
        <Card className="bg-emerald-500/10 border-emerald-500/20 p-6 mb-8 mt-2 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                Welcome to FruitFlow, {userData?.name?.split(' ')[0] || "Partner"}!
              </h2>
              <p className="text-emerald-600/80 dark:text-emerald-400/80">
                Your dashboard is empty right now because your account is brand new. Start by adding your first batch of fruits to your inventory to begin your wholesale journey.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t("todaysSales")} value={displaySales} icon={TrendingUp} delay={0} />
        <StatCard title={t("activeOrders")} value={displayOrders} icon={ShoppingCart} delay={100} />
        <StatCard title={t("stockRemaining")} value={displayStock} icon={Package} delay={200} />
        <StatCard title={t("aiDemandPrediction")} value={isNewUser ? "Pending Data" : "3,200kg"} icon={Sparkles} delay={300} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border p-6 dark:bg-white/5 dark:border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground dark:text-white">{t("salesTrends")}</h3>
            <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
          </div>
          <div className={`transition-all duration-700 ${chartMounted ? "opacity-100" : "opacity-0"}`}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border dark:text-white/5" opacity={0.3} />
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    color: "hsl(var(--foreground))",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                  }}
                  itemStyle={{ color: "#10b981", fontWeight: "bold" }}
                />
                <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 4, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, strokeWidth: 0 }} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border overflow-hidden dark:bg-white/5 dark:border-white/10">
          <div className="p-6 border-b border-border dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              <h3 className="text-xl font-semibold text-foreground dark:text-white">{t("recentOrders") || "Recent Orders"}</h3>
            </div>
            <Link href="/wholesaler/orders" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm dark:text-emerald-400 dark:hover:text-emerald-300">
              {t("viewAll")} →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 dark:bg-white/5">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-white/40">Buyer</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-white/40">Amount</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-white/40">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground dark:text-white/40">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-white/5">
                {metrics.recentOrders.length > 0 ? metrics.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50 transition-colors dark:hover:bg-white/5">
                    <td className="px-6 py-4 text-sm font-medium text-foreground dark:text-white">{order.retailerName || "Unknown Buyer"}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{(order.totalAmount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${order.status === "completed" ? "bg-emerald-500/10 text-emerald-600" :
                        order.status === "pending" ? "bg-orange-500/10 text-orange-600" :
                          "bg-blue-500/10 text-blue-600"
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground dark:text-white/40">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-muted-foreground dark:text-white/20 italic">
                      No orders recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-cyan-50 border-emerald-100 p-6 dark:from-emerald-900/20 dark:to-cyan-900/20 dark:border-emerald-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-5 h-5 text-emerald-600 dark:text-emerald-500 ${isAiLoading ? 'animate-pulse' : ''}`} />
                <h3 className="text-lg font-semibold text-emerald-900 dark:text-white">Smart Live Predictions</h3>
              </div>
              {isAiLoading && <span className="text-xs text-emerald-500 font-medium animate-pulse">Analyzing regional data...</span>}
            </div>

            <div className="space-y-3 min-h-[140px] flex items-center">
              {isAiLoading ? (
                <div className="flex flex-col gap-3 w-full">
                  <div className="h-[46px] bg-white/30 dark:bg-white/5 rounded-lg border border-emerald-100 dark:border-white/5 animate-pulse" />
                  <div className="h-[46px] bg-white/30 dark:bg-white/5 rounded-lg border border-emerald-100 dark:border-white/5 animate-pulse" />
                  <div className="h-[46px] bg-white/30 dark:bg-white/5 rounded-lg border border-emerald-100 dark:border-white/5 animate-pulse" />
                </div>
              ) : aiInsights.length > 0 ? (
                <div
                  key={currentInsightIndex}
                  className="bg-white/50 rounded-xl p-5 border border-emerald-200 dark:bg-white/5 dark:border-white/10 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700 w-full"
                >
                  <div className="flex items-center gap-2 mb-3 text-emerald-700 dark:text-emerald-400">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider">Insight {currentInsightIndex + 1} of {aiInsights.length}</span>
                  </div>
                  <p className="text-emerald-900 dark:text-white/90 text-[15px] leading-relaxed font-semibold">
                    {aiInsights[currentInsightIndex]}
                  </p>
                  <div className="flex gap-1.5 mt-5">
                    {aiInsights.map((_, idx) => (
                      <div key={idx} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${idx === currentInsightIndex ? 'bg-emerald-500' : 'bg-emerald-200 dark:bg-white/10'}`} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/50 rounded-lg p-6 border border-emerald-100 text-center dark:bg-white/5 dark:border-white/5 w-full">
                  <p className="text-emerald-800/80 text-sm dark:text-white/80">
                    Add inventory to unlock AI predictions tailored to your product catalog.
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border p-6 dark:bg-white/5 dark:border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
              <h3 className="text-lg font-semibold text-foreground dark:text-white">{t("recentActivity")}</h3>
            </div>
            <div className="space-y-3">
              {isNewUser ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-3">
                    <Activity className="w-6 h-6 text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-foreground dark:text-white">No activity yet</p>
                  <p className="text-xs text-muted-foreground mt-1 dark:text-white/40">Your recent transactions will appear here.</p>
                </div>
              ) : currentActivity.map((item, index) => (
                <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0 dark:border-white/5">
                  <div className={`w-2 h-2 rounded-full mt-2 ${item.type === "alert" ? "bg-red-500" : "bg-emerald-500"}`} />
                  <div className="flex-1">
                    <p className="text-foreground/80 text-sm dark:text-white/80">{item.action}</p>
                    <p className="text-muted-foreground text-xs mt-1 dark:text-white/40">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


export default function WholesalerDashboard() {
  return (
    <ProtectedRoute allowedRole="wholesaler">
      <WholesalerDashboardContent />
    </ProtectedRoute>
  );
}
