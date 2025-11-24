"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Lock } from "lucide-react"
import Link from "next/link"

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md text-center p-8">
        <Lock className="w-16 h-16 text-red-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600 mb-6">You don't have permission to access this page</p>
        <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
          <Link href="/home">Return to Home</Link>
        </Button>
      </Card>
    </div>
  )
}
