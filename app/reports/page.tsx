"use client"

import { Sidebar } from "@/components/layout/sidebar"
import Reports from "@/components/pages/reports"

export default function ReportsPage() {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 lg:ml-0">
        <Reports />
      </main>
    </div>
  )
}
