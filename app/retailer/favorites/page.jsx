"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Heart, ShoppingCart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { useCart } from "@/lib/cart-context";

import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { ref, onValue, remove } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { toast } from "sonner";

function FavoritesContent() {
  const [mounted, setMounted] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const { userData } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userData?.uid) return;

    setIsLoading(true);
    const favRef = ref(realtimeDb, `retailer_favorites/${userData.uid}`);

    const unsubscribe = onValue(favRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const dataArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setFavorites(dataArray);
      } else {
        setFavorites([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching favorites:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.uid]);

  // Get freshness color and label
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

  // Remove from favorites in Firebase
  const handleRemoveFavorite = async (id) => {
    try {
      await remove(ref(realtimeDb, `retailer_favorites/${userData.uid}/${id}`));
      toast.success(t("removedFromFavorites"));
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error(t("failedToRemoveFavorite"));
    }
  };

  return (
    <div className="p-6">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground font-medium">Loading your favorites...</p>
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((fruit, index) => (
            <Card key={fruit.id} className={`relative bg-card/50 backdrop-blur-sm border-border p-6 hover:border-purple-500/30 transition-all duration-500 cursor-pointer group overflow-hidden dark:bg-white/5 dark:border-purple-500/10 ${mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"}`} style={{ transitionDelay: `${index * 50}ms` }}>
              {/* Remove from Favorites Button */}
              <button
                onClick={() => handleRemoveFavorite(fruit.id)}
                className="absolute top-3 right-3 w-8 h-8 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 z-10 dark:bg-red-500/20 dark:text-red-400"
                title="Remove from favorites"
              >
                <Heart className="w-4 h-4 fill-current" />
              </button>

              {/* Stock Badge */}
              {fruit.inStock && (
                <div className="absolute top-3 left-3 bg-emerald-500/10 text-emerald-600 text-xs font-bold px-2 py-1 rounded border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                  In Stock
                </div>
              )}

              {/* Fruit Image */}
              <div className="relative mb-4 overflow-hidden rounded-lg mt-6">
                <div className="text-7xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 flex items-center justify-center py-6">
                  {fruit.image}
                </div>
              </div>

              {/* Fruit Name */}
              <h3 className="text-lg font-semibold text-foreground mb-3 dark:text-white">{fruit.name}</h3>

              {/* Freshness Indicator */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm dark:text-white/60">Freshness</span>
                  <span className="text-foreground/80 text-sm font-medium dark:text-white/80">{getFreshnessLabel(fruit.freshness)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden dark:bg-white/10">
                  <div
                    className={`h-full ${getFreshnessColor(fruit.freshness)} transition-all duration-1000 rounded-full`}
                    style={{
                      width: mounted ? `${fruit.freshness}%` : "0%",
                      transitionDelay: `${index * 50 + 200}ms`,
                    }}
                  />
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">₹{fruit.price.toFixed(2)}</span>
                <span className="text-muted-foreground text-sm ml-1 dark:text-white/40">/kg</span>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => addToCart({ ...fruit, quantity: 1 })}
                className="w-full bg-purple-500/10 hover:bg-purple-500 text-purple-600 hover:text-white font-medium py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] dark:bg-purple-500/20 dark:text-purple-400"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </Card>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-8xl mb-6 opacity-20">💜</div>
          <h3 className="text-2xl font-bold text-foreground mb-2 dark:text-white">No Favorites Yet</h3>
          <p className="text-muted-foreground mb-8 text-center max-w-md dark:text-white/60">
            Start adding your favorite fruits for quick access and easy reordering.
          </p>
          <Link href="/retailer/browse" className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
}

export default function RetailerFavorites() {
  return (
    <ProtectedRoute allowedRole="retailer">
      <FavoritesContent />
    </ProtectedRoute>
  );
}
