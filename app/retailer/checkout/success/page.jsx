"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ref, runTransaction, push, set, update, get } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { autoAssignDriver } from "@/lib/logistics-utils";


function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  const wholesalerId = searchParams.get("wholesaler_id");
  const { cartItems, clearCart } = useCart();
  const { userData } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      router.push(orderId ? "/retailer/orders" : "/retailer/cart");
      return;
    }

    // Prevent multiple executions
    if (hasProcessed || isProcessing) return;

    const processOrder = async () => {
      // Logic for existing negotiated order
      if (orderId && wholesalerId && userData?.uid) {
        setIsProcessing(true);
        await updateExistingOrder(sessionId, orderId, wholesalerId);
        setHasProcessed(true);
        setIsProcessing(false);
      } 
      // Logic for new cart order
      else if (cartItems.length > 0 && userData?.uid) {
        setIsProcessing(true);
        await saveOrderToDatabase(sessionId);
        setHasProcessed(true);
        setIsProcessing(false);
      }
      // If we have no cart items but we have a session ID, we might be waiting for CartContext to load
      // Or it might already be cleared (in case of a manual refresh after success)
    };

    processOrder();
  }, [sessionId, orderId, wholesalerId, cartItems, userData, hasProcessed, isProcessing]);

  const updateExistingOrder = async (stripeSessionId, oId, wId) => {
    try {
      const updates = {};
      const timestamp = Date.now();
      updates[`orders/${wId}/${oId}/status`] = "accepted";
      updates[`orders/${wId}/${oId}/paymentStatus`] = "paid";
      updates[`orders/${wId}/${oId}/payment/status`] = "paid";
      updates[`orders/${wId}/${oId}/payment/method`] = "Stripe";
      updates[`orders/${wId}/${oId}/payment/stripeSessionId`] = stripeSessionId;

      updates[`retailer_orders/${userData.uid}/${oId}/status`] = "accepted";
      updates[`retailer_orders/${userData.uid}/${oId}/paymentStatus`] = "paid";
      updates[`retailer_orders/${userData.uid}/${oId}/payment/status`] = "paid";
      updates[`retailer_orders/${userData.uid}/${oId}/payment/method`] = "Stripe";
      updates[`retailer_orders/${userData.uid}/${oId}/payment/stripeSessionId`] = stripeSessionId;
      
      await update(ref(realtimeDb), updates);
      toast.success("Payment successful! Your negotiated order is confirmed.");
    } catch (error) {
       console.error("Failed to update order:", error);
       toast.error("Payment successful, but order status update failed.");
    }
  };

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
          status: "accepted",
          paymentStatus: "paid",
          createdAt: timestamp,
          payment: {
            stripeSessionId,
            status: "paid",
            method: "Stripe"
          }
        };

        const wholesalerOrderRef = push(ref(realtimeDb, `orders/${wholesalerId}`));
        const orderId = wholesalerOrderRef.key;
        await set(wholesalerOrderRef, { ...orderPayload, orderId });

        const retailerOrderRef = ref(realtimeDb, `retailer_orders/${userData.uid}/${orderId}`);
        await set(retailerOrderRef, { ...orderPayload, orderId, wholesalerId });

        // AUTO-ASSIGN DRIVER
        await autoAssignDriver(orderId, wholesalerId, userData.uid, orderPayload);
      }


      toast.success("Order confirmed successfully!");
      clearCart();
    } catch (error) {
      console.error("Failed to save order:", error);
      toast.error("Payment was successful, but we had trouble saving the order. Please contact support.");
    }
  };

  if (!hasProcessed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
        <h2 className="text-2xl font-bold">
          {isProcessing ? (
            <span className="animate-pulse">Finalizing Order...</span>
          ) : (
            <span>Verifying Checkout...</span>
          )}
        </h2>
        <p className="text-muted-foreground text-sm flex items-center gap-2">
            <RefreshCw className="w-3 h-3 animate-spin"/> {isProcessing ? "Adding to Logistics Queue..." : "Waiting for order data..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center space-y-6 bg-card/50 backdrop-blur-sm border-purple-500/20 shadow-2xl">
        <div className="bg-emerald-100 dark:bg-emerald-900/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto animate-in zoom-in-95 duration-500">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">Success!</h2>
          <p className="text-muted-foreground mt-2 font-medium">
            Your payment was verified. The order is now being dispatched to the wholesalers.
          </p>
        </div>
        <button
          onClick={() => router.push("/retailer/dashboard")}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-xs uppercase tracking-widest"
        >
          Back to My Dashboard
        </button>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen flex items-center justify-center">
         <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
       </div>
    }>
        <CheckoutSuccessContent />
    </Suspense>
  )
}
