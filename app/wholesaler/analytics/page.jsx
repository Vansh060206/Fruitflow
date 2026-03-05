"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ProtectedRoute } from "@/components/protected-route";
import { TrendingUp, BarChart3, AlertTriangle } from "lucide-react";

import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { ref, onValue } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

function WholesalerAnalyticsContent() {
  const [mounted, setMounted] = useState(false);
  const [salesTrend, setSalesTrend] = useState([]);
  const [topFruits, setTopFruits] = useState([]);
  const [wastageRisk, setWastageRisk] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { userData } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userData?.uid) return;

    setIsLoading(true);
    const ordersRef = ref(realtimeDb, `orders/${userData.uid}`);
    const inventoryRef = ref(realtimeDb, `inventory/${userData.uid}`);

    // Fetch Orders for Sales Trends and Top Performers
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const orders = Object.values(snapshot.val());

        // 1. Calculate Sales Trend (Last 6 Weeks)
        const weeklyData = {};
        const now = new Date();
        for (let i = 0; i < 6; i++) {
          const d = new Date();
          d.setDate(now.getDate() - (i * 7));
          const weekNum = i === 0 ? "This Week" : `Week -${i}`;
          weeklyData[weekNum] = 0;
        }

        const fruitSales = {};

        orders.forEach(order => {
          const orderDate = new Date(order.createdAt);
          const weeksAgo = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24 * 7));

          if (weeksAgo < 6) {
            const weekKey = weeksAgo === 0 ? "This Week" : `Week -${weeksAgo}`;
            weeklyData[weekKey] += (order.totalAmount || 0);
          }

          // Aggregate fruit sales
          if (order.items) {
            order.items.forEach(item => {
              fruitSales[item.name] = (fruitSales[item.name] || 0) + (item.quantity * item.price);
            });
          }
        });

        // Format weekly data for chart (reverse to show chronological order)
        const trend = Object.keys(weeklyData).reverse().map(name => ({
          name,
          sales: weeklyData[name]
        }));
        setSalesTrend(trend);

        // Format top fruits
        const top = Object.keys(fruitSales)
          .map(name => ({ name, sales: fruitSales[name] }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);
        setTopFruits(top);
      }
      setIsLoading(false);
    });

    // Fetch Inventory for Wastage Risk (based on low freshness)
    const unsubscribeInventory = onValue(inventoryRef, (snapshot) => {
      if (snapshot.exists()) {
        const items = Object.values(snapshot.val());
        const risks = items
          .map(item => {
            // Live Freshness: Loses 0.5% every hour
            const baseFreshness = parseInt(item.freshness) || 100;
            const timeOrigin = item.updatedAt || item.createdAt || Date.now();
            const hoursSinceUpdate = Math.max(0, (Date.now() - timeOrigin) / (1000 * 60 * 60));
            const currentFreshness = Math.max(0, baseFreshness - Math.floor(hoursSinceUpdate * 0.5));
            const riskValue = 100 - currentFreshness; // Spoilage risk

            return {
              fruit: item.name,
              percentage: riskValue,
              color: riskValue > 30 ? "bg-red-500" : riskValue > 20 ? "bg-yellow-500" : "bg-emerald-500"
            };
          })
          .sort((a, b) => b.percentage - a.percentage)
          .slice(0, 3);
        setWastageRisk(risks);
      }
    });

    return () => {
      unsubscribeOrders();
      unsubscribeInventory();
    };
  }, [userData?.uid]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-screen">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Analyzing business metrics...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Sales Analytics Section */}
      <Card className={`bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 dark:bg-white/5 dark:border-white/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground dark:text-white">Live Sales Analytics</h3>
            <p className="text-muted-foreground text-sm mt-1 dark:text-white/60">Weekly performance based on actual orders</p>
          </div>
          <TrendingUp className="w-6 h-6 text-emerald-500" />
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={salesTrend}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/30 dark:text-white/10" />
            <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground/50 dark:text-white/50 fontSize-12" />
            <YAxis stroke="currentColor" className="text-muted-foreground/50 dark:text-white/50 fontSize-12" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--foreground)",
              }}
              labelStyle={{ color: "inherit" }}
              itemStyle={{ color: "#10b981" }}
            />
            <Line type="smooth" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 5 }} fill="url(#salesGradient)" animationDuration={2000} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Fruits Performance */}
        <Card className={`bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 dark:bg-white/5 dark:border-white/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground dark:text-white">Product Leaderboard</h3>
              <p className="text-muted-foreground text-sm mt-1 dark:text-white/60">Total revenue generated per fruit</p>
            </div>
            <BarChart3 className="w-6 h-6 text-emerald-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topFruits}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/30 dark:text-white/10" />
              <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground/50 dark:text-white/50 fontSize-12" />
              <YAxis stroke="currentColor" className="text-muted-foreground/50 dark:text-white/50 fontSize-12" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--foreground)",
                }}
                labelStyle={{ color: "inherit" }}
                itemStyle={{ color: "#10b981" }}
              />
              <Bar dataKey="sales" fill="#10b981" radius={[8, 8, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Wastage Risk */}
        <Card className={`bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 dark:bg-white/5 dark:border-white/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "400ms" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground dark:text-white">Spoilage Risk Analysis</h3>
              <p className="text-muted-foreground text-sm mt-1 dark:text-white/60">Realtime tracking based on shelf-life</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>

          <div className="space-y-6">
            {wastageRisk.length > 0 ? wastageRisk.map((item, index) => (
              <div key={item.fruit} className={`transition-all duration-700 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`} style={{ transitionDelay: `${600 + index * 100}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-foreground font-medium dark:text-white">{t(item.fruit)}</span>
                  <span className={`text-sm font-semibold ${item.percentage > 30 ? "text-red-500" : item.percentage > 20 ? "text-yellow-500" : "text-emerald-500"}`}>
                    {item.percentage}% Spoilage Risk
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden dark:bg-white/5">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                    style={{
                      width: mounted ? `${item.percentage}%` : "0%",
                    }}
                  />
                </div>
              </div>
            )) : (
              <div className="text-center py-10 opacity-50">
                <p>No inventory data available for risk analysis.</p>
              </div>
            )}

            {wastageRisk.some(r => r.percentage > 30) && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 animate-bounce-slow">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" />
                  <div>
                    <p className="text-red-600 font-bold text-sm dark:text-red-500">Critical Wastage Warning</p>
                    <p className="text-muted-foreground text-xs mt-1 dark:text-white/70">
                      High spoilage risk detected in your inventory! Consider offering a clearance discount to move stock.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function WholesalerAnalytics() {
  return (
    <ProtectedRoute allowedRole="wholesaler">
      <WholesalerAnalyticsContent />
    </ProtectedRoute>
  );
}
