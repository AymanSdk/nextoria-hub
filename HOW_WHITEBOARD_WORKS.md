# 🎨 How the Collaborative Whiteboard Works

## TL;DR - The Magic Explained in 60 Seconds

Your whiteboard uses **Excalidraw** (the drawing part) + **Liveblocks** (the real-time part). When you draw something, it gets saved to a shared space in the cloud. Everyone connected to the same room sees the changes instantly because they're all watching that same shared space.

Think of it like Google Docs, but for drawing instead of text.

---

## 🧩 The Three Main Pieces

### 1. **Excalidraw** = The Drawing Canvas

- Provides the actual whiteboard interface
- Handles drawing tools (pen, shapes, text, etc.)
- Manages the canvas rendering
- Fires events when things change

### 2. **Liveblocks** = The Real-Time Sync Engine

- Stores the drawing data in the cloud
- Broadcasts changes to all connected users
- Handles conflicts when multiple people edit simultaneously
- Tracks who's online and where their cursor is

### 3. **Your Components** = The Glue

- `WhiteboardRoomProvider`: Connects to a specific room
- `CollaborativeWhiteboard`: Bridges Excalidraw ↔ Liveblocks
- `UserPresence`: Shows who's online

---

## 🔄 How Real-Time Sync Works

### When YOU Draw Something:

```
1. You draw a rectangle on the canvas
   ↓
2. Excalidraw fires an onChange event with the new element
   ↓
3. CollaborativeWhiteboard catches this event
   ↓
4. It calls updateElements() mutation
   ↓
5. Mutation pushes the element to Liveblocks storage
   ↓
6. Liveblocks broadcasts to all connected users
   ↓
7. Other users' browsers receive the update
   ↓
8. Their Excalidraw canvas re-renders with your rectangle
```

**Time from draw to everyone seeing it: ~100-300ms** ⚡

### When OTHERS Draw Something:

```
1. Other user's change arrives via WebSocket
   ↓
2. useStorage() hook detects the change
   ↓
3. useEffect is triggered
   ↓
4. Converts Liveblocks data to Excalidraw format
   ↓
5. Calls excalidrawAPI.updateScene()
   ↓
6. Your canvas re-renders with their changes
```

---

## 🎯 The Storage Model

### What Gets Stored in Liveblocks:

```javascript
Storage: {
  excalidrawElements: [
    { id: "abc123", type: "rectangle", x: 100, y: 100, ... },
    { id: "def456", type: "text", text: "Hello", ... },
    { id: "ghi789", type: "arrow", points: [[0,0], [100,50]], ... }
  ],
  excalidrawAppState: {
    viewBackgroundColor: "#ffffff",
    currentItemStrokeColor: "#000000",
    ...
  }
}
```

**Storage is shared** - Everyone in the room sees the same elements list.

### What Gets Tracked in Presence:

```javascript
Presence: {
  cursor: { x: 245, y: 387 },           // Where your mouse is
  selectedElementIds: { "abc123": true }, // What you're selecting
  username: "John Doe"                   // Your name
}
```

**Presence is per-user** - Each person has their own presence object.

---

## 🔐 How Authentication Works

```
1. You visit /whiteboard/my-room
   ↓
2. Next.js checks if you're logged in (NextAuth session)
   ↓
3. If not logged in → redirects to /auth/signin
   ↓
4. If logged in → renders the whiteboard page
   ↓
5. Excalidraw loads in your browser
   ↓
6. Liveblocks client tries to connect
   ↓
7. Client calls /api/liveblocks/auth
   ↓
8. Server validates your session
   ↓
9. Server generates a JWT token for Liveblocks
   ↓
10. Client uses token to establish WebSocket connection
   ↓
11. You're now connected to the room!
```

**Security:** Only authenticated users can access whiteboards.

---

## 🧠 Conflict Resolution (The Smart Part)

### Problem: What if two people edit at the same time?

**Example Scenario:**

- User A adds a blue circle at position 0
- User B adds a red square at position 0
- Both happen simultaneously

### Traditional Approach (Bad):

```
Last write wins → One person's work gets lost 😢
```

### Liveblocks Approach (Good):

```
Uses CRDTs (Conflict-free Replicated Data Types)
→ Both operations succeed
→ Both elements exist in the final result
→ Order is deterministic based on timestamps
→ No one loses their work! 🎉
```

**This is why collaboration "just works" without any manual conflict handling.**

---

## 👥 Presence Indicators Explained

The little avatars in the top-right corner show who's online:

```javascript
useOthers() // Returns array of connected users

[
  { id: "user-1", info: { name: "Alice", avatar: "..." }, presence: {...} },
  { id: "user-2", info: { name: "Bob", avatar: "..." }, presence: {...} }
]

UserPresence component maps this array to avatar circles
```

**Features:**

- Shows up to 5 avatars
- "+N" badge if more than 5 users
- Hover to see username
- Color-coded per user

---

## ⚡ Performance & Scalability

### Throttling

Updates aren't sent instantly - they're batched:

```javascript
// In liveblocks.config.ts
createClient({
  throttle: 100, // Wait 100ms before sending batch
});
```

**Why?** If you drag your mouse quickly, you'd generate 100s of events per second. Throttling batches them into ~10 updates/sec.

### Limits

- **Max users per room:** 100+ (Liveblocks limit)
- **Max elements:** 10,000+ (Excalidraw limit)
- **Max room size:** ~5MB of data (Liveblocks default)
- **Latency:** 100-300ms typical (depends on location)

---

## 🛠️ Code Walkthrough

### 1. WhiteboardRoomProvider (The Wrapper)

```typescript
<LiveblocksRoomProvider
  id='whiteboard:my-room' // Unique room ID
  initialPresence={{ cursor: null }} // Your starting presence
  initialStorage={{
    // Empty canvas
    excalidrawElements: new LiveList([]),
  }}
>
  {children}
</LiveblocksRoomProvider>
```

**Job:** Sets up the Liveblocks context for this room.

### 2. CollaborativeWhiteboard (The Bridge)

```typescript
// When canvas changes
const handleChange = (elements, appState) => {
  updateElements(elements)        // Push to Liveblocks
  updateMyPresence({ ... })       // Update cursor/selection
}

// When storage changes
useEffect(() => {
  const elements = storageElements.map(obj => obj.toObject())
  excalidrawAPI.updateScene({ elements }) // Update canvas
}, [storageElements])
```

**Job:** Syncs Excalidraw ↔ Liveblocks in both directions.

### 3. UserPresence (The Indicator)

```typescript
const others = useOthers(); // Get connected users

return (
  <div>
    {others.map((user) => (
      <Avatar key={user.id}>{user.info.name.charAt(0)}</Avatar>
    ))}
  </div>
);
```

**Job:** Shows who's online with pretty avatars.

---

## 🎓 Key Concepts

### LiveList vs Array

```javascript
// Regular array (not collaborative)
const elements = [elem1, elem2];

// LiveList (collaborative, synced)
const elements = new LiveList([elem1, elem2]);
elements.push(elem3); // Automatically broadcasts to others
```

### LiveObject vs Object

```javascript
// Regular object (not collaborative)
const state = { color: "red" };

// LiveObject (collaborative, synced)
const state = new LiveObject({ color: "red" });
state.set("color", "blue"); // Automatically broadcasts
```

### Mutations

```javascript
// Mutation = Function that modifies storage
const updateElements = useMutation(({ storage }, newElements) => {
  const list = storage.get("excalidrawElements");
  list.clear();
  newElements.forEach((el) => list.push(new LiveObject(el)));
}, []);

// Call it like a regular function
updateElements([elem1, elem2, elem3]);
```

**Mutations ensure atomic updates** - all changes happen together.

---

## 🐛 Common Issues & Solutions

### "Elements aren't syncing"

**Check:**

1. Are both users in the same room ID?
2. Is LIVEBLOCKS_SECRET_KEY set in .env?
3. Open browser console - any errors?
4. Check Network tab - is WebSocket connected?

### "I see presence but not elements"

**Likely cause:** Storage initialization issue.

**Fix:** Make sure `initialStorage` is set in `WhiteboardRoomProvider`.

### "Performance is slow"

**Possible causes:**

1. Too many elements (>10,000)
2. High network latency
3. Throttle too low (try increasing from 100ms to 200ms)

**Debug:**

```javascript
// Check element count
console.log(excalidrawElements.length);

// Check Liveblocks connection
console.log(window.__LIVEBLOCKS__);
```

---

## 🚀 Quick Start Checklist

- [x] Install @excalidraw/excalidraw
- [x] Update liveblocks.config.ts with whiteboard types
- [x] Create WhiteboardRoomProvider component
- [x] Create CollaborativeWhiteboard component
- [x] Create UserPresence component
- [x] Create /whiteboard page routes
- [x] Add whiteboard link to sidebar
- [x] Test with two browser windows

**You're ready to go!** 🎉

---

## 📚 Further Reading

- **Technical docs:** `components/whiteboard/README.md`
- **Architecture:** `components/whiteboard/ARCHITECTURE.md`
- **Setup guide:** `WHITEBOARD_SETUP.md`

- **Excalidraw API:** https://docs.excalidraw.com
- **Liveblocks Docs:** https://liveblocks.io/docs
- **Example Projects:** https://liveblocks.io/examples

---

**Questions?** Check the docs or open the browser DevTools to inspect Liveblocks state in real-time!
