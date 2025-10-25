# 📊 Database Schema Node - Complete Guide

## ✅ Installation Complete!

The **Database Schema Node** from [React Flow UI](https://reactflow.dev/ui/components/database-schema-node) has been successfully installed and integrated!

---

## 🎯 What is it?

A specialized node type for visualizing database tables, their fields, and relationships - perfect for:

- **ER Diagrams** (Entity-Relationship diagrams)
- **Database Design** visualization
- **API Schema** documentation
- **Data Flow** diagrams
- **System Architecture** with databases

---

## 📦 What Was Installed

### Dependencies

- `@/components/database-schema-node` - Main schema node component
- `@/components/labeled-handle` - Handles with labels
- `@/components/base-node` - Base node wrapper
- `@/components/ui/table` - Table UI component

### Integration

- ✅ Added to node types registry
- ✅ Added to toolbar (Press **6** or use dropdown)
- ✅ Added to Node Palette (left sidebar)
- ✅ Keyboard shortcut: **`6`**

---

## 🚀 How to Use

### Method 1: Keyboard Shortcut

```
Press 6 → Database Schema node appears
```

### Method 2: Toolbar

1. Click "Add Node" dropdown in toolbar
2. Select "DB Schema"

### Method 3: Node Palette

1. Open Node Palette (left sidebar)
2. Click "Database Schema" card

---

## 🎨 Node Structure

Each Database Schema node shows:

```
┌─────────────────────┐
│    Table Name       │ ← Header
├─────────────────────┤
│ id         → uuid   │ ← Fields with types
│ name       → varchar│
│ created_at → timestamp│
└─────────────────────┘
```

### Field Components:

- **Left side**: Field name with input handle (•)
- **Key indicator**: 🔑 for primary/foreign keys
- **Right side**: Data type with output handle (•)

---

## 🔧 Default Schema

When you add a new Database Schema node, it comes with:

```json
{
  "label": "Table",
  "schema": [
    { "title": "id", "type": "uuid", "key": true },
    { "title": "name", "type": "varchar" },
    { "title": "created_at", "type": "timestamp" }
  ]
}
```

---

## ✏️ Customizing Schema

### Edit via Properties Panel

1. Click the schema node
2. Properties panel opens on the right
3. Edit the label (table name)
4. _Note: Field editing coming soon via properties panel_

### Edit via Data Table

1. Click **Database icon** (🗄️) in toolbar
2. View all nodes in table format
3. See all schema fields
4. Export as CSV

---

## 🔗 Connecting Schemas

### Creating Relationships

1. **Foreign Key Connections**:

   - Drag from field output handle →
   - Connect to another field's input handle
   - Represents relationships between tables

2. **Example: Products → Suppliers**:

   ```
   Products.supplier_id → Suppliers.id
   ```

3. **Multiple Connections**:
   - Each field can have multiple connections
   - One-to-Many relationships
   - Many-to-Many via junction tables

---

## 💡 Real-World Examples

### Example 1: E-commerce Database

**Users Table**:

```javascript
{
  label: "Users",
  schema: [
    { title: "id", type: "uuid", key: true },
    { title: "email", type: "varchar" },
    { title: "password", type: "varchar" },
    { title: "created_at", type: "timestamp" }
  ]
}
```

**Orders Table**:

```javascript
{
  label: "Orders",
  schema: [
    { title: "id", type: "uuid", key: true },
    { title: "user_id", type: "uuid" },
    { title: "total", type: "money" },
    { title: "status", type: "varchar" }
  ]
}
```

**Connection**: `Orders.user_id` → `Users.id`

---

### Example 2: Blog System

**Posts**:

```javascript
{
  label: "Posts",
  schema: [
    { title: "id", type: "uuid", key: true },
    { title: "title", type: "varchar" },
    { title: "content", type: "text" },
    { title: "author_id", type: "uuid" },
    { title: "published_at", type: "timestamp" }
  ]
}
```

**Authors**:

```javascript
{
  label: "Authors",
  schema: [
    { title: "id", type: "uuid", key: true },
    { title: "name", type: "varchar" },
    { title: "bio", type: "text" }
  ]
}
```

**Comments**:

```javascript
{
  label: "Comments",
  schema: [
    { title: "id", type: "uuid", key: true },
    { title: "post_id", type: "uuid" },
    { title: "author_id", type: "uuid" },
    { title: "content", type: "text" }
  ]
}
```

---

## 🎯 Common Data Types

### PostgreSQL Types:

- `uuid` - Unique identifier
- `varchar` - Variable character string
- `text` - Unlimited text
- `int4` / `int8` - Integers
- `money` - Currency
- `timestamp` - Date and time
- `boolean` - True/False
- `jsonb` - JSON data

### MySQL Types:

- `INT` - Integer
- `VARCHAR` - Variable string
- `TEXT` - Long text
- `DATETIME` - Date and time
- `DECIMAL` - Precise numbers
- `ENUM` - Enumeration

### General Types:

- `string` - Text data
- `number` - Numeric data
- `date` - Date values
- `boolean` - True/False
- `array` - List of items
- `object` - Structured data

---

## 🎨 Styling

The Database Schema nodes use:

- **Clean table layout** for easy reading
- **Purple color scheme** for database nodes
- **Labeled handles** showing field names and types
- **Key indicators** (🔑) for important fields
- **Hover effects** for better UX

---

## 📊 Integration with Data Table

When Data Table is open:

1. All schema nodes are listed
2. Shows table names
3. Export entire database structure as CSV
4. View all fields and types in table format

---

## ⌨️ Keyboard Shortcuts

- **6** - Quick add Database Schema node
- **Click node** - Edit in Properties Panel
- **Delete** - Remove selected schema node
- **Ctrl+D** - Duplicate schema node
- **Ctrl+C/V** - Copy/Paste schema structure

---

## 🔄 Use Cases

### 1. **Database Design**

- Visualize table structures
- Plan relationships
- Document schema
- Share with team

### 2. **API Documentation**

- Show data models
- Document endpoints
- Illustrate data flow
- Explain relationships

### 3. **System Architecture**

- Database layer visualization
- Service dependencies
- Data flow diagrams
- Integration patterns

### 4. **Education**

- Teach database concepts
- Demonstrate normalization
- Show ER diagrams
- Explain relationships

---

## 🚀 Pro Tips

1. **Use Auto Layout**:

   - Add multiple schema nodes
   - Select all (Ctrl+A)
   - Click Auto Layout → Left to Right
   - Perfect ER diagram!

2. **Color Code by Module**:

   - Group related tables
   - Use align tools
   - Create visual sections

3. **Export for Documentation**:

   - Create complete schema
   - Export as PNG/SVG
   - Include in documentation
   - Share with team

4. **Connection Labels**:
   - Add edge labels for relationship types
   - "1:M" for One-to-Many
   - "M:M" for Many-to-Many

---

## 🎓 Advanced Patterns

### Junction Tables (Many-to-Many)

```
Students ←→ Enrollments ←→ Courses
```

### Inheritance

```
Person ← Employee
       ← Customer
```

### Aggregation

```
Order → OrderItems
      → Products
```

---

## 📚 References

- [React Flow UI - Database Schema](https://reactflow.dev/ui/components/database-schema-node)
- [React Flow Examples](https://reactflow.dev/examples)
- [ER Diagram Basics](https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model)

---

## ✨ Summary

You can now:

- ✅ Add database schema nodes (Press **6**)
- ✅ Create ER diagrams
- ✅ Visualize relationships
- ✅ Export database structures
- ✅ Document data models
- ✅ Build system architecture diagrams

**The database schema node is perfect for visualizing your database structure!** 🎉
