# Liveblocks Chat Setup Guide

This guide will help you set up the real-time chat feature using Liveblocks.

## 1. Create a Liveblocks Account

1. Go to [liveblocks.io](https://liveblocks.io)
2. Sign up for a free account (100 MAU free)
3. Create a new project

## 2. Get Your API Keys

1. In your Liveblocks dashboard, go to **API Keys**
2. Copy your **Secret Key** (starts with `sk_prod_...` or `sk_dev_...`)
3. Add it to your `.env` file:

```env
LIVEBLOCKS_SECRET_KEY="sk_prod_your_key_here"
```

## 3. Configure Webhook (Optional - For Message Persistence)

If you want to persist messages to your Postgres database via webhooks:

1. In Liveblocks dashboard, go to **Webhooks**
2. Add a new webhook endpoint: `https://your-domain.com/api/liveblocks/webhook`
3. Select events you want to listen to (e.g., `storageUpdated`, `userEntered`, `userLeft`)
4. Copy the webhook secret and add to `.env`:

```env
LIVEBLOCKS_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

> **Note**: Message persistence is currently handled via direct API calls (`/api/chat/messages`) which is more reliable than webhooks. Webhooks are optional for additional real-time events.

## 4. Database Migration

Make sure your database has the chat tables:

```bash
bun run db:push
```

This will create:

- `chat_channels` - Chat channels/rooms
- `chat_messages` - Message history
- `chat_channel_members` - Channel membership

## 5. Test the Chat

1. Start your development server:

   ```bash
   bun run dev
   ```

2. Navigate to `/chat` in your app

3. Create a new channel and start chatting!

## Features Implemented

### ✅ Real-time Messaging

- Send and receive messages instantly
- Powered by Liveblocks' WebSocket infrastructure

### ✅ Presence System

- See who's currently online in each channel
- Real-time typing indicators
- User avatars and status

### ✅ Channel Management

- Create public and private channels
- Workspace-based organization
- Channel descriptions and metadata

### ✅ Message Persistence

- All messages saved to Postgres
- Message history loaded on channel switch
- Edit and delete tracking (schema ready)

### ✅ User Experience

- Auto-scroll to latest messages
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Optimistic UI updates
- Loading states and error handling

## Architecture

### Room Naming Convention

Rooms follow this pattern: `workspace:{workspaceId}:channel:{channelId}`

This allows:

- Workspace-level isolation
- Easy access control
- Organized room management

### Data Flow

1. **Sending Messages**:

   - User types message → ChatInput component
   - Message sent to `/api/chat/messages` (POST)
   - Saved to Postgres
   - Added to local state (optimistic UI)
   - Liveblocks broadcasts to all connected users

2. **Receiving Messages**:

   - Liveblocks WebSocket receives update
   - React state updates via hooks
   - UI re-renders with new message

3. **Loading Messages**:
   - User selects channel
   - Fetch from `/api/chat/messages?channelId={id}`
   - Display historical messages
   - Liveblocks connects for real-time updates

## Customization

### Typing Indicators

Adjust the typing presence logic in `components/chat/chat-input.tsx`:

```typescript
// Update typing status
updatePresence({ isTyping: true });

// Clear after timeout
setTimeout(() => {
  updatePresence({ isTyping: false });
}, 3000);
```

### Message Formatting

Add rich text, mentions, emojis, etc. in `components/chat/chat-message-list.tsx`

### File Attachments

The schema supports attachments. Integrate with your S3 storage:

```typescript
// In chat-input.tsx
const handleFileUpload = async (file: File) => {
  // Upload to S3
  const fileUrl = await uploadToS3(file);

  // Send message with attachment
  onSendMessage(content, [fileUrl]);
};
```

### Notifications

Integrate with your existing notification system to alert users of new messages when they're not in the channel.

## Performance Optimization

### Message Pagination

Currently loads last 100 messages. Add pagination:

```typescript
// In chat/page.tsx
const loadMoreMessages = async () => {
  const oldestMessageId = messages[0]?.id;
  const response = await fetch(
    `/api/chat/messages?channelId=${channelId}&before=${oldestMessageId}&limit=50`
  );
  // Prepend to messages
};
```

### Lazy Loading

Channels are loaded on mount. For workspaces with many channels, implement lazy loading or search.

### Presence Throttling

Liveblocks client is configured with 100ms throttle. Adjust in `liveblocks.config.ts` if needed.

## Security

### Access Control

Currently, authenticated users can access all non-private channels in their workspace.

To add more granular control:

1. Check channel membership in auth endpoint:

```typescript
// app/api/liveblocks/auth/route.ts
const isMember = await checkChannelMembership(user.id, channelId);
if (!isMember) {
  session_data.allow(room, session_data.READ_ACCESS);
} else {
  session_data.allow(room, session_data.FULL_ACCESS);
}
```

2. Implement role-based permissions (e.g., only admins can create channels)

### Rate Limiting

Add rate limiting to message creation in `/api/chat/messages`:

```typescript
import { rateLimit } from "@/src/lib/api/middleware";

// Limit to 10 messages per minute
const limiter = rateLimit({ max: 10, windowMs: 60000 });
```

## Troubleshooting

### "Unauthorized" Error

- Check that `LIVEBLOCKS_SECRET_KEY` is set in `.env`
- Verify NextAuth session is working
- Check browser console for auth errors

### Messages Not Appearing

- Verify Postgres connection
- Check API routes are responding (Network tab)
- Ensure Liveblocks room ID matches pattern

### Presence Not Updating

- Check WebSocket connection in Network tab
- Verify `updatePresence` is being called
- Look for Liveblocks client errors in console

## Next Steps

### Suggested Enhancements

1. **Threads/Replies**: Use `parentMessageId` for threaded conversations
2. **Reactions**: Add emoji reactions to messages
3. **Rich Text**: Integrate a rich text editor (e.g., Slate, Tiptap)
4. **Search**: Full-text search across messages
5. **File Sharing**: Complete file attachment implementation
6. **Voice/Video**: Integrate WebRTC for calls
7. **Message Formatting**: Support markdown, code blocks, mentions
8. **Unread Counts**: Track and display unread message counts
9. **Push Notifications**: Browser notifications for new messages
10. **Mobile App**: React Native with Liveblocks mobile SDK

## Resources

- [Liveblocks Documentation](https://liveblocks.io/docs)
- [Liveblocks React Hooks](https://liveblocks.io/docs/api-reference/liveblocks-react)
- [Liveblocks Examples](https://liveblocks.io/examples)
- [Next.js App Router Guide](https://nextjs.org/docs/app)

## Support

For issues or questions:

- Liveblocks Discord: [discord.gg/liveblocks](https://discord.gg/liveblocks)
- Liveblocks Docs: [liveblocks.io/docs](https://liveblocks.io/docs)
- GitHub Issues: Create an issue in your repository

---

Built with ❤️ using Liveblocks and Next.js
