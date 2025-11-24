"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, User, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"

export default function EvaluationCard({ evaluation, product, onDelete, canDelete }) {
  const locationLabels = {
    store: "Store",
    distribution_center: "Distribution Center",
  }

  const getScoreColor = (score) => {
    if (score >= 4.5) return "text-emerald-600"
    if (score >= 3.5) return "text-cyan-600"
    if (score >= 2.5) return "text-amber-600"
    return "text-red-600"
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Card className="p-5 border border-slate-200 hover:border-slate-300 transition-all bg-white">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-slate-900">{product?.name || "Product"}</h4>
              {evaluation.location && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  {locationLabels[evaluation.location]}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{evaluation.employee_name}</span>
              </div>
              <span>•</span>
              <span>{format(new Date(evaluation.created_date), "MMM d, yyyy")}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(evaluation.overall_score)}`}>
                {evaluation.overall_score.toFixed(1)}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Star className="w-3 h-3" />
                <span>Average</span>
              </div>
            </div>
            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(evaluation.id)}
                className="text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        {evaluation.comments && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-sm text-slate-600 italic">"{evaluation.comments}"</p>
          </div>
        )}
      </Card>
    </div>
  )
}
