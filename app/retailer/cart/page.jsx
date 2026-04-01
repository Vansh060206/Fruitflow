"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/protected-route";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { ShoppingCart, Trash2, Plus, Minus, Loader2, X, Handshake } from "lucide-react";
import { ref, runTransaction, push, set, onValue, update } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";

import { useLanguage } from "@/lib/language-context";

function RetailerCartContent() {
  const [mounted, setMounted] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isNegotiateModalOpen, setIsNegotiateModalOpen] = useState(false);
  const [negotiationPrices, setNegotiationPrices] = useState({});
  const [negotiationCount, setNegotiationCount] = useState(0);

  // Use Cart Context
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { userData } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userData?.uid) return;
    const countRef = ref(realtimeDb, `negotiation_counts/${userData.uid}`);
    const unsub = onValue(countRef, (snapshot) => {
      setNegotiationCount(snapshot.val() || 0);
    });
    return () => unsub();
  }, [userData?.uid]);

  const tax = cartTotal * 0.1;
  const total = cartTotal + tax;

  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  const handleCheckout = async () => {
    if (!userData?.uid) {
      toast.error("Please log in to checkout.");
      return;
    }

    if (cartItems.length === 0) return;

    setIsCheckingOut(true);
    try {
      // 1. Call your backend to create the Checkout Session
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems,
          userData,
          totalAmount: total
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create Stripe Checkout Session");
      }

      const { id, url } = await response.json();

      // 2. Redirect to Stripe Checkout or open the URL
      if (url) {
        window.location.href = url;
      } else {
        const stripe = await stripePromise;
        const result = await stripe.redirectToCheckout({ sessionId: id });
        if (result.error) throw new Error(result.error.message);
      }
    } catch (error) {
      console.error("Stripe Checkout Error:", error);
      toast.error("Payment initiation failed. Please check your Stripe keys in .env.local.");
      setIsCheckingOut(false);
    }
  };

  const handleNegotiationSubmit = async (e) => {
    e.preventDefault();
    if (!userData?.uid || cartItems.length === 0) return;

    let hasInvalidPrice = false;
    for (const item of cartItems) {
      const p = parseFloat(negotiationPrices[item.id]);
      if (!p || p <= 0 || p > item.price) {
         hasInvalidPrice = true;
      }
    }

    if (hasInvalidPrice) {
       toast.error("Please enter a valid negotiated offer lower than the current price for all items.");
       return;
    }

    setIsCheckingOut(true);
    try {
      const orderGroups = {};

      for (const item of cartItems) {
        if (!item.wholesalerId || !item.id) continue;

        if (!orderGroups[item.wholesalerId]) {
          orderGroups[item.wholesalerId] = {
            items: [],
            originalSubtotal: 0,
            proposedSubtotal: 0
          };
        }
        
        const proposedPrice = parseFloat(negotiationPrices[item.id]);
        
        orderGroups[item.wholesalerId].items.push({
           ...item,
           proposedPrice
        });
        
        orderGroups[item.wholesalerId].originalSubtotal += (item.price * item.quantity);
        orderGroups[item.wholesalerId].proposedSubtotal += (proposedPrice * item.quantity);
      }

      const timestamp = Date.now();
      const updates = {};
      
      for (const [wholesalerId, group] of Object.entries(orderGroups)) {
        const proposedTaxAmount = group.proposedSubtotal * 0.1;
        const requestedTotal = group.proposedSubtotal + proposedTaxAmount;

        // Use a neutral path for the initial 'Request'
        const orderId = push(ref(realtimeDb, `retailer_orders/${userData.uid}`)).key;
        
        const orderPayload = {
          orderId,
          wholesalerId,
          retailerId: userData.uid,
          retailerName: userData.companyName || userData.name || "A Retailer",
          items: group.items,
          subtotal: group.proposedSubtotal,
          tax: proposedTaxAmount,
          totalAmount: requestedTotal,
          originalTotalAmount: group.originalSubtotal + (group.originalSubtotal * 0.1),
          status: "pending_negotiation",
          createdAt: timestamp,
          payment: {
            status: "negotiating",
            method: "Negotiation Request"
          }
        };

        // RETAILER ONLY WRITES TO THEIR OWN NODE (ALWAYS ALLOWED)
        updates[`retailer_orders/${userData.uid}/${orderId}`] = orderPayload;
        
        // PUSH A SIGNAL ALERT (USUALLY ALLOWED ON SHARED NODES)
        updates[`order_alerts/${wholesalerId}/${orderId}`] = {
           retailerId: userData.uid,
           orderId: orderId,
           timestamp: timestamp
        };
      }

      updates[`negotiation_counts/${userData.uid}`] = negotiationCount + 1;

      await update(ref(realtimeDb), updates);
      
      toast.success(`Negotiation request sent!`, { icon: "🤝" });
      clearCart();
      setIsNegotiateModalOpen(false);
    } catch (error) {
      console.error("Negotiation DB Saving Failed:", error);
      toast.error("Permission denied. Ensure your profile is complete.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Extract saving logic to separate function to run upon payment success
  const saveOrderToDatabase = async (razorpayDetails) => {
    try {
      toast.loading("Processing your order...", { id: "order-processing" });
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
          createdAt: timestamp,
          // Adding Razorpay payment details returned successfully
          payment: {
            ...razorpayDetails, 
            status: "success",
            method: "Razorpay"
          }
        };

        const wholesalerOrderRef = push(ref(realtimeDb, `orders/${wholesalerId}`));
        const orderId = wholesalerOrderRef.key;
        await set(wholesalerOrderRef, { ...orderPayload, orderId });

        const retailerOrderRef = ref(realtimeDb, `retailer_orders/${userData.uid}/${orderId}`);
        await set(retailerOrderRef, { ...orderPayload, orderId, wholesalerId });
      }

      toast.dismiss("order-processing");
      toast.success("Order Placed Successfully! Payment verified and Wholesalers notified.", {
        icon: "🎉"
      });
      clearCart();
      setIsCheckingOut(false);
    } catch (error) {
      console.error("DB Saving Failed:", error);
      toast.dismiss("order-processing");
      toast.error("Order saved with errors. Support will check it.");
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
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isCheckingOut ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing order...</>
                    ) : (
                      "Pay Full Price Now"
                    )}
                  </button>

                  {negotiationCount < 10 ? (
                    <button
                      onClick={() => {
                          const defaultPrices = {};
                          cartItems.forEach(item => {
                             defaultPrices[item.id] = item.price.toString();
                          });
                          setNegotiationPrices(defaultPrices);
                          setIsNegotiateModalOpen(true);
                      }}
                      disabled={isCheckingOut}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-300 disabled:opacity-70"
                    >
                      <Handshake className="w-5 h-5" /> Negotiate Custom Price ({10 - negotiationCount} left)
                    </button>
                  ) : (
                    <div className="w-full bg-muted/50 text-muted-foreground text-sm font-semibold flex items-center justify-center gap-2 py-3 rounded-lg border border-border/50 dark:bg-white/5 dark:border-white/10 text-center px-4">
                      Negotiation Limit Reached (10/10)
                    </div>
                  )}
                </div>

                <Link href="/retailer/browse" className="block text-center text-purple-600 hover:text-purple-700 text-sm mt-4 transition-colors dark:text-purple-400 dark:hover:text-purple-300">
                  {t("continueShopping")}
                </Link>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Negotiation Modal */}
      {isNegotiateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in" onClick={() => setIsNegotiateModalOpen(false)}>
          <Card className="w-full max-w-md p-6 bg-card border-border shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setIsNegotiateModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Handshake className="text-orange-500"/> Negotiate Offer
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Propose a discounted price <b>per kg</b> for the fruits in your cart. 
            </p>
            <form onSubmit={handleNegotiationSubmit} className="max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item.id} className="p-3 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{item.name} ({item.quantity} kg)</span>
                      <span className="text-muted-foreground text-sm">Orig: ₹{item.price}/kg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">₹</span>
                      <input
                        type="number"
                        required
                        min="1"
                        step="0.01"
                        max={item.price}
                        value={negotiationPrices[item.id] || ""}
                        onChange={(e) => setNegotiationPrices(prev => ({ ...prev, [item.id]: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-orange-500 focus:outline-none dark:text-white"
                        placeholder={`Max ₹${item.price}`}
                      />
                      <span className="text-sm">/kg</span>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                type="submit"
                disabled={isCheckingOut}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all active:scale-95 flex justify-center disabled:opacity-70"
              >
                {isCheckingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Negotiation to Wholesaler"}
              </button>
            </form>
          </Card>
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
