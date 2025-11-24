"use client"

import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart3, Package, CheckSquare, Settings, LogOut, Menu, X, Home } from "lucide-react"
import { useState } from "react"

export function Sidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navItems = [
    { label: "Home", href: "/home", icon: Home },
    { label: "Products", href: "/products", icon: Package },
    { label: "Evaluations", href: "/evaluations", icon: CheckSquare },
    { label: "Reports", href: "/reports", icon: BarChart3, roles: ["manager", "evaluator", "admin"] },
    { label: "Settings", href: "/settings", icon: Settings, roles: ["manager", "evaluator", "admin"] },
  ]

  const filteredItems = navItems.filter((item) => !item.roles || item.roles.includes(user?.role || ""))

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setOpen(!open)} className="bg-white">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-white p-4 transition-transform duration-300 transform lg:relative lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } z-40 lg:z-0`}
      >
        <div className="space-y-8 h-full flex flex-col">
          {/* Logo/Title */}
          <div className="pt-2">
            <h1 className="text-xl font-bold">Classification</h1>
            {user && (
              <div className="text-xs text-slate-400 mt-3 space-y-1">
                <p className="font-medium text-slate-300">{user.name}</p>
                <p className="capitalize bg-cyan-600/20 text-cyan-300 px-2 py-1 rounded text-xs w-fit">{user.role}</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-1 flex-1">
            {filteredItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start gap-2 ${
                      isActive ? "bg-cyan-600 hover:bg-cyan-700" : "hover:bg-slate-800"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <Button onClick={logout} className="w-full justify-start gap-2 bg-red-600 hover:bg-red-700">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/50 lg:hidden z-30" onClick={() => setOpen(false)} />}
    </>
  )
}
