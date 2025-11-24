"use client"

import { useQuery } from "@tanstack/react-query"
import { base44 } from "@/api/base44Client"
import StatCard from "@/components/cards/stat-card"
import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Package, Star, TrendingUp, Users } from "lucide-react"

export default function Reports() {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => base44.entities.Product.list(),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => base44.entities.Category.list(),
  })

  const { data: evaluations = [] } = useQuery({
    queryKey: ["all-evaluations"],
    queryFn: () => base44.entities.Evaluation.list(),
  })

  // Calculate metrics
  const averageScore =
    evaluations.length > 0 ? evaluations.reduce((sum, e) => sum + e.overall_score, 0) / evaluations.length : 0

  const uniqueEvaluators = new Set(evaluations.map((e) => e.employee_email)).size

  // Top products by score
  const productScores = products
    .map((product) => {
      const productEvals = evaluations.filter((e) => e.product_id === product.id)
      const avgScore =
        productEvals.length > 0 ? productEvals.reduce((sum, e) => sum + e.overall_score, 0) / productEvals.length : 0
      return {
        name: product.name,
        score: Number.parseFloat(avgScore.toFixed(2)),
        evaluations: productEvals.length,
      }
    })
    .filter((p) => p.evaluations > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  // Evaluations by category
  const categoryData = categories
    .map((category) => {
      const categoryProducts = products.filter((p) => p.category_id === category.id)
      const categoryEvals = evaluations.filter((e) => categoryProducts.some((p) => p.id === e.product_id))
      return {
        name: category.name,
        count: categoryEvals.length,
        avgScore:
          categoryEvals.length > 0
            ? Number.parseFloat(
                (categoryEvals.reduce((sum, e) => sum + e.overall_score, 0) / categoryEvals.length).toFixed(2),
              )
            : 0,
      }
    })
    .filter((c) => c.count > 0)

  // Score distribution
  const scoreDistribution = [
    { range: "0-1", count: evaluations.filter((e) => e.overall_score < 1).length },
    { range: "1-2", count: evaluations.filter((e) => e.overall_score >= 1 && e.overall_score < 2).length },
    { range: "2-3", count: evaluations.filter((e) => e.overall_score >= 2 && e.overall_score < 3).length },
    { range: "3-4", count: evaluations.filter((e) => e.overall_score >= 3 && e.overall_score < 4).length },
    { range: "4-5", count: evaluations.filter((e) => e.overall_score >= 4).length },
  ]

  const COLORS = ["#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-600 mt-1">Performance insights and statistics</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Products" value={products.length} icon={Package} color="cyan" />
        <StatCard title="Total Evaluations" value={evaluations.length} icon={TrendingUp} color="emerald" />
        <StatCard title="Average Score" value={averageScore.toFixed(2)} icon={Star} color="amber" />
        <StatCard title="Active Evaluators" value={uniqueEvaluators} icon={Users} color="slate" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 delay-100">
          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Top Products by Score</h2>
            {productScores.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">No data available</div>
            )}
          </Card>
        </div>

        {/* Score Distribution */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 delay-200">
          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Score Distribution</h2>
            {evaluations.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={scoreDistribution}
                    dataKey="count"
                    nameKey="range"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">No data available</div>
            )}
          </Card>
        </div>

        {/* Evaluations by Category */}
        <div className="lg:col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-300 delay-300">
          <Card className="p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Performance by Category</h2>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#06b6d4" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#06b6d4" name="Evaluations" radius={[8, 8, 0, 0]} />
                  <Bar yAxisId="right" dataKey="avgScore" fill="#10b981" name="Avg Score" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">No data available</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
