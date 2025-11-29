// IndexedDB para armazenamento offline
export interface OfflineEvaluation {
  id?: number
  product_id: number
  scores: { criteria_id: number; score: number; comment?: string }[]
  comments?: string
  location: string
  created_at: Date
  synced: boolean
}

const DB_NAME = "ProductClassification"
const DB_VERSION = 1
const EVALUATIONS_STORE = "pendingEvaluations"
const CACHE_STORE = "cachedData"

let db: IDBDatabase

export async function initOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Store para avaliações pendentes
      if (!db.objectStoreNames.contains(EVALUATIONS_STORE)) {
        const store = db.createObjectStore(EVALUATIONS_STORE, { keyPath: "id", autoIncrement: true })
        store.createIndex("synced", "synced", { unique: false })
        store.createIndex("created_at", "created_at", { unique: false })
      }

      // Store para dados em cache
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        const store = db.createObjectStore(CACHE_STORE, { keyPath: "key", autoIncrement: false })
        store.createIndex("timestamp", "timestamp", { unique: false })
      }
    }
  })
}

export async function savePendingEvaluation(evaluation: OfflineEvaluation): Promise<number> {
  if (!db) await initOfflineDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([EVALUATIONS_STORE], "readwrite")
    const store = transaction.objectStore(EVALUATIONS_STORE)
    const request = store.add({ ...evaluation, synced: false })

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result as number)
  })
}

export async function getPendingEvaluations(): Promise<OfflineEvaluation[]> {
  if (!db) await initOfflineDB()

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([EVALUATIONS_STORE], "readonly")
      const store = transaction.objectStore(EVALUATIONS_STORE)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        // Filtrar avaliações não sincronizadas em JavaScript
        const allEvaluations = request.result as OfflineEvaluation[]
        const unsyncedEvaluations = allEvaluations.filter((evaluation) => !evaluation.synced)
        resolve(unsyncedEvaluations)
      }
    } catch (error) {
      console.error("Erro em getPendingEvaluations:", error)
      resolve([]) // Retornar array vazio em caso de erro para prevenir crashes
    }
  })
}

export async function markEvaluationSynced(id: number): Promise<void> {
  if (!db) await initOfflineDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([EVALUATIONS_STORE], "readwrite")
    const store = transaction.objectStore(EVALUATIONS_STORE)
    const getRequest = store.get(id)

    getRequest.onsuccess = () => {
      const evaluation = getRequest.result
      if (evaluation) {
        evaluation.synced = true
        const updateRequest = store.put(evaluation)
        updateRequest.onerror = () => reject(updateRequest.error)
        updateRequest.onsuccess = () => resolve()
      }
    }
    getRequest.onerror = () => reject(getRequest.error)
  })
}

export async function deletePendingEvaluation(id: number): Promise<void> {
  if (!db) await initOfflineDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([EVALUATIONS_STORE], "readwrite")
    const store = transaction.objectStore(EVALUATIONS_STORE)
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function cacheData(key: string, data: any, ttl = 3600000): Promise<void> {
  if (!db) await initOfflineDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CACHE_STORE], "readwrite")
    const store = transaction.objectStore(CACHE_STORE)
    const request = store.put({
      key,
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
    })

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function getCachedData(key: string): Promise<any | null> {
  if (!db) await initOfflineDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CACHE_STORE], "readonly")
    const store = transaction.objectStore(CACHE_STORE)
    const request = store.get(key)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const result = request.result
      if (result && result.expiry > Date.now()) {
        resolve(result.data)
      } else {
        resolve(null)
      }
    }
  })
}
