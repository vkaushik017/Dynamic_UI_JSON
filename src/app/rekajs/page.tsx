"use client"

import { useState } from "react"
import { ElementLibrary } from "@/components/editor/element-library"
import { PropertiesPanel } from "@/components/editor/properties-panel"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { initialElements } from "@/data/initialElements"
import { ElementType } from "@/types/editor"
import { PreviewCanvas } from "@/components/editor/preview-canvas"

export default function EditorPage() {
  // State for the currently selected element
  const [selectedElement, setSelectedElement] = useState<Element | null>(null)

  // State for all elements in the canvas
  const [elements, setElements] = useState<Element[]>(initialElements as any)

  // Handle element selection
  const handleSelectElement = (element: Element) => {
    setSelectedElement(element)
  }

  // Handle adding a new element to the canvas
  const handleAddElement = (elementType: ElementType) => {
    const newElement: Element = {
      id: `element-${Date.now()}`,
      type: elementType,
      props: getDefaultPropsForType(elementType),
    }

    setElements([...elements, newElement])
    setSelectedElement(newElement)
  }

  // Handle updating element properties
  const handleUpdateElementProps = (elementId: string, props: Record<string, any>) => {
    setElements(
      elements.map((element) =>
        element.id === elementId ? { ...element, props: { ...element.props, ...props } } : element,
      ),
    )

    if (selectedElement?.id === elementId) {
      setSelectedElement({ ...selectedElement, props: { ...selectedElement.props, ...props } })
    }
  }

  return (
    <div className="h-screen w-full bg-background">
      <ResizablePanelGroup direction="horizontal">
        {/* Left Sidebar - Element Library */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <ElementLibrary onAddElement={handleAddElement} />
        </ResizablePanel>

        <ResizableHandle />

        {/* Middle Section - Preview Canvas */}
        <ResizablePanel defaultSize={50}>
          <PreviewCanvas
            elements={elements}
            selectedElementId={selectedElement?.id}
            onSelectElement={handleSelectElement}
          />
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Sidebar - Properties Panel */}
        <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
          <PropertiesPanel selectedElement={selectedElement} onUpdateProps={handleUpdateElementProps} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

// Helper function to get default props for each element type
function getDefaultPropsForType(type: ElementType): Record<string, any> {
  switch (type) {
    case "div":
      return {
        className: "bg-gray-100 p-4 rounded",
        style: { width: "200px", height: "100px" },
        children: "Div Element",
      }
    case "button":
      return {
        className: "bg-blue-500 text-white px-4 py-2 rounded",
        onClick: "alert('Button clicked')",
        children: "Button",
      }
    case "input":
      return {
        type: "text",
        className: "border p-2 rounded",
        placeholder: "Enter text...",
        style: { width: "200px" },
      }
    case "image":
      return {
        src: "/placeholder.svg?height=100&width=200",
        alt: "Placeholder image",
        className: "rounded",
        style: { width: "200px", height: "100px" },
      }
    case "text":
      return {
        children: "Text Element",
        className: "text-lg font-medium",
      }
    default:
      return {}
  }
}
