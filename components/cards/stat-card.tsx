"use client"

import { Card } from "@/components/ui/card"

export default function StatCard({ title, value, icon: Icon, trend, color = "cyan" }) {
  const colorClasses = {
    cyan: "bg-cyan-500 text-cyan-600",
    emerald: "bg-emerald-500 text-emerald-600",
    amber: "bg-amber-500 text-amber-600",
    slate: "bg-slate-500 text-slate-600",
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-400">
      <Card className="p-6 bg-white border border-slate-200 hover:border-slate-300 transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {trend && <p className="text-xs text-slate-500 mt-2">{trend}</p>}
          </div>
          <div className={`p-3 rounded-xl bg-opacity-10 ${colorClasses[color]}`}>
            <Icon className={`w-6 h-6 ${colorClasses[color].split(" ")[1]}`} />
          </div>
        </div>
      </Card>
    </div>
  )
}
