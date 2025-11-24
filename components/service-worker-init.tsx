"use client"

import { useEffect } from "react"
import { initOfflineDB } from "@/lib/offline-db"
import { syncManager } from "@/lib/offline-sync"

export default function ServiceWorkerInit() {
  useEffect(() => {
    // Service Worker registration only works in production due to MIME type limitations in preview
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return
    }

    // Only register if serviceWorker is supported and we're on a real domain (not localhost/preview)
    const isDevelopment =
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1" ||
      location.hostname.includes("vusercontent")
    if (isDevelopment) {
      console.log("[v0] Service Worker registration skipped in non-production environment")
      // Initialize offline DB anyway for local development
      initOfflineDB().catch((error) => {
        console.warn("[v0] Offline DB init failed:", error.message)
      })
      return
    }

    navigator.serviceWorker
      .register("/service-worker.js", { scope: "/" })
      .then((registration) => {
        console.log("[v0] Service Worker registered:", registration)
      })
      .catch((error) => {
        console.warn("[v0] Service Worker registration failed:", error.message)
      })

    // Initialize offline database
    initOfflineDB().catch((error) => {
      console.warn("[v0] Offline DB init failed:", error.message)
    })

    // Start auto sync
    syncManager.startAutoSync(30000)

    return () => {
      syncManager.stopAutoSync()
    }
  }, [])

  return null
}
