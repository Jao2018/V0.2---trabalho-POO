"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Lock, Mail } from "lucide-react"

export default function LoginPage() {
  const { login, loading } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    console.log("[v0] Login form submitted with email:", formData.email)

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    try {
      await login(formData.email, formData.password)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      console.error("Erro no login:", message, err)
      setError(message)
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <CardTitle className="text-2xl">Classification System</CardTitle>
          </div>
          <CardDescription className="text-slate-100">Employee product evaluation portal</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="operator@store.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}

            <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-600 mb-3 font-medium">Demo Accounts:</p>
            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-2 rounded">
                <p className="font-mono text-slate-700">operator@store.com / demo</p>
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <p className="font-mono text-slate-700">manager@store.com / demo</p>
              </div>
              <div className="bg-slate-50 p-2 rounded">
                <p className="font-mono text-slate-700">admin@store.com / demo</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
