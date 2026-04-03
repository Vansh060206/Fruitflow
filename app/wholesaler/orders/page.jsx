"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/protected-route";
import { Search, ShoppingCart, Clock, DollarSign, CheckCircle2, Truck, Eye, X } from "lucide-react";

import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { ref, onValue, update, get, set, runTransaction, push } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { autoAssignDriver } from "@/lib/logistics-utils";
import { DeliveryTracking } from "@/components/delivery-tracking";
import { toast } from "sonner";


function OrdersPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState("");

  const handleUpdateStatus = async (orderId, retailerId, newStatus) => {
    setIsUpdating(true);
    try {
      const updates = {};
      const currentOrder = orders.find(o => o.id === orderId);
      
      if (!currentOrder) {
         toast.error("Order details not found.");
         return; 
      }

      // Check if order exists in wholesaler node
      const wholesalerOrderRef = ref(realtimeDb, `orders/${userData.uid}/${orderId}`);
      const wholesalerOrderSnap = await get(wholesalerOrderRef);
      
      const isPromotingFromAlert = !wholesalerOrderSnap.exists();

      if (isPromotingFromAlert) {
          // Promote alert to full order if it only exists in retailer_orders
          const { date, ...dataToSave } = currentOrder;
          updates[`orders/${userData.uid}/${orderId}`] = {
              ...dataToSave,
              status: newStatus,
              paymentStatus: "pending",
              isManual: true 
          };
      } else {
          updates[`orders/${userData.uid}/${orderId}/status`] = newStatus;
          // Ensure paymentStatus is initialized if not already paid
          if (currentOrder.paymentStatus !== "paid") {
             updates[`orders/${userData.uid}/${orderId}/paymentStatus`] = "pending";
          }
          if (newStatus === 'delivered') {
              updates[`orders/${userData.uid}/${orderId}/delivery/status`] = 'delivered';
          }
      }
      
      if (retailerId) {
        updates[`retailer_orders/${retailerId}/${orderId}/status`] = newStatus;
        if (currentOrder.paymentStatus !== "paid") {
           updates[`retailer_orders/${retailerId}/${orderId}/paymentStatus`] = "pending";
        }
        if (newStatus === 'delivered') {
            updates[`retailer_orders/${retailerId}/${orderId}/delivery/status`] = 'delivered';
        }
        updates[`order_alerts/${userData.uid}/${orderId}`] = null; // Clear alert once handled
      }
      
      // INVENTORY DEDUCTION ON ACCEPTANCE
      if (newStatus === "accepted" || newStatus === "accepted_negotiation") {
          // Only deduct if we haven't accepted it before (to prevent double deduction)
          const oldStatus = wholesalerOrderSnap.exists() ? wholesalerOrderSnap.val().status : "alert";
          if (oldStatus !== "accepted" && oldStatus !== "accepted_negotiation") {
              for (const item of currentOrder.items || []) {
                  const itemRef = ref(realtimeDb, `inventory/${userData.uid}/${item.id}`);
                  await runTransaction(itemRef, (currentData) => {
                      if (currentData) {
                          currentData.quantity = Math.max(0, (currentData.quantity || 0) - (item.quantity || 0));
                          currentData.status = currentData.quantity < 20 ? "low-stock" : "in-stock";
                      }
                      return currentData;
                  });
              }
          }
      }

      await update(ref(realtimeDb), updates);
      toast.success(`Order marked as ${newStatus}!`);
      
      // AUTO DRIVER ASSIGNMENT IF ACCEPTED
      if (newStatus === "accepted" || newStatus === "accepted_negotiation") {
          await autoAssignDriver(orderId, userData.uid, retailerId, currentOrder);
      }

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...currentOrder, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignDriver = async (orderId, retailerId, driverId) => {
    if (!driverId) {
      toast.error("Please select a driver");
      return;
    }
    const driver = availableDrivers.find(d => d.uid === driverId);
    if (!driver) return;
    
    setIsUpdating(true);
    try {
      const updates = {};
      const deliveryPayload = {
        status: "assigned",
        driverId: driver.uid,
        driverName: driver.name || "Unknown Driver",
        vehicleNumber: driver.vehicleNumber || "",
        vehicleType: driver.vehicleType || ""
      };
      
      updates[`orders/${userData.uid}/${orderId}/delivery`] = deliveryPayload;
      if (retailerId) {
        updates[`retailer_orders/${retailerId}/${orderId}/delivery`] = deliveryPayload;
      }
      
      // Push order to the driver's queue
      updates[`driver_orders/${driver.uid}/${orderId}`] = {
         ...selectedOrder, 
         delivery: deliveryPayload,
         wholesalerLocation: userData.location || "Warehouse",
      };
      
      await update(ref(realtimeDb), updates);
      
      setSelectedOrder(prev => ({ ...prev, delivery: deliveryPayload }));
      toast.success(`Driver ${driver.name} assigned successfully!`);
      setSelectedDriverId("");
    } catch (error) {
      console.error("Error assigning driver:", error);
      toast.error("Failed to assign driver.");
    } finally {
      setIsUpdating(false);
    }
  };

  const { t } = useLanguage();
  const { userData, isLoading: authLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userData?.uid) return;

    setIsLoading(true);
    const ordersRef = ref(realtimeDb, `orders/${userData.uid}`);

    const unsubscribe = onValue(ordersRef, (snapshot) => {
      let ordersArray = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        ordersArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
          date: new Date(data[key].createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        })).filter(o => o.status !== 'rejected_negotiation'); // HIDE REJECTED
      }
      setOrders(prev => {
        // Keep alerts that aren't yet in the main orders list
        const mainIds = ordersArray.map(o => o.id);
        const activeAlerts = prev.filter(p => p.isAlert && !mainIds.includes(p.id) && p.status !== 'rejected_negotiation');
        return [...ordersArray, ...activeAlerts].sort((a, b) => b.createdAt - a.createdAt);
      });
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.uid]);

  // Separate Listener for Alerts (Negotiations)
  useEffect(() => {
    if (!userData?.uid) return;

    const alertsRef = ref(realtimeDb, `order_alerts/${userData.uid}`);
    const unsubscribe = onValue(alertsRef, async (alertSnapshot) => {
      if (alertSnapshot.exists()) {
        const alerts = alertSnapshot.val();
        for (const alertId in alerts) {
          const alert = alerts[alertId];
          const retailerOrderRef = ref(realtimeDb, `retailer_orders/${alert.retailerId}/${alert.orderId}`);
          const orderSnap = await get(retailerOrderRef);
          
          if (orderSnap.exists()) {
            const orderData = orderSnap.val();
            setOrders(prev => {
              if (prev.some(o => o.id === alert.orderId)) return prev;
              const newOrder = {
                id: alert.orderId,
                ...orderData,
                isAlert: true,
                date: new Date(orderData.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              };
              return [newOrder, ...prev].sort((a, b) => b.createdAt - a.createdAt);
            });
          }
        }
      }
    });

    return () => unsubscribe();
  }, [userData?.uid]);

  // Sync selected order with live data
  useEffect(() => {
     if (selectedOrder) {
        const updated = orders.find(o => o.id === selectedOrder.id);
        if (updated && JSON.stringify(updated) !== JSON.stringify(selectedOrder)) {
           setSelectedOrder(updated);
        }
     }
  }, [orders]);

  useEffect(() => {
    const usersRef = ref(realtimeDb, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const drivers = Object.keys(usersData)
           .map(k => usersData[k])
           .filter(u => u.role === 'driver' && u.driverStatus === 'available');
        setAvailableDrivers(drivers);
      } else {
        setAvailableDrivers([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Filter orders based on search
  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.retailerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "pending_negotiation").length;
  const totalRevenue = orders.filter((o) => o.paymentStatus === "paid").reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingPayments = orders.filter((o) => o.paymentStatus === "pending").reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="p-2 sm:p-6 space-y-6 max-w-full overflow-x-hidden">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="bg-card/50 backdrop-blur-sm border-border p-3 sm:p-6 dark:bg-white/5 dark:border-white/10 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-muted-foreground text-[10px] sm:text-sm font-medium dark:text-white/60 leading-tight truncate mr-1">{t("totalOrders")}</h3>
            <ShoppingCart className="w-3 h-3 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
          </div>
          <p className="text-lg sm:text-3xl font-bold text-foreground dark:text-white truncate">{totalOrders}</p>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border p-3 sm:p-6 dark:bg-white/5 dark:border-white/10 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-muted-foreground text-[10px] sm:text-sm font-medium dark:text-white/60 leading-tight truncate mr-1">{t("pendingOrders")}</h3>
            <Clock className="w-3 h-3 sm:w-5 sm:h-5 text-yellow-500 shrink-0" />
          </div>
          <p className="text-lg sm:text-3xl font-bold text-foreground dark:text-white truncate">{pendingOrders}</p>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border p-3 sm:p-6 dark:bg-white/5 dark:border-white/10 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-muted-foreground text-[10px] sm:text-sm font-medium dark:text-white/60 leading-tight truncate mr-1">{t("totalRevenue")}</h3>
            <DollarSign className="w-3 h-3 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
          </div>
          <p className="text-lg sm:text-3xl font-bold text-foreground dark:text-white truncate">₹{totalRevenue.toFixed(2)}</p>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border p-3 sm:p-6 dark:bg-white/5 dark:border-white/10 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-muted-foreground text-[10px] sm:text-sm font-medium dark:text-white/60 leading-tight truncate mr-1">{t("pendingPayments")}</h3>
            <Clock className="w-3 h-3 sm:w-5 sm:h-5 text-orange-500 shrink-0" />
          </div>
          <p className="text-lg sm:text-3xl font-bold text-foreground dark:text-white truncate">₹{pendingPayments.toFixed(2)}</p>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-white/40" />
        <input
          type="text"
          placeholder={t("searchOrderPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card/50 backdrop-blur-sm border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40"
        />
      </div>

      {/* Desktop Table View */}
      <Card className="bg-card/50 backdrop-blur-sm border-border overflow-hidden hidden md:block dark:bg-white/5 dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border dark:bg-white/5 dark:border-white/10">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80 dark:text-white/80">{t("orderId")}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80 dark:text-white/80">{t("retailer")}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80 dark:text-white/80">{t("date")}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80 dark:text-white/80">{t("amount")}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80 dark:text-white/80">{t("paymentStatus")}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground/80 dark:text-white/80">{t("orderStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`border-b border-border hover:bg-muted transition-colors cursor-pointer dark:border-white/5 dark:hover:bg-white/5 ${mounted ? "opacity-100" : "opacity-0"}`}
                  style={{
                    transitionDelay: `${index * 30}ms`,
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-foreground font-medium dark:text-white">{order.id}</span>
                      {order.status === 'pending_negotiation' && (
                        <span className="text-[10px] font-bold text-orange-500 uppercase tracking-tighter">Negotiation Request</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-foreground/80 dark:text-white/80">{order.retailerName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-muted-foreground text-sm dark:text-white/60">{order.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-600 font-semibold dark:text-emerald-400">₹{order.totalAmount?.toFixed(2) || "0.00"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${(order.paymentStatus || 'pending') === "paid"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                        : "bg-orange-500/10 text-orange-600 border border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30"
                        }`}
                    >
                      {(order.paymentStatus || 'pending') === "paid" ? t("paid") : t("pending")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${order.status === "delivered"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                        : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30"
                        }`}
                    >
                      {order.status === "delivered" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          {t("delivered")}
                        </>
                      ) : (
                        <>
                          <Truck className="w-3 h-3" />
                          {t(order.status || "pending")}
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {filteredOrders.map((order, index) => (
          <Card
            key={order.id}
            onClick={() => setSelectedOrder(order)}
            className={`cursor-pointer bg-card/50 backdrop-blur-sm border-border p-4 hover:shadow-lg transition-all dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            style={{
              transitionDelay: `${index * 30}ms`,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-foreground font-semibold dark:text-white">{order.id}</h3>
                <p className="text-muted-foreground text-sm dark:text-white/60">{order.retailerName}</p>
              </div>
              <span className="text-emerald-600 font-bold dark:text-emerald-400">₹{order.totalAmount?.toFixed(2) || "0.00"}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground dark:text-white/60">{t("date")}:</span>
                <span className="text-foreground/80 dark:text-white/80">{order.date}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground dark:text-white/60">{t("paymentStatus")}:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${(order.paymentStatus || 'pending') === "paid"
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                    : "bg-orange-500/10 text-orange-600 border border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30"
                    }`}
                >
                  {(order.paymentStatus || 'pending') === "paid" ? t("paid") : t("pending")}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground dark:text-white/60">{t("orderStatus")}:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${order.status === "delivered"
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30"
                    : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30"
                    }`}
                >
                  {order.status === "delivered" ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      {t("delivered")}
                    </>
                  ) : (
                    <>
                      <Truck className="w-3 h-3" />
                      {t(order.status || "pending")}
                    </>
                  )}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* No results message */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4 dark:text-white/20" />
          <p className="text-muted-foreground text-lg dark:text-white/60">{t("noOrdersFound")}</p>
        </div>
      )}

      {/* Modal / Sheet for Order Details */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
          onClick={() => setSelectedOrder(null)}
        >
          <Card 
            className="w-full max-w-2xl bg-background border-border shadow-2xl overflow-hidden dark:bg-[#121212] dark:border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-500 max-h-[92vh] flex flex-col" 
            onClick={e => e.stopPropagation()}
          >
            {/* Grabber for Mobile */}
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto my-3 sm:hidden" />

            <div className="px-6 py-4 sm:p-6 border-b border-border dark:border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-foreground dark:text-white uppercase tracking-tight">Order Details</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">ID: {selectedOrder.id.slice(-12)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 flex items-center justify-center bg-muted/50 hover:bg-muted text-muted-foreground rounded-full transition-all dark:text-white/60 dark:hover:bg-white/10 active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em] mb-1.5 dark:text-white/40">Retailer</p>
                  <p className="text-sm font-bold text-foreground dark:text-white">{selectedOrder.retailerName}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em] mb-1.5 dark:text-white/40">Date</p>
                  <p className="text-sm font-bold text-foreground dark:text-white">{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider dark:text-white/40">Total Amount</p>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{selectedOrder.totalAmount?.toFixed(2) || "0.00"}
                    {selectedOrder.status === 'pending_negotiation' && selectedOrder.originalTotalAmount && (
                      <span className="text-xs text-muted-foreground line-through ml-2">₹{selectedOrder.originalTotalAmount?.toFixed(2)}</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider dark:text-white/40">Current Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${selectedOrder.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : (selectedOrder.status === 'accepted' || selectedOrder.status === 'accepted_negotiation') ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : selectedOrder.status === 'rejected_negotiation' ? 'bg-red-500/10 text-red-600 border border-red-500/20' : selectedOrder.status === 'pending_negotiation' ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20' : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'}`}>
                    {selectedOrder.status === 'pending_negotiation' ? 'NEGOTIATION' : selectedOrder.status?.toUpperCase().replace('_', ' ') || 'PENDING'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider dark:text-white/40">Payment Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${(selectedOrder.paymentStatus || 'pending') === "paid" ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-600 border border-orange-500/20'}`}>
                    {((selectedOrder.paymentStatus || 'pending') === "paid") ? 'PAID' : 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Delivery Assignment Block */}
              {(((selectedOrder.paymentStatus || 'pending') === "paid" || selectedOrder.status === 'accepted' || selectedOrder.status === 'accepted_negotiation') && selectedOrder.delivery?.status !== 'delivered') && (
                 <div className="mb-6 bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 dark:bg-purple-900/10">
                   <h3 className="text-sm font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                     <Truck className="w-4 h-4" /> Logistics & Delivery
                   </h3>
                   {selectedOrder.delivery?.driverId ? (
                      <div className="flex items-center justify-between text-sm bg-background/50 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                              <Truck className="w-5 h-5 text-purple-500" />
                           </div>
                           <div>
                             <p className="font-black text-foreground dark:text-white leading-none uppercase text-[11px] mb-1">{selectedOrder.delivery.driverName}</p>
                             <p className="text-[10px] text-muted-foreground font-bold">{selectedOrder.delivery.vehicleType} • {selectedOrder.delivery.vehicleNumber}</p>
                           </div>
                        </div>
                        <span className={`px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest ${
                           selectedOrder.delivery.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-600' :
                           selectedOrder.delivery.status === 'in_transit' ? 'bg-blue-500/10 text-blue-600' :
                           'bg-orange-500/10 text-orange-600 animate-pulse'
                        }`}>
                          {selectedOrder.delivery.status.replace('_', ' ')}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select 
                          value={selectedDriverId}
                          onChange={(e) => setSelectedDriverId(e.target.value)}
                          className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/50 transition-all h-12 cursor-pointer"
                        >
                          <option value="" disabled>{availableDrivers.length > 0 ? "Select professional driver..." : "No available drivers found"}</option>
                          {availableDrivers.map(d => (
                            <option key={d.uid} value={d.uid}>{d.name} ({d.vehicleType})</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAssignDriver(selectedOrder.id, selectedOrder.retailerId, selectedDriverId)}
                          disabled={isUpdating || !selectedDriverId}
                          className="bg-purple-600 hover:bg-purple-500 text-white font-black py-3 px-8 shadow-xl rounded-xl text-xs uppercase tracking-widest transition-all whitespace-nowrap h-12 disabled:opacity-30 disabled:grayscale active:scale-95"
                        >
                          {isUpdating ? "Assigning..." : "Assign Driver"}
                        </button>
                      </div>
                    )}
                 </div>
              )}

              {/* LIVE DELIVERY TRACKING MONITOR */}
              {selectedOrder.delivery && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "900ms" }}>
                   <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2 dark:text-white">
                      <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      Dispatch Monitoring
                   </h3>
                   <DeliveryTracking order={selectedOrder} />
                </div>
              )}


              <h3 className="font-bold text-foreground mb-4 dark:text-white">Items Ordered</h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-center gap-4 bg-muted/50 p-3 rounded-lg border border-border/50 dark:bg-white/5 dark:border-white/5 min-w-0">
                    <div className="text-4xl shrink-0">{item.image || "📦"}</div>
                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <p className="font-semibold text-foreground dark:text-white truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground dark:text-white/60">
                        {item.proposedPrice ? (
                          <>
                            <span className="line-through mr-1 opacity-70">₹{item.price}</span>
                            <span className="text-orange-500 font-bold mr-1">₹{item.proposedPrice}</span>
                          </>
                        ) : (
                          <span>₹{item.price}</span>
                        )}
                        x {item.quantity} kg
                      </p>
                    </div>
                    <div className="text-right">
                      {item.proposedPrice && (
                        <p className="text-xs line-through text-muted-foreground opacity-70 mb-0.5">₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                      )}
                      <p className={`font-bold ${item.proposedPrice ? 'text-orange-500' : 'text-foreground dark:text-white'}`}>
                        {item.proposedPrice ? `₹${((item.proposedPrice || 0) * (item.quantity || 0)).toFixed(2)}` : `₹${((item.price || 0) * (item.quantity || 0)).toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-6 sm:py-6 border-t border-border bg-muted/30 dark:border-white/10 dark:bg-white/5 flex flex-col sm:flex-row gap-3 justify-end sticky bottom-0 z-20 backdrop-blur-md">
              {(selectedOrder.status === 'pending' || !selectedOrder.status) && (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.retailerId, 'accepted')}
                  disabled={isUpdating}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  {isUpdating ? "Updating..." : "Accept Order"}
                </button>
              )}
              {selectedOrder.status === 'pending_negotiation' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.retailerId, 'rejected_negotiation')}
                    disabled={isUpdating}
                    className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all disabled:opacity-50 ring-1 ring-white/10 active:scale-95"
                  >
                    {isUpdating ? "Updating..." : "Reject Offer"}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.retailerId, 'accepted_negotiation')}
                    disabled={isUpdating}
                    className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20 active:scale-95"
                  >
                    {isUpdating ? "Updating..." : "Accept Offer"}
                  </button>
                </>
              )}
              {(selectedOrder.status === 'accepted' || selectedOrder.status === 'accepted_negotiation') && (
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.retailerId, 'delivered')}
                  disabled={isUpdating}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" /> {isUpdating ? "Updating..." : "Mark as Delivered"}
                </button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute allowedRole="wholesaler">
      <OrdersPageContent />
    </ProtectedRoute>
  );
}
