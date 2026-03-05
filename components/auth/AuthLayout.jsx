"use client";
import Link from "next/link";
import { Apple, Store, Truck } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { ThemeToggle } from "@/components/theme-toggle"; // Added import

export default function AuthLayout({ children, role, title, subtitle }) {
    const { t } = useLanguage();
    const currentRole = role === "wholesaler" ? "wholesaler" : "retailer";
    const theme = {
        retailer: {
            primary: "bg-emerald-600",
            primaryHover: "hover:bg-emerald-700",
            secondary: "bg-emerald-50 dark:bg-emerald-950/20",
            text: "text-emerald-900 dark:text-emerald-100",
            subtitleText: "text-emerald-800/70 dark:text-emerald-100/60",
            accent: "text-emerald-600 dark:text-emerald-400",
            illustration: "from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-900",
            shape1: "bg-emerald-300 dark:bg-emerald-700",
            shape2: "bg-teal-300 dark:bg-teal-700",
            icon: <Store className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />,
        },
        wholesaler: {
            primary: "bg-amber-600",
            primaryHover: "hover:bg-amber-700",
            secondary: "bg-amber-50 dark:bg-amber-950/20",
            text: "text-amber-900 dark:text-amber-100",
            subtitleText: "text-amber-800/70 dark:text-amber-100/60",
            accent: "text-amber-600 dark:text-amber-400",
            illustration: "from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900",
            shape1: "bg-amber-300 dark:bg-amber-700",
            shape2: "bg-orange-300 dark:bg-orange-700",
            icon: <Truck className="w-12 h-12 text-amber-600 dark:text-amber-400" />,
        },
    }[currentRole];

    return (
        <div className="flex min-h-screen w-full overflow-hidden bg-background font-sans transition-colors duration-300">
            {/* Left Panel - Illustration */}
            <div className={`hidden w-1/2 lg:flex flex-col justify-center items-center relative overflow-hidden bg-gradient-to-br transition-colors duration-300 ${theme.illustration}`}>
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 w-full h-full">
                    <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full ${theme.shape1} blur-[100px] opacity-40 animate-pulse`} />
                    <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full ${theme.shape2} blur-[100px] opacity-40 animate-pulse`} style={{ animationDelay: "2s" }} />

                    {/* Stylized Tree/Organic shapes mimicking the reference art */}
                    <svg className="absolute left-0 bottom-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 400">
                        <path d="M0,400 C150,400 150,200 200,200 C250,200 250,0 250,0 L0,0 Z" fill="currentColor" className={currentRole === 'retailer' ? 'text-emerald-900/40 dark:text-emerald-200/20' : 'text-amber-900/40 dark:text-amber-200/20'} />
                    </svg>
                </div>

                <div className="relative z-10 flex flex-col items-center p-12 text-center max-w-lg">
                    {/* Main Visual Placeholder since image generation failed */}
                    <div className="w-[450px] h-[450px] relative mb-8 group perspective-1000">
                        <div className={`absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/30 dark:border-white/10 transform transition-transform duration-700 hover:rotate-y-12 flex items-center justify-center overflow-hidden`}>
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                            <div className="flex flex-col items-center gap-6 p-8">
                                <div className={`p-6 rounded-full ${theme.secondary} shadow-inner transition-colors duration-300`}>
                                    {theme.icon}
                                </div>
                                <div className="space-y-2">
                                    <h3 className={`text-2xl font-bold ${theme.text} transition-colors duration-300`}>
                                        {t("role") || "Role"}: {currentRole === 'retailer' ? t("retailer") : t("wholesaler")}
                                    </h3>
                                    <p className={`${theme.subtitleText} text-sm transition-colors duration-300`}>
                                        {currentRole === 'retailer'
                                            ? t("retailerRoleDesc")
                                            : t("wholesalerRoleDesc")
                                        }
                                    </p>
                                </div>
                                {/* Decorative stylized fruit */}
                                <div className="flex gap-4 mt-4 opacity-50">
                                    <Apple className={`w-8 h-8 ${currentRole === 'retailer' ? 'text-red-500/80 dark:text-red-400' : 'text-orange-600/80 dark:text-orange-500'}`} />
                                    <div className={`w-6 h-6 rounded-full ${currentRole === 'retailer' ? 'bg-yellow-500/80 dark:bg-yellow-400' : 'bg-green-600/80 dark:bg-green-500'}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <h1 className={`text-4xl font-bold mb-4 tracking-tight ${theme.text} transition-colors duration-300`}>{t("welcomeToFamily")}</h1>
                    <p className={`text-lg ${theme.subtitleText} font-medium transition-colors duration-300`}>{t("communityDesc")}</p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex w-full flex-col justify-center items-center bg-background lg:w-1/2 p-8 lg:p-12 relative transition-colors duration-300">
                {/* Theme Toggle Button - Absolute Positioned */}
                <div className="absolute top-8 right-8 z-50">
                    <ThemeToggle />
                </div>

                {/* Mobile Header for context */}
                <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${theme.secondary}`}>
                        <Apple className={`w-6 h-6 ${theme.accent}`} />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-foreground">Fruitflow</span>
                </div>

                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center lg:text-left space-y-2">
                        <p className={`font-semibold tracking-wide uppercase text-xs ${theme.accent}`}>
                            {currentRole === 'wholesaler' ? t("forSellers") : t("forBuyers")}
                        </p>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground transition-colors duration-300">{title}</h2>
                        <p className="text-muted-foreground transition-colors duration-300">{subtitle}</p>
                    </div>

                    {/* Theme Switcher / Role Toggle */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center justify-center lg:justify-start gap-4 p-1 bg-muted rounded-lg w-fit transition-colors duration-300 dark:bg-white/5 dark:border dark:border-white/10">
                            <Link href="?role=retailer" className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentRole === 'retailer'
                                ? 'bg-background text-emerald-600 shadow-sm dark:bg-white/10 dark:text-emerald-400'
                                : 'text-muted-foreground hover:text-foreground'}`}>
                                {t("retailer")}
                            </Link>
                            <Link href="?role=wholesaler" className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${currentRole === 'wholesaler'
                                ? 'bg-background text-amber-600 shadow-sm dark:bg-white/10 dark:text-amber-400'
                                : 'text-muted-foreground hover:text-foreground'}`}>
                                {t("wholesaler")}
                            </Link>
                        </div>
                    </div>

                    {children}
                </div>
            </div>
        </div>);
}
