export interface Product {
  id: number
  sku: string
  name: string
  category_id?: number
  barcode?: string
  description?: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Criteria {
  id: number
  category_id: number
  name: string
  weight?: number
  max_score: number
  created_at: string
}

export interface Employee {
  id: number
  email: string
  name: string
  role: "operator" | "manager" | "admin"
  store_location: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Evaluation {
  id: number
  product_id: number
  employee_id: number
  evaluation_date: string
  store_location: string
  status: "draft" | "completed" | "reviewed"
  notes?: string
  sync_status: "pending" | "synced" | "failed"
  created_at: string
  updated_at: string
}

export interface EvaluationScore {
  id: number
  evaluation_id: number
  criteria_id: number
  score: number
  comment?: string
  created_at: string
}

export interface EvaluationWithScores extends Evaluation {
  product?: Product
  scores?: EvaluationScore[]
}
