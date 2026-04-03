"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { ArrowRight, Leaf, TrendingUp, Cpu, ShieldCheck, Network, Sparkles, Sprout, ShoppingCart, Truck } from "lucide-react";

const fruitsData = [
  { emoji: "🥭", left: "10%", top: "20%", delay: 0, duration: 20 },
  { emoji: "🍎", left: "85%", top: "15%", delay: 2, duration: 25 },
  { emoji: "🍊", left: "15%", top: "75%", delay: 1, duration: 22 },
  { emoji: "🍇", left: "75%", top: "80%", delay: 3, duration: 28 },
];

function FloatingFruit({ emoji, left, top, delay, duration }) {
  return (
    <div
      className="absolute text-6xl opacity-10 pointer-events-none select-none transition-opacity duration-1000"
      style={{
        left,
        top,
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      {emoji}
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { t, language, switchLanguage } = useLanguage();
  const { isAuthenticated, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
      // Auto-forward logged-in users directly to their dashboard
      if (!isLoading && isAuthenticated && role) {
          router.push(role === 'wholesaler' ? '/wholesaler/dashboard' : role === 'driver' ? '/driver/dashboard' : '/retailer/dashboard');
      }
  }, [isLoading, isAuthenticated, role, router]);

  const features = [
    {
      title: "AI-Powered Predictions",
      desc: "Google Gemini 2.5 Flash predicts exactly what fruits you need to stock up on based on historical deep-learning.",
      icon: Cpu,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "Real-Time Spoilage Tracking",
      desc: "Live analytics that decay freshness percentages dynamically, tracking your financial wastage down to the rupee.",
      icon: Leaf,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Automated PDF Invoicing",
      desc: "Retailers can instantly download legally compliant PDF digital invoices the second an order is marked 'Delivered'.",
      icon: ShieldCheck,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "The B2B Khata System",
      desc: "Seamlessly map 'Pay on Credit' logistics. Keep absolute track of what shops owe your regional warehouse.",
      icon: TrendingUp,
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    }
  ];

  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-20px, 30px) rotate(5deg); }
          66% { transform: translate(20px, -20px) rotate(-5deg); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes textShimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>

      <div className="min-h-screen w-full bg-background relative overflow-x-hidden text-foreground selection:bg-emerald-500/30 font-sans max-w-full">
        
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-[80vh] opacity-30 dark:opacity-20 pointer-events-none" style={{
          background: "radial-gradient(circle at 15% 50%, rgba(16, 185, 129, 0.4), transparent 40%), radial-gradient(circle at 85% 30%, rgba(59, 130, 246, 0.4), transparent 40%)",
          animation: "gradientShift 15s ease infinite",
          backgroundSize: "200% 200%"
        }} />

        {/* Floating Fruits */}
        {mounted && fruitsData.map((fruit, index) => <FloatingFruit key={index} {...fruit} />)}

        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between backdrop-blur-xl border-b border-border/50 bg-background/60">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-200">
              FruitFlow
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-full border border-border">
              <button onClick={() => switchLanguage('en')} className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${language === 'en' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>EN</button>
              <button onClick={() => switchLanguage('hi')} className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${language === 'hi' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>हिं</button>
            </div>
            <ThemeToggle />
            <a href="#roles" className="hidden sm:flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform">
              Get Started <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="truncate">The Future of B2B Agriculture</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 sm:mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 break-words w-full">
            Revolutionizing the <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-[length:200%_auto] block mt-2 px-2" style={{
              backgroundImage: 'linear-gradient(to right, #10b981, #3b82f6, #10b981)',
              animation: 'textShimmer 3s infinite linear'
            }}>
              Fruit Supply Chain.
            </span>
          </h1>
 Broadway
          <p className="text-base sm:text-lg md:text-2xl text-muted-foreground max-w-3xl mb-10 sm:mb-12 font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 px-2 sm:px-0">
            A state-of-the-art logistics engine connecting Wholesale Distributors directly to Retail Shops. Built with Real-time synchronization, AI Demand Prediction, and dynamic Khata Ledgers.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <a href="#roles" className="h-14 px-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/20 hover:scale-105 w-full sm:w-auto">
              Open Platform Access
              <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#features" className="h-14 px-8 rounded-full bg-muted hover:bg-muted/80 text-foreground font-bold text-lg flex items-center justify-center gap-2 transition-all w-full sm:w-auto border border-border">
              Explore Enterprise Features
            </a>
          </div>
        </section>

        {/* Dynamic Features Grid */}
        <section id="features" className="py-24 bg-muted/30 border-y border-border relative z-10 max-w-full overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4 px-2">Enterprise-grade capabilities</h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">Stop managing hundreds of kilograms of perishable items with pen and paper. Leverage modern software infrastructure.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feat, i) => (
                <Card key={i} className="p-6 bg-card hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-border group overflow-hidden relative">
                  <div className={`w-14 h-14 rounded-2xl ${feat.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feat.icon className={`w-7 h-7 ${feat.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Roles / Get Started Section */}
        <section id="roles" className="py-24 md:py-32 px-4 md:px-6 max-w-6xl mx-auto relative z-10">
          <div className="bg-card border border-border rounded-[2rem] md:rounded-[3rem] p-6 md:p-16 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="text-center mb-8 md:mb-16 relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-2 md:mb-4">Choose Your Vector</h2>
              <p className="text-sm md:text-lg text-muted-foreground hidden sm:block">Select your role to instantly access your customized command center.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative z-10">
              {/* Wholesaler Card */}
              <Link href="/login?role=wholesaler" className="group h-full">
                <Card className="p-4 md:p-10 bg-background/50 backdrop-blur-md border-border hover:border-blue-500/50 transition-all duration-500 overflow-hidden relative h-full flex flex-col items-center justify-center text-center group-hover:bg-blue-500/5 group-hover:-translate-y-2">
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-blue-500/10 flex items-center justify-center mb-4 md:mb-8 group-hover:bg-blue-500 transition-colors duration-500">
                    <Network className="w-8 h-8 md:w-12 md:h-12 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">{t("wholesaler") || "Wholesaler Login"}</h3>
                  <p className="text-muted-foreground mb-4 md:mb-8 text-xs md:text-base px-2 md:px-4 hidden sm:block">Manage multi-ton inventories, accept bulk orders from retailers, and analyze AI spoilage reports.</p>
                  <span className="mt-auto px-4 md:px-6 py-2 md:py-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm md:text-base font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors flex items-center gap-2">
                    Enter Dashboard <ArrowRight className="w-4 h-4" />
                  </span>
                </Card>
              </Link>

              {/* Retailer Card */}
              <Link href="/login?role=retailer" className="group h-full">
                <Card className="p-4 md:p-10 bg-background/50 backdrop-blur-md border-border hover:border-emerald-500/50 transition-all duration-500 overflow-hidden relative h-full flex flex-col items-center justify-center text-center group-hover:bg-emerald-500/5 group-hover:-translate-y-2">
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-4 md:mb-8 group-hover:bg-emerald-500 transition-colors duration-500">
                    <ShoppingCart className="w-8 h-8 md:w-12 md:h-12 text-emerald-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">{t("retailer") || "Retailer Login"}</h3>
                  <p className="text-muted-foreground mb-4 md:mb-8 text-xs md:text-base px-2 md:px-4 hidden sm:block">Browse live regional fruit catalogs, negotiate bulk pricing, and restock your store instantly.</p>
                  <span className="mt-auto px-4 md:px-6 py-2 md:py-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm md:text-base font-bold group-hover:bg-emerald-500 group-hover:text-white transition-colors flex items-center gap-2">
                    Open Catalog <ArrowRight className="w-4 h-4" />
                  </span>
                </Card>
              </Link>

              {/* Driver Card */}
              <Link href="/login?role=driver" className="group h-full">
                <Card className="p-4 md:p-10 bg-background/50 backdrop-blur-md border-border hover:border-purple-500/50 transition-all duration-500 overflow-hidden relative h-full flex flex-col items-center justify-center text-center group-hover:bg-purple-500/5 group-hover:-translate-y-2">
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-purple-500/10 flex items-center justify-center mb-4 md:mb-8 group-hover:bg-purple-500 transition-colors duration-500">
                    <Truck className="w-8 h-8 md:w-12 md:h-12 text-purple-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">{t("driver") || "Driver Login"}</h3>
                  <p className="text-muted-foreground mb-4 md:mb-8 text-xs md:text-base px-2 md:px-4 hidden sm:block">Manage and execute live delivery routes from Wholesalers to Retailers and track transit status dynamically.</p>
                  <span className="mt-auto px-4 md:px-6 py-2 md:py-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm md:text-base font-bold group-hover:bg-purple-500 group-hover:text-white transition-colors flex items-center gap-2">
                    Start Driving <ArrowRight className="w-4 h-4" />
                  </span>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border bg-muted/20 py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Sprout className="w-6 h-6 text-emerald-500" />
              <span className="text-xl font-bold">FruitFlow Technologies</span>
            </div>
            <p className="text-muted-foreground text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} FruitFlow. All rights reserved. A Portfolio Masterpiece.
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}
