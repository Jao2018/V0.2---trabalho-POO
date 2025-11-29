"use client"

import { useEffect, useState } from "react"

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [hasPendingSync, setHasPendingSync] = useState(false)

  useEffect(() => {
    // Verificar status inicial
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return { isOnline, hasPendingSync }
}
