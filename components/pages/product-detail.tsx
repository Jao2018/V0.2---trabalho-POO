"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { base44 } from "@/api/base44Client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import EvaluationCard from "@/components/cards/evaluation-card"
import { ArrowLeft, Star, Package, ClipboardCheck, MapPin } from "lucide-react"
import { toast } from "sonner"
import { createPageUrl } from "@/utils"

export default function ProductDetail() {
  const searchParams = useSearchParams()
  const productId = searchParams.get("id")

  const [user, setUser] = useState(null)
  const [showEvaluationForm, setShowEvaluationForm] = useState(false)
  const [criteriaScores, setCriteriaScores] = useState({})
  const [comments, setComments] = useState("")
  const [location, setLocation] = useState("store")

  const queryClient = useQueryClient()

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me()
      setUser(currentUser)
    }
    fetchUser()
  }, [])

  const { data: product } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const products = await base44.entities.Product.list()
      return products.find((p) => p.id === productId)
    },
    enabled: !!productId,
  })

  const { data: category } = useQuery({
    queryKey: ["category", product?.category_id],
    queryFn: async () => {
      const categories = await base44.entities.Category.list()
      return categories.find((c) => c.id === product.category_id)
    },
    enabled: !!product?.category_id,
  })

  const { data: criteria = [] } = useQuery({
    queryKey: ["criteria"],
    queryFn: () => base44.entities.Criterion.list(),
  })

  const { data: evaluations = [] } = useQuery({
    queryKey: ["product-evaluations", productId],
    queryFn: async () => {
      const allEvaluations = await base44.entities.Evaluation.list("-created_date")
      return allEvaluations.filter((e) => e.product_id === productId)
    },
    enabled: !!productId,
  })

  const createEvaluationMutation = useMutation({
    mutationFn: async (data) => {
      const evaluation = await base44.entities.Evaluation.create(data.evaluation)
      await Promise.all(
        data.scores.map((score) =>
          base44.entities.EvaluationScore.create({
            ...score,
            evaluation_id: evaluation.id,
          }),
        ),
      )
      return evaluation
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["product-evaluations"])
      queryClient.invalidateQueries(["evaluations"])
      queryClient.invalidateQueries(["all-evaluations"])
      setShowEvaluationForm(false)
      setCriteriaScores({})
      setComments("")
      toast.success("Evaluation submitted successfully")
    },
  })

  const deleteEvaluationMutation = useMutation({
    mutationFn: async (evaluationId) => {
      const scores = await base44.entities.EvaluationScore.list()
      const evaluationScores = scores.filter((s) => s.evaluation_id === evaluationId)
      await Promise.all(evaluationScores.map((s) => base44.entities.EvaluationScore.delete(s.id)))
      await base44.entities.Evaluation.delete(evaluationId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["product-evaluations"])
      queryClient.invalidateQueries(["evaluations"])
      queryClient.invalidateQueries(["all-evaluations"])
      toast.success("Evaluation deleted")
    },
  })

  const handleSubmitEvaluation = () => {
    const scores = Object.entries(criteriaScores).map(([criterionId, score]) => {
      const criterion = criteria.find((c) => c.id === criterionId)
      return {
        criterion_id: criterionId,
        criterion_name: criterion?.name || "",
        score,
      }
    })

    if (scores.length === 0) {
      toast.error("Please rate at least one criterion")
      return
    }

    const overallScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length

    createEvaluationMutation.mutate({
      evaluation: {
        product_id: productId,
        employee_email: user.email,
        employee_name: user.full_name,
        overall_score: overallScore,
        comments,
        location,
      },
      scores,
    })
  }

  const averageScore =
    evaluations.length > 0 ? evaluations.reduce((sum, e) => sum + e.overall_score, 0) / evaluations.length : 0

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Product not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href={createPageUrl("Products")}>
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Button>
      </Link>

      {/* Product Header */}
      <Card className="p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-48 h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <Package className="w-16 h-16 text-slate-400" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{product.name}</h1>
                <p className="text-slate-600 mb-3">{product.description}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="text-sm">
                    Code: {product.code}
                  </Badge>
                  {product.brand && (
                    <Badge variant="outline" className="text-sm">
                      {product.brand}
                    </Badge>
                  )}
                  {category && (
                    <Badge
                      className={`bg-${category.color}-100 text-${category.color}-700 border-${category.color}-200`}
                    >
                      {category.name}
                    </Badge>
                  )}
                </div>
              </div>
              {averageScore > 0 && (
                <div className="text-center bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-amber-700">{averageScore.toFixed(1)}</div>
                  <div className="flex items-center justify-center gap-1 text-sm text-amber-600">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    Average Score
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{evaluations.length} evaluations</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Evaluation Form */}
      {!showEvaluationForm ? (
        <Button onClick={() => setShowEvaluationForm(true)} className="w-full bg-cyan-600 hover:bg-cyan-700" size="lg">
          <ClipboardCheck className="w-5 h-5 mr-2" />
          Evaluate This Product
        </Button>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Card className="p-6 border-2 border-cyan-200 bg-cyan-50/50">
            <h2 className="text-xl font-bold text-slate-900 mb-4">New Evaluation</h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="store">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Store
                      </div>
                    </SelectItem>
                    <SelectItem value="distribution_center">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Distribution Center
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {criteria.map((criterion) => (
                <div key={criterion.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">{criterion.name}</Label>
                    <span className="text-2xl font-bold text-cyan-600">{criteriaScores[criterion.id] || 0}</span>
                  </div>
                  {criterion.description && <p className="text-sm text-slate-600">{criterion.description}</p>}
                  <Slider
                    value={[criteriaScores[criterion.id] || 0]}
                    onValueChange={([value]) => setCriteriaScores({ ...criteriaScores, [criterion.id]: value })}
                    min={0}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
              ))}

              <div className="space-y-2">
                <Label>Comments (Optional)</Label>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any additional observations..."
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEvaluationForm(false)
                    setCriteriaScores({})
                    setComments("")
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitEvaluation}
                  disabled={createEvaluationMutation.isPending}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                >
                  Submit Evaluation
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Evaluations History */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Evaluation History</h2>
        {evaluations.length === 0 ? (
          <Card className="p-12 text-center border border-slate-200">
            <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No evaluations yet</p>
            <p className="text-sm text-slate-500 mt-1">Be the first to evaluate this product</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {evaluations.map((evaluation) => (
              <EvaluationCard
                key={evaluation.id}
                evaluation={evaluation}
                product={product}
                canDelete={user?.role === "admin"}
                onDelete={(id) => deleteEvaluationMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
