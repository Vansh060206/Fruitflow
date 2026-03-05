"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/lib/language-context";

// Sample animated fruits for the background
const fruitsData = [
  { emoji: "🥭", left: "10%", top: "20%", delay: 0, duration: 20 },
  { emoji: "🍎", left: "85%", top: "15%", delay: 2, duration: 25 },
  { emoji: "🍊", left: "15%", top: "75%", delay: 1, duration: 22 },
  { emoji: "🍇", left: "75%", top: "80%", delay: 3, duration: 28 },
  { emoji: "🍓", left: "45%", top: "10%", delay: 4, duration: 24 },
  { emoji: "🍍", left: "5%", top: "45%", delay: 5, duration: 26 },
  { emoji: "🥝", left: "92%", top: "45%", delay: 1.5, duration: 23 },
  { emoji: "🍉", left: "50%", top: "85%", delay: 3.5, duration: 30 },
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

export default function RoleSelectionPage() {
  const [mounted, setMounted] = useState(false);
  const { t, language, switchLanguage } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 opacity-30 dark:opacity-20" style={{
          background: "radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.15) 0%, transparent 40%)",
          animation: "gradientShift 15s ease infinite",
          backgroundSize: "200% 200%",
        }} />

        {/* Premium Header Controls */}
        <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tighter text-foreground">FruitFlow</span>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="flex items-center gap-1 bg-card/50 backdrop-blur-xl border border-border p-1 rounded-full shadow-lg dark:bg-white/5 dark:border-white/10">
              <button
                onClick={() => switchLanguage('en')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                EN
              </button>
              <button
                onClick={() => switchLanguage('hi')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'hi' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                हिं
              </button>
            </div>
            <div className="flex items-center justify-center bg-card/50 backdrop-blur-xl border border-border w-10 h-10 rounded-full shadow-lg dark:bg-white/5 dark:border-white/10">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Animated fruit background */}
        {mounted && fruitsData.map((fruit, index) => <FloatingFruit key={index} {...fruit} />)}

        {/* Main content */}
        <div className="w-full max-w-4xl z-10">
          <div className="bg-card/50 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-16 border border-border shadow-2xl dark:bg-white/5 dark:border-white/10">
            <div className="text-center mb-12" style={{
              animation: mounted ? "fadeIn 0.8s ease-out" : "none",
            }}>
              <h1 className="text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight dark:text-white leading-tight">
                {t("whoAreYou") || "Welcome to FruitFlow"}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium dark:text-white/60">
                {t("chooseHowToContinue") || "Choose your role to get started with our fresh ecosystem"}
              </p>
            </div>

            <div className="w-32 h-1.5 mx-auto mb-16 rounded-full relative overflow-hidden bg-muted/30">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500" />
              <div className="absolute inset-0" style={{
                background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)",
                animation: "shimmer 2s ease-in-out infinite",
              }} />
            </div>

            {/* Role cards */}
            <div className="grid md:grid-cols-2 gap-8">
              <Link href="/login?role=wholesaler" className="group">
                <Card className="bg-white/40 backdrop-blur-md border-border/50 hover:border-blue-500/50 hover:bg-white transition-all duration-500 cursor-pointer p-10 rounded-3xl h-full min-h-[280px] flex flex-col items-center justify-center relative overflow-hidden dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-blue-500/30" style={{
                  animation: mounted ? "cardSlideIn 0.8s ease-out 0.4s backwards" : "none",
                }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-blue-500/5 to-transparent" />

                  <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-8 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 group-hover:shadow-[0_20px_40px_rgba(59,130,246,0.3)]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                    </svg>
                  </div>

                  <h2 className="text-3xl font-bold text-foreground mb-3 dark:text-white">{t("wholesaler") || "Wholesaler"}</h2>
                  <p className="text-muted-foreground text-center text-sm dark:text-white/50 leading-relaxed px-4">
                    {t("wholesalerRoleDesc") || "Manage large-scale distributions, inventory, and predict demand with AI."}
                  </p>
                </Card>
              </Link>

              <Link href="/login?role=retailer" className="group">
                <Card className="bg-white/40 backdrop-blur-md border-border/50 hover:border-emerald-500/50 hover:bg-white transition-all duration-500 cursor-pointer p-10 rounded-3xl h-full min-h-[280px] flex flex-col items-center justify-center relative overflow-hidden dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-emerald-500/30" style={{
                  animation: mounted ? "cardSlideIn 0.8s ease-out 0.6s backwards" : "none",
                }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-emerald-500/5 to-transparent" />

                  <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 group-hover:shadow-[0_20px_40px_rgba(16,185,129,0.3)]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-emerald-600 group-hover:text-white transition-colors">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                    </svg>
                  </div>

                  <h2 className="text-3xl font-bold text-foreground mb-3 dark:text-white">{t("retailer") || "Retailer"}</h2>
                  <p className="text-muted-foreground text-center text-sm dark:text-white/50 leading-relaxed px-4">
                    {t("retailerRoleDesc") || "Browse fresh inventory, place orders, and manage your local shop effortlessly."}
                  </p>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
