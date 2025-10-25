# Flowchart Component - React Flow UI

A professional flowchart editor built with [React Flow](https://reactflow.dev/) and [React Flow UI](https://reactflow.dev/ui) components, styled with shadcn/ui and Tailwind CSS.

## 🎨 Features

- **Multiple Node Types**
  - Start/End nodes with rounded styling
  - Process nodes with status indicators
  - Decision nodes (diamond shape)
  - Base nodes with customizable variants and icons

- **Custom Edges**
  - Smooth step path connections
  - Edge labels
  - Delete button on hover
  - Animated connections

- **Enhanced Controls**
  - Node Palette - Quick access to add any node type
  - Properties Panel - Edit node properties on selection
  - Toolbar - Add nodes, zoom controls, delete, import/export
  - Zoom Slider - Precise zoom control with percentage display
  - Mini Map - Navigate large flowcharts easily

- **Collaboration Ready**
  - Room-based architecture
  - Real-time sync capability (ready for Liveblocks integration)
  - Multi-user support

## 📁 Structure

```
components/flowchart/
├── nodes/
│   ├── base-node.tsx         # Customizable node with variants
│   ├── process-node.tsx      # Process node with status
│   ├── decision-node.tsx     # Diamond-shaped decision node
│   └── start-end-node.tsx    # Start/End circular nodes
├── edges/
│   └── custom-edge.tsx       # Custom edge with label & delete
├── controls/
│   ├── node-palette.tsx      # Side panel to add nodes
│   └── zoom-slider.tsx       # Zoom control slider
├── toolbar/
│   └── flowchart-toolbar.tsx # Top toolbar with actions
├── properties-panel.tsx      # Right panel to edit nodes
└── flowchart-canvas.tsx      # Main canvas component
```

## 🚀 Usage

```tsx
import { FlowchartCanvas } from "@/components/flowchart/flowchart-canvas";

export default function Page() {
  return (
    <div className="h-screen w-full">
      <FlowchartCanvas />
    </div>
  );
}
```

## 🎯 Node Types

### Start/End Node
```tsx
{
  id: "1",
  type: "startEnd",
  data: { label: "Start", type: "start" },
  position: { x: 250, y: 50 }
}
```

### Process Node
```tsx
{
  id: "2",
  type: "process",
  data: { label: "Process Data", status: "running" }, // idle, running, success, error
  position: { x: 250, y: 150 }
}
```

### Decision Node
```tsx
{
  id: "3",
  type: "decision",
  data: { label: "Valid?" },
  position: { x: 250, y: 250 }
}
```

### Base Node
```tsx
{
  id: "4",
  type: "base",
  data: {
    label: "Custom Node",
    description: "Optional description",
    icon: <Icon />,
    variant: "info" // default, success, warning, error, info
  },
  position: { x: 250, y: 350 }
}
```

## 🎨 Customization

### Node Colors
Each node type has its own color scheme:
- Start: Emerald green
- End: Rose red
- Process: Blue (varies by status)
- Decision: Amber
- Base: Configurable by variant

### Edge Customization
Edges support:
- Custom labels
- Delete buttons
- Smooth step paths
- Animation

## ⌨️ Keyboard Shortcuts

- `Delete` / `Backspace` - Delete selected items
- `Control + Click` - Multi-select
- Drag canvas - Pan
- Mouse wheel - Zoom

## 📦 Dependencies

- `@xyflow/react` - React Flow library
- `shadcn/ui` - UI components
- `lucide-react` - Icons
- `sonner` - Toast notifications
- `nanoid` - ID generation

## 🔄 Import/Export

The flowchart supports JSON import/export:

```json
{
  "nodes": [...],
  "edges": [...],
  "viewport": { "x": 0, "y": 0, "zoom": 1 }
}
```

## 🎓 Learn More

- [React Flow Documentation](https://reactflow.dev/)
- [React Flow UI Components](https://reactflow.dev/ui)
- [shadcn/ui](https://ui.shadcn.com/)

