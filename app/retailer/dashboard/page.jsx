"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/protected-route";
import { TrendingDown, Clock, DollarSign, Star, ShoppingBag, Sparkles, MapPin, Loader2 } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useRouter } from "next/navigation";

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
    <Card className={`bg-card/50 backdrop-blur-sm border-border p-3 sm:p-6 transition-all duration-700 dark:bg-white/5 dark:border-purple-500/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h3 className="text-muted-foreground text-[10px] sm:text-sm font-medium dark:text-white/60 leading-tight">{title}</h3>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 shrink-0" />
      </div>
      <p className="text-xl sm:text-3xl font-bold text-foreground dark:text-white">
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
  const [bestMarket, setBestMarket] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("requesting");
  const router = useRouter();

  // Location Permission Request
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus("granted");
          toast.success("Location synced! Market prices optimized for your region.");
        },
        (err) => {
          console.warn("Geolocation Blocked:", err);
          setLocationStatus("denied");
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocationStatus("unsupported");
    }
  }, []);

  // Dynamic Metrics State
  const [metrics, setMetrics] = useState({
    activeOrderCount: 0,
    pendingPaymentAmount: 0,
    recentOrders: [],
    activeOrders: [],
    isInitialLoad: true
  });

  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { userData } = useAuth();

  // 1. Listen to Retailer Orders for Live Stats
  useEffect(() => {
    if (!userData?.uid) return;

    const ordersRef = ref(realtimeDb, `retailer_orders/${userData.uid}`);
    return onValue(ordersRef, (snapshot) => {
      let active = 0;
      let pending = 0;
      let latestOrders = [];
      let ordersArray = [];

      if (snapshot.exists()) {
        const data = snapshot.val();
        ordersArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));

        ordersArray.forEach(order => {
          // Count active orders (not yet delivered)
          if (['pending', 'pending_negotiation', 'accepted', 'accepted_negotiation', 'picked_up', 'in_transit'].includes(order.status)) {
            active++;
          }
          // Sum pending payments
          if ((order.paymentStatus || 'pending') !== "paid") {
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
                  lastOrder: new Date(order.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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
        activeOrders: ordersArray.filter(o => o.status !== 'delivered').sort((a,b) => b.createdAt - a.createdAt).slice(0, 5),
        isInitialLoad: false
      });
    }, (error) => {
      console.error("Error fetching retailer orders:", error);
      setMetrics(prev => ({ ...prev, isInitialLoad: false }));
    });
  }, [userData?.uid]);

  // 1.5 Fetch Market Recommendation
  useEffect(() => {
    if (metrics.isInitialLoad) return;
    
    const fetchBestMarket = async () => {
        try {
            const res = await fetch("/api/mandi-prices?fruit=Apple");
            const json = await res.json();
            if (json.success && json.data.length > 0) {
                // Find mandi with min price modal for procurement
                const sorted = [...json.data].sort((a,b) => a.priceModal - b.priceModal);
                setBestMarket(sorted[0]);
            }
        } catch (e) {
            console.error("Mandi Dash Error:", e);
        }
    };
    fetchBestMarket();
  }, [metrics.isInitialLoad]);

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
    <div className="p-2 sm:p-6 space-y-6 max-w-full overflow-x-hidden">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <StatCard title={t("todaysBestPrices")} value="24" icon={TrendingDown} delay={0} suffix={" " + t("items")} />
        <StatCard title={t("activeOrders")} value={displayActiveOrders} icon={Clock} delay={100} />
        <StatCard title={t("pendingPayments")} value={displayPendingPayments} icon={DollarSign} delay={200} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Smart Live Predictions */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100 p-6 dark:from-purple-900/20 dark:to-indigo-900/20 dark:border-purple-500/10">
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

        {/* Live Market Tip Card (Procurement focus) */}
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 p-6 flex flex-col justify-between">
            <div>
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-2">
                   <MapPin className="w-5 h-5 text-indigo-500" />
                   <h3 className="font-bold text-indigo-900 dark:text-indigo-300">Live Procurement Tip</h3>
                 </div>
                 <Link href="/retailer/mandi-prices" className="text-[10px] font-bold text-indigo-500 uppercase hover:underline">Market Analysis →</Link>
               </div>
               
               {bestMarket ? (
                   <div className="space-y-4">
                       <p className="text-sm text-indigo-800/80 dark:text-indigo-100/70">
                           Best entry price for <span className="font-bold text-indigo-900 dark:text-white underline decoration-indigo-500">Apple</span> detected in:
                       </p>
                       <div className="flex items-end justify-between">
                           <div>
                               <p className="text-xl font-black text-indigo-900 dark:text-white">{bestMarket.mandiName}</p>
                               <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">{bestMarket.state}</p>
                           </div>
                           <div className="text-right">
                               <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">₹{bestMarket.priceModal}/kg</p>
                               <p className="text-[10px] text-emerald-500 font-bold">LOWER THAN AVG</p>
                           </div>
                       </div>
                   </div>
               ) : (
                   <div className="flex items-center gap-2 text-muted-foreground animate-pulse py-8">
                       <Loader2 className="w-4 h-4 animate-spin" />
                       <span className="text-xs">Finding best sourcing rates...</span>
                   </div>
               )}
            </div>
            
            <button 
                onClick={() => router.push('/retailer/browse')}
                className="mt-6 w-full py-2 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-colors"
            >
                SOURCE FROM WHOLESALERS
            </button>
        </Card>
      </div>
      {/* Live Order Progress and Location Status */}
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <h3 className="text-xl font-bold text-foreground dark:text-white flex items-center gap-2 uppercase tracking-tight">
                  <Clock className="w-5 h-5 text-purple-500 animate-pulse" /> Active Progress
               </h3>
               {locationStatus === 'granted' ? (
                 <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5 shrink-0">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Local Discovery On</span>
                 </div>
               ) : (
                 <button 
                  onClick={() => window.location.reload()}
                  className="px-2 py-0.5 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-full text-[8px] font-black text-zinc-500 uppercase tracking-widest hover:bg-purple-500/10 hover:text-purple-500 transition-colors"
                 >
                   Enable GPS For Proximity
                 </button>
               )}
            </div>
            {metrics.activeOrders.length > 0 && (
               <Link href="/retailer/orders" className="text-[10px] font-black text-purple-500 uppercase hover:underline tracking-[0.2em]">Full History →</Link>
            )}
         </div>

         {metrics.activeOrders.length > 0 ? (
           <div className="grid gap-4">
              {metrics.activeOrders.map((order) => (
                <Card key={order.id} className="bg-card/50 backdrop-blur-md border-border p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 dark:bg-white/5 dark:border-white/10 hover:border-purple-500/40 transition-all group overflow-hidden relative" onClick={() => router.push('/retailer/orders')}>
                   <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                   
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center dark:bg-purple-900/20 border border-purple-500/20">
                         <ShoppingBag className="w-7 h-7 text-purple-500" />
                      </div>
                      <div>
                         <h4 className="font-black text-foreground dark:text-white leading-none tracking-tight">#{order.id.slice(-8)}</h4>
                         <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                           <span className="px-2 py-0.5 bg-zinc-100 dark:bg-white/5 rounded text-purple-600 dark:text-purple-400">₹{order.totalAmount?.toFixed(2)}</span>
                           <span>•</span>
                           <span>{order.items?.length || 0} ITEMS</span>
                         </p>
                      </div>
                   </div>

                   {/* Progress Visualizer */}
                   <div className="flex-1 max-w-md hidden md:block px-8 relative">
                      <div className="flex justify-between mb-2.5 px-0.5">
                         <span className="text-[9px] font-black uppercase text-purple-500 tracking-tighter">Processed</span>
                         <span className={`text-[9px] font-black uppercase tracking-tighter ${['accepted', 'accepted_negotiation', 'picked_up', 'in_transit'].includes(order.status) ? 'text-purple-500' : 'text-muted-foreground opacity-50'}`}>Logistics</span>
                         <span className={`text-[9px] font-black uppercase tracking-tighter ${['picked_up', 'in_transit'].includes(order.status) ? 'text-purple-500' : 'text-muted-foreground opacity-50'}`}>On Road</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden dark:bg-white/5 border border-white/5">
                         <div 
                          className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-1000 shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                          style={{ 
                            width: order.status === 'delivered' ? '100%' : 
                                   ['picked_up', 'in_transit'].includes(order.status) ? '80%' :
                                   ['accepted', 'accepted_negotiation'].includes(order.status) ? '45%' : '15%'
                          }}
                         />
                      </div>
                   </div>

                   <div className="flex items-center gap-5">
                      <div className="text-right">
                         <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${order.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-orange-500 animate-pulse'}`}>
                            {order.paymentStatus === 'paid' ? '● PAID' : '● PAYMENT PENDING'}
                         </p>
                         <p className="text-sm font-black text-foreground dark:text-white uppercase italic tracking-tighter">
                            {order.status.replace('_', ' ')}
                         </p>
                      </div>
                      <button className="w-10 h-10 flex items-center justify-center bg-purple-500/10 rounded-xl hover:bg-purple-500 hover:text-white transition-all text-purple-500">
                         <Clock className="w-5 h-5" />
                      </button>
                   </div>
                </Card>
              ))}
           </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-6 bg-zinc-900/50 border-white/5 border-dashed flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black text-zinc-600 uppercase mb-2">Live logistics inactive</p>
                    <p className="text-xs text-zinc-500">Active orders will show live map tracks and proximity arrival alerts here.</p>
                </Card>
                {locationStatus !== 'granted' && (
                    <Card className="p-6 bg-purple-500/5 border-purple-500/20 border-dashed flex flex-col items-center justify-center text-center group cursor-pointer" onClick={() => window.location.reload()}>
                        <MapPin className="w-5 h-5 text-purple-500 mb-2 group-hover:bounce" />
                        <p className="text-[10px] font-black text-purple-600 uppercase mb-1">Enable Location Tracking</p>
                        <p className="text-xs text-purple-500/70 italic">Find wholesalers nearest to your shop for faster delivery.</p>
                    </Card>
                )}
            </div>
         )}
      </div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    onClick={() => {
                        toast.info("Please guarantee fresh stock availability from the live marketplace!");
                        setTimeout(() => router.push('/retailer/browse'), 1500);
                    }}
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
          <button onClick={() => router.push('/retailer/browse')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-purple-600/20 transition-all active:scale-95 dark:shadow-none">
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
