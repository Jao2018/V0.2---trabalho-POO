"use client"

import { useState, useEffect } from "react"
import { base44 } from "@/api/base44Client"

export default function RoleGuard({ children, requiredRole = "admin" }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me()
        setUser(currentUser)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  if (loading) {
    return null
  }

  if (!user || user.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}
