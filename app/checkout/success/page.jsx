"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ref, runTransaction, push, set } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { cartItems, clearCart } = useCart();
  const { userData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.push("/retailer/cart");
      return;
    }

    if (cartItems.length > 0 && userData?.uid) {
      saveOrderToDatabase(sessionId);
    } else if (cartItems.length === 0) {
      setLoading(false);
    }
  }, [sessionId, cartItems, userData]);

  const saveOrderToDatabase = async (stripeSessionId) => {
    try {
      const orderGroups = {};

      for (const item of cartItems) {
        if (!item.wholesalerId || !item.id) continue;

        if (!orderGroups[item.wholesalerId]) {
          orderGroups[item.wholesalerId] = { items: [], subtotal: 0 };
        }
        orderGroups[item.wholesalerId].items.push(item);
        orderGroups[item.wholesalerId].subtotal += (item.price * item.quantity);

        // Update inventory transactionally
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
          payment: {
            stripeSessionId,
            status: "success",
            method: "Stripe"
          }
        };

        const wholesalerOrderRef = push(ref(realtimeDb, `orders/${wholesalerId}`));
        const orderId = wholesalerOrderRef.key;
        await set(wholesalerOrderRef, { ...orderPayload, orderId });

        const retailerOrderRef = ref(realtimeDb, `retailer_orders/${userData.uid}/${orderId}`);
        await set(retailerOrderRef, { ...orderPayload, orderId, wholesalerId });
      }

      toast.success("Order confirmed successfully!");
      clearCart();
      setLoading(false);
    } catch (error) {
      console.error("Failed to save order:", error);
      toast.error("Payment was successful, but we had trouble saving the order. Please contact support.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
        <h2 className="text-2xl font-bold">Confirming your payment...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center space-y-6 bg-card/50 backdrop-blur-sm border-purple-500/20">
        <div className="bg-green-100 dark:bg-green-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">Order Placed!</h2>
          <p className="text-muted-foreground mt-2">
            Your payment was successful and your order is being processed.
          </p>
        </div>
        <button
          onClick={() => router.push("/retailer/dashboard")}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Go to Dashboard
        </button>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center font-bold text-4xl">Loading...</div>}>
        <CheckoutSuccessContent />
    </Suspense>
  )
}
