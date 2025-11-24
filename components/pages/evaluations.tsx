"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import EvaluationCard from "@/components/cards/evaluation-card"
import { Search, ClipboardCheck, Plus } from "lucide-react"
import { toast } from "sonner"

function getAuthHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export default function Evaluations() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [scoreFilter, setScoreFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newEvaluation, setNewEvaluation] = useState({
    product_id: "",
    store_location: "",
    notes: "",
    scores: {} as Record<number, { score: number; comment: string }>,
  })

  const queryClient = useQueryClient()

  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ["evaluations"],
    queryFn: async () => {
      console.log("[v0] Fetching evaluations...")
      const res = await fetch("/api/evaluations", {
        credentials: "include",
        headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error("Failed to fetch evaluations")
      return res.json()
    },
  })

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      console.log("[v0] Fetching products for evaluation dropdown...")
      const res = await fetch("/api/products", {
        credentials: "include",
        headers: getAuthHeaders(),
      })
      console.log("[v0] Products fetch response status:", res.status)
      if (!res.ok) {
        const error = await res.text()
        console.log("[v0] Products fetch error:", error)
        throw new Error(`Failed to fetch products: ${res.status}`)
      }
      const data = await res.json()
      console.log("[v0] Products fetched:", data.length, data)
      return data
    },
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  })

  const { data: evaluationScores = [] } = useQuery({
    queryKey: ["evaluation-scores"],
    queryFn: async () => {
      const res = await fetch("/api/evaluation-scores", {
        credentials: "include",
        headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error("Failed to fetch evaluation scores")
      return res.json()
    },
  })

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories", {
        credentials: "include",
        headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error("Failed to fetch categories")
      return res.json()
    },
  })

  const { data: allCriteria = [] } = useQuery({
    queryKey: ["criteria"],
    queryFn: async () => {
      console.log("[v0] Fetching criteria...")
      const res = await fetch("/api/criteria", {
        credentials: "include",
        headers: getAuthHeaders(),
      })
      console.log("[v0] Criteria fetch response status:", res.status)
      if (!res.ok) {
        const error = await res.text()
        console.log("[v0] Criteria fetch error:", error)
        throw new Error(`Failed to fetch criteria: ${res.status}`)
      }
      const data = await res.json()
      console.log("[v0] Criteria fetched:", data.length, data)
      return data
    },
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })

  const createEvaluationMutation = useMutation({
    mutationFn: async (data: any) => {
      const evalRes = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        credentials: "include",
        body: JSON.stringify({
          product_id: Number.parseInt(data.product_id),
          employee_id: user?.id,
          store_location: data.store_location,
          notes: data.notes,
          evaluation_date: new Date().toISOString().split("T")[0],
          status: "completed",
        }),
      })
      if (!evalRes.ok) throw new Error("Failed to create evaluation")
      const evaluation = await evalRes.json()

      await Promise.all(
        Object.entries(data.scores).map(async ([criteriaId, scoreData]: [string, any]) => {
          await fetch("/api/evaluation-scores", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
            credentials: "include",
            body: JSON.stringify({
              evaluation_id: evaluation.id,
              criteria_id: Number.parseInt(criteriaId),
              score: scoreData.score,
              comment: scoreData.comment,
            }),
          })
        }),
      )

      return evaluation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] })
      queryClient.invalidateQueries({ queryKey: ["evaluation-scores"] })
      setDialogOpen(false)
      setNewEvaluation({
        product_id: "",
        store_location: "",
        notes: "",
        scores: {},
      })
      toast.success("Evaluation created successfully")
    },
    onError: () => {
      toast.error("Failed to create evaluation")
    },
  })

  const deleteEvaluationMutation = useMutation({
    mutationFn: async (evaluationId: number) => {
      const scores = evaluationScores.filter((s: any) => s.evaluation_id === evaluationId)
      await Promise.all(
        scores.map((s: any) =>
          fetch(`/api/evaluation-scores/${s.id}`, {
            method: "DELETE",
            credentials: "include",
            headers: getAuthHeaders(),
          }),
        ),
      )
      const res = await fetch(`/api/evaluations/${evaluationId}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error("Failed to delete evaluation")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] })
      queryClient.invalidateQueries({ queryKey: ["evaluation-scores"] })
      toast.success("Evaluation deleted")
    },
  })

  const getOverallScore = (evaluationId: number) => {
    const scores = evaluationScores.filter((s: any) => s.evaluation_id === evaluationId)
    if (scores.length === 0) return 0
    const avg = scores.reduce((sum, s: any) => sum + (s.score || 0), 0) / scores.length
    return Math.round(avg * 10) / 10
  }

  const filteredEvaluations = evaluations.filter((evaluation: any) => {
    const product = products.find((p: any) => p.id === evaluation.product_id)
    const query = searchQuery.toLowerCase()
    const overall_score = getOverallScore(evaluation.id)

    const matchesSearch =
      !searchQuery || product?.name.toLowerCase().includes(query) || evaluation.notes?.toLowerCase().includes(query)

    const matchesLocation = locationFilter === "all" || evaluation.store_location === locationFilter

    let matchesScore = true
    if (scoreFilter === "excellent") matchesScore = overall_score >= 4.5
    else if (scoreFilter === "good") matchesScore = overall_score >= 3.5 && overall_score < 4.5
    else if (scoreFilter === "average") matchesScore = overall_score >= 2.5 && overall_score < 3.5
    else if (scoreFilter === "poor") matchesScore = overall_score < 2.5

    return matchesSearch && matchesLocation && matchesScore
  })

  const selectedProduct = products.find((p: any) => p.id === Number.parseInt(newEvaluation.product_id))
  const relevantCriteria = selectedProduct
    ? allCriteria.filter((c: any) => c.category_id === selectedProduct.category_id)
    : []

  console.log("[v0] Selected product:", selectedProduct)
  console.log("[v0] Selected product category_id:", selectedProduct?.category_id)
  console.log("[v0] All criteria:", allCriteria)
  console.log("[v0] Relevant criteria for selected product:", relevantCriteria)

  const handleScoreChange = (criteriaId: number, score: number) => {
    setNewEvaluation({
      ...newEvaluation,
      scores: {
        ...newEvaluation.scores,
        [criteriaId]: {
          score: score,
          comment: newEvaluation.scores[criteriaId]?.comment ?? "",
        },
      },
    })
  }

  const handleCommentChange = (criteriaId: number, comment: string) => {
    setNewEvaluation({
      ...newEvaluation,
      scores: {
        ...newEvaluation.scores,
        [criteriaId]: {
          score: newEvaluation.scores[criteriaId]?.score ?? 0,
          comment: comment,
        },
      },
    })
  }

  const handleCreateEvaluation = () => {
    if (!newEvaluation.product_id || !newEvaluation.store_location) {
      toast.error("Please fill in all required fields")
      return
    }

    createEvaluationMutation.mutate(newEvaluation)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Product Evaluations</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-5 h-5" />
                New Evaluation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Evaluation</DialogTitle>
                <DialogDescription>Evaluate a product using the relevant criteria for its category.</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Product Selection */}
                <div className="space-y-2">
                  <Label>Product *</Label>
                  <Select
                    value={newEvaluation.product_id}
                    onValueChange={(value) => {
                      console.log("[v0] Product selected:", value)
                      setNewEvaluation({
                        ...newEvaluation,
                        product_id: value,
                        scores: {},
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product to evaluate" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.length === 0 ? (
                        <SelectItem value="no-products" disabled>
                          No products available
                        </SelectItem>
                      ) : (
                        products.map((product: any) => {
                          const category = categories.find((c: any) => c.id === product.category_id)
                          return (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              [{product.sku}] {product.name} {category ? `- ${category.name}` : "(No category)"}
                            </SelectItem>
                          )
                        })
                      )}
                    </SelectContent>
                  </Select>
                  {selectedProduct && (
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      <p className="font-medium">
                        [{selectedProduct.sku}] {selectedProduct.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Category:{" "}
                        {categories.find((c: any) => c.id === selectedProduct.category_id)?.name || "Not assigned"}
                      </p>
                      {selectedProduct.description && (
                        <p className="text-xs text-slate-500 mt-1">{selectedProduct.description}</p>
                      )}
                      {!selectedProduct.category_id && (
                        <p className="text-xs text-amber-600 mt-2 font-medium">
                          ⚠️ This product has no category assigned. Please assign a category first.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Store Location */}
                <div className="space-y-2">
                  <Label>Store Location *</Label>
                  <Input
                    placeholder="Enter store location"
                    value={newEvaluation.store_location}
                    onChange={(e) => setNewEvaluation({ ...newEvaluation, store_location: e.target.value })}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Add any notes about this evaluation"
                    value={newEvaluation.notes}
                    onChange={(e) => setNewEvaluation({ ...newEvaluation, notes: e.target.value })}
                  />
                </div>

                {/* Criteria Scoring */}
                {selectedProduct && relevantCriteria.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="font-semibold text-slate-900">Evaluation Criteria</h3>
                    {relevantCriteria.map((criteria: any) => {
                      const currentScore = newEvaluation.scores[criteria.id]?.score ?? 0
                      return (
                        <div
                          key={criteria.id}
                          className="space-y-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="font-semibold text-slate-900">{criteria.name}</Label>
                              <p className="text-xs text-slate-500 mt-1">
                                Weight: {criteria.weight} • Max Score: {criteria.max_score}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">{currentScore}</div>
                              <p className="text-xs text-slate-500">/ {criteria.max_score}</p>
                            </div>
                          </div>
                          {/* Slider for score input */}
                          <Slider
                            min={0}
                            max={criteria.max_score}
                            step={0.5}
                            value={[currentScore]}
                            onValueChange={(value) => handleScoreChange(criteria.id, value[0])}
                            className="w-full"
                          />
                          {/* Comment input */}
                          <Textarea
                            placeholder="Add comments (optional)"
                            value={newEvaluation.scores[criteria.id]?.comment ?? ""}
                            onChange={(e) => handleCommentChange(criteria.id, e.target.value)}
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      )
                    })}
                  </div>
                )}

                {selectedProduct && relevantCriteria.length === 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-900">
                      No evaluation criteria defined for this product's category. Please add criteria in settings.
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleCreateEvaluation}
                  disabled={!selectedProduct || relevantCriteria.length === 0 || createEvaluationMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {createEvaluationMutation.isPending ? "Creating..." : "Create Evaluation"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by product name or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {Array.from(new Set(evaluations.map((e: any) => e.store_location))).map((location: any) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={scoreFilter} onValueChange={setScoreFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scores</SelectItem>
              <SelectItem value="excellent">Excellent (4.5+)</SelectItem>
              <SelectItem value="good">Good (3.5-4.4)</SelectItem>
              <SelectItem value="average">Average (2.5-3.4)</SelectItem>
              <SelectItem value="poor">Poor (&lt;2.5)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Evaluations List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading evaluations...</p>
          </div>
        ) : filteredEvaluations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No evaluations found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEvaluations.map((evaluation: any) => {
              const product = products.find((p: any) => p.id === evaluation.product_id)
              const evaluationWithScore = {
                ...evaluation,
                overall_score: getOverallScore(evaluation.id),
              }
              return (
                <div key={evaluation.id}>
                  <EvaluationCard
                    evaluation={evaluationWithScore}
                    product={product}
                    canDelete={user?.role === "admin"}
                    onDelete={(id) => deleteEvaluationMutation.mutate(id)}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
