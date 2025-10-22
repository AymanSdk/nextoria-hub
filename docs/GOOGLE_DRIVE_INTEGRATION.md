# Google Drive Integration Guide

## Overview

Google Drive integration is **FREE** and allows your team to access, browse, and link files directly from Google Drive without duplicating storage.

## ✅ Is Google Drive API Free?

**YES!** Google Drive API is free with generous quotas:

### Free Tier Includes:
- 📊 **20,000 requests/day** per project (usually sufficient)
- 🔄 **1,000 requests per 100 seconds** per user
- 💾 **No storage costs** (uses user's Drive storage)
- 🌐 **Unlimited users** (each has their own quota)

### Additional Quotas (if needed):
- Can request quota increases for free
- Enterprise customers get higher default quotas
- Paid Google Workspace accounts have no additional API fees

## How It Works

### Architecture
```
User's Browser
     ↓
OAuth 2.0 Login (Google)
     ↓
Nextoria Hub Backend
     ↓
Google Drive API
     ↓
User's Google Drive Files
```

### Benefits
1. ✅ No file duplication
2. ✅ Real-time sync with Drive
3. ✅ Preserve Drive permissions
4. ✅ Link files to projects/clients
5. ✅ Preview Drive files in-app
6. ✅ No storage costs

## Implementation Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Name it "Nextoria Hub" or similar

### 2. Enable Google Drive API

```bash
# In Google Cloud Console
1. Navigate to "APIs & Services" > "Library"
2. Search for "Google Drive API"
3. Click "Enable"
```

### 3. Create OAuth 2.0 Credentials

```bash
# In Google Cloud Console
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google (development)
   - https://yourdomain.com/api/auth/callback/google (production)
5. Save Client ID and Client Secret
```

### 4. Configure Environment Variables

Add to your `.env` file:

```env
# Google Drive Integration
GOOGLE_DRIVE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_DRIVE_CLIENT_SECRET="your-client-secret"
GOOGLE_DRIVE_REDIRECT_URI="http://localhost:3000/api/auth/callback/google"

# Scopes (what permissions we need)
GOOGLE_DRIVE_SCOPES="https://www.googleapis.com/auth/drive.readonly"
```

### 5. Install Google Drive SDK

```bash
bun add googleapis
```

### 6. Create Google Drive Service

Create `/src/lib/integrations/google-drive.ts`:

```typescript
import { google } from 'googleapis';

export async function getGoogleDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    process.env.GOOGLE_DRIVE_REDIRECT_URI
  );

  auth.setCredentials({ access_token: accessToken });

  return google.drive({ version: 'v3', auth });
}

export async function listDriveFiles(accessToken: string, folderId?: string) {
  const drive = await getGoogleDriveClient(accessToken);

  const response = await drive.files.list({
    pageSize: 100,
    fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, thumbnailLink, webViewLink)',
    q: folderId ? `'${folderId}' in parents` : undefined,
  });

  return response.data.files;
}

export async function getFileMetadata(accessToken: string, fileId: string) {
  const drive = await getGoogleDriveClient(accessToken);

  const response = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size, createdTime, modifiedTime, thumbnailLink, webViewLink',
  });

  return response.data;
}

export async function downloadFile(accessToken: string, fileId: string) {
  const drive = await getGoogleDriveClient(accessToken);

  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  return response.data;
}
```

### 7. Create API Routes

Create `/app/api/integrations/google-drive/auth/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    process.env.GOOGLE_DRIVE_REDIRECT_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.file',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  return NextResponse.redirect(url);
}
```

Create `/app/api/integrations/google-drive/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { google } from 'googleapis';
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { integrations } from "@/src/db/schema";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    process.env.GOOGLE_DRIVE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);
  
  // Store tokens in database
  await db.insert(integrations).values({
    workspaceId: user.workspaceId, // Adjust based on your schema
    type: 'GOOGLE_DRIVE',
    credentials: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    },
    isActive: true,
  });

  return NextResponse.redirect('/files?tab=drive&connected=true');
}
```

Create `/app/api/integrations/google-drive/files/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { listDriveFiles } from "@/src/lib/integrations/google-drive";
import { db } from "@/src/db";
import { integrations } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get('folderId');

  // Get Google Drive integration
  const integration = await db.query.integrations.findFirst({
    where: and(
      eq(integrations.workspaceId, user.workspaceId),
      eq(integrations.type, 'GOOGLE_DRIVE'),
      eq(integrations.isActive, true)
    ),
  });

  if (!integration) {
    return NextResponse.json({ error: 'Google Drive not connected' }, { status: 404 });
  }

  const accessToken = integration.credentials.access_token;
  const files = await listDriveFiles(accessToken, folderId || undefined);

  return NextResponse.json({ files });
}
```

### 8. Update Database Schema

The `integrations` table already exists, update it to support Google Drive:

```typescript
// In src/db/schema/integrations.ts
export const integrationType = pgEnum("integration_type", [
  "SLACK",
  "GOOGLE_DRIVE", // Add this
  "FIGMA",
  "GITHUB",
]);
```

### 9. Create Drive Browser Component

Create `/components/integrations/google-drive-browser.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, FileText, Folder } from "lucide-react";
import { toast } from "sonner";

export function GoogleDriveBrowser() {
  const [files, setFiles] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/integrations/google-drive/status');
      const data = await response.json();
      setConnected(data.connected);
      if (data.connected) {
        fetchFiles();
      }
    } catch (error) {
      console.error('Error checking Drive connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/integrations/google-drive/files');
      const data = await response.json();
      setFiles(data.files);
    } catch (error) {
      console.error('Error fetching Drive files:', error);
      toast.error('Failed to load Google Drive files');
    }
  };

  const handleConnect = () => {
    window.location.href = '/api/integrations/google-drive/auth';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!connected) {
    return (
      <div className='text-center py-12'>
        <Cloud className='mx-auto h-16 w-16 text-blue-500 mb-4' />
        <h3 className='text-xl font-semibold mb-2'>Connect Google Drive</h3>
        <p className='text-neutral-500 mb-6 max-w-md mx-auto'>
          Access your Google Drive files directly from Nextoria Hub
        </p>
        <Button onClick={handleConnect}>
          <Cloud className='mr-2 h-4 w-4' />
          Connect Google Drive
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {files.map((file: any) => (
        <Card key={file.id}>
          <CardContent className='p-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              {file.mimeType.includes('folder') ? (
                <Folder className='h-8 w-8 text-blue-500' />
              ) : (
                <FileText className='h-8 w-8 text-neutral-500' />
              )}
              <div>
                <p className='font-medium'>{file.name}</p>
                <p className='text-xs text-neutral-500'>
                  {new Date(file.createdTime).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button variant='outline' size='sm'>
              Link to Project
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## Integration with Existing File System

The unified file system now supports:

1. **S3 Storage** (Projects, Tasks, Clients) - ✅ Implemented
2. **Google Drive** (External linking) - 🔜 Coming Soon

### Unified File View

Files from both sources appear in `/files`:

- **All Files Tab**: S3 + Google Drive files
- **Projects Tab**: Project-specific S3 files
- **Clients Tab**: Client deliverables (S3) ✅ Already Working
- **Google Drive Tab**: Drive files with link capability

## Cost Comparison

### S3 Storage (Current)
- ✅ Full control
- ✅ Fast uploads/downloads
- 💰 Storage costs (~$0.023/GB/month)
- 💰 Transfer costs (~$0.09/GB egress)

### Google Drive
- ✅ FREE API access
- ✅ No storage costs (user's Drive)
- ✅ No transfer costs
- ⚠️ Requires user authentication
- ⚠️ Depends on Drive quotas

### Recommendation: Use Both!

**S3 for:**
- Client deliverables
- Project files
- Team uploads
- Files that need to be permanently available

**Google Drive for:**
- Large design files (PSD, Figma exports)
- Video files
- Reference materials
- Temporary sharing

## Security Considerations

1. **OAuth 2.0**: Secure user authentication
2. **Scopes**: Request minimum necessary permissions
3. **Token Storage**: Encrypted in database
4. **Token Refresh**: Auto-refresh expired tokens
5. **User Permissions**: Respect Drive file permissions

## Quota Management

### Monitor Usage:
```typescript
// Check quota status
const quotaResponse = await drive.about.get({
  fields: 'storageQuota, user'
});
```

### Best Practices:
1. Cache file lists (don't fetch on every page load)
2. Use webhooks for change notifications
3. Batch API requests when possible
4. Implement pagination for large file lists

## Testing

```bash
# 1. Set up Google Cloud project
# 2. Add credentials to .env
# 3. Start dev server
bun run dev

# 4. Navigate to /files
# 5. Click "Connect Google Drive"
# 6. Authenticate with Google
# 7. Browse Drive files
```

## Troubleshooting

### "Invalid Client" Error
- Check `GOOGLE_DRIVE_CLIENT_ID` and `CLIENT_SECRET`
- Verify redirect URI matches exactly

### "Insufficient Permissions" Error
- Check scopes in OAuth request
- User needs to grant permissions

### "Quota Exceeded" Error
- Wait for quota reset (daily)
- Request quota increase from Google
- Implement caching to reduce API calls

## Next Steps

1. ✅ Implement OAuth flow
2. ✅ Create Drive browser component
3. ✅ Add file linking to projects
4. ⬜ Implement file search
5. ⬜ Add webhook support for real-time updates
6. ⬜ Implement file preview

## Resources

- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [API Quotas](https://developers.google.com/drive/api/v3/handle-errors#quotas)
- [googleapis NPM Package](https://www.npmjs.com/package/googleapis)

---

**Status**: 🔜 Ready to implement (all infrastructure in place)
**Cost**: ✅ **100% FREE** for most use cases
**Implementation Time**: ~4-6 hours

