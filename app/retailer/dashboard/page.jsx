"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/protected-route";
import { TrendingDown, Clock, DollarSign, Star, ShoppingBag, Sparkles } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";

// Sample recommended fruits data
const recommendedFruits = [
  { id: 1, name: "Fresh Mangoes", price: 4.50, unit: "/kg", image: "🥭", rating: 4.8, discount: "15% OFF" },
  { id: 2, name: "Sweet Oranges", price: 3.20, unit: "/kg", image: "🍊", rating: 4.6, discount: null },
  { id: 3, name: "Red Apples", price: 5.00, unit: "/kg", image: "🍎", rating: 4.9, discount: "10% OFF" },
  { id: 4, name: "Bananas", price: 2.80, unit: "/kg", image: "🍌", rating: 4.7, discount: null },
];

const quickReorderItems = [
  { id: 6, name: "Watermelon", price: 3.5, image: "🍉", lastOrder: "2 days ago" },
  { id: 5, name: "Grapes", price: 6.5, image: "🍇", lastOrder: "4 days ago" },
  { id: 8, name: "Strawberries", price: 7.5, image: "🍓", lastOrder: "1 week ago" },
];

function StatCard({ title, value, icon: Icon, delay, suffix = "" }) {
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState(0);
  const targetValue = Number.parseFloat(value.toString().replace(/[^0-9.]/g, ""));

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
      <p className="text-3xl font-bold text-foreground dark:text-white">
        {value.toString().includes("₹") && "₹"}
        {Math.floor(count).toLocaleString()}
        {suffix}
      </p>
    </Card>
  );
}

function RetailerDashboardContent() {
  const [mounted, setMounted] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [recommendedFruits, setRecommendedFruits] = useState([]);
  const [isLoadingMarket, setIsLoadingMarket] = useState(true);

  // Dynamic Metrics State
  const [metrics, setMetrics] = useState({
    activeOrderCount: 0,
    pendingPaymentAmount: 0,
    recentOrders: [],
    isInitialLoad: true
  });

  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { userData } = useAuth();

  // 1. Listen to Retailer Orders for Live Stats
  useEffect(() => {
    if (!userData?.uid) return;
    const { ref, onValue } = require("firebase/database");
    const { realtimeDb } = require("@/lib/firebase");

    const ordersRef = ref(realtimeDb, `retailer_orders/${userData.uid}`);
    return onValue(ordersRef, (snapshot) => {
      let active = 0;
      let pending = 0;
      let latestOrders = [];

      if (snapshot.exists()) {
        const data = snapshot.val();
        const ordersArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));

        ordersArray.forEach(order => {
          // Count active orders
          if (order.status === "pending") {
            active++;
            pending += (order.totalAmount || 0);
          }
        });

        // Get latest 3 unique items from orders for quick reorder
        const itemsMap = {};
        ordersArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              if (!itemsMap[item.name]) {
                itemsMap[item.name] = {
                  ...item,
                  lastOrder: new Date(order.createdAt).toLocaleDateString()
                };
              }
            });
          }
        });
        latestOrders = Object.values(itemsMap).slice(0, 3);
      }
      setMetrics({
        activeOrderCount: active,
        pendingPaymentAmount: pending,
        recentOrders: latestOrders,
        isInitialLoad: false
      });
    }, (error) => {
      console.error("Error fetching retailer orders:", error);
      setMetrics(prev => ({ ...prev, isInitialLoad: false }));
    });
  }, [userData?.uid]);

  // Check if it's a new user (strictly based on lack of activity)
  const isNewUser = metrics.isInitialLoad ? false : (metrics.activeOrderCount === 0 && metrics.pendingPaymentAmount === 0);

  // Dynamic placeholders - STRICT ZERO FOR NEW USERS
  const displayPendingPayments = "₹" + metrics.pendingPaymentAmount.toLocaleString();
  const displayActiveOrders = metrics.activeOrderCount.toString();
  const currentQuickReorder = metrics.recentOrders;

  useEffect(() => {
    setMounted(true);

    // Fetch live market data for Recommended Fruits
    const inventoryRef = ref(realtimeDb, 'inventory');
    const unsubscribe = onValue(inventoryRef, (snapshot) => {
      setIsLoadingMarket(true);
      if (snapshot.exists()) {
        const data = snapshot.val();
        let allProducts = [];

        Object.keys(data).forEach(wholesalerId => {
          const wholesalerProducts = data[wholesalerId];
          Object.keys(wholesalerProducts).forEach(productId => {
            const product = wholesalerProducts[productId];
            if (product.quantity > 0) { // Only recommend in-stock items
              allProducts.push({
                id: productId,
                wholesalerId,
                name: product.name,
                price: product.pricePerKg || 0,
                image: product.image || "🍎",
                rating: (Math.random() * (5.0 - 4.2) + 4.2).toFixed(1), // Mock rating since not in DB
                unit: "/kg"
              });
            }
          });
        });

        // Shuffle and take top 4 for recommendations
        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        setRecommendedFruits(shuffled.slice(0, 4));
      } else {
        setRecommendedFruits([]);
      }
      setIsLoadingMarket(false);
    }, (error) => {
      console.error("Error fetching market data:", error);
      setIsLoadingMarket(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch AI Predictions specific to this user profile
  useEffect(() => {
    if (!userData || !userData.role) return;
    const langName = language === 'hi' ? 'Hindi' : 'English';

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
        <Card className="bg-purple-500/10 border-purple-500/20 p-6 mb-8 mt-2 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-2">
                Welcome to FruitFlow, {userData?.name?.split(' ')[0] || "Shopper"}!
              </h2>
              <p className="text-purple-600/80 dark:text-purple-400/80">
                Ready to stock your store with the freshest produce? Browse our marketplace below to place your first direct order from local wholesalers.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title={t("todaysBestPrices")} value="24" icon={TrendingDown} delay={0} suffix={" " + t("items")} />
        <StatCard title={t("activeOrders")} value={displayActiveOrders} icon={Clock} delay={100} />
        <StatCard title={t("pendingPayments")} value={displayPendingPayments} icon={DollarSign} delay={200} />
      </div>

      {/* Smart Live Predictions */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100 p-6 dark:from-purple-900/20 dark:to-indigo-900/20 dark:border-purple-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-5 h-5 text-purple-600 dark:text-purple-500 ${isAiLoading ? 'animate-pulse' : ''}`} />
            <h3 className="text-lg font-semibold text-purple-900 dark:text-white">Smart Live Predictions</h3>
          </div>
          {isAiLoading && <span className="text-xs text-purple-500 font-medium animate-pulse">Analyzing regional data...</span>}
        </div>

        <div className="space-y-3 min-h-[140px] flex items-center">
          {isAiLoading ? (
            <div className="flex flex-col gap-3 w-full">
              <div className="h-[46px] bg-white/30 dark:bg-white/5 rounded-lg border border-purple-100 dark:border-white/5 animate-pulse" />
              <div className="h-[46px] bg-white/30 dark:bg-white/5 rounded-lg border border-purple-100 dark:border-white/5 animate-pulse" />
              <div className="h-[46px] bg-white/30 dark:bg-white/5 rounded-lg border border-purple-100 dark:border-white/5 animate-pulse" />
            </div>
          ) : aiInsights.length > 0 ? (
            <div
              key={currentInsightIndex}
              className="bg-white/50 rounded-xl p-5 border border-purple-200 dark:bg-white/5 dark:border-white/10 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700 w-full"
            >
              <div className="flex items-center gap-2 mb-3 text-purple-700 dark:text-purple-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">Insight {currentInsightIndex + 1} of {aiInsights.length}</span>
              </div>
              <p className="text-purple-900 dark:text-white/90 text-[15px] leading-relaxed font-semibold">
                {aiInsights[currentInsightIndex]}
              </p>
              <div className="flex gap-1.5 mt-5">
                {aiInsights.map((_, idx) => (
                  <div key={idx} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${idx === currentInsightIndex ? 'bg-purple-500' : 'bg-purple-200 dark:bg-white/10'}`} />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/50 rounded-lg p-6 border border-purple-100 text-center dark:bg-white/5 dark:border-white/5 w-full">
              <p className="text-purple-800/80 text-sm dark:text-white/80">
                Browse the marketplace to unlock AI predictions tailored to your sourcing needs.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Recommended Fruits */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-foreground dark:text-white">{t("recommendedForYou")}</h3>
          <Link href="/retailer/browse" className="text-purple-600 hover:text-purple-700 font-medium text-sm dark:text-purple-400 dark:hover:text-purple-300">
            {t("viewAll")} →
          </Link>
        </div>

        {isLoadingMarket ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground text-sm font-medium">Scanning local farms...</p>
          </div>
        ) : recommendedFruits.length === 0 ? (
          <div className="text-center py-10 bg-card/50 backdrop-blur-sm border border-dashed border-border rounded-xl dark:bg-white/5 dark:border-white/10">
            <p className="text-muted-foreground">Marketplace is currently empty. Waiting for wholesalers to list fruits.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedFruits.map((fruit, index) => (
              <Card key={fruit.id} className={`bg-card/50 backdrop-blur-sm border-border p-6 hover:border-purple-500/30 hover:shadow-xl transition-all duration-500 cursor-pointer group dark:bg-white/5 dark:border-purple-500/10 dark:hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${index * 100 + 400}ms` }}>
                {fruit.discount && (
                  <div className="absolute top-3 right-3 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full dark:bg-purple-500">
                    {fruit.discount}
                  </div>
                )}
                <div className="text-6xl mb-4 transition-transform duration-300 group-hover:scale-110">
                  {fruit.image}
                </div>
                <h4 className="text-foreground font-semibold mb-2 dark:text-white">{fruit.name}</h4>
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-muted-foreground text-sm dark:text-white/60">{fruit.rating}</span>
                </div>
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹{fruit.price.toFixed(2)}</span>
                    <span className="text-muted-foreground text-xs ml-1 dark:text-white/40">{fruit.unit}</span>
                  </div>
                </div>
                <button
                  onClick={() => addToCart(fruit)}
                  className="w-full bg-purple-600/10 hover:bg-purple-600 text-purple-700 hover:text-white font-semibold py-2 rounded-lg transition-all duration-300 dark:bg-purple-500/20 dark:text-purple-400 dark:hover:bg-purple-500 dark:hover:text-white"
                >
                  {t("addToCart")}
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Reorder Section */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-6 dark:text-white">{t("recentOrders") || "Recent Orders"}</h3>
        {isNewUser ? (
          <Card className="bg-card/50 backdrop-blur-sm border-border p-8 border-dashed flex flex-col items-center justify-center text-center dark:bg-white/5 dark:border-white/10">
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-purple-400" />
            </div>
            <h4 className="text-lg font-semibold text-foreground dark:text-white mb-2">No Past Orders Found</h4>
            <p className="text-muted-foreground dark:text-white/60 max-w-md">
              Items you purchase will appear here for 1-click quick reordering. Start browsing to fill up your inventory!
            </p>
            <Link href="/retailer/browse" className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-2.5 rounded-full transition-all">
              Browse Marketplace
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentQuickReorder.map((item, index) => (
              <Card key={item.id} className={`bg-card/50 backdrop-blur-sm border-border p-6 hover:border-purple-500/30 hover:shadow-xl transition-all duration-500 cursor-pointer group dark:bg-white/5 dark:border-purple-500/10 dark:hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${index * 100 + 900}ms` }}>
                <div className="flex items-center gap-4">
                  <div className="text-5xl transition-transform duration-300 group-hover:scale-110">
                    {item.image}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-foreground font-semibold mb-1 dark:text-white">{t(item.name)}</h4>
                    <p className="text-muted-foreground text-sm dark:text-white/40">{item.lastOrder}</p>
                  </div>
                  <button
                    onClick={() => addToCart(item)}
                    className="bg-purple-600/10 hover:bg-purple-600 text-purple-700 hover:text-white w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 dark:bg-purple-500/20 dark:text-purple-400 dark:hover:bg-purple-500 dark:hover:text-white"
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Promotional Banner */}
      <Card className="bg-gradient-to-r from-purple-100 to-violet-100 border-purple-200 p-8 dark:from-purple-900/30 dark:to-violet-900/30 dark:border-purple-500/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-purple-900 mb-2 dark:text-white">{t("specialOffer")}</h3>
            <p className="text-purple-800/70 dark:text-white/60">{t("specialOfferDesc")}</p>
          </div>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-purple-600/20 transition-all active:scale-95 dark:shadow-none">
            {t("shopNow")}
          </button>
        </div>
      </Card>
    </div>
  );
}


export default function RetailerDashboard() {
  return (
    <ProtectedRoute allowedRole="retailer">
      <RetailerDashboardContent />
    </ProtectedRoute>
  );
}
