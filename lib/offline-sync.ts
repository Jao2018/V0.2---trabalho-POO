// Sync manager for offline evaluations
import { getPendingEvaluations, markEvaluationSynced } from "./offline-db"

export class OfflineSyncManager {
  private syncing = false
  private syncInterval: NodeJS.Timeout | null = null

  async syncPendingEvaluations(): Promise<void> {
    if (this.syncing) return

    this.syncing = true
    try {
      const pendingEvaluations = await getPendingEvaluations()

      for (const evaluation of pendingEvaluations) {
        try {
          const response = await fetch("/api/evaluations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              product_id: evaluation.product_id,
              evaluation_date: new Date().toISOString().split("T")[0],
              scores: evaluation.scores,
              notes: evaluation.comments,
            }),
          })

          if (response.ok && evaluation.id) {
            await markEvaluationSynced(evaluation.id)
          }
        } catch (error) {
          console.error("Failed to sync evaluation:", error)
        }
      }
    } finally {
      this.syncing = false
    }
  }

  startAutoSync(intervalMs = 30000): void {
    if (this.syncInterval) clearInterval(this.syncInterval)

    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncPendingEvaluations()
      }
    }, intervalMs)
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }
}

export const syncManager = new OfflineSyncManager()
