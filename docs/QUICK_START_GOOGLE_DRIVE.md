# Google Drive Integration - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Google Cloud Console (2 minutes)

```bash
1. Go to: https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Enable "Google Drive API" from API Library
4. Configure OAuth consent screen:
   - User Type: External
   - Add your email as TEST USER (⚠️ IMPORTANT!)
5. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     * http://localhost:3000/api/integrations/google-drive/callback
   - Copy Client ID and Client Secret
```

> ⚠️ **IMPORTANT**: Must add yourself as a test user to avoid "Access blocked" error! See [GOOGLE_OAUTH_VERIFICATION_FIX.md](./GOOGLE_OAUTH_VERIFICATION_FIX.md)

### Step 2: Environment Variables (1 minute)

Add to your `.env` file:

```env
GOOGLE_DRIVE_CLIENT_ID="1234567890-abc.apps.googleusercontent.com"
GOOGLE_DRIVE_CLIENT_SECRET="GOCSPX-your-secret-here"
GOOGLE_DRIVE_REDIRECT_URI="http://localhost:3000/api/integrations/google-drive/callback"
```

### Step 3: Database Migration (1 minute)

```bash
# Option 1: Using Drizzle
bun run db:push

# Option 2: Direct SQL
psql $DATABASE_URL < drizzle/migrations/create_drive_files_table.sql
```

### Step 4: Start Server (30 seconds)

```bash
bun run dev
```

### Step 5: Connect & Test (30 seconds)

```
1. Navigate to http://localhost:3000/files
2. Click "Connect Google Drive"
3. Sign in and grant permissions
4. Browse your Drive files! 🎉
```

## 📖 Usage Examples

### Connecting Google Drive

```typescript
// User clicks "Connect Google Drive" button
// Redirects to: /api/integrations/google-drive/auth
// After OAuth: Redirected back to /files?tab=drive&connected=true
```

### Browsing Files

```typescript
// In GoogleDriveBrowser component
const response = await fetch("/api/integrations/google-drive/files?pageSize=50");
const { files, nextPageToken } = await response.json();
```

### Searching Files

```typescript
// Search by name
const response = await fetch(
  "/api/integrations/google-drive/files?query=proposal&pageSize=20"
);
```

### Linking a File

```typescript
// Link Drive file to a project
const response = await fetch("/api/integrations/google-drive/link", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    fileId: "drive-file-id",
    fileName: "Project Proposal.pdf",
    mimeType: "application/pdf",
    webViewLink: "https://drive.google.com/...",
    size: "1024000",
    linkType: "project", // or 'client' or 'task'
    entityId: "project-123",
    description: "Final proposal document",
    tags: "proposal,final,v2",
  }),
});
```

### Getting Linked Files

```typescript
// Get all Drive files linked to a project
const response = await fetch(
  "/api/integrations/google-drive/link?linkType=project&entityId=project-123"
);
const { links } = await response.json();
```

### Checking Connection Status

```typescript
const response = await fetch("/api/integrations/google-drive/status");
const { connected, email, connectedAt } = await response.json();
```

### Disconnecting

```typescript
const response = await fetch("/api/integrations/google-drive/disconnect", {
  method: "POST",
});
```

## 🎨 UI Components

### Use GoogleDriveBrowser

```tsx
import { GoogleDriveBrowser } from "@/components/files/google-drive-browser";

export default function MyPage() {
  return <GoogleDriveBrowser />;
}
```

### Use LinkDriveFileDialog

```tsx
import { LinkDriveFileDialog } from "@/components/files/link-drive-file-dialog";

const file = {
  id: "drive-file-id",
  name: "My Document.pdf",
  mimeType: "application/pdf",
  webViewLink: "https://drive.google.com/...",
  size: "1024000",
};

<LinkDriveFileDialog file={file}>
  <Button>Link to Project</Button>
</LinkDriveFileDialog>;
```

## 🔧 Common Patterns

### Pattern 1: Show Drive Files in Project Page

```tsx
"use client";

import { useEffect, useState } from "react";

export function ProjectDriveFiles({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    async function fetchFiles() {
      const response = await fetch(
        `/api/integrations/google-drive/link?linkType=project&entityId=${projectId}`
      );
      const { links } = await response.json();
      setFiles(links);
    }
    fetchFiles();
  }, [projectId]);

  return (
    <div>
      <h3>Google Drive Files</h3>
      {files.map((file) => (
        <div key={file.id}>
          <a href={file.webViewLink} target='_blank'>
            {file.fileName}
          </a>
        </div>
      ))}
    </div>
  );
}
```

### Pattern 2: Programmatic File Linking

```tsx
async function linkFileToProject(fileId: string, projectId: string) {
  // First, get file metadata from Drive
  const driveResponse = await fetch(
    `/api/integrations/google-drive/files?fileId=${fileId}`
  );
  const file = await driveResponse.json();

  // Then link it
  const linkResponse = await fetch("/api/integrations/google-drive/link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileId: file.id,
      fileName: file.name,
      mimeType: file.mimeType,
      webViewLink: file.webViewLink,
      size: file.size,
      linkType: "project",
      entityId: projectId,
    }),
  });

  return linkResponse.json();
}
```

### Pattern 3: Check if Drive is Connected

```tsx
"use client";

import { useEffect, useState } from "react";

export function DriveConnectionIndicator() {
  const [status, setStatus] = useState<{ connected: boolean; email?: string }>();

  useEffect(() => {
    async function checkStatus() {
      const response = await fetch("/api/integrations/google-drive/status");
      const data = await response.json();
      setStatus(data);
    }
    checkStatus();
  }, []);

  if (!status) return <div>Checking...</div>;

  return (
    <div>
      {status.connected ? (
        <span>✅ Connected: {status.email}</span>
      ) : (
        <span>❌ Not connected</span>
      )}
    </div>
  );
}
```

## 🐛 Debugging

### ⚠️ Common Error: "Access blocked"

```
Error: "Access blocked: Nextoria-hub has not completed the Google verification process"

Quick Fix:
1. Go to Google Cloud Console
2. APIs & Services → OAuth consent screen
3. Scroll to "Test users"
4. Click "+ ADD USERS"
5. Add your email
6. Try again!

Detailed guide: See GOOGLE_OAUTH_VERIFICATION_FIX.md
```

### Enable Debug Logs

```typescript
// In your component
console.log("Drive files:", files);
console.log("Connection status:", driveStatus);
```

### Check API Response

```bash
# Check connection status
curl http://localhost:3000/api/integrations/google-drive/status

# List files
curl http://localhost:3000/api/integrations/google-drive/files?pageSize=10
```

### Other Common Errors

```typescript
// Error: "Google Drive not configured"
// Fix: Check environment variables

// Error: "Google Drive not connected"
// Fix: Click "Connect Google Drive" button first

// Error: "Failed to refresh token"
// Fix: Disconnect and reconnect

// Error: "Invalid redirect URI"
// Fix: Ensure redirect URI in Google Console matches .env exactly
```

## 📊 API Response Examples

### List Files Response

```json
{
  "files": [
    {
      "id": "1abc123",
      "name": "Project Proposal.pdf",
      "mimeType": "application/pdf",
      "webViewLink": "https://drive.google.com/...",
      "size": "1024000",
      "createdTime": "2025-01-15T10:30:00.000Z",
      "modifiedTime": "2025-01-20T15:45:00.000Z",
      "thumbnailLink": "https://...",
      "owners": [
        {
          "displayName": "John Doe",
          "emailAddress": "john@example.com"
        }
      ],
      "shared": false
    }
  ],
  "nextPageToken": "token-for-next-page"
}
```

### Link File Response

```json
{
  "success": true,
  "link": {
    "id": "link-id",
    "driveFileId": "1abc123",
    "fileName": "Project Proposal.pdf",
    "linkType": "project",
    "projectId": "project-123",
    "description": "Final proposal",
    "tags": "proposal,final",
    "createdAt": "2025-01-20T16:00:00.000Z"
  }
}
```

## 🎯 Tips & Best Practices

1. **Always check connection first**

   ```typescript
   const status = await fetch("/api/integrations/google-drive/status");
   if (!status.connected) {
     // Show connect button
   }
   ```

2. **Handle token refresh errors gracefully**

   ```typescript
   try {
     const files = await fetch("/api/integrations/google-drive/files");
   } catch (error) {
     // Suggest reconnection
   }
   ```

3. **Use pagination for large file lists**

   ```typescript
   const response = await fetch(
     "/api/integrations/google-drive/files?pageSize=50&pageToken=..."
   );
   ```

4. **Cache file lists when appropriate**

   ```typescript
   // Use SWR or React Query
   const { data } = useSWR("/api/integrations/google-drive/files", fetcher);
   ```

5. **Validate entity IDs before linking**
   ```typescript
   if (!projectId || projectId.trim() === "") {
     toast.error("Invalid project ID");
     return;
   }
   ```

## ✅ Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Drive API
- [ ] Created OAuth credentials
- [ ] Added environment variables
- [ ] Ran database migration
- [ ] Tested connection flow
- [ ] Tested file browsing
- [ ] Tested file linking
- [ ] Tested disconnection

## 🆘 Need Help?

- Check [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md) for detailed setup
- See [FILE_SYSTEM_COMPLETE.md](./FILE_SYSTEM_COMPLETE.md) for architecture
- Review [Google Drive API Docs](https://developers.google.com/drive/api)

---

**Ready to go! 🚀**
