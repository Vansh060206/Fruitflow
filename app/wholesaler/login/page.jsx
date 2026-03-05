"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
export default function WholesalerLoginPage() {
    const [mounted, setMounted] = useState(false);
    const { login, isAuthenticated, role } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    useEffect(() => {
        setMounted(true);
    }, []);
    useEffect(() => {
        if (isAuthenticated && role === "wholesaler") {
            router.push("/wholesaler/dashboard");
        }
    }, [isAuthenticated, role, router]);
    const handleLogin = (e) => {
        e.preventDefault();
        login("wholesaler");
        router.push("/wholesaler/dashboard");
    };
    return (<div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {/* Background layer with blur */}
        {[
            {
                emoji: "🥭",
                left: "8%",
                top: "25%",
                delay: 0,
                duration: 28,
                size: "text-7xl md:text-8xl",
                opacity: "opacity-20",
                blur: "blur-sm",
            },
            {
                emoji: "🍎",
                left: "15%",
                top: "55%",
                delay: 4,
                duration: 32,
                size: "text-6xl md:text-7xl",
                opacity: "opacity-20",
                blur: "blur-sm",
            },
            {
                emoji: "🍊",
                left: "5%",
                top: "75%",
                delay: 2,
                duration: 30,
                size: "text-7xl md:text-8xl",
                opacity: "opacity-20",
                blur: "blur-sm",
            },
        ].map((fruit, i) => (<div key={`back-${i}`} className={`absolute ${fruit.size} ${fruit.opacity} ${fruit.blur}`} style={{
                left: fruit.left,
                top: fruit.top,
                animation: `floatSlow ${fruit.duration}s ease-in-out infinite`,
                animationDelay: `${fruit.delay}s`,
            }}>
            {fruit.emoji}
          </div>))}

        {[
            {
                emoji: "🥭",
                left: "12%",
                top: "20%",
                delay: 1,
                duration: 25,
                size: "text-8xl md:text-9xl",
                glow: "drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]",
            },
            {
                emoji: "🍎",
                left: "18%",
                top: "50%",
                delay: 3,
                duration: 27,
                size: "text-9xl md:text-[10rem]",
                glow: "drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]",
            },
            {
                emoji: "🍊",
                left: "8%",
                top: "70%",
                delay: 5,
                duration: 26,
                size: "text-8xl md:text-9xl",
                glow: "drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]",
            },
            {
                emoji: "🥭",
                left: "85%",
                top: "15%",
                delay: 2,
                duration: 29,
                size: "text-7xl md:text-8xl",
                glow: "drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]",
            },
            {
                emoji: "🍎",
                left: "50%",
                top: "85%",
                delay: 4,
                duration: 28,
                size: "text-7xl md:text-8xl",
                glow: "drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]",
            },
            {
                emoji: "🍊",
                left: "90%",
                top: "60%",
                delay: 1.5,
                duration: 30,
                size: "text-7xl md:text-8xl",
                glow: "drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]",
            },
        ].map((fruit, i) => (<div key={`front-${i}`} className={`absolute ${fruit.size} opacity-30`} style={{
                left: fruit.left,
                top: fruit.top,
                animation: `floatComplex ${fruit.duration}s ease-in-out infinite`,
                animationDelay: `${fruit.delay}s`,
                filter: fruit.glow,
            }}>
            {fruit.emoji}
          </div>))}
      </div>

      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20 pointer-events-none blur-3xl" style={{
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)",
        }}/>

      <div className={`bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl max-w-md w-full relative z-10 transition-all duration-700 hover:shadow-[0_0_50px_rgba(16,185,129,0.15)] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 text-balance">FruitFlow</h1>
          <p className="text-white/60">Wholesaler Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-white/80 text-sm mb-2 block">Email</label>
            <input type="email" placeholder="wholesaler@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300"/>
          </div>

          <div>
            <label className="text-white/80 text-sm mb-2 block">Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300"/>
          </div>

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group" style={{
            boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)",
        }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
            background: "radial-gradient(circle at center, rgba(16, 185, 129, 0.4) 0%, transparent 70%)",
            animation: "breathe 2s ease-in-out infinite",
        }}/>
            <span className="relative z-10">Login</span>
          </button>

          <div className="text-center mt-4">
            <button type="button" className="text-white/60 hover:text-white text-sm transition-colors duration-200">
              Forgot password?
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes floatSlow {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(-15px, 20px) rotate(3deg);
          }
          66% {
            transform: translate(15px, -15px) rotate(-2deg);
          }
        }

        @keyframes floatComplex {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(30px, -35px) rotate(6deg);
          }
          50% {
            transform: translate(-20px, 25px) rotate(-5deg);
          }
          75% {
            transform: translate(25px, 30px) rotate(4deg);
          }
        }

        @keyframes breathe {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>);
}
