"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function useAuthGuard(requiredRoles?: string[]) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login")
        return
      }

      if (requiredRoles && !requiredRoles.includes(user?.role || "")) {
        router.push("/403")
      }
    }
  }, [isAuthenticated, loading, user, requiredRoles, router])

  return { user, loading }
}
