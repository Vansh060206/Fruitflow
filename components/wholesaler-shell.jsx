"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";
import { EmailVerificationWall } from "@/components/EmailVerificationWall";
import {
    LayoutDashboard,
    Package,
    Truck,
    BarChart3,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    X,
    User,
    AlertCircle,
    AlertTriangle,
    Building2
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle"; // Added import

export function WholesalerShell({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const canvasRef = useRef(null);
    const router = useRouter();
    const { logout, userData, user, isEmailVerified, isAuthenticated, isLoading } = useAuth();
    const pathname = usePathname();
    const { language, switchLanguage, t } = useLanguage();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/");
        }
    }, [isLoading, isAuthenticated, router]);

    const userInitials = userData?.name
        ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'WS';

    if (isLoading || !isAuthenticated) return null;


    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            logout();
            router.push("/");
        }
    };

    // ... (keep Canvas Animation useEffect)

    const navLinks = [
        { href: "/wholesaler/dashboard", icon: LayoutDashboard, label: t("dashboard") },
        { href: "/wholesaler/profile/business", icon: Building2, label: "Business Profile" },
        { href: "/wholesaler/inventory", icon: Package, label: t("inventory") },
        { href: "/wholesaler/orders", icon: Truck, label: t("orders") },
        { href: "/wholesaler/analytics", icon: BarChart3, label: t("analytics") },
        { href: "/wholesaler/payments", icon: CreditCard, label: t("payments") },
        { href: "/wholesaler/mandi-prices", icon: BarChart3, label: "Market Prices" },
        { href: "/wholesaler/settings", icon: Settings, label: t("settings") },
    ];

    return (
        <div className="min-h-screen bg-background relative overflow-hidden transition-colors duration-300">
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

            <div className="relative z-10 flex">
                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
                {/* Sidebar */}
                <aside className={`fixed lg:sticky top-0 h-screen bg-card/50 backdrop-blur-xl border-r border-border transition-all duration-300 z-50 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} w-64 shrink-0 dark:bg-white/5 dark:border-white/10`}>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-bold text-foreground dark:text-white">FruitFlow</h1>
                            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <nav className="space-y-2 relative">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg relative overflow-hidden transition-all duration-300 ${isActive ? "text-green-500 font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5"}`}
                                    >
                                        {isActive && (<div className="absolute inset-0 bg-green-500/10 rounded-lg animate-in fade-in duration-300" />)}
                                        {isActive && (<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-green-500 rounded-r-full shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-in slide-in-from-left duration-300" />)}
                                        <Icon className="w-5 h-5 relative z-10" />
                                        <span className="relative z-10">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5 transition-colors w-full">
                            <LogOut className="w-5 h-5" />
                            {t("logout")}
                        </button>
                    </div>
                </aside>

                <main className="flex-1 w-full min-w-0 max-w-full overflow-x-hidden min-h-screen pb-20 lg:pb-0 relative">
                    {/* Header */}
                    <header className="bg-card/50 backdrop-blur-xl border-b border-border px-4 py-3 lg:p-6 sticky top-0 z-30 transition-all duration-300 dark:bg-white/5 dark:border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground">
                                    <Menu className="w-6 h-6" />
                                </button>
                                <div>
                                    <h2 className="text-lg lg:text-2xl font-bold text-foreground transition-all duration-300 dark:text-white truncate max-w-[150px] sm:max-w-none">
                                        {pathname === "/wholesaler/dashboard" && t("dashboard")}
                                        {pathname === "/wholesaler/profile/business" && "Business Profile"}
                                        {pathname === "/wholesaler/inventory" && t("inventory")}
                                        {pathname === "/wholesaler/orders" && t("orders")}
                                        {pathname === "/wholesaler/analytics" && t("analytics")}
                                        {pathname === "/wholesaler/payments" && t("payments")}
                                        {pathname === "/wholesaler/settings" && t("settings")}
                                        {pathname === "/wholesaler/profile" && t("profile")}
                                        {pathname === "/wholesaler/mandi-prices" && "Market Mandi Prices"}
                                    </h2>
                                    <p className="text-muted-foreground text-sm hidden sm:block transition-all duration-300 dark:text-white/60">
                                        {t("welcomeBack")}, {userData?.name || t("partner")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 relative">
                                <ThemeToggle />

                                {/* Language Toggle */}
                                <div className="hidden md:flex items-center gap-2 bg-muted rounded-full p-1 border border-border dark:bg-white/5 dark:border-white/10">
                                    <button
                                        onClick={() => switchLanguage('en')}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${language === 'en' ? 'bg-green-500/20 text-green-500' : 'text-muted-foreground hover:text-foreground dark:text-white/60 dark:hover:text-white'}`}
                                    >
                                        EN
                                    </button>
                                    <button
                                        onClick={() => switchLanguage('hi')}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${language === 'hi' ? 'bg-green-500/20 text-green-500' : 'text-muted-foreground hover:text-foreground dark:text-white/60 dark:hover:text-white'}`}
                                    >
                                        HI
                                    </button>
                                </div>

                                {/* Mobile Logout Fast-Action */}
                                <button
                                    onClick={handleLogout}
                                    className="lg:hidden w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-all active:scale-90"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-5 h-5 text-red-500" />
                                </button>

                                {/* Profile Dropdown Trigger */}
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center hover:bg-green-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50 relative z-50 overflow-hidden"
                                >
                                    {userData?.photoURL ? (
                                        <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-green-500 font-semibold">{userInitials}</span>
                                    )}
                                </button>

                                {/* Profile Dropdown Menu */}
                                {isProfileOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsProfileOpen(false)}
                                        />
                                        <div className="absolute right-0 top-12 w-64 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 dark:bg-[#1a1a1a] dark:border-white/10">
                                            <div className="p-4 border-b border-border bg-muted/50 dark:bg-white/5 dark:border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center overflow-hidden">
                                                        {userData?.photoURL ? (
                                                            <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-green-500 font-bold">{userInitials}</span>
                                                        )}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-foreground font-medium truncate">{userData?.name || t("partner")}</p>
                                                        <p className="text-muted-foreground text-xs truncate">{userData?.email || "No email provided"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-1 space-y-1">
                                                <Link
                                                    href="/wholesaler/profile"
                                                    className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors text-sm dark:text-white/70 dark:hover:text-white dark:hover:bg-white/5"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <User className="w-4 h-4" />
                                                    {t("profile")}
                                                </Link>
                                                <Link
                                                    href="/wholesaler/settings"
                                                    className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors text-sm dark:text-white/70 dark:hover:text-white dark:hover:bg-white/5"
                                                    onClick={() => setIsProfileOpen(false)}
                                                >
                                                    <Settings className="w-4 h-4" />
                                                    {t("accountSettings")}
                                                </Link>
                                            </div>
                                            <div className="p-1 border-t border-border dark:border-white/5">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    {t("signOut")}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </header>


                    {/* Security Banners */}
                    <div className="px-6 pt-6 -mb-2 space-y-3">
                        {userData && (!userData.phone || !userData.gstNumber) && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top duration-500">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground dark:text-white">Complete your business profile</p>
                                        <p className="text-xs text-muted-foreground dark:text-white/60">GST number and phone are required for full trading access.</p>
                                    </div>
                                </div>
                                <Link href="/wholesaler/profile/business" className="text-xs font-bold text-amber-500 hover:underline">Complete Now</Link>
                            </div>
                        )}
                        {user && !isEmailVerified && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top duration-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <AlertCircle className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground dark:text-white">Email not verified</p>
                                        <p className="text-xs text-muted-foreground dark:text-white/60">Please verify your email to secure your account.</p>
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-blue-500 hover:underline" onClick={() => {
                                    router.push("/verify-account");
                                }}>Verify Email</button>
                            </div>
                        )}
                    </div>

                    <EmailVerificationWall>
                        {children}
                    </EmailVerificationWall>
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border dark:bg-zinc-950/95 dark:border-white/10">
                <div className="grid grid-cols-5 h-16">
                    {[
                        { href: "/wholesaler/dashboard", icon: LayoutDashboard, label: "Home" },
                        { href: "/wholesaler/inventory", icon: Package, label: "Stock" },
                        { href: "/wholesaler/orders", icon: Truck, label: "Orders" },
                        { href: "/wholesaler/analytics", icon: BarChart3, label: "Stats" },
                        { href: "/wholesaler/settings", icon: Settings, label: "More" },
                    ].map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-1 relative transition-all active:scale-90 ${isActive ? "text-emerald-500" : "text-muted-foreground dark:text-white/40"}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-500 rounded-full" />}
                                <div className={`relative p-1.5 rounded-xl transition-all ${isActive ? "bg-emerald-500/15" : ""}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? "text-emerald-500" : ""}`}>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
