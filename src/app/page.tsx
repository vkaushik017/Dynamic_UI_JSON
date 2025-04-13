"use client"

import { ResizableLayout } from "@/components/resizable-layout"
import initialConfig from "../data/layoutConfig.json"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false)

  return (
    <div className="min-h-screen p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dynamic Resizable Layout Demo</h1>
        <div className="flex items-center space-x-2">
          <Label htmlFor="admin-mode">Admin Mode</Label>
          <Switch id="admin-mode" checked={isAdmin} onCheckedChange={setIsAdmin} />
        </div>
      </div>
      <ResizableLayout initialConfig={initialConfig as any} isAdmin={isAdmin} />
    </div>
  )
}
