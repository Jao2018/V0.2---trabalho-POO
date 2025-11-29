"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona para login ou home baseado na autenticação
    router.push("/login")
  }, [router])

  return null
}
