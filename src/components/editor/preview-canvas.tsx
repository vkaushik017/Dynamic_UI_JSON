"use client"

import type React from "react"

import type { Element } from "@/types/editor"
import { cn } from "@/lib/utils"

interface PreviewCanvasProps {
  elements: Element[]
  selectedElementId: string | undefined
  onSelectElement: (element: Element) => void
}

export function PreviewCanvas({ elements, selectedElementId, onSelectElement }: PreviewCanvasProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Preview</h2>
        <p className="text-sm text-muted-foreground">Click on an element to select it</p>
      </div>

      <div className="flex-1 p-8 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative bg-background border rounded-lg shadow-sm p-8 min-h-[400px] min-w-[400px]">
            {elements.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Add elements from the library
              </div>
            ) : (
              elements.map((element) => (
                <RenderElement
                  key={element.id}
                  element={element}
                  isSelected={element.id === selectedElementId}
                  onClick={() => onSelectElement(element)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface RenderElementProps {
  element: Element
  isSelected: boolean
  onClick: () => void
}

function RenderElement({ element, isSelected, onClick }: RenderElementProps) {
  const { type, props } = element

  // Extract style from props
  const { style = {}, className = "", children, ...otherProps } = props

  // Create safe props without event handlers (we'll handle them separately)
  const safeProps = { ...otherProps }
  delete safeProps.onClick

  // Handle click events
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick()

    // Execute the onClick prop if it exists
    if (props.onClick && typeof props.onClick === "string") {
      try {
        // eslint-disable-next-line no-new-func
        new Function(props.onClick)()
      } catch (error) {
        console.error("Error executing onClick function:", error)
      }
    }
  }

  // Common props for all elements
  const commonProps = {
    onClick: handleClick,
    className: cn(className, isSelected && "ring-2 ring-primary ring-offset-2", "relative"),
    style: { ...style },
  }

  // Render different elements based on type
  switch (type) {
    case "div":
      return (
        <div {...commonProps} {...safeProps}>
          {children}
        </div>
      )

    case "button":
      return (
        <button {...commonProps} {...safeProps}>
          {children}
        </button>
      )

    case "input":
      return <input {...commonProps} {...safeProps} />

    case "image":
      return <img {...commonProps} {...safeProps} />

    case "text":
      return (
        <p {...commonProps} {...safeProps}>
          {children}
        </p>
      )

    default:
      return <div {...commonProps}>Unknown element type: {type}</div>
  }
}
