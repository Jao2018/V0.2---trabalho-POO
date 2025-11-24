"use client"

import { Sidebar } from "@/components/layout/sidebar"
import Products from "@/components/pages/products"

export default function ProductsPage() {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 lg:ml-0">
        <Products />
      </main>
    </div>
  )
}
