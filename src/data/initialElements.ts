import { Element } from "../types/editor";

export const initialElements: Element[] = [
  {
    id: "element-1",
    type: "div",
    props: {
      className: "bg-gray-100 p-4 rounded mb-4",
      style: { width: "300px", height: "100px" },
      children: "This is a container element",
    },
  },
  {
    id: "element-2",
    type: "button",
    props: {
      className: "bg-blue-500 text-white px-4 py-2 rounded",
      onClick: "alert('Button clicked!')",
      children: "Click Me",
    },
  },
  {
    id: "element-3",
    type: "text",
    props: {
      className: "text-lg font-medium mt-4",
      children: "This is a text element",
    },
  },
];
