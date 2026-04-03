"use client";
import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useCart } from "@/lib/cart-context";
import { ProtectedRoute } from "@/components/protected-route";
import { Search, Filter, ShoppingCart, Store, Heart, BellRing, X } from "lucide-react";
import { ref, onValue, set, remove, get } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

// Sample fruits data with different freshness levels and stock status
const fruitsData = [
  {
    id: 1,
    name: "Fresh Mangoes",
    price: 4.5,
    image: "🥭",
    freshness: 95,
    inStock: true,
  },
  {
    id: 2,
    name: "Sweet Oranges",
    price: 3.2,
    image: "🍊",
    freshness: 88,
    inStock: true,
  },
  {
    id: 3,
    name: "Red Apples",
    price: 5.0,
    image: "🍎",
    freshness: 92,
    inStock: true,
  },
  {
    id: 4,
    name: "Fresh Bananas",
    price: 2.8,
    image: "🍌",
    freshness: 85,
    inStock: true,
  },
  {
    id: 5,
    name: "Watermelon",
    price: 3.5,
    image: "🍉",
    freshness: 90,
    inStock: true,
  },
  {
    id: 6,
    name: "Green Grapes",
    price: 6.0,
    image: "🍇",
    freshness: 78,
    inStock: true,
  },
  {
    id: 7,
    name: "Strawberries",
    price: 7.5,
    image: "🍓",
    freshness: 70,
    inStock: true,
  },
  {
    id: 8,
    name: "Pineapple",
    price: 4.0,
    image: "🍍",
    freshness: 87,
    inStock: true,
  },
  {
    id: 9,
    name: "Peaches",
    price: 5.5,
    image: "🍑",
    freshness: 82,
    inStock: true,
  },
  {
    id: 10,
    name: "Kiwi Fruit",
    price: 6.5,
    image: "🥝",
    freshness: 88,
    inStock: true,
  },
  {
    id: 11,
    name: "Cherries",
    price: 8.0,
    image: "🍒",
    freshness: 65,
    inStock: true,
  },
  {
    id: 12,
    name: "Dragon Fruit",
    price: 9.0,
    image: "🐉",
    freshness: 93,
    inStock: true,
  },
];

import { useLanguage } from "@/lib/language-context";

function RetailerBrowseContent() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [liveFruits, setLiveFruits] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [requestingFruit, setRequestingFruit] = useState(null);
  const [requestQty, setRequestQty] = useState("");
  const { addMultipleToCart } = useCart();
  const { t } = useLanguage();
  const { userData } = useAuth();

  // Fetch user favorites on load
  useEffect(() => {
    if (!userData?.uid) return;
    const favRef = ref(realtimeDb, `retailer_favorites/${userData.uid}`);
    return onValue(favRef, (snapshot) => {
      if (snapshot.exists()) setFavorites(snapshot.val());
      else setFavorites({});
    });
  }, [userData?.uid]);

  const toggleFavorite = async (fruit) => {
    if (!userData?.uid) return;
    const favRef = ref(realtimeDb, `retailer_favorites/${userData.uid}/${fruit.id}`);

    try {
      if (favorites[fruit.id]) {
        await remove(favRef);
        toast.info(t("removedFromFavorites"));
      } else {
        await set(favRef, {
          name: fruit.name,
          price: fruit.price,
          image: fruit.image,
          freshness: fruit.freshness,
          inStock: fruit.inStock,
          wholesalerId: fruit.wholesalerId,
          wholesalerName: fruit.wholesalerName,
          savedAt: Date.now()
        });
        toast.success(t("addedToFavorites"));
      }
    } catch (err) {
      console.error("Favorite Error:", err);
    }
  };
  const handleRequestStock = async (e) => {
    e.preventDefault();
    if (!userData?.uid || !requestingFruit || !requestQty || isNaN(requestQty) || requestQty <= 0) return;

    const reqNum = Number(requestQty);
    const available = Number(requestingFruit.quantity || 0);

    // If user asks for more than allowed
    if (reqNum > available) {
      try {
        const requestId = Date.now().toString();
        const requestRef = ref(realtimeDb, `stock_requests/${requestingFruit.wholesalerId}/${requestId}`);
        await set(requestRef, {
          retailerId: userData.uid,
          retailerName: userData.companyName || userData.name || "A Retailer",
          productId: requestingFruit.id,
          productName: requestingFruit.name,
          requestedQuantity: reqNum,
          status: "pending",
          createdAt: Date.now()
        });

        if (available > 0) {
            addMultipleToCart([{...requestingFruit, quantity: available}]);
        }
        
        toast.info(available > 0 
          ? `Added ${available}kg to cart. Sent request to Wholesaler for your remaining demand...`
          : `Sent request to Wholesaler for ${reqNum}kg.`, { duration: 6000 });
          
        setRequestingFruit(null);
        setRequestQty("");
      } catch (err) {
        console.error("Failed to request stock:", err);
        toast.error("Failed to process stock request.");
      }
    } else {
      // Normal Add To Cart
      addMultipleToCart([{...requestingFruit, quantity: reqNum}]);
      toast.success(`Successfully added ${reqNum}kg of ${requestingFruit.name} to your cart!`);
      setRequestingFruit(null);
      setRequestQty("");
    }
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    let unsubscribeInventory = null;

    // First fetch users once to map wholesaler IDs to names securely
    const usersRef = ref(realtimeDb, 'users');
    get(usersRef).then((usersSnapshot) => {
      const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};

      // Then subscribe to live inventory
      const inventoryRef = ref(realtimeDb, 'inventory');
      unsubscribeInventory = onValue(inventoryRef, (snapshot) => {
        setIsLoading(true);
        if (snapshot.exists()) {
          const data = snapshot.val();
          let allProducts = [];

          Object.keys(data).forEach(wholesalerId => {
            const wholesalerProducts = data[wholesalerId];
            const wholesalerName = usersData[wholesalerId]?.companyName || usersData[wholesalerId]?.name || "Local Wholesaler";

            Object.keys(wholesalerProducts).forEach(productId => {
              const product = wholesalerProducts[productId];

              // Calculate live freshness
              const baseFreshness = parseInt(product.freshness) || 100;
              const timeOrigin = product.updatedAt || product.createdAt || Date.now();
              const hoursSinceUpdate = Math.max(0, (Date.now() - timeOrigin) / (1000 * 60 * 60));
              const freshnessLost = Math.floor(hoursSinceUpdate * 0.5);
              const currentFreshness = Math.max(20, baseFreshness - freshnessLost);

              allProducts.push({
                id: productId,
                wholesalerId,
                wholesalerName,
                name: product.name,
                price: product.pricePerKg || 0,
                image: product.image || "🍎",
                freshness: currentFreshness,
                inStock: product.quantity > 0,
                quantity: product.quantity || 0,
              });
            });
          });
          setLiveFruits(allProducts);
        } else {
          setLiveFruits([]);
        }
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching marketplace inventory:", error);
        setIsLoading(false);
      });
    }).catch((err) => {
       console.error("Failed fetching users map:", err);
       setIsLoading(false);
    });

    return () => {
      if (unsubscribeInventory) unsubscribeInventory();
    };
  }, []);

  const getFreshnessColor = (freshness) => {
    if (freshness >= 85) return "bg-emerald-500";
    if (freshness >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getFreshnessLabel = (freshness) => {
    if (freshness >= 85) return t("excellent");
    if (freshness >= 70) return t("good");
    return t("fair");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
  };

  // Memoize filtered fruits to prevent re-calculation on every render
  const filteredFruits = useMemo(() => {
    return liveFruits.filter((fruit) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch = fruit.name.toLowerCase().includes(query) ||
        fruit.wholesalerName.toLowerCase().includes(query);
      const matchesMinPrice = minPrice === "" || fruit.price >= parseFloat(minPrice);
      const matchesMaxPrice = maxPrice === "" || fruit.price <= parseFloat(maxPrice);
      return matchesSearch && matchesMinPrice && matchesMaxPrice;
    });
  }, [liveFruits, searchTerm, minPrice, maxPrice]);

  return (
    <div className="p-2 sm:p-6 space-y-6 max-w-full overflow-x-hidden">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-white/30" />
            <input
              type="text"
              placeholder={t("searchFruits")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card/50 backdrop-blur-sm border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 bg-card/50 backdrop-blur-sm border rounded-xl px-6 py-3 text-foreground transition-all dark:bg-white/5 active:scale-95 ${showFilters ? 'border-purple-500 bg-purple-500/10 dark:border-purple-500/50' : 'border-border hover:border-purple-500/50 hover:bg-muted dark:border-white/10 dark:hover:bg-purple-500/10'}`}
          >
            <Filter className={`w-5 h-5 ${showFilters ? 'text-purple-500' : ''}`} />
            <span className={`font-semibold ${showFilters ? 'text-purple-500' : ''}`}>{t("filters")}</span>
          </button>
        </div>

        {/* Expandable Filter Panel */}
        <div className={`grid transition-all duration-300 ease-in-out ${showFilters ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}>
          <div className="overflow-hidden">
            <Card className="p-6 bg-card/30 backdrop-blur-xl border-border dark:bg-white/5 dark:border-white/10 mt-2">
              <div className="flex flex-col md:flex-row items-end gap-6">
                <div className="w-full md:w-64">
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block dark:text-white/60">
                    {t("priceRange")} (₹)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      placeholder={t("minPrice")}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition-all dark:bg-black/20 dark:border-white/10"
                    />
                    <span className="text-muted-foreground">—</span>
                    <input
                      type="number"
                      placeholder={t("maxPrice")}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition-all dark:bg-black/20 dark:border-white/10"
                    />
                  </div>
                </div>

                <button
                  onClick={resetFilters}
                  className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors pb-2"
                >
                  {t("resetFilters")}
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground font-medium">Scanning live marketplace...</p>
        </div>
      ) : (
        <>
          {/* Fruits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredFruits.map((fruit, index) => (
              <Card
                key={fruit.id}
                className={`relative bg-card/50 backdrop-blur-sm border border-border p-3 sm:p-6 hover:border-purple-500/40 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl cursor-default group overflow-hidden dark:bg-white/5 dark:border-white/10 dark:hover:border-purple-500/30 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
                style={{ transitionDelay: `${index * 30}ms` }}
              >
                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(fruit);
                  }}
                  className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${favorites[fruit.id] ? "bg-red-500 text-white fill-current" : "bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white dark:bg-purple-500/20 dark:text-purple-400"}`}
                >
                  <Heart className={`w-4 h-4 ${favorites[fruit.id] ? "fill-current" : ""}`} />
                </button>

                {/* Stock Badge */}
                {fruit.inStock && (
                  <div className="absolute top-3 right-3 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                    {t("inStock")}
                  </div>
                )}

                {/* Fruit Image */}
                <div className="relative mb-4 overflow-hidden rounded-2xl bg-muted/30 dark:bg-white/5">
                  <div className="text-5xl md:text-7xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 flex items-center justify-center py-8">
                    {fruit.image}
                  </div>
                </div>

                {/* Info */}
                <div className="mb-3 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 dark:text-white leading-tight truncate">{t(fruit.name)}</h3>
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground dark:text-white/40 min-w-0">
                    <Store className="w-3 h-3 shrink-0" />
                    <span className="truncate italic">{fruit.wholesalerName}</span>
                  </div>
                </div>

                {/* Freshness Indicator */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-muted-foreground text-[10px] sm:text-xs font-medium dark:text-white/50">{t("freshness")}</span>
                    <span className="text-foreground text-[10px] sm:text-xs font-bold dark:text-white/80">{getFreshnessLabel(fruit.freshness)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1 sm:h-1.5 overflow-hidden dark:bg-white/10">
                    <div
                      className={`h-full ${getFreshnessColor(fruit.freshness)} transition-all duration-1000 rounded-full`}
                      style={{
                        width: mounted ? `${fruit.freshness}%` : "0%",
                        transitionDelay: `${index * 30 + 100}ms`,
                      }}
                    />
                  </div>
                </div>

                {/* Price and Stock */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-baseline mb-1 sm:mb-2 flex-wrap min-w-0">
                    <span className="text-xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 truncate">₹{fruit.price.toFixed(2)}</span>
                    <span className="text-muted-foreground text-[10px] sm:text-xs font-medium ml-1 dark:text-white/40">/kg</span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground font-medium dark:text-white/50 truncate">
                    Available: {fruit.quantity} kg
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRequestingFruit(fruit);
                    }}
                    className="w-full bg-purple-600/10 hover:bg-purple-600 text-purple-700 hover:text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 dark:bg-purple-500/20 dark:text-purple-400 dark:hover:bg-purple-500 dark:hover:text-white"
                  >
                    <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
                    {t("addToCart")}
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* No Results Message */}
          {!isLoading && filteredFruits.length === 0 && (
            <div className="text-center py-24 bg-card/50 backdrop-blur-sm border border-dashed border-border rounded-2xl dark:bg-white/5 dark:border-white/10">
              <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 dark:text-white">Marketplace is Empty</h3>
              <p className="text-muted-foreground max-w-md mx-auto dark:text-white/60">
                {searchTerm || minPrice || maxPrice
                  ? "No fresh produce matches your exact filters right now. Try adjusting them."
                  : "Wait for local wholesalers to list some fresh produce for sale to begin shopping."}
              </p>
            </div>
          )}
        </>
      )}

      {/* Request Stock Modal */}
      {requestingFruit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-md p-6 bg-card border-border shadow-2xl relative">
            <button 
              onClick={() => setRequestingFruit(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2">Add to Cart</h3>
            <p className="text-sm text-muted-foreground mb-6">
              You are purchasing <b>{requestingFruit.name}</b> from {requestingFruit.wholesalerName}. They currently have <b>{requestingFruit.quantity} kg</b> available. 
              <br/><br/>If you request more than what is available, the maximum stock will be added to your cart and the Wholesaler will be instantly notified to restock the remaining!
            </p>
            <form onSubmit={handleRequestStock}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Required Quantity (kg)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={requestQty}
                  onChange={(e) => setRequestQty(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  placeholder="e.g. 50"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Confirm Order Quantity
              </button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function RetailerBrowse() {
  return (
    <ProtectedRoute allowedRole="retailer">
      <RetailerBrowseContent />
    </ProtectedRoute>
  );
}
