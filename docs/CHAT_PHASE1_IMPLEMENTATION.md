# 🚀 Chat Phase 1 Implementation Guide

## Overview

This guide covers the **highest-priority features** that will make the chat production-ready for team-client collaboration.

**Estimated Time**: 10-12 hours  
**Impact**: Transforms chat from basic to professional-grade

---

## Features to Implement

### ✅ Feature 1: Unread Message Tracking (Priority: CRITICAL)

**Time**: 2 hours  
**Why**: Don't miss important client messages

#### Database Changes

```sql
-- Already exists in schema ✅
-- chat_channel_members.last_read_message_id
```

#### API Changes

```typescript
// app/api/chat/channels/[channelId]/read/route.ts (NEW)
POST /api/chat/channels/:channelId/read
Body: { lastReadMessageId: string }
- Updates chat_channel_members.last_read_message_id
- Returns unread count

// app/api/chat/channels/route.ts (UPDATE)
GET /api/chat/channels
- Add unread count to each channel
- Join with chat_channel_members
- Count messages after last_read_message_id
```

#### UI Components

```typescript
// components/chat/channel-list.tsx (UPDATE)
- Add unread count badge
- Bold channel name if unread > 0
- Sort: unread channels first

// components/chat/chat-message-list.tsx (UPDATE)
- Add "unread divider" line
- "Jump to first unread" button
- Auto-mark as read on scroll

// components/chat/unread-badge.tsx (NEW)
- Reusable badge component
- Red dot for < 10, number for > 10
```

#### Implementation Steps

1. Create read API endpoint
2. Add unread count query to channels endpoint
3. Add UnreadBadge component
4. Update ChannelList with badges
5. Add scroll detection to mark as read
6. Add "unread" divider in message list

---

### ✅ Feature 2: File Attachments (Priority: CRITICAL)

**Time**: 3-4 hours  
**Why**: Essential for sharing designs, documents, contracts

#### Dependencies

```bash
# Already installed ✅
@uploadthing/react
uploadthing
```

#### Database Changes

```sql
-- Already exists in schema ✅
-- chat_messages.attachments (JSON field)

-- Structure:
attachments: [
  {
    id: string,
    name: string,
    url: string,
    size: number,
    type: string, // "image" | "document" | "video" | "other"
    uploadedAt: string
  }
]
```

#### API Changes

```typescript
// app/api/uploadthing/route.ts (UPDATE)
- Add "chatAttachment" file route
- Max 10MB per file
- Allowed types: images, PDFs, docs, spreadsheets

// app/api/chat/messages/route.ts (UPDATE)
POST /api/chat/messages
Body: {
  channelId: string,
  content: string,
  attachments?: Array<{...}> // NEW
}
```

#### UI Components

```typescript
// components/chat/chat-input.tsx (UPDATE)
- Add file upload button (paperclip icon)
- Show selected files preview
- Upload progress indicator
- Remove file option

// components/chat/file-upload-zone.tsx (NEW)
- Drag & drop zone
- File type validation
- Size validation
- Upload progress

// components/chat/message-attachment.tsx (NEW)
- Display attachments in messages
- Image thumbnails with lightbox
- PDF preview
- Download button
- File type icons
```

#### File Type Handling

```typescript
// lib/file-utils.ts (NEW)
function getFileIcon(type: string) {
  if (type.includes("image")) return "🖼️";
  if (type.includes("pdf")) return "📄";
  if (type.includes("video")) return "🎥";
  if (type.includes("spreadsheet")) return "📊";
  return "📎";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

#### Implementation Steps

1. Configure uploadthing route for chat
2. Create FileUploadZone component
3. Update ChatInput with file picker
4. Create MessageAttachment component
5. Update message schema validation
6. Add file utilities
7. Test with various file types

---

### ✅ Feature 3: @Mentions (Priority: HIGH)

**Time**: 4 hours  
**Why**: Get specific people's attention, especially clients

#### Database Changes

```sql
-- New table for tracking mentions
CREATE TABLE chat_mentions (
  id TEXT PRIMARY KEY,
  message_id TEXT REFERENCES chat_messages(id) ON DELETE CASCADE,
  mentioned_user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mentions_user ON chat_mentions(mentioned_user_id);
CREATE INDEX idx_mentions_message ON chat_mentions(message_id);
```

#### API Changes

```typescript
// app/api/chat/messages/route.ts (UPDATE)
POST /api/chat/messages
- Parse content for @mentions
- Extract mentioned users
- Insert into chat_mentions table
- (Future: Send notifications)

// app/api/chat/channels/[channelId]/members/route.ts (UPDATE)
GET /api/chat/channels/:channelId/members
- Return list of members for autocomplete
- Include: id, name, avatar, role
```

#### UI Components

```typescript
// components/chat/mention-autocomplete.tsx (NEW)
- Trigger: Type "@"
- Fuzzy search members
- Keyboard navigation (↑↓, Enter, Esc)
- Show avatar + name + role

// components/chat/chat-input.tsx (UPDATE)
- Detect "@" character
- Show autocomplete
- Insert mention on select
- Format: @[username](userId)

// components/chat/message-content.tsx (NEW)
- Parse message content
- Highlight mentions
- Make mentions clickable
- Show user card on click
```

#### Mention Parsing

```typescript
// lib/mention-parser.ts (NEW)
interface Mention {
  userId: string;
  username: string;
  startIndex: number;
  endIndex: number;
}

function parseMentions(content: string): Mention[] {
  // Regex: @\[([^\]]+)\]\(([^)]+)\)
  // Example: @[john.doe](user_123)
}

function extractMentionedUserIds(content: string): string[] {
  return parseMentions(content).map((m) => m.userId);
}

function renderMentionedContent(content: string, currentUserId: string) {
  // Replace mentions with <span class="mention">
  // Highlight if currentUserId is mentioned
}
```

#### Special Mentions

```typescript
// @channel - notify all members
// @here - notify online members only
// @team - notify team members only
// @client - notify client members only
```

#### Implementation Steps

1. Create chat_mentions table
2. Add mention parsing utility
3. Create MentionAutocomplete component
4. Update ChatInput with autocomplete
5. Create MessageContent component
6. Update message POST to save mentions
7. Add mention highlighting in messages

---

### ✅ Feature 4: Team/Client Visual Distinction (Priority: HIGH)

**Time**: 1-2 hours  
**Why**: Better context in conversations

#### User Role Schema

```sql
-- Already exists in users table ✅
-- users.role: "owner" | "admin" | "member" | "client"
```

#### UI Components

```typescript
// components/chat/user-role-badge.tsx (NEW)
- Show role badge next to name
- Different colors per role:
  - Owner/Admin: ⭐ Gold
  - Team Member: 🏢 Blue
  - Client: 👤 Purple

// components/chat/chat-message-list.tsx (UPDATE)
- Add role badge to messages
- Different message bubble colors:
  - Team: Default
  - Client: Subtle purple tint

// components/chat/chat-presence.tsx (UPDATE)
- Group users by role
- Show role in tooltip
```

#### Role Badge Component

```typescript
// components/chat/user-role-badge.tsx
interface UserRoleBadgeProps {
  role: "owner" | "admin" | "member" | "client";
  size?: "sm" | "md";
}

const ROLE_CONFIG = {
  owner: { icon: "⭐", label: "Owner", color: "text-yellow-600" },
  admin: { icon: "⭐", label: "Admin", color: "text-yellow-600" },
  member: { icon: "🏢", label: "Team", color: "text-blue-600" },
  client: { icon: "👤", label: "Client", color: "text-purple-600" },
};
```

#### Implementation Steps

1. Create UserRoleBadge component
2. Update ChatMessageList to show badges
3. Update ChatPresence to group by role
4. Add subtle color coding to messages
5. Add role info to tooltips

---

### ✅ Feature 5: Enhanced Channel Organization (Priority: MEDIUM)

**Time**: 2 hours  
**Why**: Better structure for client projects

#### Channel Types

```typescript
// src/db/schema/chat.ts (UPDATE)
enum ChannelType {
  GENERAL = "general", // General discussion
  PROJECT = "project", // Project-specific
  CLIENT = "client", // Client-facing
  INTERNAL = "internal", // Team-only
  ANNOUNCEMENTS = "announcements", // Read-only for clients
}

// Add to chat_channels table:
channel_type: ChannelType;
```

#### Channel Icons

```typescript
// Map channel type to icon
const CHANNEL_ICONS = {
  general: "💬",
  project: "📁",
  client: "🤝",
  internal: "🔒",
  announcements: "📢",
};
```

#### Auto-create Channels for Projects

```typescript
// When project is created, auto-create:
1. #{project-name}-client (client + team)
2. #{project-name}-team (team only)
3. #{project-name}-updates (announcements)
```

#### Implementation Steps

1. Add channel_type to schema
2. Update channel creation to include type
3. Add channel icons to UI
4. Create auto-channel-creation utility
5. Add channel type filter in sidebar

---

## 📋 Implementation Checklist

### Week 1: Core Features

- [ ] **Day 1-2**: Unread tracking

  - [ ] Create read endpoint
  - [ ] Add unread count query
  - [ ] Update ChannelList UI
  - [ ] Add scroll detection
  - [ ] Test with multiple users

- [ ] **Day 2-3**: File attachments

  - [ ] Configure uploadthing
  - [ ] Create upload components
  - [ ] Update message schema
  - [ ] Add attachment display
  - [ ] Test with various file types

- [ ] **Day 3-4**: @Mentions

  - [ ] Create mentions table
  - [ ] Add parsing logic
  - [ ] Build autocomplete
  - [ ] Update message display
  - [ ] Test mention notifications

- [ ] **Day 4-5**: Visual distinction

  - [ ] Create role badge component
  - [ ] Update message display
  - [ ] Add color coding
  - [ ] Test with team/client users

- [ ] **Day 5**: Channel organization
  - [ ] Add channel types
  - [ ] Add icons
  - [ ] Test channel creation

### Testing

- [ ] Test with real team members
- [ ] Test with test client accounts
- [ ] Test file upload (various types)
- [ ] Test @mentions
- [ ] Test unread tracking
- [ ] Mobile responsiveness
- [ ] Performance with many messages

### Documentation

- [ ] Update user guide
- [ ] Add feature documentation
- [ ] Create client onboarding guide
- [ ] Update API documentation

---

## 🎯 Success Criteria

After Phase 1 implementation:

### Functionality

✅ Users can see unread message counts  
✅ Users can upload and view files  
✅ Users can @mention team members  
✅ Clear visual distinction between team/client  
✅ Organized channels by type

### Performance

✅ Unread counts load in < 100ms  
✅ Files upload in < 2s (for 5MB)  
✅ Mention autocomplete appears in < 50ms  
✅ No UI lag with 100+ messages

### User Experience

✅ Intuitive file upload (drag & drop)  
✅ Fast mention autocomplete  
✅ Clear unread indicators  
✅ Professional appearance

---

## 📊 Database Migration

```sql
-- Migration: Add mentions table
CREATE TABLE IF NOT EXISTS chat_mentions (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  mentioned_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentions_user ON chat_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_message ON chat_mentions(message_id);

-- Migration: Add channel type
ALTER TABLE chat_channels
ADD COLUMN IF NOT EXISTS channel_type TEXT DEFAULT 'general';

-- Migration: Add full-text search index (for future search feature)
CREATE INDEX IF NOT EXISTS idx_messages_content_search
ON chat_messages
USING GIN (to_tsvector('english', content));
```

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Run database migrations
- [ ] Test file upload in production
- [ ] Configure uploadthing keys
- [ ] Test with real client
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Update user documentation

---

## Next: Phase 2 Preview

After Phase 1, we'll add:

1. **Message threads** (organize conversations)
2. **Message reactions** (quick acknowledgments)
3. **Message search** (find past discussions)
4. **Pinned messages** (important info)

**Phase 1 makes chat usable. Phase 2 makes it powerful. Phase 3 makes it delightful.**

---

Ready to start implementation! 🚀
