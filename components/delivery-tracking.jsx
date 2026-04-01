"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { 
  Truck, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Phone, 
  User, 
  Clock, 
  AlertCircle, 
  ShieldCheck,
  ChevronRight,
  TrendingUp
} from "lucide-react";

export function DeliveryTracking({ order }) {
  const delivery = order?.delivery;
  if (!delivery) return null;

  const steps = [
    { label: "Order Placed", status: "completed", desc: "We've received your order" },
    { label: "Confirmed", status: (order.status !== 'pending' && order.status !== 'pending_negotiation') ? 'completed' : 'pending', desc: "Wholesaler has confirmed" },
    { label: "Driver Assigned", status: delivery.status ? 'completed' : 'pending', desc: delivery.driverName || "Finding a partner" },
    { label: "Picked Up", status: ['picked_up', 'in_transit', 'delivered'].includes(delivery.status) ? 'completed' : 'pending', desc: "Partner at warehouse" },
    { label: "On the Way", status: ['in_transit', 'delivered'].includes(delivery.status) ? 'completed' : 'active', desc: "Arriving at your store" },
    { label: "Delivered", status: delivery.status === 'delivered' ? 'completed' : 'pending', desc: "Enjoy your fresh fruits!" }
  ];

  const getStepIconColor = (status) => {
    if (status === "completed") return "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]";
    if (status === "active") return "bg-purple-600 animate-pulse shadow-[0_0_20px_rgba(147,51,234,0.5)]";
    return "bg-zinc-200 dark:bg-zinc-800";
  };

  const getStepTextColor = (status) => {
    if (status === "completed") return "text-zinc-900 dark:text-white font-bold";
    if (status === "active") return "text-purple-600 dark:text-purple-400 font-black";
    return "text-zinc-400 dark:text-zinc-600 font-medium";
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Live Map Tracking - The Crown Jewel */}
      <div className="relative group">
         <div className="h-[320px] rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-white/5 shadow-2xl relative">
             <iframe
                width="100%" height="100%" frameBorder="0" style={{ border: 0, filter: 'contrast(1.1) brightness(1.05)' }}
                src={
                   delivery.driverLocation 
                   ? `https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&origin=${delivery.driverLocation.lat},${delivery.driverLocation.lng}&destination=${encodeURIComponent(order.deliveryLocation || "Retailer Store")}&mode=driving&zoom=14`
                   : `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(order.deliveryLocation || "Retailer Store")}&zoom=15`
                }
                allowFullScreen
              ></iframe>

             {/* Status Overlay */}
             <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
                <div className="bg-white/95 backdrop-blur-xl px-5 py-2.5 rounded-2xl shadow-2xl border border-zinc-100 flex items-center gap-3 dark:bg-zinc-950/90 dark:border-white/10 pointer-events-auto">
                   <div className={`w-3 h-3 rounded-full ${delivery.status === 'delivered' ? 'bg-emerald-500' : 'bg-purple-500 animate-ping'}`} />
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 leading-none mb-1">Status</span>
                      <span className="text-sm font-black text-zinc-900 dark:text-white uppercase italic">
                         {delivery.status?.replace('_', ' ') || "PREPARING"}
                      </span>
                   </div>
                </div>

                <div className="bg-emerald-500 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 pointer-events-auto animate-bounce-slow">
                   <ShieldCheck className="w-4 h-4" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Safe Delivery</span>
                </div>
             </div>

             {/* Map Controls */}
             <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3">
                <button className="flex-1 bg-white/90 backdrop-blur-xl dark:bg-zinc-900/90 py-3 rounded-2xl shadow-xl border border-white/20 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 text-zinc-700 dark:text-zinc-300">
                   <TrendingUp className="w-3 h-3 text-emerald-500" /> Live Updates {delivery.driverLocation ? 'Active' : 'Pending'}
                </button>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(order.wholesalerLocation || "Warehouse")}&destination=${encodeURIComponent(order.deliveryLocation || "Retailer Store")}&travelmode=driving`}
                  target="_blank"
                  className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-[0_10px_25px_rgba(147,51,234,0.3)] hover:scale-105 active:scale-95 transition-all"
                >
                   <Navigation className="w-6 h-6" />
                </a>
             </div>
         </div>
      </div>

      {/* 2. Enhanced Driver Card */}
      <div className="p-6 bg-gradient-to-br from-zinc-50 to-white rounded-[2.5rem] border border-zinc-100 shadow-xl dark:from-zinc-900 dark:to-zinc-950 dark:border-white/5 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
         
         <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative">
            <div className="flex items-center gap-5">
               <div className="relative">
                  <div className="w-20 h-20 rounded-3xl bg-zinc-100 flex items-center justify-center text-zinc-300 border border-zinc-200 dark:bg-white/5 dark:border-white/10 overflow-hidden">
                     {delivery.driverImage ? <img src={delivery.driverImage} className="w-full h-full object-cover" /> : <User className="w-10 h-10" />}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center dark:border-zinc-950">
                     <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1.5">
                     <span className="text-[10px] uppercase font-black tracking-widest text-purple-600 bg-purple-500/10 px-2.5 py-0.5 rounded-full dark:text-purple-400">Valued Partner</span>
                  </div>
                  <h4 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">{delivery.driverName}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 font-bold uppercase tracking-tighter">
                     <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> {delivery.vehicleNumber}</span>
                     <span>•</span>
                     <span>{delivery.vehicleType}</span>
                  </div>
               </div>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
               <a 
                href={`tel:${delivery.driverPhone}`}
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-zinc-950 text-white rounded-2xl font-black text-xs hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] active:scale-95 transition-all dark:bg-white dark:text-black"
               >
                  <Phone className="w-4 h-4" /> 
                  CALL PARTNER
               </a>
            </div>
         </div>
      </div>

      {/* 3. Swiggy-Style Vertical Stepper */}
      <Card className="p-8 rounded-[2.5rem] border-zinc-100 dark:border-white/5 dark:bg-zinc-900/40 shadow-inner">
         <h3 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400 mb-8 border-b border-zinc-100 dark:border-white/5 pb-4">Trip Timeline</h3>
         <div className="relative space-y-10 pl-2">
           <div className="absolute left-[17px] top-6 bottom-6 w-[3px] bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              {/* Dynamic progress bar in the line */}
              <div 
                 className="w-full bg-emerald-500 transition-all duration-1000" 
                 style={{ height: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` }}
              />
           </div>
           {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-8 relative">
                 <div className={`z-10 w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-500 ${getStepIconColor(step.status)}`}>
                    <CheckCircle2 className={`w-5 h-5 ${step.status !== 'pending' ? 'text-white' : 'text-zinc-600'}`} />
                 </div>
                 <div className="flex-1 -mt-1">
                    <p className={`text-[15px] tracking-tight ${getStepTextColor(step.status)}`}>{step.label}</p>
                    <p className={`text-[11px] mt-1 font-medium ${step.status === 'active' ? 'text-purple-500 animate-pulse' : 'text-zinc-500 dark:text-zinc-400'}`}>
                       {step.desc}
                    </p>
                 </div>
                 {step.status === 'active' && (
                    <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-[9px] font-black uppercase dark:bg-purple-900/30 dark:text-purple-400">
                       Now
                    </div>
                 )}
              </div>
           ))}
         </div>
      </Card>

      {/* 4. Safety Warning - Modern Look */}
      <div className="p-6 bg-zinc-900 dark:bg-zinc-100 rounded-[2rem] flex items-center justify-between gap-6 group overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-full bg-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
         <div className="flex items-center gap-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center dark:bg-black/5">
               <ShieldCheck className="w-6 h-6 text-emerald-400 dark:text-emerald-600" />
            </div>
            <div>
               <p className="text-white dark:text-zinc-900 font-bold text-sm tracking-tight">Contactless & Safe Delivery</p>
               <p className="text-[10px] text-zinc-500 font-medium">Driver metrics are synced in real-time</p>
            </div>
         </div>
         <ChevronRight className="w-5 h-5 text-zinc-700" />
      </div>

    </div>
  );
}
