"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ClipboardCheck, BarChart3 } from "lucide-react"

export default function HomePage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      <div className="flex bg-slate-50 min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 lg:ml-0">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome, {user?.name}</h1>
              <p className="text-slate-600">
                {user?.role === "admin" && "Manage the classification system"}
                {user?.role === "manager" && "Oversee product evaluations"}
                {user?.role === "operator" && "Evaluate products in your store"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer hover:border-cyan-300">
                <Package className="w-8 h-8 text-cyan-600 mb-3" />
                <h3 className="font-semibold text-slate-900 mb-2">Products</h3>
                <p className="text-sm text-slate-600 mb-4">View and manage product catalog</p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/products">Go to Products</a>
                </Button>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer hover:border-cyan-300">
                <ClipboardCheck className="w-8 h-8 text-emerald-600 mb-3" />
                <h3 className="font-semibold text-slate-900 mb-2">Evaluations</h3>
                <p className="text-sm text-slate-600 mb-4">Complete and review product evaluations</p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/evaluations">View Evaluations</a>
                </Button>
              </Card>

              {(user?.role === "manager" || user?.role === "admin") && (
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer hover:border-cyan-300">
                  <BarChart3 className="w-8 h-8 text-amber-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-2">Reports</h3>
                  <p className="text-sm text-slate-600 mb-4">Analyze classification metrics and trends</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/reports">View Reports</a>
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
