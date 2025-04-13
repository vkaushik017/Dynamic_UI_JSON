"use client"

import type React from "react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Square, Type, ImageIcon, BoxIcon as ButtonIcon, FileInputIcon as InputIcon, Plus } from "lucide-react"
import { ElementType } from "../../types/editor"

interface ElementLibraryProps {
  onAddElement: (elementType: ElementType) => void
}

interface ElementCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
}

const elementTypes: { type: ElementType; title: string; description: string; icon: React.ReactNode }[] = [
  {
    type: "div",
    title: "Container",
    description: "A basic container element",
    icon: <Square className="h-6 w-6" />,
  },
  {
    type: "text",
    title: "Text",
    description: "A text element",
    icon: <Type className="h-6 w-6" />,
  },
  {
    type: "button",
    title: "Button",
    description: "An interactive button",
    icon: <ButtonIcon className="h-6 w-6" />,
  },
  {
    type: "input",
    title: "Input",
    description: "A text input field",
    icon: <InputIcon className="h-6 w-6" />,
  },
  {
    type: "image",
    title: "Image",
    description: "An image element",
    icon: <ImageIcon className="h-6 w-6" />,
  },
]

export function ElementLibrary({ onAddElement }: ElementLibraryProps) {
  return (
    <div className="h-full flex flex-col border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Elements</h2>
        <p className="text-sm text-muted-foreground">Drag or click to add elements to the canvas</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="grid gap-4">
          {elementTypes.map((element) => (
            <ElementCard
              key={element.type}
              title={element.title}
              description={element.description}
              icon={element.icon}
              onClick={() => onAddElement(element.type)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

function ElementCard({ title, description, icon, onClick }: ElementCardProps) {
  return (
    <Card className="cursor-pointer hover:border-primary transition-colors">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-sm">{title}</CardTitle>
          </div>
          <Button size="icon" variant="ghost" onClick={onClick} className="h-6 w-6">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
