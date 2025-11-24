"use client"

import { Sidebar } from "@/components/layout/sidebar"
import Evaluations from "@/components/pages/evaluations"

export default function EvaluationsPage() {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 lg:ml-0">
        <Evaluations />
      </main>
    </div>
  )
}
