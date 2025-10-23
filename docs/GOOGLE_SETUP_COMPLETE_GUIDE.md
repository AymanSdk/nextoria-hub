# Complete Google Drive Setup - Step by Step

## 🎯 What We're Doing

Setting up Google Drive so you can browse your Drive files in Nextoria Hub.

**Total time: 10 minutes**

---

## PART 1: Create Google Cloud Project (3 minutes)

### Step 1.1: Go to Google Cloud Console

1. Open: https://console.cloud.google.com/
2. Sign in with your Google account

### Step 1.2: Create a New Project

**If you see "Select a project" at the top:**

1. Click **"Select a project"** (top bar, near Google Cloud logo)
2. Click **"NEW PROJECT"** (top right of popup)
3. Enter project name: **"Nextoria Hub"**
4. Click **"CREATE"**
5. Wait 10 seconds for project to be created
6. Make sure "Nextoria Hub" is selected in the top bar

**If you already have a project:**

- Just select it from the dropdown

---

## PART 2: Enable Google Drive API (1 minute)

### Step 2.1: Go to API Library

1. Click **☰ Menu** (top left, three horizontal lines)
2. Scroll down to **"APIs & Services"**
3. Click **"Library"**

### Step 2.2: Enable Drive API

1. In the search box, type: **"Google Drive API"**
2. Click on **"Google Drive API"** (first result)
3. Click **"ENABLE"** button (big blue button)
4. Wait for it to enable (5 seconds)

✅ Done! Now you should see "API enabled"

---

## PART 3: Configure OAuth Consent Screen (3 minutes)

**This is where you'll add test users and scopes!**

### Step 3.1: Navigate to OAuth Consent Screen

1. Click **☰ Menu** (top left)
2. Go to **"APIs & Services"**
3. Click **"OAuth consent screen"** (in the left sidebar)

**IMPORTANT:** You should see either:

- A setup wizard (if first time)
- OR a filled-out form with EDIT buttons

### Step 3.2: Choose User Type (If This Is Your First Time)

**If you see this screen:**

```
○ Internal  (Only available if you have Google Workspace)
○ External  ← Select this one
```

1. Select **"External"**
2. Click **"CREATE"**

**If you DON'T see this screen:**

- You already configured it!
- Click **"EDIT APP"** button (top of page)
- This will let you go through the wizard again

### Step 3.3: Fill Out App Information

**Page 1: OAuth consent screen**

Fill in these fields:

```
App name: Nextoria Hub

User support email: [Select your email from dropdown]

App logo: [Skip for now - optional]

Application home page: http://localhost:3000

Application privacy policy: http://localhost:3000/privacy (optional for testing)

Application terms of service: http://localhost:3000/terms (optional for testing)

Authorized domains: [Leave empty for now]

Developer contact information: your-email@gmail.com
```

3. Click **"SAVE AND CONTINUE"** (bottom of page)

### Step 3.4: Add Scopes ⭐ (THIS IS WHERE THE SCOPES ARE!)

**Page 2: Scopes**

1. Click **"ADD OR REMOVE SCOPES"** button
2. A panel slides in from the right

**Now you need to add 3 scopes. Here's how:**

#### Scope 1 & 2: Google Drive Scopes

3. In the **"Filter"** box at the top, type: **"drive"**
4. You'll see a list of Google Drive API scopes
5. Find and **check the boxes** for these TWO scopes:

```
☑ .../auth/drive.file
   See, edit, create, and delete only the specific Google Drive files you use with this app

☑ .../auth/drive.readonly
   See and download all your Google Drive files
```

#### Scope 3: Email Scope

6. **Clear the filter box** (delete "drive")
7. In the **"Filter"** box, type: **"email"**
8. Scroll down and find **"Google OAuth2 API v2"** section
9. Check the box for:

```
☑ .../auth/userinfo.email
   View your email address
```

**Or alternatively:** Type the full URL in the manual entry field at the bottom:

```
https://www.googleapis.com/auth/userinfo.email
```

#### Finish Adding Scopes

10. Click **"UPDATE"** (bottom of the panel)
11. You should now see **"3 scopes"** in the table
12. Click **"SAVE AND CONTINUE"** (bottom of page)

**Troubleshooting Scopes:**

- If you can't find a scope, try searching for just part of the name
- The email scope is under "Google OAuth2 API v2", not Google Drive API
- You can also manually paste the full scope URLs

### Step 3.5: Add Test Users ⭐ (THIS IS WHERE TEST USERS ARE!)

**IMPORTANT: Test users are on Page 3 of the OAuth Consent Screen wizard!**

**If you're going through the wizard:**

**Page 3: Test users**

1. You should see a page titled **"Test users"** at the top
2. Below it, you'll see a section that says **"No test users"** or shows existing users
3. Click **"+ ADD USERS"** button (on the right side)
4. A small popup appears titled "Add test users"
5. Type your email: **your-email@gmail.com**
6. Press **Enter** or click outside the box
7. Click **"Add"** button in the popup
8. You should now see your email listed with a small X next to it
9. Click **"SAVE AND CONTINUE"** (bottom of page)

**If you don't see "Test users" page:**

This means you skipped through the wizard too fast or already configured it!

**Solution:**

1. Go back to **OAuth consent screen** (left sidebar)
2. Look for **"EDIT APP"** button at the top
3. Click **"EDIT APP"**
4. Click through pages 1 and 2 (just click "Save and Continue")
5. **Page 3 is Test users** - add your email here!
6. Click "Save and Continue" to finish

### Step 3.6: Summary

**Page 4: Summary**

1. Review everything
2. Click **"BACK TO DASHBOARD"**

✅ Done with OAuth consent screen!

---

## PART 4: Create OAuth Credentials (2 minutes)

### Step 4.1: Navigate to Credentials

1. Click **☰ Menu** (top left)
2. Go to **"APIs & Services"**
3. Click **"Credentials"** (in the left sidebar)

### Step 4.2: Create OAuth Client ID

1. Click **"+ CREATE CREDENTIALS"** (top of page)
2. Select **"OAuth client ID"**

### Step 4.3: Configure OAuth Client

**Application type:**

- Select **"Web application"**

**Name:**

- Enter: **"Nextoria Hub Web Client"**

**Authorized JavaScript origins:**

- Leave empty (not needed)

**Authorized redirect URIs:**

- Click **"+ ADD URI"**
- Enter: **http://localhost:3000/api/integrations/google-drive/callback**
- Make sure there are NO spaces or extra characters

It should look exactly like this:

```
http://localhost:3000/api/integrations/google-drive/callback
```

### Step 4.4: Create and Copy Credentials

1. Click **"CREATE"** button
2. A popup appears with your credentials!

**⭐ COPY THESE NOW - You need them for .env file:**

```
Your Client ID
1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com

Your Client Secret
GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
```

3. Click **"DOWNLOAD JSON"** (optional, for backup)
4. Click **"OK"**

✅ Keep these credentials safe!

---

## PART 5: Configure Your App (2 minutes)

### Step 5.1: Add Environment Variables

Open your `.env` file and add:

```env
# Google Drive Integration
GOOGLE_DRIVE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_DRIVE_CLIENT_SECRET="GOCSPX-your-client-secret-here"
GOOGLE_DRIVE_REDIRECT_URI="http://localhost:3000/api/integrations/google-drive/callback"
```

**Replace:**

- `your-client-id-here` with your actual Client ID
- `your-client-secret-here` with your actual Client Secret

**Example:**

```env
GOOGLE_DRIVE_CLIENT_ID="123456789-abc123def456.apps.googleusercontent.com"
GOOGLE_DRIVE_CLIENT_SECRET="GOCSPX-Abc123Def456Ghi789"
GOOGLE_DRIVE_REDIRECT_URI="http://localhost:3000/api/integrations/google-drive/callback"
```

### Step 5.2: Run Database Migration

```bash
cd /home/aymane-wrk/nextoria-hub
bun run db:push
```

**Or if that doesn't work:**

```bash
psql $DATABASE_URL < drizzle/migrations/create_drive_files_table.sql
```

### Step 5.3: Restart Your Dev Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
bun run dev
```

---

## PART 6: Test It! (1 minute)

### Step 6.1: Connect Google Drive

1. Open browser: http://localhost:3000/files
2. Click **"Connect Google Drive"** button
3. Google OAuth page opens
4. **Sign in with the email you added as test user**
5. You'll see permission request screen
6. Click **"Allow"**
7. Redirects back to Nextoria Hub
8. You should see: "Connected: your-email@gmail.com" ✅

### Step 6.2: Browse Your Files

1. Click **"Google Drive"** tab
2. You should see your Drive files!
3. Try searching, changing view mode, etc.

---

## 🎉 Success Checklist

- [x] Created Google Cloud project
- [x] Enabled Google Drive API
- [x] Configured OAuth consent screen
- [x] Added scopes (drive.file, drive.readonly, userinfo.email)
- [x] Added yourself as test user
- [x] Created OAuth credentials
- [x] Copied Client ID and Secret
- [x] Added to .env file
- [x] Ran database migration
- [x] Restarted dev server
- [x] Successfully connected Google Drive!

---

## 🐛 Troubleshooting

### Error: "Access blocked: Nextoria-hub has not completed verification"

**Solution:** You forgot to add yourself as test user!

**IMPORTANT:** Test users are NOT on the main OAuth consent screen page!

**How to add test users:**

1. Go to: Google Cloud Console
2. Navigate: APIs & Services → OAuth consent screen
3. Click **"EDIT APP"** button (top of page)
4. Click through the wizard to **Page 3: Test users**
5. Click **"+ ADD USERS"**
6. Type your email address
7. Click "Add"
8. Click "Save and Continue" to finish
9. Try connecting again!

### Error: "Redirect URI mismatch"

**Solution:** Your redirect URI doesn't match!

Check that BOTH of these are EXACTLY the same:

**In Google Cloud Console (Credentials):**

```
http://localhost:3000/api/integrations/google-drive/callback
```

**In your .env file:**

```
GOOGLE_DRIVE_REDIRECT_URI="http://localhost:3000/api/integrations/google-drive/callback"
```

No extra spaces, no https (use http for localhost), no trailing slash!

### Error: "Google Drive not configured"

**Solution:** Environment variables not loaded

1. Check your `.env` file has all three variables
2. Make sure you restarted the dev server
3. Try `cat .env | grep GOOGLE_DRIVE` to verify

### Can't find OAuth consent screen

Make sure you're in the right project:

1. Check project name in top bar
2. Should say "Nextoria Hub" (or your project name)

### Don't see "Test users" section ⭐ COMMON ISSUE!

**Test users are NOT visible on the main OAuth consent screen page!**

You need to go through the setup wizard to see them:

**Solution:**

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Look for **"EDIT APP"** button (usually near top of page)
3. Click **"EDIT APP"**
4. You'll enter a wizard with 4 pages
5. Click through:
   - Page 1: OAuth consent screen (info)
   - Page 2: Scopes (add the 3 scopes)
   - **Page 3: Test users** ← THIS IS WHERE THEY ARE!
   - Page 4: Summary
6. On Page 3, click **"+ ADD USERS"**
7. Add your email
8. Click "Save and Continue" through to the end

**Visual:**

```
OAuth Consent Screen Page (main)
     │
     ├─ EDIT APP button ← Click this!
     │
     └─ Opens Wizard:
         ├─ Page 1: App info
         ├─ Page 2: Scopes
         ├─ Page 3: Test users ← HERE! ✅
         └─ Page 4: Summary
```

---

## 📸 Visual Guide

### Where is OAuth Consent Screen?

```
Google Cloud Console
│
├── ☰ Menu (click)
│   │
│   └── APIs & Services
│       │
│       ├── Credentials          ← NOT here!
│       ├── OAuth consent screen ← HERE! ✅
│       └── Library
```

### Where are Scopes?

```
OAuth consent screen
│
├── Page 1: App information      (fill out app details)
│
├── Page 2: Scopes              ← SCOPES ARE HERE! ✅
│   └── Click "ADD OR REMOVE SCOPES"
│
├── Page 3: Test users          ← TEST USERS ARE HERE! ✅
│   └── Click "+ ADD USERS"
│
└── Page 4: Summary             (review)
```

### What Order?

```
1. Create project
2. Enable Drive API
3. Configure OAuth consent screen
   ├── 3a. Add scopes
   └── 3b. Add test users
4. Create credentials
5. Add to .env
6. Restart server
7. Test!
```

---

## 🆘 Still Stuck?

### Option 1: Check These Files

- `.env` - Has all variables?
- Server is running?
- Using correct email (test user)?

### Option 2: Start Fresh

Sometimes easier to start over:

1. Delete OAuth client in Credentials
2. Start from PART 4 again
3. Make sure redirect URI is exact

### Option 3: Screenshots

Take screenshots of:

1. Your OAuth consent screen (test users section)
2. Your credentials page (redirect URIs)
3. Your .env file (hide secrets!)
4. The error you're seeing

---

## 🎓 Understanding the Parts

**Project**: Container for your app in Google Cloud

**API**: Google Drive API - lets you access Drive programmatically

**OAuth Consent Screen**: What users see when granting permission

- **Scopes**: What permissions you're requesting (read Drive, etc.)
- **Test Users**: Who can use your unverified app

**Credentials**: Client ID & Secret - identifies your app to Google

**Redirect URI**: Where Google sends user after they approve

---

## 📝 Exact Scope Names Reference

When adding scopes, here's what to search for and what you'll see:

### Search "drive" - You'll see:

```
Google Drive API
├── https://www.googleapis.com/auth/drive
├── https://www.googleapis.com/auth/drive.file ✅ CHECK THIS
├── https://www.googleapis.com/auth/drive.readonly ✅ CHECK THIS
└── ... (other drive scopes)
```

### Search "email" - You'll see:

```
Google OAuth2 API v2
├── openid
├── https://www.googleapis.com/auth/userinfo.email ✅ CHECK THIS
└── https://www.googleapis.com/auth/userinfo.profile
```

### Can't Find Email Scope? Use Manual Entry:

At the bottom of the scopes panel, there's usually a field to manually add scopes.

**Paste this full URL:**

```
https://www.googleapis.com/auth/userinfo.email
```

Then click "ADD" or press Enter.

### Final Check - You Should Have These 3:

```
1. https://www.googleapis.com/auth/drive.file
2. https://www.googleapis.com/auth/drive.readonly
3. https://www.googleapis.com/auth/userinfo.email
```

---

## Next Steps

Once working:

- Add more test users (team members)
- Link Drive files to projects/tasks
- For production: Submit for Google verification

**Enjoy your Google Drive integration! 🚀**
