"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Package } from "lucide-react"

export default function ProductCard({ product, category, averageScore, onClick }) {
  const categoryColors = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    green: "bg-green-100 text-green-700 border-green-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    pink: "bg-pink-100 text-pink-700 border-pink-200",
  }

  return (
    <div
      onClick={onClick}
      className="animate-in fade-in slide-in-from-bottom-4 duration-300 hover:-translate-y-1 transition-transform"
    >
      <Card className="overflow-hidden border border-slate-200 hover:border-cyan-300 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white">
        <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative">
          {product.image_url ? (
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-16 h-16 text-slate-300" />
          )}
          {category && (
            <Badge className={`absolute top-3 right-3 ${categoryColors[category.color] || categoryColors.blue} border`}>
              {category.name}
            </Badge>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">{product.name}</h3>
              <p className="text-xs text-slate-500 mb-1">{product.sku}</p>
            </div>
          </div>
          {averageScore !== null && averageScore !== undefined && (
            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-semibold text-slate-700">{averageScore.toFixed(1)}</span>
              <span className="text-xs text-slate-500 ml-1">/ 5.0</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
