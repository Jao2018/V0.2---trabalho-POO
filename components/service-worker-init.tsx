"use client"

import { useEffect } from "react"
import { initOfflineDB } from "@/lib/offline-db"
import { syncManager } from "@/lib/offline-sync"

export default function ServiceWorkerInit() {
  useEffect(() => {
    // Registro do Service Worker funciona apenas em produção devido a limitações de tipo MIME em preview
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return
    }

    // Registrar apenas se serviceWorker for suportado e estivermos em domínio real (não localhost/preview)
    const isDevelopment =
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1" ||
      location.hostname.includes("vusercontent")
    if (isDevelopment) {
      console.log("Registro do Service Worker ignorado em ambiente de não-produção")
      // Inicializar BD offline de qualquer forma para desenvolvimento local
      initOfflineDB().catch((error) => {
        console.warn("Falha ao inicializar BD offline:", error.message)
      })
      return
    }

    navigator.serviceWorker
      .register("/service-worker.js", { scope: "/" })
      .then((registration) => {
        console.log("Service Worker registrado:", registration)
      })
      .catch((error) => {
        console.warn("Falha ao registrar Service Worker:", error.message)
      })

    // Inicializar banco de dados offline
    initOfflineDB().catch((error) => {
      console.warn("Falha ao inicializar BD offline:", error.message)
    })

    // Iniciar sincronização automática
    syncManager.startAutoSync(30000)

    return () => {
      syncManager.stopAutoSync()
    }
  }, [])

  return null
}
