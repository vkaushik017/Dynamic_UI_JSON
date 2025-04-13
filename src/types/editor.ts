export type ElementType = "div" | "button" | "input" | "image" | "text"

export interface Element {
  id: string
  type: ElementType
  props: Record<string, any>
}
