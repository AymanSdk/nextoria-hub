# React Flow UI Components - Official Implementation

This document outlines all the **official React Flow UI components** installed and integrated into the flowchart application. All components follow the [official React Flow UI documentation](https://reactflow.dev/ui) exactly, without custom styling modifications.

---

## 📦 Installed Components

All components were installed using the official shadcn command:

```bash
bun x shadcn@latest add https://ui.reactflow.dev/[component-name]
```

### Core Components

| Component | File | Status | Documentation |
|-----------|------|--------|---------------|
| **BaseNode** | `components/base-node.tsx` | ✅ Installed | [Docs](https://reactflow.dev/ui/components/base-node) |
| **BaseHandle** | `components/base-handle.tsx` | ✅ Installed | [Docs](https://reactflow.dev/ui/components/base-handle) |
| **LabeledHandle** | `components/labeled-handle.tsx` | ✅ Installed | [Docs](https://reactflow.dev/ui/components/labeled-handle) |
| **DatabaseSchemaNode** | `components/database-schema-node.tsx` | ✅ Installed | [Docs](https://reactflow.dev/ui/components/database-schema-node) |

---

## 🗄️ Database Schema Node - Official Implementation

The Database Schema Node is implemented **exactly as shown in the official React Flow UI documentation**, with no style modifications.

### Component Structure

```typescript
import {
  DatabaseSchemaNode,
  DatabaseSchemaNodeHeader,
  DatabaseSchemaNodeBody,
  DatabaseSchemaTableRow,
  DatabaseSchemaTableCell,
} from "@/components/database-schema-node";
```

### Official Implementation

Located in: `components/flowchart/nodes/database-schema-node.tsx`

```typescript
import { memo } from "react";
import { Position } from "@xyflow/react";
import { LabeledHandle } from "@/components/labeled-handle";
import {
  DatabaseSchemaNode as BaseSchemaNode,
  DatabaseSchemaNodeHeader,
  DatabaseSchemaNodeBody,
  DatabaseSchemaTableRow,
  DatabaseSchemaTableCell,
} from "@/components/database-schema-node";

export type DatabaseSchemaNodeData = {
  data: {
    label: string;
    schema: { title: string; type: string }[];
  };
};

const DatabaseSchemaNodeComponent = memo(({ data }: DatabaseSchemaNodeData) => {
  return (
    <BaseSchemaNode className="p-0">
      <DatabaseSchemaNodeHeader>{data.label}</DatabaseSchemaNodeHeader>
      <DatabaseSchemaNodeBody>
        {data.schema.map((entry) => (
          <DatabaseSchemaTableRow key={entry.title}>
            <DatabaseSchemaTableCell className="pl-0 pr-6 font-light">
              <LabeledHandle
                id={entry.title}
                title={entry.title}
                type="target"
                position={Position.Left}
              />
            </DatabaseSchemaTableCell>
            <DatabaseSchemaTableCell className="pr-0 font-thin">
              <LabeledHandle
                id={entry.title}
                title={entry.type}
                type="source"
                position={Position.Right}
                className="p-0"
                handleClassName="p-0"
                labelClassName="p-0 w-full pr-3 text-right"
              />
            </DatabaseSchemaTableCell>
          </DatabaseSchemaTableRow>
        ))}
      </DatabaseSchemaNodeBody>
    </BaseSchemaNode>
  );
});

DatabaseSchemaNodeComponent.displayName = "DatabaseSchemaNode";

export { DatabaseSchemaNodeComponent as DatabaseSchemaNode };
```

**✅ This matches the official docs exactly!**

---

## 📊 Official Example Data

The flowchart now includes the **official example from React Flow UI documentation** with three database tables:

### 1. Products Table
```typescript
{
  id: "db-products",
  type: "databaseSchema",
  position: { x: 700, y: 100 },
  data: {
    label: "Products",
    schema: [
      { title: "id", type: "uuid" },
      { title: "name", type: "varchar" },
      { title: "description", type: "varchar" },
      { title: "warehouse_id", type: "uuid" },
      { title: "supplier_id", type: "uuid" },
      { title: "price", type: "money" },
      { title: "quantity", type: "int4" },
    ],
  },
}
```

### 2. Warehouses Table
```typescript
{
  id: "db-warehouses",
  type: "databaseSchema",
  position: { x: 1050, y: 0 },
  data: {
    label: "Warehouses",
    schema: [
      { title: "id", type: "uuid" },
      { title: "name", type: "varchar" },
      { title: "address", type: "varchar" },
      { title: "capacity", type: "int4" },
    ],
  },
}
```

### 3. Suppliers Table
```typescript
{
  id: "db-suppliers",
  type: "databaseSchema",
  position: { x: 1050, y: 300 },
  data: {
    label: "Suppliers",
    schema: [
      { title: "id", type: "uuid" },
      { title: "name", type: "varchar" },
      { title: "description", type: "varchar" },
      { title: "country", type: "varchar" },
    ],
  },
}
```

### Database Relations (Edges)

```typescript
// Products → Warehouses (via warehouse_id)
{
  id: "products-warehouses",
  source: "db-products",
  target: "db-warehouses",
  sourceHandle: "warehouse_id",
  targetHandle: "id",
  type: "custom",
  animated: true,
}

// Products → Suppliers (via supplier_id)
{
  id: "products-suppliers",
  source: "db-products",
  target: "db-suppliers",
  sourceHandle: "supplier_id",
  targetHandle: "id",
  type: "custom",
  animated: true,
}
```

---

## 🎯 Features

### Official React Flow UI Styling
- ✅ **Clean, modern design** from shadcn/ui
- ✅ **Dark mode support** built-in
- ✅ **Tailwind CSS** styling
- ✅ **Consistent with React Flow UI** design system

### Database Schema Visualization
- ✅ **Table header** with name
- ✅ **Field list** with types
- ✅ **Connection handles** on each field (left = target, right = source)
- ✅ **Visual foreign key relationships** with animated edges
- ✅ **Clean typography** (font-light for fields, font-thin for types)

### Handle System
- ✅ **Labeled handles** with field names and types
- ✅ **Left handles** (target) for incoming connections
- ✅ **Right handles** (source) for outgoing connections
- ✅ **Unique IDs** per field for precise connections

---

## 🚀 Usage

### Adding a Database Schema Node

**Via Toolbar:**
1. Click the "Add Node" button in the toolbar
2. Select "DB Schema" from the dropdown
3. A new table node with default fields will be created

**Via Node Palette:**
1. Open the Node Palette (left side)
2. Click "Database Schema"
3. Drag or click to add to canvas

### Default Template
When you add a new database schema node, it comes with:
```typescript
{
  label: "Table",
  schema: [
    { title: "id", type: "uuid" },
    { title: "name", type: "varchar" },
    { title: "created_at", type: "timestamp" },
  ],
}
```

### Editing Schema Data

**Properties Panel:**
1. Click on a database schema node
2. Properties panel opens on the right
3. Edit the JSON data directly
4. Schema format:
   ```typescript
   {
     label: "TableName",
     schema: [
       { title: "field_name", type: "data_type" },
       // ... more fields
     ]
   }
   ```

### Connecting Tables

**Creating Relationships:**
1. Click and drag from a field's **right handle** (source)
2. Connect to another table's field **left handle** (target)
3. The edge will show the foreign key relationship
4. Use the sourceHandle and targetHandle IDs that match field names

**Example:**
```typescript
// Connect Products.warehouse_id → Warehouses.id
{
  source: "db-products",
  target: "db-warehouses",
  sourceHandle: "warehouse_id",  // Field in Products
  targetHandle: "id",            // Field in Warehouses
}
```

---

## 🎨 Official Design System

### Colors & Styling

All styling comes from the **official React Flow UI components** and uses shadcn/ui theming:

```css
/* Header */
- Background: bg-secondary
- Text: text-muted-foreground
- Padding: p-2
- Alignment: text-center

/* Fields */
- Field names: font-light, pl-0, pr-6
- Data types: font-thin, pr-0
- Text size: text-xs (12px)
- Row: relative positioning for handles

/* Handles */
- Labeled handles with field names
- Left (target): Position.Left
- Right (source): Position.Right
- Padding: p-0 for precise alignment
- Label alignment: text-right for types
```

### Dark Mode Support

All components automatically support dark mode through:
- `dark:` Tailwind variants
- shadcn/ui theme variables
- Consistent foreground/background colors

---

## 📐 Component Hierarchy

```
DatabaseSchemaNode (BaseNode wrapper)
├── DatabaseSchemaNodeHeader
│   └── Table name
└── DatabaseSchemaNodeBody
    └── <table>
        └── <TableBody>
            └── DatabaseSchemaTableRow (for each field)
                ├── DatabaseSchemaTableCell (left)
                │   └── LabeledHandle (target)
                │       ├── BaseHandle
                │       └── Field name label
                └── DatabaseSchemaTableCell (right)
                    └── LabeledHandle (source)
                        ├── Data type label
                        └── BaseHandle
```

---

## 🔧 Technical Details

### Dependencies

All official React Flow UI components depend on:

```json
{
  "@xyflow/react": "^12.x",
  "lucide-react": "^0.x",
  "tailwindcss": "^3.x",
  "class-variance-authority": "^0.x",
  "clsx": "^2.x",
  "tailwind-merge": "^2.x"
}
```

These are automatically installed by shadcn when adding components.

### Component Registration

Database schema nodes are registered in the flowchart:

```typescript
const nodeTypes: NodeTypes = useMemo(
  () => ({
    base: BaseNode,
    process: ProcessNode,
    decision: DecisionNode,
    startEnd: StartEndNode,
    databaseSchema: DatabaseSchemaNode, // ✅ Official component
  }),
  []
);
```

---

## ✅ Verification Checklist

- [x] **BaseNode** installed and functional
- [x] **BaseHandle** installed and functional
- [x] **LabeledHandle** installed and functional
- [x] **DatabaseSchemaNode** installed and functional
- [x] All sub-components exported correctly
- [x] Official example data added to flowchart
- [x] Database relations with animated edges
- [x] Handles connect properly between tables
- [x] Node palette includes database schema option
- [x] Toolbar includes database schema option
- [x] Properties panel supports editing schema data
- [x] No custom styling modifications
- [x] Matches official React Flow UI docs exactly
- [x] Dark mode support works
- [x] No linter errors

---

## 🌐 Official Resources

- **React Flow UI Home**: https://reactflow.dev/ui
- **Database Schema Node Docs**: https://reactflow.dev/ui/components/database-schema-node
- **Base Node Docs**: https://reactflow.dev/ui/components/base-node
- **Labeled Handle Docs**: https://reactflow.dev/ui/components/labeled-handle
- **shadcn/ui**: https://ui.shadcn.com

---

## 📝 Notes

### Why Use Official Components?

1. **Consistent Design**: Matches React Flow ecosystem design language
2. **Maintained**: Kept up-to-date by React Flow team
3. **Best Practices**: Implements recommended patterns
4. **Accessibility**: Built with a11y in mind
5. **TypeScript**: Full type safety
6. **Customizable**: Based on Tailwind CSS

### No Custom Styling

The implementation follows the official docs **exactly**:
- ✅ Same component structure
- ✅ Same prop interfaces
- ✅ Same className values
- ✅ Same handle positioning
- ✅ Same data format

**Result:** Clean, professional UI that matches React Flow's official design system!

---

**Last Updated:** October 25, 2025  
**React Flow Version:** 12.x  
**shadcn/ui:** Latest  
**Status:** ✅ All Official Components Installed & Functional

