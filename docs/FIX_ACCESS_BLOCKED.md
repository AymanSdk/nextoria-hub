# 🔧 Fix "Access Blocked" Error - 2 Minutes

## The Error You're Seeing

```
❌ Access blocked: Nextoria-hub has not completed the Google verification process
```

## The Fix (Takes 2 minutes)

### Option 1: Add Test User (Fastest! ⚡)

1. **Go to Google Cloud Console**

   ```
   https://console.cloud.google.com/
   ```

2. **Navigate to OAuth Consent Screen**

   ```
   Menu → APIs & Services → OAuth consent screen
   ```

3. **Scroll down to "Test users"**

   ```
   You'll see a section called "Test users"
   Below it shows "No test users" or existing users
   ```

4. **Click "+ ADD USERS"**

   ```
   Button on the right side
   ```

5. **Enter your email**

   ```
   Type: your-email@gmail.com
   Press Enter or click outside
   ```

6. **Click "SAVE"**

   ```
   Bottom of the page
   ```

7. **Done! Try connecting again** ✅

### Option 2: Change to Internal (Google Workspace Only)

If you have Google Workspace:

1. Go to **OAuth consent screen**
2. Click **"MAKE INTERNAL"** (if available)
3. Click **Save**
4. Done! ✅

## Why This Happens

Google requires apps to be **verified** before anyone can use them.

**Two options:**

1. ✅ **Add test users** (instant, up to 100 users)
2. ⏳ **Verify your app** (takes 1-7 days, unlimited users)

For development/testing → Use test users
For production → Get verified

## Verification Flowchart

```
┌─────────────────────────────────┐
│ User tries to connect           │
│ Google Drive                    │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Is app verified?                │
└─┬───────────────────────────┬───┘
  │                           │
  │ NO                        │ YES
  ▼                           ▼
┌───────────────────┐   ┌──────────┐
│ Is user a test    │   │ Success! │
│ user?             │   └──────────┘
└─┬──────────────┬──┘
  │              │
  │ NO           │ YES
  ▼              ▼
┌────────┐  ┌──────────┐
│ ERROR! │  │ Success! │
└────────┘  └──────────┘
```

## Step-by-Step with Screenshots

### Step 1: Find OAuth Consent Screen

```
Google Cloud Console
├── Select your project
└── Left menu
    └── APIs & Services
        └── OAuth consent screen  ← Click here
```

### Step 2: Locate Test Users Section

Scroll down until you see:

```
┌─────────────────────────────────────┐
│ Test users                          │
│                                     │
│ No test users                       │
│                                     │
│                [+ ADD USERS]  ← Click│
└─────────────────────────────────────┘
```

### Step 3: Add Email

A dialog appears:

```
┌─────────────────────────────────────┐
│ Add test users                      │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ your-email@gmail.com            │ │ ← Type here
│ └─────────────────────────────────┘ │
│                                     │
│     [Cancel]           [Add]  ← Click│
└─────────────────────────────────────┘
```

### Step 4: Save Changes

```
┌─────────────────────────────────────┐
│ Test users (1)                      │
│                                     │
│ ✓ your-email@gmail.com         [X]  │
│                                     │
└─────────────────────────────────────┘

                          [SAVE]  ← Click
```

### Step 5: Test Again

```
1. Go to http://localhost:3000/files
2. Click "Connect Google Drive"
3. Sign in with the email you added
4. Should work now! ✅
```

## Troubleshooting

### Still seeing error?

**Clear browser cache:**

```
Chrome: Ctrl+Shift+Delete
- Check "Cookies and other site data"
- Click "Clear data"
```

**Wait 2 minutes:**

```
Google needs time to sync test users
```

**Try incognito mode:**

```
Chrome: Ctrl+Shift+N
Firefox: Ctrl+Shift+P
```

**Verify you're signed in with correct email:**

```
Check email in top-right of OAuth screen
Must match the test user you added
```

### Need to add more people?

```
Repeat the steps for each email address
Maximum: 100 test users
```

### Want to go to production?

```
See: GOOGLE_OAUTH_VERIFICATION_FIX.md
Section: "Solution 3: Verify Your App"
Timeline: 1-7 business days
```

## Quick Reference Card

| What        | Where                                  | What to Do          |
| ----------- | -------------------------------------- | ------------------- |
| 1. Go       | console.cloud.google.com               | Select project      |
| 2. Navigate | APIs & Services → OAuth consent screen | Scroll down         |
| 3. Find     | Test users section                     | Click "+ ADD USERS" |
| 4. Add      | Email field                            | Type your email     |
| 5. Save     | Bottom                                 | Click "SAVE"        |
| 6. Test     | localhost:3000/files                   | Connect Drive       |

## Common Questions

**Q: How long does this take?**
A: 2 minutes max

**Q: Is this permanent?**
A: Yes, until you remove the test user

**Q: Can I add multiple emails?**
A: Yes, up to 100

**Q: Do they need to be Gmail?**
A: No, any Google account works

**Q: Does this work for production?**
A: No, test users are for development only

**Q: How do I remove test users?**
A: OAuth consent screen → Click X next to email

**Q: What if I don't have Google Cloud Console access?**
A: You need to be the project owner or have proper IAM roles

## Related Docs

- **Full guide**: [GOOGLE_OAUTH_VERIFICATION_FIX.md](./GOOGLE_OAUTH_VERIFICATION_FIX.md)
- **Setup guide**: [GOOGLE_DRIVE_SETUP.md](./GOOGLE_DRIVE_SETUP.md)
- **Quick start**: [QUICK_START_GOOGLE_DRIVE.md](./QUICK_START_GOOGLE_DRIVE.md)

---

**TL;DR**:

1. Google Cloud Console
2. OAuth consent screen
3. Test users → + ADD USERS
4. Add your email
5. Save
6. Done! ✅
