"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/protected-route";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { ShoppingCart, Trash2, Plus, Minus, Loader2 } from "lucide-react";
import { ref, runTransaction, push, set } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { toast } from "sonner";

import { useLanguage } from "@/lib/language-context";

function RetailerCartContent() {
  const [mounted, setMounted] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Use Cart Context
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { userData } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  const tax = cartTotal * 0.1;
  const total = cartTotal + tax;

  const handleCheckout = async () => {
    if (!userData?.uid) {
      toast.error("Please log in to checkout.");
      return;
    }

    if (cartItems.length === 0) return;

    setIsCheckingOut(true);
    try {
      // Group cart items by Wholesaler to create split orders
      const orderGroups = {};

      for (const item of cartItems) {
        if (!item.wholesalerId || !item.id) continue;

        if (!orderGroups[item.wholesalerId]) {
          orderGroups[item.wholesalerId] = {
            items: [],
            subtotal: 0
          };
        }
        orderGroups[item.wholesalerId].items.push(item);
        orderGroups[item.wholesalerId].subtotal += (item.price * item.quantity);

        const itemRef = ref(realtimeDb, `inventory/${item.wholesalerId}/${item.id}`);

        await runTransaction(itemRef, (currentData) => {
          if (currentData) {
            currentData.quantity = Math.max(0, currentData.quantity - item.quantity);
            currentData.status = currentData.quantity < 20 ? "low-stock" : "in-stock";
          }
          return currentData;
        });
      }

      // Create Orders in Firebase
      const timestamp = Date.now();
      for (const [wholesalerId, group] of Object.entries(orderGroups)) {
        const taxAmount = group.subtotal * 0.1;
        const totalAmount = group.subtotal + taxAmount;

        const orderPayload = {
          retailerId: userData.uid,
          retailerName: userData.name || "Unknown Retailer",
          items: group.items,
          subtotal: group.subtotal,
          tax: taxAmount,
          totalAmount,
          status: "pending",
          createdAt: timestamp
        };

        // Push to Wholesale Inbox
        const wholesalerOrderRef = push(ref(realtimeDb, `orders/${wholesalerId}`));
        const orderId = wholesalerOrderRef.key;
        await set(wholesalerOrderRef, { ...orderPayload, orderId });

        // Store a copy in Retailer's own outbox history
        const retailerOrderRef = ref(realtimeDb, `retailer_orders/${userData.uid}/${orderId}`);
        await set(retailerOrderRef, { ...orderPayload, orderId, wholesalerId });
      }

      // Simulate a real-world processing delay for UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success("Order Placed Successfully! Wholesalers have been notified.", {
        icon: "🎉"
      });
      clearCart();
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="p-6">
      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart className="w-20 h-20 text-muted-foreground/20 mx-auto mb-4 dark:text-white/20" />
          <h3 className="text-2xl font-bold text-foreground mb-2 dark:text-white">{t("yourCartIsEmpty")}</h3>
          <p className="text-muted-foreground mb-6 dark:text-white/60">{t("addFruitsToStart")}</p>
          <Link href="/retailer/browse" className="inline-block bg-purple-500 hover:bg-purple-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
            {t("browseProducts")}
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <Card key={item.id} className={`bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-300 dark:bg-white/5 dark:border-purple-500/10 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`} style={{ transitionDelay: `${index * 100}ms` }}>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="text-6xl">{item.image}</div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-xl font-semibold text-foreground mb-1 dark:text-white">{t(item.name)}</h3>
                    <p className="text-purple-600 font-semibold dark:text-purple-400">₹{item.price.toFixed(2)}/kg</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4">
                    <div className="flex items-center gap-3 bg-muted rounded-lg p-2 dark:bg-white/5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 transition-colors disabled:opacity-50 dark:bg-purple-500/20 dark:hover:bg-purple-500/30 dark:text-purple-400"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-foreground font-semibold w-8 text-center dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 transition-colors dark:bg-purple-500/20 dark:hover:bg-purple-500/30 dark:text-purple-400"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="text-2xl font-bold text-foreground dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-400 transition-colors dark:text-red-400 dark:hover:text-red-300">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div>
            <div className={`sticky top-24 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <Card className="bg-card/50 backdrop-blur-sm border-border p-6 dark:bg-white/5 dark:border-purple-500/10">
                <h3 className="text-xl font-semibold text-foreground mb-6 dark:text-white">{t("orderSummary")}</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground dark:text-white/60">{t("subtotal")}</span>
                    <span className="text-foreground font-semibold dark:text-white">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground dark:text-white/60">{t("tax10")}</span>
                    <span className="text-foreground font-semibold dark:text-white">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-4 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground text-lg font-semibold dark:text-white">{t("total")}</span>
                      <span className="text-purple-600 text-2xl font-bold dark:text-purple-400">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isCheckingOut ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing order...</>
                  ) : (
                    t("proceedToCheckout")
                  )}
                </button>
                <Link href="/retailer/browse" className="block text-center text-purple-600 hover:text-purple-700 text-sm mt-4 transition-colors dark:text-purple-400 dark:hover:text-purple-300">
                  {t("continueShopping")}
                </Link>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RetailerCart() {
  return (
    <ProtectedRoute allowedRole="retailer">
      <RetailerCartContent />
    </ProtectedRoute>
  );
}
