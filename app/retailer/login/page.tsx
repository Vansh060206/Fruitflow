"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface Fruit {
  emoji: string
  x: number
  y: number
  speedX: number
  speedY: number
  rotation: number
  rotationSpeed: number
  size: number
  layer: "back" | "front"
}

export default function RetailerLoginPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { login, isAuthenticated, role } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isAuthenticated && role === "retailer") {
      router.push("/retailer/dashboard")
    }
  }, [isAuthenticated, role, router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    login("retailer")
    router.push("/retailer/dashboard")
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const fruits: Fruit[] = [
      // Background layer
      {
        emoji: "🍇",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedX: 0.15,
        speedY: 0.1,
        rotation: 0,
        rotationSpeed: 0.005,
        size: 60,
        layer: "back",
      },
      {
        emoji: "🍎",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedX: -0.1,
        speedY: 0.15,
        rotation: 0,
        rotationSpeed: -0.005,
        size: 55,
        layer: "back",
      },
      // Foreground layer - larger and more prominent
      {
        emoji: "🍇",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedX: 0.25,
        speedY: 0.2,
        rotation: 0,
        rotationSpeed: 0.008,
        size: 80,
        layer: "front",
      },
      {
        emoji: "🍎",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedX: -0.2,
        speedY: 0.25,
        rotation: 0,
        rotationSpeed: -0.008,
        size: 85,
        layer: "front",
      },
      {
        emoji: "🍊",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedX: 0.22,
        speedY: -0.22,
        rotation: 0,
        rotationSpeed: 0.01,
        size: 75,
        layer: "front",
      },
      {
        emoji: "🍇",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedX: -0.25,
        speedY: -0.18,
        rotation: 0,
        rotationSpeed: -0.009,
        size: 78,
        layer: "front",
      },
      {
        emoji: "🍎",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedX: 0.18,
        speedY: 0.28,
        rotation: 0,
        rotationSpeed: 0.007,
        size: 82,
        layer: "front",
      },
      {
        emoji: "🍊",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speedX: -0.22,
        speedY: 0.2,
        rotation: 0,
        rotationSpeed: -0.008,
        size: 76,
        layer: "front",
      },
    ]

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      fruits
        .filter((f) => f.layer === "back")
        .forEach((fruit) => {
          fruit.x += fruit.speedX
          fruit.y += fruit.speedY
          fruit.rotation += fruit.rotationSpeed

          if (fruit.x < -100 || fruit.x > canvas.width + 100) fruit.speedX *= -1
          if (fruit.y < -100 || fruit.y > canvas.height + 100) fruit.speedY *= -1

          ctx.save()
          ctx.translate(fruit.x, fruit.y)
          ctx.rotate(fruit.rotation)
          ctx.globalAlpha = 0.2
          ctx.filter = "blur(3px)"
          ctx.font = `${fruit.size}px sans-serif`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(fruit.emoji, 0, 0)
          ctx.restore()
        })

      fruits
        .filter((f) => f.layer === "front")
        .forEach((fruit) => {
          fruit.x += fruit.speedX
          fruit.y += fruit.speedY
          fruit.rotation += fruit.rotationSpeed

          if (fruit.x < -100 || fruit.x > canvas.width + 100) fruit.speedX *= -1
          if (fruit.y < -100 || fruit.y > canvas.height + 100) fruit.speedY *= -1

          ctx.save()
          ctx.translate(fruit.x, fruit.y)
          ctx.rotate(fruit.rotation)

          ctx.shadowBlur = 25
          ctx.shadowColor = "rgba(168, 85, 247, 0.4)"
          ctx.globalAlpha = 0.35

          ctx.font = `${fruit.size}px sans-serif`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(fruit.emoji, 0, 0)

          const sparklePhase = (Date.now() / 2000 + fruit.x) % (Math.PI * 2)
          ctx.globalAlpha = 0.1 + Math.sin(sparklePhase) * 0.05
          ctx.shadowBlur = 15
          ctx.shadowColor = "rgba(255, 255, 255, 0.8)"
          ctx.fillText(fruit.emoji, 0, 0)

          ctx.restore()
        })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-4 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)",
        }}
      />

      <div
        className={`relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-purple-500/20 shadow-2xl shadow-purple-500/10 max-w-md w-full transition-all duration-700 hover:shadow-[0_0_60px_rgba(168,85,247,0.25)] hover:border-purple-500/40 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
            animation: "shimmer 3s ease-in-out infinite",
          }}
        />

        <h1 className="text-3xl font-bold text-white mb-2 relative z-10">FruitFlow</h1>
        <p className="text-white/60 mb-8 relative z-10">Retailer Portal</p>

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="text-white/80 text-sm mb-2 block">Email</label>
            <input
              type="email"
              placeholder="retailer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/30 focus:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all duration-300"
            />
          </div>

          <div>
            <label className="text-white/80 text-sm mb-2 block">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/30 focus:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all duration-300"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group"
            style={{
              boxShadow: "0 0 25px rgba(168, 85, 247, 0.3)",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: "radial-gradient(circle at center, rgba(168, 85, 247, 0.5) 0%, transparent 70%)",
                animation: "breathe 2s ease-in-out infinite",
              }}
            />
            <span className="relative z-10">Sign In</span>
          </button>

          <p className="text-white/40 text-sm text-center mt-4">Forgot password?</p>
        </form>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0%, 100% {
            opacity: 0.3;
            transform: translateX(-100%);
          }
          50% {
            opacity: 0.5;
            transform: translateX(100%);
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
    </div>
  )
}
