# 🎨 Collaborative Whiteboard Setup Guide

## Overview

Your Next.js app now has a fully functional collaborative whiteboard using **Excalidraw** for the drawing canvas and **Liveblocks** for real-time collaboration.

## 🚀 Quick Start

### 1. Access the Whiteboard

Navigate to the whiteboard from the sidebar:

- **Dashboard** → **Tools** → **Whiteboard**
- Or visit directly: `http://localhost:3000/whiteboard`

### 2. Create or Join a Session

**Option A: Create New Whiteboard**

1. Click "Create Whiteboard" button
2. A new room with a random ID will be generated
3. Share the URL with collaborators

**Option B: Join Existing Whiteboard**

1. Get the room ID from a collaborator
2. Enter it in the "Join Whiteboard" form
3. Click "Join" to enter the room

**Option C: Direct Link**

- Navigate to: `/whiteboard/[any-room-id]`
- Example: `/whiteboard/my-team-board`

## 🔧 How It Works

### Real-Time Synchronization Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Excalidraw Canvas                         │
│  (Local drawing, text, shapes, selections)                  │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ onChange / onPointerUpdate
               ↓
┌─────────────────────────────────────────────────────────────┐
│            CollaborativeWhiteboard Component                 │
│  • Captures canvas changes (elements, appState)             │
│  • Captures cursor movements and selections                 │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ useMutation / updateMyPresence
               ↓
┌─────────────────────────────────────────────────────────────┐
│                 Liveblocks Storage Layer                     │
│  Storage: {                                                  │
│    excalidrawElements: LiveList<LiveObject>                 │
│    excalidrawAppState: LiveObject                           │
│  }                                                           │
│  Presence: {                                                 │
│    cursor: {x, y},                                           │
│    selectedElementIds: {},                                   │
│    username: string                                          │
│  }                                                           │
└──────────────┬──────────────────────────────────────────────┘
               │
               │ WebSocket / CRDT sync
               ↓
┌─────────────────────────────────────────────────────────────┐
│              Other Connected Clients                         │
│  • Receive updates via useStorage / useOthers hooks         │
│  • Automatically merge changes (conflict-free)              │
│  • See presence indicators for all users                    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Explained

#### **Excalidraw → Liveblocks (Local to Remote)**

1. **User draws on canvas** → Excalidraw fires `onChange` event
2. **Elements captured** → Array of ExcalidrawElement objects
3. **Mutation triggered** → `updateElements` pushes to Liveblocks storage
4. **Broadcast** → Changes sent to all connected clients via WebSocket

#### **Liveblocks → Excalidraw (Remote to Local)**

1. **Remote user makes change** → Liveblocks storage updated
2. **useStorage hook observes** → Detects new elements in LiveList
3. **useEffect triggers** → Converts LiveList to plain array
4. **Canvas updates** → `excalidrawAPI.updateScene()` renders new elements

#### **Presence Tracking**

- **Cursor movements**: Tracked via `onPointerUpdate` → `updateMyPresence`
- **Selected elements**: Tracked via `onChange` appState → `updateMyPresence`
- **Other users**: Retrieved via `useOthers()` → displayed in `UserPresence` component
- **Username**: Set from session data on component mount

## 📁 File Structure

```
app/(dashboard)/whiteboard/
├── page.tsx                    # Whiteboard index (create/join UI)
└── [roomId]/
    └── page.tsx                # Dynamic whiteboard room page

components/whiteboard/
├── whiteboard-room-provider.tsx   # Liveblocks room context wrapper
├── collaborative-whiteboard.tsx   # Main Excalidraw + sync logic
├── user-presence.tsx              # Active users indicator
└── README.md                      # Technical documentation

liveblocks.config.ts            # Updated with whiteboard types
```

## 🎨 Features Implemented

### ✅ Core Features

- **Real-time collaborative drawing** - Multiple users can draw simultaneously
- **Live cursor tracking** - See where other users are pointing (stored in presence)
- **Selected elements sync** - Know what others are selecting
- **User presence indicators** - Avatars showing who's online
- **Automatic reconnection** - Built into Liveblocks
- **Conflict-free updates** - CRDTs handle concurrent edits

### 🎯 Excalidraw Tools Available

- ✏️ **Freehand drawing**
- 📐 **Shapes**: Rectangle, circle, diamond, arrow
- 📝 **Text annotations**
- 🖼️ **Image uploads**
- 🔗 **Connecting arrows**
- 🎨 **Color picker**
- 📏 **Stroke width/style**
- ↩️ **Undo/redo**
- 🔍 **Zoom & pan**

### 👥 Collaboration Features

- Real-time element synchronization
- User avatars with hover tooltips
- Active user count display
- Color-coded user indicators

## 🔐 Authentication & Permissions

- **Session-based auth**: Uses existing NextAuth session
- **Auth endpoint**: `/api/liveblocks/auth` validates users
- **Room access**: All authenticated users get FULL_ACCESS
- **Room ID format**: `whiteboard:{roomId}`

## ⚡ Performance Optimizations

1. **Throttled updates**: 100ms throttle on Liveblocks client
2. **Memoized callbacks**: Prevent unnecessary re-renders
3. **Lazy API initialization**: Excalidraw loads progressively
4. **ClientSideSuspense**: Shows loading state during hydration

## 🛠️ Environment Setup

### Required Environment Variables

Make sure your `.env.local` has:

```bash
# Liveblocks (already configured for chat)
LIVEBLOCKS_SECRET_KEY=sk_prod_...

# NextAuth (already configured)
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### Dependencies Installed

```json
{
  "@excalidraw/excalidraw": "^0.18.0",
  "@liveblocks/client": "^3.9.1",
  "@liveblocks/react": "^3.9.1"
}
```

## 🚦 Testing the Setup

### Test Collaboration

1. **Open whiteboard in two browser windows**:

   ```
   Window 1: http://localhost:3000/whiteboard/test-room
   Window 2: http://localhost:3000/whiteboard/test-room
   ```

2. **Draw in Window 1** - Should appear instantly in Window 2

3. **Move cursor in Window 2** - Position tracked (check DevTools presence)

4. **Check presence indicators** - Should show 2 users online

### Verify Real-Time Sync

```javascript
// In browser console, check Liveblocks connection
// You should see WebSocket messages flowing
window.__LIVEBLOCKS__; // debug object
```

## 🔮 Future Enhancements

### Planned Features

- 🎨 **Visible cursor trails** for other users (like Figma)
- 💾 **Save/load whiteboards** from database
- 📸 **Export to PNG/SVG**
- 🔙 **Version history** with timestamps
- 🎨 **Custom themes** (dark mode support)
- 📋 **Copy/paste** between whiteboards
- 👥 **User roles** (viewer, editor, admin)
- 💬 **Comments** on specific elements
- 🔒 **Private rooms** with access control

### Easy Extensions

**Add database persistence:**

```typescript
// Save whiteboard state to DB
const saveWhiteboard = useMutation(async ({ storage }) => {
  const elements = storage.get("excalidrawElements");
  await fetch("/api/whiteboards", {
    method: "POST",
    body: JSON.stringify({ elements: elements.toArray() }),
  });
});
```

**Add visible cursors:**

```typescript
// Render other users' cursors on canvas
const Cursors = () => {
  const others = useOthers();
  return others.map((user) => (
    <Cursor
      key={user.id}
      x={user.presence.cursor?.x}
      y={user.presence.cursor?.y}
      name={user.presence.username}
    />
  ));
};
```

## 🐛 Troubleshooting

### Elements not syncing?

- ✅ Check browser console for errors
- ✅ Verify `LIVEBLOCKS_SECRET_KEY` is set
- ✅ Ensure both users are in the same room ID
- ✅ Check network tab for WebSocket connection

### Presence not showing?

- ✅ Verify username is set in presence (DevTools → Components)
- ✅ Check `useOthers()` returns data
- ✅ Ensure multiple users are connected

### Slow performance?

- ✅ Reduce throttle in `liveblocks.config.ts` (increase from 100ms)
- ✅ Check network latency in Liveblocks dashboard
- ✅ Simplify complex drawings (too many elements)

### Build errors?

- ✅ Clear `.next` folder: `rm -rf .next`
- ✅ Reinstall dependencies: `bun install`
- ✅ Check TypeScript errors: `bun run type-check`

## 📚 Documentation Links

- **Excalidraw**: https://docs.excalidraw.com
- **Liveblocks**: https://liveblocks.io/docs
- **Liveblocks + Excalidraw**: https://liveblocks.io/examples/collaborative-whiteboard/nextjs-excalidraw

## 💡 Usage Tips

1. **Share links easily**: Copy browser URL and send to collaborators
2. **Use meaningful room IDs**: `/whiteboard/design-sprint-2025` is better than random IDs
3. **Test with multiple devices**: Phone, tablet, desktop all work
4. **Keyboard shortcuts**: Excalidraw has extensive keyboard support (press `?` in canvas)

---

**Built with ❤️ using:**

- [Next.js 16](https://nextjs.org)
- [Excalidraw](https://excalidraw.com)
- [Liveblocks](https://liveblocks.io)
- [ShadCN UI](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
