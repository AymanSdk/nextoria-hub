# Profile Picture Upload Feature

## Overview

Users can now upload profile pictures that automatically display as their avatar throughout the entire application, including:

- Sidebar user section
- Activity feed
- Team browser
- Chat messages
- Anywhere else that displays user avatars

## Implementation Details

### 1. API Endpoint

**File:** `app/api/user/avatar/route.ts`

#### POST `/api/user/avatar`

Uploads a new profile picture to S3 storage.

**Features:**

- Accepts image files (JPG, PNG, GIF, WebP)
- Maximum file size: 5MB
- Validates file type and size
- Automatically deletes old avatar from S3
- Stores S3 URL in database
- Returns updated user data

**Request:**

```typescript
POST /api/user/avatar
Content-Type: multipart/form-data

file: File // The image file
```

**Response:**

```json
{
  "success": true,
  "imageUrl": "https://...",
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "image": "https://..."
  }
}
```

#### DELETE `/api/user/avatar`

Removes the user's profile picture.

**Features:**

- Deletes avatar from S3 storage
- Sets user.image to null in database
- Returns updated user data

### 2. Frontend Components

**File:** `components/settings/profile-form.tsx`

The profile form has been enhanced with:

- **Image preview** - Shows current or newly selected image
- **File validation** - Client-side validation for size and type
- **Immediate upload** - "Upload Now" button for instant upload
- **Cancel option** - Discard newly selected image
- **Session sync** - Updates NextAuth session after upload

**User Flow:**

1. Click "Choose Photo" button
2. Select an image file (max 5MB)
3. Preview appears instantly
4. Click "Upload Now" to save immediately OR
5. Click "Save Changes" to upload with other profile updates
6. Avatar updates everywhere automatically

### 3. Authentication Integration

**File:** `src/lib/auth/config.ts`

NextAuth configuration has been updated to:

- Include `name` and `image` in JWT token
- Fetch fresh user data on session updates
- Automatically propagate avatar changes to all components

**JWT Token Structure:**

```typescript
interface JWT {
  id: string;
  role: Role;
  name?: string | null;
  image?: string | null;
}
```

**Session Callback:**
When `update()` is called, the session automatically fetches the latest user data from the database, ensuring the new profile picture appears immediately.

### 4. Storage Architecture

**File:** `src/lib/storage/s3.ts`

Profile pictures are stored in S3-compatible storage:

- **Folder structure:** `avatars/{userId}/{filename}`
- **File naming:** Uses nanoid for unique filenames
- **Access:** Public URLs for direct access
- **Deletion:** Old avatars are automatically removed

### 5. Database Schema

**File:** `src/db/schema/users.ts`

The `users` table includes:

```typescript
{
  id: string;
  name: string;
  email: string;
  image: text; // Stores the S3 URL
  // ... other fields
}
```

## Avatar Display Locations

The profile picture automatically appears in:

### 1. Sidebar

**File:** `components/layout/app-sidebar.tsx`

- User dropdown menu
- User profile section
- Uses: `session?.user?.image`

### 2. Activity Feed

**File:** `components/dashboard/activity-feed.tsx`

- Activity log entries
- Uses: `activity.user.avatarUrl` (mapped from `user.image`)

### 3. Chat Messages

**File:** `components/chat/chat-message-list.tsx`

- Message sender avatars
- Uses: `message.senderImage`

### 4. Team Browser

**File:** `components/team/team-browser.tsx`

- Team member listings
- Uses: `member.image`

### 5. Workspace Members

**File:** `components/settings/workspace-members-section.tsx`

- Workspace member lists
- Uses: `member.image`

## Technical Features

### File Validation

**Client-side:**

- File size check (max 5MB)
- File type validation (image/jpeg, image/png, image/gif, image/webp)
- Instant preview using FileReader API

**Server-side:**

- Content-type validation
- File size enforcement
- Secure file upload to S3

### Session Management

When a user uploads a profile picture:

1. File is uploaded to S3
2. Database is updated with new URL
3. `updateSession()` is called
4. NextAuth fetches fresh user data
5. All components using `useSession()` automatically re-render
6. Avatar appears everywhere instantly

### Error Handling

The upload process includes comprehensive error handling:

- Invalid file type → User-friendly error message
- File too large → Clear size limit message
- Upload failure → Error notification with retry option
- Network errors → Graceful degradation

## Usage Examples

### For Users

1. **Upload Profile Picture:**

   ```
   Settings → Profile → Choose Photo → Select image → Upload Now
   ```

2. **Change Profile Picture:**

   ```
   Settings → Profile → Choose Photo → Select new image → Upload Now
   ```

3. **Remove Profile Picture:**
   ```
   Delete /api/user/avatar (programmatically)
   ```

### For Developers

**Get current user avatar:**

```typescript
import { useSession } from "next-auth/react";

function MyComponent() {
  const { data: session } = useSession();
  const avatarUrl = session?.user?.image;

  return <Avatar src={avatarUrl} />;
}
```

**Update session after profile change:**

```typescript
import { useSession } from "next-auth/react";

function ProfileForm() {
  const { update } = useSession();

  const handleUpload = async () => {
    // ... upload logic ...
    await update(); // Refresh session data
  };
}
```

## Security Considerations

1. **Authentication:** All uploads require valid session
2. **File Validation:** Both client and server-side validation
3. **Size Limits:** 5MB maximum to prevent abuse
4. **Type Restrictions:** Only image formats allowed
5. **S3 Security:** Private bucket with public read access for avatars only
6. **Old File Cleanup:** Prevents storage bloat by deleting old avatars

## Performance Optimizations

1. **Direct S3 Upload:** No server proxying
2. **CDN-ready:** S3 URLs are CDN-compatible
3. **Lazy Loading:** Avatar components use Radix UI's optimized image loading
4. **Session Caching:** NextAuth caches session data
5. **Optimistic UI:** Preview shows immediately while uploading

## Future Enhancements

Potential improvements:

- [ ] Image cropping/resizing UI
- [ ] Multiple image size variants (thumbnail, medium, large)
- [ ] Image optimization (WebP conversion, compression)
- [ ] Avatar generation from initials as fallback
- [ ] Avatar history/gallery
- [ ] Social media avatar import

## Troubleshooting

### Avatar not updating

- Ensure `updateSession()` is called after upload
- Check browser cache
- Verify S3 URL is publicly accessible

### Upload fails

- Check S3 credentials in `.env`
- Verify file size and type
- Check network connectivity
- Review server logs for S3 errors

### Session not refreshing

- Ensure NextAuth callbacks include `name` and `image`
- Check JWT token includes user data
- Verify `update()` function is awaited

## Related Files

- `app/api/user/avatar/route.ts` - Avatar upload endpoint
- `app/api/user/profile/route.ts` - Profile update endpoint
- `components/settings/profile-form.tsx` - Profile settings UI
- `src/lib/auth/config.ts` - NextAuth configuration
- `src/lib/storage/s3.ts` - S3 storage utilities
- `components/ui/avatar.tsx` - Avatar component
- `types/chat.ts` - Chat message types

## Changelog

### 2025-10-23

- ✅ Created `/api/user/avatar` endpoint for uploads
- ✅ Updated ProfileForm with image upload UI
- ✅ Integrated S3 storage for profile pictures
- ✅ Updated NextAuth to include image in session
- ✅ Fixed chat message avatar display
- ✅ Added session sync after uploads
- ✅ Comprehensive error handling and validation
