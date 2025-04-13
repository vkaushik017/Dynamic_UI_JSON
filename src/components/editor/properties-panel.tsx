"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Element } from "@/types/editor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Settings, Code, Palette } from "lucide-react"

interface PropertiesPanelProps {
  selectedElement: Element | null
  onUpdateProps: (elementId: string, props: Record<string, any>) => void
}

export function PropertiesPanel({ selectedElement, onUpdateProps }: PropertiesPanelProps) {
  const [localProps, setLocalProps] = useState<Record<string, any>>({})

  // Update local props when selected element changes
  useEffect(() => {
    if (selectedElement) {
      setLocalProps(selectedElement.props || {})
    } else {
      setLocalProps({})
    }
  }, [selectedElement])

  // Handle property change
  const handlePropertyChange = (key: string, value: any) => {
    if (!selectedElement) return

    const updatedProps = { ...localProps, [key]: value }
    setLocalProps(updatedProps)
    onUpdateProps(selectedElement.id, { [key]: value })
  }

  // Handle style property change
  const handleStyleChange = (key: string, value: any) => {
    if (!selectedElement) return

    const currentStyle = localProps.style || {}
    const updatedStyle = { ...currentStyle, [key]: value }

    setLocalProps({ ...localProps, style: updatedStyle })
    onUpdateProps(selectedElement.id, { style: updatedStyle })
  }

  if (!selectedElement) {
    return (
      <div className="h-full flex flex-col border-l">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Properties</h2>
          <p className="text-sm text-muted-foreground">Select an element to edit its properties</p>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">No element selected</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col border-l">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Properties</h2>
        <p className="text-sm text-muted-foreground">
          Editing {selectedElement.type} ({selectedElement.id})
        </p>
      </div>

      <Tabs defaultValue="properties" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2 grid w-auto grid-cols-3">
          <TabsTrigger value="properties">
            <Settings className="h-4 w-4 mr-2" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="styles">
            <Palette className="h-4 w-4 mr-2" />
            Styles
          </TabsTrigger>
          <TabsTrigger value="events">
            <Code className="h-4 w-4 mr-2" />
            Events
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 p-4">
          <TabsContent value="properties" className="mt-0">
            <PropertySection title="Basic Properties">
              {selectedElement.type === "div" ||
              selectedElement.type === "text" ||
              selectedElement.type === "button" ? (
                <PropertyField
                  label="Content"
                  type="textarea"
                  value={localProps.children || ""}
                  onChange={(value) => handlePropertyChange("children", value)}
                />
              ) : null}

              <PropertyField
                label="Class Name"
                type="text"
                value={localProps.className || ""}
                onChange={(value) => handlePropertyChange("className", value)}
              />

              {selectedElement.type === "input" && (
                <>
                  <PropertyField
                    label="Placeholder"
                    type="text"
                    value={localProps.placeholder || ""}
                    onChange={(value) => handlePropertyChange("placeholder", value)}
                  />
                  <PropertyField
                    label="Type"
                    type="select"
                    options={["text", "password", "email", "number", "date"]}
                    value={localProps.type || "text"}
                    onChange={(value) => handlePropertyChange("type", value)}
                  />
                </>
              )}

              {selectedElement.type === "image" && (
                <>
                  <PropertyField
                    label="Source (URL)"
                    type="text"
                    value={localProps.src || ""}
                    onChange={(value) => handlePropertyChange("src", value)}
                  />
                  <PropertyField
                    label="Alt Text"
                    type="text"
                    value={localProps.alt || ""}
                    onChange={(value) => handlePropertyChange("alt", value)}
                  />
                </>
              )}
            </PropertySection>
          </TabsContent>

          <TabsContent value="styles" className="mt-0">
            <PropertySection title="Dimensions">
              <div className="grid grid-cols-2 gap-4">
                <PropertyField
                  label="Width"
                  type="text"
                  value={(localProps.style?.width || "").toString()}
                  onChange={(value) => handleStyleChange("width", value)}
                />
                <PropertyField
                  label="Height"
                  type="text"
                  value={(localProps.style?.height || "").toString()}
                  onChange={(value) => handleStyleChange("height", value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <PropertyField
                  label="Min Width"
                  type="text"
                  value={(localProps.style?.minWidth || "").toString()}
                  onChange={(value) => handleStyleChange("minWidth", value)}
                />
                <PropertyField
                  label="Min Height"
                  type="text"
                  value={(localProps.style?.minHeight || "").toString()}
                  onChange={(value) => handleStyleChange("minHeight", value)}
                />
              </div>
            </PropertySection>

            <PropertySection title="Spacing">
              <PropertyField
                label="Padding"
                type="text"
                value={(localProps.style?.padding || "").toString()}
                onChange={(value) => handleStyleChange("padding", value)}
              />
              <PropertyField
                label="Margin"
                type="text"
                value={(localProps.style?.margin || "").toString()}
                onChange={(value) => handleStyleChange("margin", value)}
              />
            </PropertySection>

            <PropertySection title="Appearance">
              <PropertyField
                label="Background Color"
                type="text"
                value={(localProps.style?.backgroundColor || "").toString()}
                onChange={(value) => handleStyleChange("backgroundColor", value)}
              />
              <PropertyField
                label="Text Color"
                type="text"
                value={(localProps.style?.color || "").toString()}
                onChange={(value) => handleStyleChange("color", value)}
              />
              <PropertyField
                label="Border"
                type="text"
                value={(localProps.style?.border || "").toString()}
                onChange={(value) => handleStyleChange("border", value)}
              />
              <PropertyField
                label="Border Radius"
                type="text"
                value={(localProps.style?.borderRadius || "").toString()}
                onChange={(value) => handleStyleChange("borderRadius", value)}
              />
            </PropertySection>
          </TabsContent>

          <TabsContent value="events" className="mt-0">
            <PropertySection title="Event Handlers">
              <PropertyField
                label="onClick"
                type="textarea"
                value={localProps.onClick || ""}
                onChange={(value) => handlePropertyChange("onClick", value)}
              />
              <PropertyField
                label="onMouseOver"
                type="textarea"
                value={localProps.onMouseOver || ""}
                onChange={(value) => handlePropertyChange("onMouseOver", value)}
              />
              <PropertyField
                label="onMouseOut"
                type="textarea"
                value={localProps.onMouseOut || ""}
                onChange={(value) => handlePropertyChange("onMouseOut", value)}
              />
            </PropertySection>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}

interface PropertySectionProps {
  title: string
  children: React.ReactNode
}

function PropertySection({ title, children }: PropertySectionProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-2 space-y-4">{children}</CardContent>
    </Card>
  )
}

interface PropertyFieldProps {
  label: string
  type: "text" | "textarea" | "number" | "checkbox" | "select"
  value: any
  onChange: (value: any) => void
  options?: string[]
}

function PropertyField({ label, type, value, onChange, options = [] }: PropertyFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (type === "checkbox") {
      onChange((e.target as HTMLInputElement).checked)
    } else {
      onChange(e.target.value)
    }
  }

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={label}>{label}</Label>

      {type === "text" && <Input id={label} value={value} onChange={handleChange} />}

      {type === "textarea" && <Textarea id={label} value={value} onChange={handleChange} rows={3} />}

      {type === "number" && <Input id={label} type="number" value={value} onChange={handleChange} />}

      {type === "checkbox" && <Switch id={label} checked={value} onCheckedChange={onChange} />}

      {type === "select" && (
        <select
          id={label}
          value={value}
          onChange={handleChange}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
