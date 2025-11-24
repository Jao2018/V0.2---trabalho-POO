"use client"

import { Sidebar } from "@/components/layout/sidebar"
import Settings from "@/components/pages/settings"

export default function SettingsPage() {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 lg:ml-0">
        <Settings />
      </main>
    </div>
  )
}
