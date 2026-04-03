"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/protected-route";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Store } from "lucide-react";

import { useAuth } from "@/lib/auth-context";

function RetailerProfileContent() {
    const [mounted, setMounted] = useState(false);
    const { userData } = useAuth();
    const [totalOrders, setTotalOrders] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Real-time Order Count Listener
    const { ref, onValue } = require("firebase/database");
    const { realtimeDb } = require("@/lib/firebase");

    useEffect(() => {
        if (!userData?.uid) return;
        const ordersRef = ref(realtimeDb, `retailer_orders/${userData.uid}`);
        
        return onValue(ordersRef, (snapshot) => {
            if (snapshot.exists()) {
                const count = Object.keys(snapshot.val()).length;
                setTotalOrders(count);
            } else {
                setTotalOrders(0);
            }
        });
    }, [userData?.uid]);

    const userInitials = userData?.name
        ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'RT';

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            {/* Profile Header */}
            <div className={`relative bg-gradient-to-r from-purple-800/80 to-indigo-800/80 rounded-2xl p-8 overflow-hidden border border-border transition-all duration-700 dark:from-purple-900/50 dark:to-indigo-900/50 dark:border-white/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-purple-500/20 border-4 border-white/10 overflow-hidden">
                        {userData?.photoURL ? (
                            <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            userInitials
                        )}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-bold text-white mb-2">{userData?.name || "Retailer Account"}</h1>
                        <p className="text-purple-100 flex items-center justify-center md:justify-start gap-2 dark:text-purple-200">
                            <Store className="w-4 h-4" />
                            {userData?.storeName || "Fresh Market Store"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Personal Information */}
                <Card className={`md:col-span-2 bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 delay-100 dark:bg-white/5 dark:border-white/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2 dark:text-white">
                            <User className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                            Personal Information
                        </h3>
                        <button className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors dark:text-purple-400 dark:hover:text-purple-300">
                            <Edit2 className="w-3 h-3" />
                            Edit
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm text-muted-foreground dark:text-white/40">Full Name</label>
                                <p className="text-foreground font-medium flex items-center gap-2 dark:text-white">
                                    {userData?.name || "Not provided"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-muted-foreground dark:text-white/40">Email Address</label>
                                <p className="text-foreground font-medium flex items-center gap-2 dark:text-white">
                                    <Mail className="w-4 h-4 text-muted-foreground dark:text-white/40" />
                                    {userData?.email || "Not provided"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-muted-foreground dark:text-white/40">Phone Number</label>
                                <p className="text-foreground font-medium flex items-center gap-2 dark:text-white">
                                    <Phone className="w-4 h-4 text-muted-foreground dark:text-white/40" />
                                    {userData?.phone || "Not provided"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm text-muted-foreground dark:text-white/40">Location</label>
                                <p className="text-foreground font-medium flex items-center gap-2 dark:text-white">
                                    <MapPin className="w-4 h-4 text-muted-foreground dark:text-white/40" />
                                    {userData?.location || "Not provided"}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Account Details */}
                <Card className={`bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 delay-200 dark:bg-white/5 dark:border-white/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                    <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2 dark:text-white">
                        <Store className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                        Store Details
                    </h3>

                    <div className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground dark:text-white/40">System UID (Unique ID)</label>
                            <p className="text-foreground font-mono text-xs max-w-[200px] truncate dark:text-white bg-black/5 dark:bg-white/5 p-1 rounded">
                                {userData?.uid || "Loading..."}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground dark:text-white/40">Member Since</label>
                            <p className="text-foreground font-medium flex items-center gap-2 dark:text-white">
                                <Calendar className="w-4 h-4 text-muted-foreground dark:text-white/40" />
                                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Just now"}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground dark:text-white/40">Account Role</label>
                            <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 border border-purple-500/20 dark:text-purple-400 capitalize">
                                    {userData?.role || "Retailer"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground dark:text-white/40">Total Orders Placed</label>
                            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 transition-all duration-500 transform hover:scale-110">
                                {totalOrders}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default function RetailerProfilePage() {
    return (
        <ProtectedRoute allowedRole="retailer">
            <RetailerProfileContent />
        </ProtectedRoute>
    );
}
