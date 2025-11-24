"use client"

import { useEffect, useState } from "react"
import { getPendingEvaluations } from "@/lib/offline-db"
import { Cloud, CloudOff } from "lucide-react"

export function SyncStatus() {
  const [pendingCount, setPendingCount] = useState(0)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const checkPending = async () => {
      const pending = await getPendingEvaluations()
      setPendingCount(pending.length)
    }

    checkPending()
    const interval = setInterval(checkPending, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
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

  if (pendingCount === 0 && isOnline) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 animate-in fade-in scale-in duration-300">
      <div
        className={`rounded-lg p-4 shadow-lg ${
          isOnline ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"
        }`}
      >
        <div className="flex items-center gap-2">
          {isOnline ? <Cloud className="w-5 h-5 text-emerald-600" /> : <CloudOff className="w-5 h-5 text-amber-600" />}
          <div>
            <p className={`font-medium text-sm ${isOnline ? "text-emerald-900" : "text-amber-900"}`}>
              {isOnline ? "Online" : "Offline"}
            </p>
            {pendingCount > 0 && (
              <p className="text-xs text-slate-600 mt-1">
                {pendingCount} evaluation{pendingCount !== 1 ? "s" : ""} pending sync
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
