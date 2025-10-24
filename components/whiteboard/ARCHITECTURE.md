# Whiteboard Architecture

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  app/(dashboard)/whiteboard/[roomId]/page.tsx               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  WhiteboardRoomProvider                               │  │
│  │  • Wraps in Liveblocks RoomProvider                   │  │
│  │  • Initializes storage & presence                     │  │
│  │  • Room ID: whiteboard:{roomId}                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  CollaborativeWhiteboard                        │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │  UserPresence (overlay)                   │  │  │  │
│  │  │  │  • Shows active users                      │  │  │  │
│  │  │  │  • Displays avatars                        │  │  │  │
│  │  │  │  • User count badge                        │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │  Excalidraw Canvas                        │  │  │  │
│  │  │  │  • Drawing surface                         │  │  │  │
│  │  │  │  • Tools & UI                             │  │  │  │
│  │  │  │  • onChange → Liveblocks                  │  │  │  │
│  │  │  │  • Liveblocks → updateScene               │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Draws on Canvas

```
User Action
    ↓
Excalidraw onChange event
    ↓
CollaborativeWhiteboard.handleChange()
    ↓
updateElements mutation
    ↓
LiveList<LiveObject<ExcalidrawElement>>
    ↓
Broadcast to all clients via WebSocket
```

### 2. Remote Update Arrives

```
WebSocket message from Liveblocks
    ↓
useStorage hook detects change
    ↓
useEffect triggered
    ↓
Convert LiveList to array
    ↓
excalidrawAPI.updateScene()
    ↓
Canvas re-renders with new elements
```

### 3. Presence Updates

```
Cursor moves / Selection changes
    ↓
onPointerUpdate / onChange (appState)
    ↓
updateMyPresence()
    ↓
Presence: { cursor, selectedElementIds, username }
    ↓
useOthers() detects changes
    ↓
UserPresence component re-renders
```

## Liveblocks Storage Schema

```typescript
Storage {
  excalidrawElements: LiveList<LiveObject<any>> [
    {
      id: "element-1",
      type: "rectangle",
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      strokeColor: "#000000",
      backgroundColor: "transparent",
      // ... more Excalidraw properties
    },
    {
      id: "element-2",
      type: "text",
      x: 150,
      y: 125,
      text: "Hello World",
      fontSize: 20,
      // ... more properties
    }
  ],
  excalidrawAppState: LiveObject<Record<string, any>> {
    viewBackgroundColor: "#ffffff",
    currentItemStrokeColor: "#000000",
    // ... app state properties
  }
}
```

## Liveblocks Presence Schema

```typescript
Presence {
  cursor: { x: number, y: number } | null,
  selectedElementIds: {
    "element-1": true,
    "element-3": true
  },
  username: "John Doe"
}
```

## Hooks Used

### From Liveblocks

- `useStorage(root => root.excalidrawElements)` - Observe elements
- `useMutation(({ storage }, elements) => {...})` - Update storage
- `useMyPresence()` - Get/set own presence
- `updateMyPresence({ cursor, ... })` - Update presence
- `useOthers()` - Get all connected users
- `useSelf()` - Get current user info

### From React

- `useState` - Local state for Excalidraw API
- `useEffect` - Sync Liveblocks → Excalidraw
- `useCallback` - Memoized event handlers

## Conflict Resolution

Liveblocks uses **CRDTs** (Conflict-free Replicated Data Types):

- **LiveList**: Handles concurrent insertions/deletions
- **LiveObject**: Last-write-wins for scalar values
- **Automatic merging**: No manual conflict resolution needed

Example:

```
User A adds rectangle at index 0
User B adds circle at index 0 (simultaneously)
→ Both operations succeed
→ Final list: [rectangle, circle] or [circle, rectangle]
→ Order is deterministic based on timestamps
```

## Performance Considerations

### Optimizations in Place

1. **Throttling**: Updates batched every 100ms (configurable)
2. **Lazy loading**: Excalidraw loads progressively
3. **Memoization**: Callbacks don't recreate on every render
4. **Suspense**: ClientSideSuspense prevents hydration mismatches

### Scalability Limits

- **Elements**: ~10,000 elements per whiteboard (Excalidraw limit)
- **Users**: 100+ concurrent users (Liveblocks limit)
- **Updates/sec**: ~10 updates/sec/user (throttled)
- **Storage**: ~5MB per room (Liveblocks default)

## Security

### Authentication Flow

```
1. User visits /whiteboard/[roomId]
2. Next.js checks session (getSession)
3. If no session → redirect to /auth/signin
4. If authenticated → render whiteboard
5. Excalidraw loads
6. Liveblocks client connects
7. POST /api/liveblocks/auth
8. Server validates NextAuth session
9. Liveblocks generates JWT token
10. WebSocket connection established
```

### Authorization

- Currently: All authenticated users have FULL_ACCESS
- Future: Can implement per-room permissions

```typescript
// In /api/liveblocks/auth/route.ts
if (room) {
  // Check if user has access to this room
  const hasAccess = await checkRoomPermissions(user.id, room);
  if (hasAccess) {
    session_data.allow(room, session_data.FULL_ACCESS);
  } else {
    session_data.deny(room);
  }
}
```

## Integration with Existing Features

### Chat Integration

Both Chat and Whiteboard use the same Liveblocks client:

- Shared auth endpoint
- Shared user metadata
- Different room IDs:
  - Chat: `workspace:{workspaceId}:channel:{channelId}`
  - Whiteboard: `whiteboard:{roomId}`

### Potential Integrations

1. **Link to Projects**: Whiteboard per project
2. **Link to Tasks**: Whiteboard for task planning
3. **Comments**: Add Liveblocks threads to elements
4. **File Storage**: Save whiteboards to database
5. **Export**: Generate PNG/PDF and attach to projects

## Testing Strategy

### Unit Tests

```typescript
// Test component rendering
test('renders whiteboard provider', () => {
  render(<WhiteboardRoomProvider roomId="test">...</>)
  expect(screen.getByText('Loading whiteboard...')).toBeInTheDocument()
})

// Test mutations
test('updates elements on change', () => {
  const { result } = renderHook(() => useUpdateElements())
  act(() => result.current([mockElement]))
  expect(storage.get('excalidrawElements')).toHaveLength(1)
})
```

### Integration Tests

```typescript
// Test real-time sync
test("syncs between two clients", async () => {
  const client1 = await openWhiteboard("room-1");
  const client2 = await openWhiteboard("room-1");

  await client1.drawRectangle(100, 100, 200, 150);
  await waitFor(() => {
    expect(client2.getElements()).toHaveLength(1);
  });
});
```

### E2E Tests

```typescript
// Playwright test
test("collaborative drawing works", async ({ page, context }) => {
  const page1 = page;
  const page2 = await context.newPage();

  await page1.goto("/whiteboard/test-room");
  await page2.goto("/whiteboard/test-room");

  await page1.click('[data-testid="rectangle-tool"]');
  await page1.mouse.down(100, 100);
  await page1.mouse.move(300, 250);
  await page1.mouse.up();

  await expect(page2.locator("canvas")).toContainElement("[data-id]");
});
```
