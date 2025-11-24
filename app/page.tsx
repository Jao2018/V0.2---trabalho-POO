"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login or home based on auth
    router.push("/login")
  }, [router])

  return null
}
