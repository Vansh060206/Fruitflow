"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Store, FileText, CreditCard, Building2 } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { Card } from "@/components/ui/card";

function WholesalerProfileContent() {
    const [mounted, setMounted] = useState(false);
    const { userData } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    const userInitials = userData?.name
        ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'WS';

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            {/* Profile Header */}
            <div className={`relative bg-gradient-to-r from-emerald-800/80 to-green-800/80 rounded-2xl p-8 overflow-hidden border border-border transition-all duration-700 dark:from-emerald-900/50 dark:to-green-900/50 dark:border-white/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-emerald-500/20 border-4 border-white/10 overflow-hidden">
                        {userData?.photoURL ? (
                            <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            userInitials
                        )}
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-bold text-white mb-2">{userData?.name || "Wholesaler Account"}</h1>
                        <p className="text-emerald-100 flex items-center justify-center md:justify-start gap-2 dark:text-emerald-200">
                            <Store className="w-4 h-4" />
                            {userData?.companyName || "Global Fruits Wholesale"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Company Information */}
                <Card className={`md:col-span-2 bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 delay-100 dark:bg-white/5 dark:border-white/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2 dark:text-white">
                            <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                            Company Overview
                        </h3>
                        <Link href="/wholesaler/profile/business" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">
                            <Edit2 className="w-3 h-3" />
                            Edit Profile
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider dark:text-white/40">Company Name</label>
                            <p className="text-foreground font-medium dark:text-white">
                                {userData?.companyName || userData?.name || "Not provided"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider dark:text-white/40">GST Number</label>
                            <p className="text-foreground font-medium flex items-center gap-2 dark:text-white">
                                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                                {userData?.gstNumber || "Not provided"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider dark:text-white/40">Business Type</label>
                            <p className="text-foreground font-medium dark:text-white">
                                {userData?.businessType || "Not provided"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider dark:text-white/40">Contact Email</label>
                            <p className="text-foreground font-medium flex items-center gap-2 dark:text-white">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                {userData?.email || "Not provided"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider dark:text-white/40">Phone</label>
                            <p className="text-foreground font-medium flex items-center gap-2 dark:text-white">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                {userData?.phone || "Not provided"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider dark:text-white/40">Location</label>
                            <p className="text-foreground font-medium flex items-center gap-2 dark:text-white">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                {userData?.city ? `${userData.city}, ${userData.state}` : (userData?.location || "Not provided")}
                            </p>
                        </div>
                    </div>

                    {userData?.description && (
                        <div className="mt-6 pt-6 border-t border-border dark:border-white/5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider dark:text-white/40">About Business</label>
                            <p className="mt-1 text-sm text-foreground/80 dark:text-white/80 leading-relaxed">
                                {userData.description}
                            </p>
                        </div>
                    )}

                    {userData?.address && (
                        <div className="mt-6 pt-6 border-t border-border dark:border-white/5">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider dark:text-white/40">Full Address</label>
                            <p className="mt-1 text-sm text-foreground/80 dark:text-white/80 leading-relaxed">
                                {userData.address}
                                {userData.pincode && `, PIN: ${userData.pincode}`}
                            </p>
                        </div>
                    )}
                </Card>

                {/* Status & Settings */}
                <div className="space-y-6">
                    <Card className={`bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 delay-200 dark:bg-white/5 dark:border-white/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                        <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2 dark:text-white">
                            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                            Account Status
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-sm text-muted-foreground dark:text-white/40">Partner Since</label>
                                <p className="text-foreground font-medium flex items-center gap-2 dark:text-white">
                                    <Calendar className="w-4 h-4 text-muted-foreground dark:text-white/40" />
                                    {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Just now"}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm text-muted-foreground dark:text-white/40">Account Role</label>
                                <div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400 capitalize">
                                        {userData?.role || "Wholesaler"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className={`bg-card/50 backdrop-blur-sm border-border p-6 transition-all duration-700 delay-300 dark:bg-white/5 dark:border-white/10 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                        <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2 dark:text-white">
                            <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                            Settlement
                        </h3>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider dark:text-white/40">Bank Account</label>
                            <p className="text-foreground font-medium dark:text-white">
                                {userData?.bankName ? `${userData.bankName} - ${userData.accountNumber?.slice(-4).padStart(userData.accountNumber.length, '*')}` : "Not configured"}
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function WholesalerProfilePage() {
    return (
        <ProtectedRoute allowedRole="wholesaler">
            <WholesalerProfileContent />
        </ProtectedRoute>
    );
}
