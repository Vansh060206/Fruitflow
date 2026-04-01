"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ref, onValue, update } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/protected-route";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Truck, MapPin, PackageCircle, CheckCircle, Navigation, Loader2, Phone, ArrowRight, History, PlayCircle, LogOut } from "lucide-react";

export default function DriverDashboard() {
  const { userData, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [driverStatus, setDriverStatus] = useState("offline");
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    setMounted(true);
    requestLocation();
  }, []);

  // 1. Fetch Orders and Profile
  useEffect(() => {
    if (!userData?.uid) return;

    // Listen to personal status
    const userRef = ref(realtimeDb, `users/${userData.uid}`);
    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) setDriverStatus(snapshot.val().driverStatus || "offline");
    });

    // Listen to assigned deliveries
    setLoadingOrders(true);
    const ordersRef = ref(realtimeDb, `driver_orders/${userData.uid}`);
    const alertsRef = ref(realtimeDb, `dispatch_alerts/${userData.uid}`);
    const timer = setTimeout(() => setLoadingOrders(false), 5000);
    
    onValue(ordersRef, (snapshot) => {
      clearTimeout(timer);
      let ordersArray = [];
      if (snapshot.exists()) {
        const data = snapshot.val();
        ordersArray = Object.keys(data).map(key => ({ ...data[key], id: key }));
      }

      // ALSO LISTEN TO INCOMING PEER DISPATCH ALERTS
      onValue(alertsRef, (alertSnap) => {
         if (alertSnap.exists()) {
            const alerts = alertSnap.val();
            for (const aId in alerts) {
               if (!ordersArray.some(o => o.id === aId)) {
                  ordersArray.push({ ...alerts[aId], id: aId });
               }
            }
         }
         setOrders([...ordersArray.sort((a, b) => b.createdAt - a.createdAt)]);
         setLoadingOrders(false);
      });
    });
  }, [userData?.uid]);

  // 2. Periodic Location Sync (Smooth Real-time Tracking)
  useEffect(() => {
    const activeOrder = orders.find(o => ['picked_up', 'in_transit'].includes(o.delivery?.status));
    if (!activeOrder || !currentLocation || !userData?.uid) return;

    const interval = setInterval(async () => {
       const updates = {};
       const locData = { 
          lat: currentLocation.lat, 
          lng: currentLocation.lng, 
          updatedAt: Date.now(),
          bearing: currentLocation.bearing || 0 // Optional: add bearing if available
       };
       
       updates[`driver_orders/${userData.uid}/${activeOrder.id}/delivery/driverLocation`] = locData;
       updates[`orders/${activeOrder.wholesalerId}/${activeOrder.id}/delivery/driverLocation`] = locData;
       updates[`retailer_orders/${activeOrder.retailerId}/${activeOrder.id}/delivery/driverLocation`] = locData;
       
       await update(ref(realtimeDb), updates).catch(console.error);
    }, 30000); // 30 second precision for B2B logistics

    return () => clearInterval(interval);
  }, [orders, currentLocation, userData?.uid]);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => toast.error("GPS access needed for navigation updates."),
        { enableHighAccuracy: true }
      );
    }
  };

  const syncDeliveryStatus = async (order, newStatus) => {
    try {
      const updates = {};
      const { wholesalerId, retailerId, id: orderId } = order;
      
      const payload = { ...order.delivery, status: newStatus };
      if (newStatus === 'in_transit' && currentLocation) {
          payload.driverLocation = { lat: currentLocation.lat, lng: currentLocation.lng, updatedAt: Date.now() };
      }

      updates[`driver_orders/${userData.uid}/${orderId}/delivery`] = payload;
      updates[`orders/${wholesalerId}/${orderId}/delivery`] = payload;
      updates[`retailer_orders/${retailerId}/${orderId}/delivery`] = payload;

      if (newStatus === 'delivered') {
        updates[`driver_orders/${userData.uid}/${orderId}/status`] = "delivered";
        updates[`orders/${wholesalerId}/${orderId}/status`] = "delivered";
        updates[`retailer_orders/${retailerId}/${orderId}/status`] = "delivered";
      }

      await update(ref(realtimeDb), updates);
      toast.success(`Success: ${newStatus.replace('_', ' ').toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to sync status");
    }
  };

  const updateAvailability = async (newStatus) => {
    await update(ref(realtimeDb, `users/${userData.uid}`), { driverStatus: newStatus });
    toast.success(`Status: ${newStatus.toUpperCase()}`);
  };

  // Section Filters
  const activeDelivery = orders.find(o => o.delivery?.status === 'picked_up' || o.delivery?.status === 'in_transit');
  const assignedOrders = orders.filter(o => o.delivery?.status === 'assigned' || !o.delivery?.status);
  const deliveryHistory = orders.filter(o => o.delivery?.status === 'delivered');

  if (!mounted || authLoading) return <div className="min-h-screen flex items-center justify-center bg-zinc-950"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;

  return (
    <ProtectedRoute allowedRole="driver">
      <div className="min-h-screen bg-[#09090b] text-zinc-100 pb-20">
        
         {/* Header - Fixed & Premium */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 pt-8 pb-4 px-4 sm:px-6 shadow-2xl transition-all duration-500">
           <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={async () => {
                    await logout();
                    router.push('/login?role=driver');
                  }}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/40 transition-all group active:scale-95"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-zinc-400 group-hover:text-red-400 transition-colors" />
                </button>
                <div>
                  <h1 className="text-lg sm:text-xl font-black tracking-tighter text-white leading-none">DRIVER</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px] ${driverStatus === 'available' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{driverStatus}</span>
                  </div>
                </div>
              </div>
              
              <select
                value={driverStatus}
                onChange={(e) => updateAvailability(e.target.value)}
                className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none hover:border-white/20 transition-all cursor-pointer appearance-none"
                style={{ direction: 'rtl' }}
              >
                <option value="available">ONLINE</option>
                <option value="busy">BUSY</option>
                <option value="offline">OFFLINE</option>
              </select>
           </div>
        </div>

        <div className="max-w-xl mx-auto pt-32 px-4 space-y-8">

          {/* Navigation Tabs */}
          <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/5 font-bold text-[10px]">
             {[ 
               { id: 'active', icon: Navigation, label: 'ON ROAD' },
               { id: 'assigned', icon: PlayCircle, label: 'ASSIGNED' },
               { id: 'history', icon: History, label: 'HISTORY' }
             ].map(tab => (
               <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 <tab.icon className="w-3.5 h-3.5" />
                 {tab.label}
               </button>
             ))}
          </div>

          {/* 1. ACTIVE DELIVERY (High Priority) */}
          {activeTab === 'active' && (
            <div className="space-y-6">
              {!activeDelivery ? (
                <Card className="bg-zinc-900/40 border-white/5 border-dashed p-10 text-center rounded-[2.5rem]">
                   <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                      <Truck className="w-8 h-8 text-zinc-600" />
                   </div>
                   <p className="text-zinc-400 font-bold text-sm">No active tasks currently.</p>
                </Card>
              ) : (
                <Card className="bg-zinc-900 border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                   {/* Direction Map */}
                   <div className="h-64 relative bg-zinc-800">
                      <iframe
                        width="100%" height="100%" frameBorder="0" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(1.2)' }}
                        src={`https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&origin=${encodeURIComponent(activeDelivery.wholesalerLocation || "Warehouse")}&destination=${encodeURIComponent(activeDelivery.deliveryLocation || "Retailer Store")}&mode=driving`}
                        allowFullScreen
                      ></iframe>
                      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-purple-500/30 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[9px] font-black uppercase tracking-widest leading-none">Live Routing Active</span>
                      </div>
                   </div>

                   {/* Content */}
                   <div className="p-8 space-y-6">
                      <div className="flex justify-between items-start">
                         <div>
                            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest underline decoration-2 underline-offset-4 mb-2 block">ACTIVE SHIPMENT</span>
                            <h2 className="text-2xl font-bold tracking-tight">#{activeDelivery.id.slice(-6)}</h2>
                         </div>
                         <div className="bg-zinc-800 px-4 py-2 rounded-2xl border border-white/5 text-center">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase">Size</p>
                            <p className="text-sm font-black">{activeDelivery.items?.length || 0} ITEMS</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 py-4 border-y border-white/5">
                         <div className="flex items-start gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20"><MapPin className="w-4 h-4 text-emerald-500" /></div>
                            <div>
                               <p className="text-[10px] text-zinc-500 font-bold uppercase">Pickup</p>
                               <p className="text-sm font-bold">{activeDelivery.wholesalerLocation || "Wholesaler Warehouse"}</p>
                            </div>
                         </div>
                         <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20"><Navigation className="w-4 h-4 text-red-500" /></div>
                            <div>
                               <p className="text-[10px] text-zinc-500 font-bold uppercase">Dropoff</p>
                               <p className="text-sm font-bold">{activeDelivery.retailerName}</p>
                               <p className="text-[10px] text-zinc-500 mt-0.5">{activeDelivery.deliveryLocation}</p>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-col gap-3">
                         {activeDelivery.delivery?.status === 'picked_up' && (
                            <button 
                              onClick={() => syncDeliveryStatus(activeDelivery, 'in_transit')}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3"
                            >
                               <Navigation className="w-5 h-5" />
                               START DELIVERY TRANSIT
                            </button>
                         )}
                         {activeDelivery.delivery?.status === 'in_transit' && (
                            <button 
                              onClick={() => syncDeliveryStatus(activeDelivery, 'delivered')}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-3"
                            >
                               <CheckCircle className="w-5 h-5" />
                               MARK AS DELIVERED
                            </button>
                         )}
                         <a 
                           href={`tel:${activeDelivery.retailerPhone || "9999999999"}`}
                           className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-4 rounded-2xl text-sm border border-white/5 flex items-center justify-center gap-3 transition-colors"
                         >
                            <Phone className="w-4 h-4" /> CONTACT RETAILER
                         </a>
                      </div>
                   </div>
                </Card>
              )}
            </div>
          )}

          {/* 2. ASSIGNED ORDERS */}
          {activeTab === 'assigned' && (
            <div className="space-y-4">
              {assignedOrders.length === 0 ? (
                <div className="text-center py-20 opacity-30 font-bold text-xs">NO NEW ASSIGNMENTS</div>
              ) : (
                assignedOrders.map(order => (
                  <Card key={order.id} className="bg-zinc-900/60 border-white/5 p-6 rounded-[2rem] hover:border-purple-500/20 transition-all group">
                     <div className="flex justify-between items-center mb-4">
                       <span className="text-[10px] font-black px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full">ASSIGNED</span>
                       <span className="text-[10px] font-mono text-zinc-600">ID {order.id.slice(-8)}</span>
                     </div>
                     <div className="space-y-4 mb-6">
                        <div className="flex gap-4">
                           <div className="p-2 bg-emerald-500/5 rounded-lg"><MapPin className="w-3.5 h-3.5 text-emerald-500" /></div>
                           <div><p className="text-[10px] text-zinc-500 uppercase">From</p><p className="text-xs font-bold leading-none">{order.wholesalerLocation}</p></div>
                        </div>
                        <div className="flex gap-4">
                           <div className="p-2 bg-red-500/5 rounded-lg"><ArrowRight className="w-3.5 h-3.5 text-red-500" /></div>
                           <div><p className="text-[10px] text-zinc-500 uppercase">To</p><p className="text-xs font-bold leading-none">{order.retailerName}</p></div>
                        </div>
                     </div>
                     <button 
                        onClick={() => syncDeliveryStatus(order, 'picked_up')}
                        disabled={!!activeDelivery}
                        className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white font-black py-4 rounded-xl shadow-lg transition-all text-xs"
                     >
                        {!!activeDelivery ? "FINISH CURRENT TASK FIRST" : "CONFIRM PICKUP"}
                     </button>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* 3. HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
               {deliveryHistory.map(order => (
                 <div key={order.id} className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-emerald-500/10 rounded-full"><CheckCircle className="w-4 h-4 text-emerald-500" /></div>
                       <div>
                          <p className="text-sm font-bold leading-none">{order.retailerName}</p>
                          <p className="text-[10px] text-zinc-500 mt-1 uppercase">Delivered • {new Date(order.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-600">#{order.id.slice(-6)}</span>
                 </div>
               ))}
               {deliveryHistory.length === 0 && <div className="text-center py-20 opacity-20 font-bold text-xs uppercase tracking-widest">Archive Empty</div>}
            </div>
          )}

        </div>

        {/* Global Loading Spinner for content */}
        {loadingOrders && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-2.5 rounded-full shadow-2xl font-black text-[10px] flex items-center gap-2 border border-white/10">
             <Loader2 className="w-3 h-3 animate-spin" />
             SYNCING LOGISTICS...
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
