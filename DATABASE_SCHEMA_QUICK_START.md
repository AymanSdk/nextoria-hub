# Database Schema Node - Quick Start Guide

## 🎯 Official React Flow UI Implementation

All database schema components are now installed and configured using the **official React Flow UI components** from [reactflow.dev/ui](https://reactflow.dev/ui/components/database-schema-node).

---

## 🚀 How to Use

### 1. View the Example

Open your flowchart application and you'll see three database tables already connected:

- **Products** table (center)
  - Fields: id, name, description, warehouse_id, supplier_id, price, quantity
  
- **Warehouses** table (top-right)
  - Fields: id, name, address, capacity
  
- **Suppliers** table (bottom-right)
  - Fields: id, name, description, country

**Connections:**
- Products.warehouse_id → Warehouses.id
- Products.supplier_id → Suppliers.id

---

### 2. Add New Database Table

**Option A: Via Toolbar**
1. Click the **"Add Node +"** button in the toolbar (top center)
2. Select **"DB Schema"** from the dropdown
3. A new table appears with default fields

**Option B: Via Node Palette**
1. Open the **Node Palette** on the left side
2. Find **"Database Schema"** (purple icon 🗄️)
3. Click to add to the canvas

---

### 3. Edit Table Data

**Step 1:** Click on any database schema node

**Step 2:** Properties panel opens on the right

**Step 3:** Edit the JSON data:

```json
{
  "label": "Users",
  "schema": [
    { "title": "id", "type": "uuid" },
    { "title": "email", "type": "varchar" },
    { "title": "password_hash", "type": "varchar" },
    { "title": "created_at", "type": "timestamp" }
  ]
}
```

**Step 4:** Changes apply automatically!

---

### 4. Connect Tables (Foreign Keys)

**Creating Relationships:**

1. **Find the source field** (e.g., "user_id" in Posts table)
2. **Click and drag** from its **right handle** (the dot on the right side)
3. **Connect to target field** (e.g., "id" in Users table) **left handle**
4. **Release** - connection is created!

**Visual:**
```
[Posts Table]                    [Users Table]
  └─ user_id ●───────────────●── id ─┘
     (source)      edge      (target)
```

---

## 🎨 Official Design Features

### Clean UI
- ✅ **Modern design** with shadcn/ui components
- ✅ **Dark mode** support built-in
- ✅ **Professional typography** (light/thin fonts)
- ✅ **Consistent spacing** and padding

### Smart Handles
- ✅ **Left handles (●)** = Target (incoming connections)
- ✅ **Right handles (●)** = Source (outgoing connections)
- ✅ **Labeled handles** show field names and types
- ✅ **Precise connections** to specific fields

### Visual Feedback
- ✅ **Animated edges** for database relations
- ✅ **Hover effects** on handles
- ✅ **Clean borders** and spacing
- ✅ **Readable text** at all zoom levels

---

## 📋 Data Format

### Node Structure
```typescript
{
  id: "unique-id",
  type: "databaseSchema",
  position: { x: 100, y: 200 },
  data: {
    label: "TableName",
    schema: [
      { title: "field_name", type: "data_type" },
      // ... more fields
    ]
  }
}
```

### Edge Structure (Foreign Key)
```typescript
{
  id: "unique-edge-id",
  source: "source-table-id",
  target: "target-table-id",
  sourceHandle: "foreign_key_field",  // Field in source table
  targetHandle: "id",                 // Field in target table (usually primary key)
  type: "custom",
  animated: true
}
```

---

## 🛠️ Common Use Cases

### 1. **Create ER Diagram**
```
1. Add database schema nodes for each table
2. Connect foreign keys to primary keys
3. Use auto-layout to organize
4. Export as image for documentation
```

### 2. **Visualize Data Model**
```
1. Define all table schemas with fields and types
2. Show relationships between tables
3. Use colors/groups for different modules
4. Share with team
```

### 3. **Database Migration Planning**
```
1. Create current state with existing tables
2. Add new tables/fields in different positions
3. Show migration path with edges
4. Document changes
```

---

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Select node | Click |
| Multi-select | Ctrl + Click |
| Select all | Ctrl + A |
| Delete selected | Delete / Backspace |
| Copy | Ctrl + C |
| Paste | Ctrl + V |
| Duplicate | Ctrl + D |
| Undo | Ctrl + Z |
| Redo | Ctrl + Shift + Z |
| Box select | V → Drag |
| Pan mode | H → Drag |

---

## 🎯 Pro Tips

### Tip 1: Field Naming
Use clear, consistent field names:
```typescript
✅ Good:
  { title: "user_id", type: "uuid" }
  { title: "created_at", type: "timestamp" }

❌ Avoid:
  { title: "uId", type: "uuid" }
  { title: "dt", type: "timestamp" }
```

### Tip 2: Connection Handles
Each field has **two handles**:
- **Left (●)** - For incoming FK relationships (target)
- **Right (●)** - For outgoing FK relationships (source)

### Tip 3: Organizing Tables
1. Use **Auto Layout** (toolbar) for clean arrangement
2. Group related tables together
3. Place "main" tables in center
4. Place "lookup" tables on edges

### Tip 4: Visual Clarity
- Keep table names short and clear
- Use common data types (uuid, varchar, int, timestamp)
- Limit fields to 5-10 per table for readability
- Use animated edges for active relationships

---

## 🔍 Troubleshooting

### Q: Can't see the handles?
**A:** Zoom in closer - handles appear when you hover over fields

### Q: Connection won't work?
**A:** Make sure you're dragging from **right handle (source)** to **left handle (target)**

### Q: How to edit field names?
**A:** Click node → Properties panel → Edit JSON → Change "title" values

### Q: How to add more fields?
**A:** Click node → Properties panel → Add to schema array:
```json
{ "title": "new_field", "type": "varchar" }
```

### Q: Tables look too small?
**A:** Use **Zoom Slider** (bottom-right) or mouse wheel to zoom in

---

## 📚 Official Resources

- **React Flow UI**: https://reactflow.dev/ui
- **Database Schema Docs**: https://reactflow.dev/ui/components/database-schema-node
- **Full Component List**: See `REACT_FLOW_UI_COMPONENTS.md`

---

## ✅ Quick Checklist

- [x] Official React Flow UI components installed
- [x] Example database tables visible in flowchart
- [x] Can add new database schema nodes via toolbar
- [x] Can add new database schema nodes via palette
- [x] Can edit table/field data via properties panel
- [x] Can connect tables with foreign key relationships
- [x] Handles show on hover
- [x] Connections are animated
- [x] Dark mode support
- [x] Clean, professional design

---

**🎉 You're ready to create beautiful database diagrams!**

**Next Steps:**
1. Open your flowchart at `/flowchart/[roomId]`
2. See the example tables (Products, Warehouses, Suppliers)
3. Try adding your own tables
4. Connect them with relationships
5. Export as image or JSON

---

**Last Updated:** October 25, 2025  
**Status:** ✅ Fully Functional with Official Components

