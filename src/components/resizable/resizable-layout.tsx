"use client"

import React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { cn } from "@/lib/utils"

interface PanelConfig {
  id: string
  defaultSize: number
  minSize?: number
  maxSize?: number
  content?: React.ReactNode
  contentContainerClass?: string
  textClass?: string
  isAdminOnly?: boolean
  nested?: any
}

interface ResizableLayoutConfig {
  direction: "horizontal" | "vertical"
  className?: string
  panels: PanelConfig[]
}

interface ResizableLayoutProps {
  config: ResizableLayoutConfig
  isAdmin?: boolean
}

export const ResizableLayout: React.FC<ResizableLayoutProps> = ({ config, isAdmin = false }) => {
  const { direction, className, panels } = config

  // Filter out admin-only panels if user is not admin
  const visiblePanels = panels.filter((panel) => !panel.isAdminOnly || isAdmin)

  // If no panels are visible, return a placeholder
  if (visiblePanels.length === 0) {
    return <div className={cn("flex items-center justify-center h-full", className)}>No panels to display</div>
  }

  // If only one panel is visible, render it without ResizablePanelGroup
  if (visiblePanels.length === 1) {
    const panel = visiblePanels[0]
    return (
      <div className={className}>
        {panel.nested ? (
          <ResizableLayout config={panel.nested} isAdmin={isAdmin} />
        ) : (
          <div className={panel.contentContainerClass}>
            {typeof panel.content === "string" ? (
              <span className={panel.textClass}>{panel.content}</span>
            ) : (
              panel.content
            )}
          </div>
        )}
      </div>
    )
  }

  // Ensure panel sizes add up to 100%
  const totalSize = visiblePanels.reduce((sum, panel) => sum + panel.defaultSize, 0)
  const normalizedPanels = visiblePanels.map((panel) => ({
    ...panel,
    defaultSize: Math.round((panel.defaultSize / totalSize) * 100),
  }))

  return (
    <ResizablePanelGroup direction={direction} className={className}>
      {normalizedPanels.map((panel, index) => (
        <React.Fragment key={panel.id}>
          <ResizablePanel
            defaultSize={panel.defaultSize}
            minSize={panel.minSize || 10}
            maxSize={panel.maxSize || 90}
            className="overflow-hidden"
          >
            {panel.nested ? (
              <ResizableLayout config={panel.nested} isAdmin={isAdmin} />
            ) : (
              <div className={panel.contentContainerClass}>
                {typeof panel.content === "string" ? (
                  <span className={panel.textClass}>{panel.content}</span>
                ) : (
                  panel.content
                )}
              </div>
            )}
          </ResizablePanel>
          {index < normalizedPanels.length - 1 && <ResizableHandle />}
        </React.Fragment>
      ))}
    </ResizablePanelGroup>
  )
}
