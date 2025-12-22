"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type UserRole = "wholesaler" | "retailer" | null

interface AuthContextType {
  role: UserRole
  isAuthenticated: boolean
  login: (role: UserRole) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as UserRole
    if (storedRole) {
      setRole(storedRole)
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const login = (userRole: UserRole) => {
    setRole(userRole)
    setIsAuthenticated(true)
    if (userRole) {
      localStorage.setItem("userRole", userRole)
    }
  }

  const logout = () => {
    setRole(null)
    setIsAuthenticated(false)
    localStorage.removeItem("userRole")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ role, isAuthenticated, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
