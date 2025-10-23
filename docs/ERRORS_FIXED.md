# Errors Fixed - Google Drive Integration

## Issues Found & Fixed

### Issue 1: `workspace_id` NULL Constraint Violation

**Error:**

```
null value in column "workspace_id" violates not-null constraint
```

**Cause:**
The code was trying to access `user.workspaceId`, but the user session object doesn't include this property by default in NextAuth.

**Fix:**
Updated all Google Drive API routes to use `getCurrentWorkspaceId()` function from the workspace context (which reads from cookies).

**Files Updated:**

- `app/api/integrations/google-drive/callback/route.ts`
- `app/api/integrations/google-drive/status/route.ts`
- `app/api/integrations/google-drive/disconnect/route.ts`
- `app/api/integrations/google-drive/files/route.ts`
- `app/api/integrations/google-drive/link/route.ts`

**Changes Made:**

```typescript
// Before (WRONG):
const user = await getCurrentUser();
await db.insert(integrations).values({
  workspaceId: user.workspaceId, // ❌ This is undefined!
  ...
});

// After (CORRECT):
const user = await getCurrentUser();
const workspaceId = await getCurrentWorkspaceId(); // ✅ Get from cookie
await db.insert(integrations).values({
  workspaceId, // ✅ Now has a value!
  ...
});
```

---

### Issue 2: `NEXT_PUBLIC_APP_URL` is Undefined

**Error:**

```
URL is malformed "undefined/files?error=callback_failed"
```

**Cause:**
The `NEXT_PUBLIC_APP_URL` environment variable was not set in the `.env` file.

**Fix:**

1. Added `NEXT_PUBLIC_APP_URL="http://localhost:3000"` to `.env` file
2. Added fallback value in code: `process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"`

**Files Updated:**

- `.env` (added the variable)
- All Google Drive API routes (added fallback)

**Changes Made:**

```typescript
// Before (WRONG):
return NextResponse.redirect(
  `${process.env.NEXT_PUBLIC_APP_URL}/files?error=callback_failed`
  // If NEXT_PUBLIC_APP_URL is undefined → "undefined/files?error..."
);

// After (CORRECT):
return NextResponse.redirect(
  `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/files?error=callback_failed`
  // If undefined → defaults to "http://localhost:3000/files?error..."
);
```

---

## What You Need to Do

### 1. Check Your `.env` File

Make sure you have this line in `/home/aymane-wrk/nextoria-hub/.env`:

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**I already added it for you!** ✅

### 2. Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
bun run dev
```

### 3. Try Connecting Google Drive Again

1. Go to http://localhost:3000/files
2. Click "Connect Google Drive"
3. Complete OAuth flow
4. Should work now! ✅

---

## Technical Details

### Why `getCurrentWorkspaceId()`?

The workspace ID is stored in an HTTP-only cookie when you sign in. The session object doesn't include it by default because:

- Keeps JWT token size small
- Cookie is more secure (HTTP-only)
- Cookie persists across requests

### How It Works:

```typescript
// On sign in (src/lib/auth/config.ts):
async signIn({ user }) {
  const [membership] = await db.select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, user.id))
    .limit(1);

  if (membership) {
    // Sets cookie with workspace ID
    await setCurrentWorkspaceId(membership.workspaceId);
  }
}

// In API routes:
const workspaceId = await getCurrentWorkspaceId();
// Reads from the cookie!
```

---

## Summary

✅ Fixed workspace ID issue by using `getCurrentWorkspaceId()`
✅ Fixed undefined URL issue by adding `NEXT_PUBLIC_APP_URL`
✅ Added fallback values for robustness
✅ Updated all 5 Google Drive API routes

**Status: READY TO TEST!** 🚀

---

## If You Still Get Errors

### Make sure you're signed in

```
If you're not signed in, the workspace cookie won't exist!
```

### Check your workspace membership

```sql
SELECT * FROM workspace_members WHERE user_id = 'your-user-id';
```

### Clear cookies and sign in again

```
Sometimes the workspace cookie gets out of sync.
Clear browser cookies for localhost:3000 and sign in again.
```

---

**All fixed! Try connecting Google Drive now!** 🎉
