# Google Drive Integration Setup Guide

## Overview

Google Drive integration allows your team to:

- ✅ Access Google Drive files directly from Nextoria Hub
- ✅ Link Drive files to projects, clients, and tasks
- ✅ No file duplication (files stay in Google Drive)
- ✅ **100% FREE** - Google Drive API has generous free quotas

## Is It Really Free?

**YES!** Google Drive API is completely free with these quotas:

- 📊 **20,000 requests/day** per project
- 🔄 **1,000 requests per 100 seconds** per user
- 💾 **No storage costs** (uses user's Drive storage)
- 🌐 **Unlimited users**

For most teams, you'll never hit these limits. If you do, you can request free quota increases.

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select existing project
3. Name it "Nextoria Hub" (or any name you prefer)
4. Click "Create"

### 2. Enable Google Drive API

1. In Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google Drive API"**
3. Click on it and press **"Enable"**

### 3. Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. If prompted, configure the OAuth consent screen:
   - User Type: **Internal** (for workspace) or **External** (for public)
   - App name: **"Nextoria Hub"**
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add these scopes:
     - `https://www.googleapis.com/auth/drive.readonly`
     - `https://www.googleapis.com/auth/drive.file`
     - `https://www.googleapis.com/auth/userinfo.email`
   - **IMPORTANT**: If using "External" user type, scroll to "Test users" and add your email address(es) to avoid verification errors
4. Back to credentials, create OAuth client:
   - Application type: **Web application**
   - Name: **"Nextoria Hub Web Client"**
   - Authorized redirect URIs:
     - `http://localhost:3000/api/integrations/google-drive/callback` (development)
     - `https://yourdomain.com/api/integrations/google-drive/callback` (production)
5. Click **"Create"**
6. Copy the **Client ID** and **Client Secret**

> ⚠️ **Common Issue**: If you see "Access blocked" error, you need to add test users. See [GOOGLE_OAUTH_VERIFICATION_FIX.md](./GOOGLE_OAUTH_VERIFICATION_FIX.md) for details.

### 4. Configure Environment Variables

Add these to your `.env` file:

```env
# Google Drive Integration
GOOGLE_DRIVE_CLIENT_ID="1234567890-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_DRIVE_CLIENT_SECRET="GOCSPX-your-client-secret"
GOOGLE_DRIVE_REDIRECT_URI="http://localhost:3000/api/integrations/google-drive/callback"
```

**For production**, update the redirect URI:

```env
GOOGLE_DRIVE_REDIRECT_URI="https://yourdomain.com/api/integrations/google-drive/callback"
```

### 5. Run Database Migration

```bash
# Using Drizzle
bun run db:push

# Or run the migration SQL directly
psql $DATABASE_URL < drizzle/migrations/create_drive_files_table.sql
```

### 6. Restart Your Development Server

```bash
bun run dev
```

## How to Use

### Connecting Google Drive

1. Navigate to **Files** page in Nextoria Hub
2. Click **"Connect Google Drive"** button
3. Sign in with your Google account
4. Grant permissions to Nextoria Hub
5. You'll be redirected back and see your Drive files!

### Browsing Google Drive Files

1. Go to **Files** page
2. Click on **"Google Drive"** tab
3. Browse your files (supports search, filtering, pagination)
4. Use view modes: List or Grid

### Linking Files to Projects/Clients/Tasks

1. In the Google Drive tab, find the file you want to link
2. Click **"Link"** button on the file
3. Choose what to link to: Project, Client, or Task
4. Enter the ID of the entity (you can find it in the URL)
5. Optionally add description and tags
6. Click **"Link File"**

Now the file is linked and can be accessed from the project/client/task page!

### Disconnecting Google Drive

1. Go to **Files** page
2. Click **"Disconnect"** button next to your email
3. Confirm disconnection

You can reconnect anytime without losing your linked files.

## Features

✅ **File Browser** - Browse all your Google Drive files
✅ **Search** - Search files by name
✅ **Multiple View Modes** - List or Grid view
✅ **File Linking** - Link files to projects, clients, tasks
✅ **Metadata** - Add descriptions and tags
✅ **Auto Token Refresh** - Tokens refresh automatically
✅ **Secure** - OAuth 2.0 with encrypted token storage

## Architecture

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

### How It Works

1. User authorizes Nextoria Hub via Google OAuth
2. Google provides access + refresh tokens
3. Tokens stored encrypted in database
4. Nextoria Hub uses tokens to access Drive API
5. Files stay in Google Drive (no duplication)
6. Links stored in database with file metadata

## Security

- ✅ OAuth 2.0 authentication
- ✅ Tokens encrypted in database
- ✅ Auto token refresh (no re-auth needed)
- ✅ Workspace-scoped (each workspace has own connection)
- ✅ Files never leave Google Drive
- ✅ Permission-based access control

## API Endpoints

### Authentication

- `GET /api/integrations/google-drive/auth` - Start OAuth flow
- `GET /api/integrations/google-drive/callback` - OAuth callback
- `POST /api/integrations/google-drive/disconnect` - Disconnect Drive

### Files

- `GET /api/integrations/google-drive/status` - Check connection status
- `GET /api/integrations/google-drive/files` - List Drive files
- `POST /api/integrations/google-drive/link` - Link file to entity
- `GET /api/integrations/google-drive/link` - Get linked files

## Troubleshooting

### ⚠️ "Access blocked: Nextoria-hub has not completed the Google verification process"

**This is the most common issue!**

**Quick Fix**: Add yourself as a test user in Google Cloud Console.

1. Go to **APIs & Services** → **OAuth consent screen**
2. Scroll to **"Test users"** section
3. Click **"+ ADD USERS"**
4. Enter your email address(es)
5. Click **Save**
6. Try connecting again!

**Detailed guide**: See [GOOGLE_OAUTH_VERIFICATION_FIX.md](./GOOGLE_OAUTH_VERIFICATION_FIX.md)

---

### "Google Drive not configured" error

Make sure you've set all environment variables:

- `GOOGLE_DRIVE_CLIENT_ID`
- `GOOGLE_DRIVE_CLIENT_SECRET`
- `GOOGLE_DRIVE_REDIRECT_URI`

### "Access denied" error

Make sure your redirect URI in Google Cloud Console exactly matches your env variable.

### "Token expired" error

The app should auto-refresh tokens. If this persists, try disconnecting and reconnecting.

### "Redirect URI mismatch" error

The redirect URI must match exactly:

- In Google Cloud Console: `http://localhost:3000/api/integrations/google-drive/callback`
- In your `.env`: `GOOGLE_DRIVE_REDIRECT_URI="http://localhost:3000/api/integrations/google-drive/callback"`

## Quota Limits

Default free quotas:

- **20,000 queries/day** per project
- **1,000 queries/100 seconds** per user

If you exceed these, you can:

1. Request a quota increase (usually approved within 24 hours)
2. Optimize API calls with caching
3. Use pagination to reduce calls

## Next Steps

- [ ] Add file preview for images/PDFs
- [ ] Implement folder navigation
- [ ] Add file search with advanced filters
- [ ] Bulk file linking
- [ ] Real-time sync with Drive changes
- [ ] Support for shared drives

## Support

Need help? Check out:

- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- Nextoria Hub issues on GitHub

---

**Built with ❤️ by the Nextoria Team**
