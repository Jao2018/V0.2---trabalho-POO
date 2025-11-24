"use client"

import { useState, useEffect } from "react"
import { base44 } from "@/api/base44Client"
import { useQuery } from "@tanstack/react-query"
import StatCard from "@/components/cards/stat-card"
import EvaluationCard from "@/components/cards/evaluation-card"
import { Package, ClipboardCheck, TrendingUp, Star } from "lucide-react"

export default function Home() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me()
      setUser(currentUser)
    }
    fetchUser()
  }, [])

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => base44.entities.Product.list(),
  })

  const { data: evaluations = [] } = useQuery({
    queryKey: ["evaluations"],
    queryFn: () => base44.entities.Evaluation.list("-created_date", 5),
  })

  const { data: allEvaluations = [] } = useQuery({
    queryKey: ["all-evaluations"],
    queryFn: () => base44.entities.Evaluation.list(),
  })

  const activeProducts = products.filter((p) => p.status === "active").length
  const averageScore =
    allEvaluations.length > 0 ? allEvaluations.reduce((sum, e) => sum + e.overall_score, 0) / allEvaluations.length : 0

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Welcome back, {user?.full_name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-slate-600">Here's an overview of your product quality control system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Products" value={activeProducts} icon={Package} color="cyan" />
        <StatCard title="Total Evaluations" value={allEvaluations.length} icon={ClipboardCheck} color="emerald" />
        <StatCard title="Average Score" value={averageScore.toFixed(1)} icon={Star} color="amber" />
        <StatCard title="This Week" value={evaluations.length} icon={TrendingUp} color="slate" />
      </div>

      {/* Recent Evaluations */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recent Evaluations</h2>
            <p className="text-sm text-slate-600 mt-1">Latest product assessments</p>
          </div>
        </div>

        {evaluations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 animate-in fade-in duration-300">
            <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No evaluations yet</p>
            <p className="text-sm text-slate-500 mt-1">Start evaluating products to see them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluations.map((evaluation) => {
              const product = products.find((p) => p.id === evaluation.product_id)
              return (
                <div key={evaluation.id}>
                  <EvaluationCard evaluation={evaluation} product={product} canDelete={false} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
