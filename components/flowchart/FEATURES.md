# ✨ Flowchart UI - Feature Overview

## 🎨 What's New

Your flowchart editor has been completely redesigned using [React Flow UI](https://reactflow.dev/ui) components with professional styling!

### 🔷 Custom Node Types

#### 1. **Start/End Nodes** (`startEnd`)

- Beautiful circular/pill-shaped design
- Green for Start, Red for End
- Clear visual indicators with icons

#### 2. **Process Nodes** (`process`)

- Real-time status indicators (idle, running, success, error)
- Animated pulse effect when running
- Settings icon for easy identification

#### 3. **Decision Nodes** (`decision`)

- Classic diamond shape (rotated 45°)
- Two output handles: "Yes" (green) and "No" (red)
- Perfect for conditional logic

#### 4. **Base Nodes** (`base`)

- Fully customizable with 5 variants:
  - Default (neutral)
  - Success (green)
  - Warning (yellow)
  - Error (red)
  - Info (blue)
- Support for custom icons
- Optional description field

### 🎯 Enhanced UI Components

#### **Node Palette** (Left Side)

- Collapsible panel with all node types
- Click to add nodes instantly
- Beautiful card-based design
- Descriptions for each node type

#### **Flowchart Toolbar** (Top Center)

- Quick add buttons for all node types
- Zoom controls (In/Out/Fit View)
- Delete selected items
- Import/Export flowchart as JSON

#### **Properties Panel** (Right Side)

- Edit node labels in real-time
- Change node descriptions
- Update status for process nodes
- Switch variants for base nodes
- View node metadata (ID, type, position)
- Collapsible to save space

#### **Zoom Slider** (Bottom Right)

- Precise zoom control (10% - 200%)
- Live percentage display
- Smooth zoom animations

### 🎮 User Experience Features

✅ **Snap to Grid** - Nodes align to a 15x15 grid for clean layouts
✅ **Multi-Selection** - Hold Control to select multiple items
✅ **Keyboard Shortcuts** - Delete/Backspace to remove selected
✅ **Click to Edit** - Click any node to open properties panel
✅ **Drag & Drop** - Intuitive node positioning
✅ **Connection Validation** - Visual feedback when connecting nodes
✅ **Mini Map** - Navigate large flowcharts easily
✅ **Background Pattern** - Beautiful dot grid background

### 🔄 Import/Export

Save and load flowcharts as JSON:

```json
{
  "nodes": [...],
  "edges": [...],
  "viewport": { "x": 0, "y": 0, "zoom": 1 }
}
```

### 🎨 Theming

All components support dark mode and automatically adapt to your theme:

- Light mode: Clean white backgrounds with subtle shadows
- Dark mode: Dark backgrounds with proper contrast
- Consistent color schemes across all components

### 📱 Responsive Design

- Mobile-friendly controls
- Collapsible panels to maximize canvas space
- Touch-friendly interface
- Adaptive toolbar layout

## 🚀 Quick Start

1. Navigate to `/flowchart`
2. Click "Create Flowchart"
3. Use the Node Palette to add nodes
4. Connect nodes by dragging from handles
5. Click nodes to edit properties
6. Export your work when done!

## 🎯 Example Use Cases

- **Process Documentation** - Document business processes
- **Decision Trees** - Visualize decision logic
- **User Flows** - Map user journeys
- **System Architecture** - Design system flows
- **Workflow Automation** - Plan automation workflows

## 📚 References

- [React Flow Documentation](https://reactflow.dev/)
- [React Flow UI Components](https://reactflow.dev/ui)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

Built with ❤️ using React Flow and shadcn/ui
