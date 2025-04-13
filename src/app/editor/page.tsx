"use client";

import { ResizableLayoutEditor } from "@/components/resizable/resizable-layout-editor";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="min-h-screen p-4 bg-background text-foreground">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dynamic Resizable Layout Editor</h1>
        <div className="flex items-center space-x-2">
          <Label htmlFor="admin-mode">Admin Mode</Label>
          <Switch
            id="admin-mode"
            checked={isAdmin}
            onCheckedChange={setIsAdmin}
          />
        </div>
      </div>
      <ResizableLayoutEditor isAdmin={isAdmin} />
    </div>
  );
}
