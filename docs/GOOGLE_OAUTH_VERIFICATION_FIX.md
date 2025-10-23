# Fixing "Access blocked" Google OAuth Error

## The Error

```
Access blocked: Nextoria-hub has not completed the Google verification process
```

This happens because Google requires OAuth apps to be verified before external users can use them.

## Solution 1: Add Test Users (Quick Fix - Development)

This is the **fastest solution** for development and testing.

### Steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **"APIs & Services"** → **"OAuth consent screen"**
4. Scroll down to **"Test users"** section
5. Click **"+ ADD USERS"**
6. Add the Google email addresses that need access (including yours!)
7. Click **"Save"**

### Important:

- You can add up to **100 test users** in development
- Test users can use the app immediately (no verification needed)
- Perfect for development, testing, and small teams

### Example:

```
Test Users:
- you@gmail.com
- teammate1@gmail.com
- teammate2@company.com
```

## Solution 2: Use Internal User Type (For Google Workspace)

If you have a **Google Workspace** account (not regular Gmail):

### Steps:

1. Go to **"OAuth consent screen"**
2. Change **User Type** to **"Internal"**
3. Click **"Save"**

### Benefits:

- No verification needed
- All users in your Google Workspace can use it
- No test user limits

### Limitations:

- Only works if you have Google Workspace
- Only users in your workspace can connect

## Solution 3: Verify Your App (For Production)

For production use with external users:

### Steps:

1. Go to **"OAuth consent screen"**
2. Click **"PUBLISH APP"**
3. Click **"Prepare for verification"**
4. Follow Google's verification process:
   - Add privacy policy URL
   - Add terms of service URL
   - Add app homepage URL
   - Provide YouTube demo video
   - Explain why you need Drive access

### Timeline:

- Google review takes **1-7 business days**
- May require additional information
- Required for public apps with external users

### When to use:

- Production apps with external users
- Public SaaS products
- Apps with > 100 users

## Solution 4: Bypass Warning (Development Only)

If you're a test user or developer:

### Steps:

1. When you see the warning screen
2. Look for **"Advanced"** link (bottom left)
3. Click **"Advanced"**
4. Click **"Go to Nextoria-hub (unsafe)"**
5. Grant permissions

### ⚠️ WARNING:

- Only works if you're added as a test user
- Not available for non-test users
- Shows "unsafe" warning to users

## Recommended Approach

### For Development (Right Now):

```bash
✅ Use Solution 1: Add Test Users
- Quick (takes 2 minutes)
- No verification needed
- Works immediately
```

### For Production (Later):

```bash
✅ Use Solution 3: Verify Your App
- Required for public use
- Takes 1-7 days
- Professional appearance
```

## Step-by-Step: Add Test Users (Detailed)

### 1. Navigate to OAuth Consent Screen

```
1. Go to: https://console.cloud.google.com/
2. Select your project (e.g., "Nextoria Hub")
3. Click menu → APIs & Services → OAuth consent screen
```

### 2. Configure App Details (if not done)

```
User Type: External (or Internal if you have Workspace)
App name: Nextoria Hub
User support email: your-email@gmail.com
Developer contact: your-email@gmail.com
```

### 3. Add Scopes (if not done)

```
Click "ADD OR REMOVE SCOPES"
Add these scopes:
- https://www.googleapis.com/auth/drive.readonly
- https://www.googleapis.com/auth/drive.file
- https://www.googleapis.com/auth/userinfo.email
```

### 4. Add Test Users

```
Scroll to "Test users" section
Click "+ ADD USERS"
Enter email addresses (one per line):
  your-email@gmail.com
  team-member@gmail.com
Click "Add"
Click "SAVE AND CONTINUE"
```

### 5. Verify Test Users Were Added

```
You should see:
  Test users (2)
  ✓ your-email@gmail.com
  ✓ team-member@gmail.com
```

### 6. Test the Connection

```
1. Go to http://localhost:3000/files
2. Click "Connect Google Drive"
3. Sign in with test user email
4. You should now see permissions screen (no error!)
5. Click "Allow"
6. Success! 🎉
```

## Screenshots Guide

### Before Adding Test Users:

```
❌ Error: "Access blocked: Nextoria-hub has not completed verification"
```

### After Adding Test Users:

```
✅ Shows normal OAuth consent screen
✅ Can click "Allow" and proceed
✅ Successfully connects Google Drive
```

## Troubleshooting

### Still seeing error after adding test users?

1. **Clear browser cache**

   ```bash
   Chrome: Ctrl+Shift+Delete → Clear cookies
   ```

2. **Make sure you're signed in with test user email**

   ```
   Check email in top-right of Google consent screen
   ```

3. **Wait 2-3 minutes**

   ```
   Google sometimes takes a few minutes to sync test users
   ```

4. **Try incognito/private mode**
   ```
   Chrome: Ctrl+Shift+N
   Firefox: Ctrl+Shift+P
   ```

### User not in test user list but needs access?

```bash
# Option 1: Add them as test user
Go to OAuth consent screen → Add to test users

# Option 2: They can request access
When they see error → Click "Learn more" → Request access
You'll receive email to approve
```

### Want to remove test users?

```
OAuth consent screen → Test users → Click X next to email
```

## Production Checklist

When ready to go public:

- [ ] Create privacy policy page
- [ ] Create terms of service page
- [ ] Add app logo (120x120px)
- [ ] Record demo video showing Drive integration
- [ ] Fill out verification questionnaire
- [ ] Submit for verification
- [ ] Wait 1-7 days for approval
- [ ] Once approved, change from "Testing" to "Production"

## FAQs

**Q: How many test users can I add?**
A: Up to 100 test users in development/testing mode.

**Q: Do test users need to verify their email?**
A: No, they can use the app immediately after being added.

**Q: Can test users see my app in their connected apps?**
A: Yes, it appears like any other OAuth app.

**Q: How long does verification take?**
A: Typically 1-7 business days, but can take longer.

**Q: Is verification free?**
A: Yes, Google OAuth verification is free!

**Q: What if verification is rejected?**
A: Google will provide feedback. Address issues and resubmit.

## Quick Reference

| Solution     | Setup Time | Users               | Best For                 |
| ------------ | ---------- | ------------------- | ------------------------ |
| Test Users   | 2 min      | Up to 100           | Development, small teams |
| Internal     | 2 min      | All workspace users | Google Workspace orgs    |
| Verification | 1-7 days   | Unlimited           | Production apps          |

## Need More Help?

- [Google OAuth Verification Docs](https://support.google.com/cloud/answer/10311615)
- [OAuth Consent Screen Guide](https://support.google.com/cloud/answer/6158849)
- [Verification FAQs](https://support.google.com/cloud/answer/9110914)

---

**TL;DR**: Add yourself as a test user in Google Cloud Console → OAuth consent screen → Test users → Add your email → Try again!
