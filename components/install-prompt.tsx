"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowPrompt(false)
      setDeferredPrompt(null)
    }
  }

  return (
    showPrompt &&
    deferredPrompt && (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
        <Card className="p-4 shadow-lg border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-cyan-600" />
              <h3 className="font-semibold text-slate-900">Install App</h3>
            </div>
            <button onClick={() => setShowPrompt(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Install the Product Classification app for quick access and offline support.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => setShowPrompt(false)} variant="outline" size="sm" className="flex-1">
              Not Now
            </Button>
            <Button onClick={handleInstall} size="sm" className="flex-1 bg-cyan-600 hover:bg-cyan-700">
              Install
            </Button>
          </div>
        </Card>
      </div>
    )
  )
}
