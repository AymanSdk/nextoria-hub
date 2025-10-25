# 🎯 Enhanced Box Selection - Complete Guide

## ✨ What's New

**Box selection (drag to select) is now super easy to use with enhanced visual feedback!**

---

## 🖱️ How Box Selection Works

### Step-by-Step Guide

1. **Enter Selection Mode**

   ```
   Press V → Selection Mode activated
   ```

   You'll see: **"Selection Mode | Drag to select"** badge at bottom-left

2. **Start Dragging**

   ```
   Click on empty canvas → Hold → Drag
   ```

3. **Visual Feedback**

   - **Blue selection box** appears with smooth animation
   - **Semi-transparent background** (15% opacity)
   - **Solid blue border** (2px)
   - **Rounded corners** for modern look

4. **Release to Select**
   ```
   Release mouse → All items in box are selected
   ```
   - Nodes with **blue ring** around them
   - Edges turn **blue** and thicker
   - **Count badge** appears at top: "3 nodes & 2 edges selected [5]"

---

## 🎨 Visual Enhancements

### Selection Box Styling

```css
- Color: Blue (rgb(59, 130, 246))
- Background: 15% opacity blue
- Border: 2px solid blue
- Animation: Smooth fade-in + scale
- Cursor: Crosshair when ready
```

### Selected Items

```css
- Nodes: Blue ring (2px shadow)
- Edges: Blue color, thicker (3px)
- Animation: Smooth transitions
```

### Mode Indicators

```css
Bottom-left badge shows:
- Selection Mode: Blue badge with "Drag to select"
- Pan Mode: Gray badge with "Drag to move canvas"
```

---

## 🎯 Selection Modes

### Partial Selection (Current)

- **Selects items that are partially or fully in box**
- More forgiving and easier to use
- Default mode

### Full Selection (Alternative)

- Only selects items **completely inside** the box
- More precise control
- Can be enabled by changing: `SelectionMode.Full`

---

## 🚀 Usage Examples

### Example 1: Select Multiple Nodes

```
1. Press V (Selection Mode)
2. Drag a box around nodes
3. All nodes in box selected
4. Use Align tools to organize them
```

### Example 2: Select Everything in Area

```
1. Press V
2. Drag from top-left to bottom-right
3. All items selected
4. Press Delete to remove
```

### Example 3: Add to Selection

```
1. Drag box to select first group
2. Hold Ctrl + Click individual nodes
3. Add more items to selection
4. Copy/Paste or Duplicate (Ctrl+D)
```

### Example 4: Quick Alignment

```
1. Drag box to select nodes
2. Right-click → Align → Align Left
3. All selected nodes align perfectly
```

---

## 💡 Pro Tips

### 1. **Quick Multi-Select**

```
Drag box across items → Instant selection
Faster than Ctrl+Click each item
```

### 2. **Use with Auto Layout**

```
1. Select all related nodes (drag box)
2. Toolbar → Auto Layout → Left to Right
3. Perfect organization!
```

### 3. **Combine with Ctrl+Click**

```
1. Drag box for main selection
2. Hold Ctrl + Click to add/remove items
3. Fine-tune your selection
```

### 4. **Selection + Copy = Template**

```
1. Design a pattern with multiple nodes
2. Drag box to select all
3. Ctrl+D to duplicate
4. Repeat pattern across canvas
```

### 5. **Quick Delete**

```
1. Drag box over unwanted items
2. Press Delete
3. All selected items removed
```

---

## ⌨️ Keyboard Shortcuts

### Selection Mode

```
V     - Enter Selection Mode
H     - Enter Pan Mode
Esc   - Deselect all
```

### Multi-Select

```
Ctrl+A        - Select all
Ctrl+Click    - Add/remove from selection
Shift+Click   - (Future: Range select)
```

### Actions on Selected

```
Delete        - Delete selected
Ctrl+C        - Copy selected
Ctrl+X        - Cut selected
Ctrl+D        - Duplicate selected
Right-Click   - Context menu
```

---

## 🎨 Visual Indicators

### Bottom-Left Badge

Shows current mode and hint:

**Selection Mode:**

```
🖱️ Selection Mode | 📦 Drag to select
```

**Pan Mode:**

```
✋ Pan Mode | Drag to move canvas
```

### Top-Center Badge

Shows selection count (appears when items selected):

```
🖱️ 3 nodes & 2 edges selected [5]
```

### Cursor Changes

```
Selection Mode: Crosshair (✚) when over canvas
Pan Mode: Hand (✋) when over canvas
Dragging Pan: Grabbing hand (✊)
```

---

## 🎓 Interactive Guide

### First-Time User Guide

When you first open the flowchart:

1. **Guide appears** after 2 seconds
2. Shows **step-by-step instructions**
3. **"Got it!" button** to dismiss
4. **Never shows again** (saved in localStorage)

### Guide Content:

```
✓ How to enable selection mode
✓ How to drag box selection
✓ What happens when you select
✓ Tips for Ctrl+Click
```

---

## 🔧 Technical Details

### Selection Algorithm

```typescript
selectionMode={SelectionMode.Partial}
```

- **Partial**: Includes items partially in box
- **Full**: Only fully enclosed items

### Pan Detection

```typescript
panOnDrag={interactionMode === "pan"}
```

- Automatically switches based on mode
- No accidental panning in selection mode

### Multi-Selection

```typescript
multiSelectionKeyCode = "Control";
```

- Hold Ctrl for multi-select
- Works with both click and box selection

---

## 📊 Use Cases

### 1. **Database ER Diagrams**

```
Select multiple table schemas → Align → Connect
```

### 2. **Complex Flowcharts**

```
Select process group → Copy → Paste → Build patterns
```

### 3. **Quick Cleanup**

```
Drag box over unwanted section → Delete
```

### 4. **Reorganization**

```
Select all nodes → Auto Layout → Clean diagram
```

### 5. **Duplicate Patterns**

```
Create pattern → Select → Duplicate → Move
```

---

## 🎯 Comparison: Click vs Box Select

| Action              | Click Select  | Box Select    |
| ------------------- | ------------- | ------------- |
| **Single item**     | ✅ Easy       | ❌ Overkill   |
| **2-3 items**       | 🤔 Hold Ctrl  | ✅ Quick drag |
| **5+ items**        | ❌ Tedious    | ✅ Very fast  |
| **Area select**     | ❌ Impossible | ✅ Perfect    |
| **Precise control** | ✅ Exact      | 🤔 Partial    |

---

## 🚀 Advanced Techniques

### 1. **Lasso Selection Pattern**

```
1. Start at top-left of group
2. Drag diagonally to bottom-right
3. Release - all items captured
```

### 2. **Exclude Items**

```
1. Drag box to select large group
2. Ctrl+Click to deselect unwanted items
3. Work with refined selection
```

### 3. **Iterative Selection**

```
1. Select first group with box
2. Copy (Ctrl+C)
3. Select second group with box
4. Paste previous + new = combined workflow
```

---

## 🎨 Customization

Want to customize the selection box?

Edit `app/flowchart-styles.css`:

```css
.react-flow__selection {
  background: rgba(59, 130, 246, 0.15); /* Change color/opacity */
  border: 2px solid rgb(59, 130, 246); /* Change border */
  border-radius: 4px; /* Change corners */
}
```

---

## ✅ Summary

**Box Selection Features:**

- ✅ **Visual blue selection box** with animation
- ✅ **Crosshair cursor** for precision
- ✅ **Mode indicator badge** at bottom-left
- ✅ **Selection count badge** at top
- ✅ **First-time user guide** with instructions
- ✅ **Partial selection mode** for ease of use
- ✅ **Enhanced styling** for selected items
- ✅ **Smooth animations** and transitions

**Quick Reference:**

```
V           → Selection Mode
Drag        → Draw box to select
Ctrl+Click  → Add/remove items
Ctrl+A      → Select all
Delete      → Remove selected
```

**Your box selection is now professional-grade!** 🎉
