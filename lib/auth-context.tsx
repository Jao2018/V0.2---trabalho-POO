"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

export interface User {
  id: number
  email: string
  name: string
  role: "operator" | "manager" | "admin" | "evaluator"
  store_location: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch {
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    console.log("[v0] Auth context login started")
    setLoading(true)
    try {
      console.log("[v0] Calling loginAction server action")
      const { loginAction } = await import("@/app/actions/auth")
      const result = await loginAction(email, password)
      console.log("[v0] Login result received:", result)
      setUser(result.user)
      localStorage.setItem("user", JSON.stringify(result.user))
      localStorage.setItem("auth_token", result.token)

      // This ensures it's sent with fetch requests to API routes
      document.cookie = `auth_token=${result.token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`
      console.log("[v0] Auth cookie set on client")

      console.log("[v0] Redirecting to /home")
      router.push("/home")
    } catch (error) {
      console.error("[v0] Login catch error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("auth_token")
    document.cookie = "auth_token=; Max-Age=0; path=/"
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
