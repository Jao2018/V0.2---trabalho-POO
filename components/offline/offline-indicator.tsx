"use client"

import { useOfflineStatus } from "@/lib/hooks/use-offline-status"
import { AlertCircle } from "lucide-react"

export function OfflineIndicator() {
  const { isOnline } = useOfflineStatus()

  return (
    !isOnline && (
      <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-900 text-sm">Working offline</p>
            <p className="text-xs text-amber-700">Changes will sync when online</p>
          </div>
        </div>
      </div>
    )
  )
}
