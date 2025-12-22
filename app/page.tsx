"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

function FloatingFruit({
  emoji,
  delay,
  duration,
  startX,
  startY,
  layer,
}: {
  emoji: string
  delay: number
  duration: number
  startX: number
  startY: number
  layer: "front" | "back"
}) {
  return (
    <div
      className={`absolute pointer-events-none ${layer === "back" ? "text-6xl opacity-20 blur-sm" : "text-7xl md:text-8xl opacity-30"}`}
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        animation: `float-${layer} ${duration}s ease-in-out ${delay}s infinite`,
        filter: `drop-shadow(0 0 20px ${emoji === "🍎" ? "rgba(239, 68, 68, 0.3)" : emoji === "🍌" ? "rgba(234, 179, 8, 0.3)" : "rgba(249, 115, 22, 0.3)"})`,
        zIndex: layer === "front" ? 5 : 1,
      }}
    >
      {emoji}
    </div>
  )
}

export default function RoleSelectionPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fruits = [
    // Background layer
    { emoji: "🍎", delay: 0, duration: 25, startX: 5, startY: 15, layer: "back" as const },
    { emoji: "🍌", delay: 4, duration: 28, startX: 85, startY: 20, layer: "back" as const },
    { emoji: "🍊", delay: 2, duration: 26, startX: 10, startY: 75, layer: "back" as const },
    // Foreground layer
    { emoji: "🍎", delay: 3, duration: 22, startX: 15, startY: 25, layer: "front" as const },
    { emoji: "🍌", delay: 1, duration: 24, startX: 80, startY: 10, layer: "front" as const },
    { emoji: "🍊", delay: 5, duration: 23, startX: 12, startY: 65, layer: "front" as const },
    { emoji: "🍎", delay: 2.5, duration: 26, startX: 90, startY: 55, layer: "front" as const },
    { emoji: "🍌", delay: 4.5, duration: 27, startX: 50, startY: 8, layer: "front" as const },
    { emoji: "🍊", delay: 1.5, duration: 25, startX: 88, startY: 80, layer: "front" as const },
  ]

  return (
    <>
      <style jsx global>{`
        @keyframes float-front {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(35px, -40px) rotate(8deg);
          }
          50% {
            transform: translate(-25px, 25px) rotate(-6deg);
          }
          75% {
            transform: translate(30px, 35px) rotate(5deg);
          }
        }

        @keyframes float-back {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(20px, -25px) rotate(4deg);
          }
          50% {
            transform: translate(-15px, 20px) rotate(-3deg);
          }
          75% {
            transform: translate(18px, 28px) rotate(2deg);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardSlideIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>

      <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.15) 0%, transparent 40%)",
            animation: "gradientShift 15s ease infinite",
            backgroundSize: "200% 200%",
          }}
        />

        {/* Animated fruit background */}
        {mounted && fruits.map((fruit, index) => <FloatingFruit key={index} {...fruit} />)}

        {/* Main content */}
        <div className="w-full max-w-4xl z-10">
          {/* Glassmorphism container */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl">
            <div
              className="text-center mb-12"
              style={{
                animation: mounted ? "fadeIn 0.8s ease-out" : "none",
              }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">Who are you?</h1>
              <p className="text-lg text-white/60">Choose how you want to continue</p>
            </div>

            <div
              className="w-32 h-1 mx-auto mb-12 rounded-full relative overflow-hidden"
              style={{
                background: "linear-gradient(90deg, rgba(59, 130, 246, 0.5), rgba(16, 185, 129, 0.5))",
                animation: mounted ? "fadeIn 1s ease-out 0.3s backwards" : "none",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)",
                  animation: "shimmer 2s ease-in-out infinite",
                }}
              />
            </div>

            {/* Role cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Link href="/wholesaler/login" className="group">
                <Card
                  className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-[#3b82f6]/50 hover:bg-white/10 transition-all duration-500 cursor-pointer p-8 rounded-2xl h-full min-h-[240px] flex flex-col items-center justify-center relative overflow-hidden"
                  style={{
                    animation: mounted ? "cardSlideIn 0.8s ease-out 0.4s backwards" : "none",
                    boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/10 via-transparent to-transparent" />
                    <div className="absolute inset-[-2px] rounded-2xl bg-gradient-to-br from-[#3b82f6]/30 to-transparent blur-xl" />
                  </div>

                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl" />

                  <div
                    className="text-center relative z-10 group-hover:scale-[1.02] transition-transform duration-500"
                    style={{ transform: "translateZ(20px)" }}
                  >
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full bg-[#3b82f6]/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#3b82f6]/20 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-8 h-8 text-[#3b82f6] group-hover:scale-110 transition-transform duration-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                        />
                      </svg>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-semibold text-white mb-2">Wholesaler</h2>

                    {/* Description */}
                    <p className="text-white/50 text-sm">Manage inventory, orders, and distribution</p>
                  </div>
                </Card>
              </Link>

              <Link href="/retailer/login" className="group">
                <Card
                  className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-[#10b981]/50 hover:bg-white/10 transition-all duration-500 cursor-pointer p-8 rounded-2xl h-full min-h-[240px] flex flex-col items-center justify-center relative overflow-hidden"
                  style={{
                    animation: mounted ? "cardSlideIn 0.8s ease-out 0.6s backwards" : "none",
                    boxShadow: "0 0 0 0 rgba(16, 185, 129, 0)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/10 via-transparent to-transparent" />
                    <div className="absolute inset-[-2px] rounded-2xl bg-gradient-to-br from-[#10b981]/30 to-transparent blur-xl" />
                  </div>

                  <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl" />

                  <div
                    className="text-center relative z-10 group-hover:scale-[1.02] transition-transform duration-500"
                    style={{ transform: "translateZ(20px)" }}
                  >
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#10b981]/20 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-8 h-8 text-[#10b981] group-hover:scale-110 transition-transform duration-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                        />
                      </svg>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-semibold text-white mb-2">Retailer</h2>

                    {/* Description */}
                    <p className="text-white/50 text-sm">Browse products and place orders</p>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
