# 🔍 Where Are Test Users? (Simple Guide)

## The Problem

You're looking for "Test users" but can't find it on the OAuth consent screen page!

## The Solution

**Test users are HIDDEN inside a wizard. You need to click a button to access them!**

---

## Step-by-Step Visual Guide

### Step 1: Go to OAuth Consent Screen

```
Google Cloud Console
→ ☰ Menu (top left)
→ APIs & Services
→ OAuth consent screen (left sidebar)
```

### Step 2: You'll See This Page

```
┌─────────────────────────────────────────┐
│ OAuth consent screen                    │
│                                         │
│ [EDIT APP]  [PUBLISH APP]  ← Click EDIT APP!
│                                         │
│ App information                         │
│ - App name: Nextoria Hub                │
│ - User type: External                   │
│ - Publishing status: Testing            │
│                                         │
│ Scopes                                  │
│ - 3 scopes selected                     │
│                                         │
└─────────────────────────────────────────┘
```

**❌ DO NOT scroll down looking for "Test users" - it's NOT on this page!**

**✅ Click the "EDIT APP" button instead!**

### Step 3: Click "EDIT APP"

Look for this button near the top of the page:

```
[EDIT APP]  ← CLICK THIS!
```

### Step 4: Wizard Opens (4 Pages)

After clicking "EDIT APP", you'll see a wizard with 4 pages:

```
Page 1: OAuth consent screen
   ↓ (click "Save and Continue")

Page 2: Scopes
   ↓ (click "Save and Continue")

Page 3: Test users ← HERE THEY ARE! ✅
   ↓
   └─ Click "+ ADD USERS"
   └─ Type your email
   └─ Click "Add"

Page 4: Summary
   ↓ (click "Back to Dashboard")
```

### Step 5: On Page 3 - Add Test Users

You'll see this:

```
┌─────────────────────────────────────────┐
│ Test users                              │
│                                         │
│ Add the email addresses of users you   │
│ want to have access during testing     │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ No test users                   │   │
│ └─────────────────────────────────┘   │
│                                         │
│                    [+ ADD USERS] ← Click!│
└─────────────────────────────────────────┘
```

Click **"+ ADD USERS"**

### Step 6: Add Your Email

A popup appears:

```
┌─────────────────────────────────────────┐
│ Add test users                          │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ your-email@gmail.com               │ │ ← Type here
│ └─────────────────────────────────────┘ │
│                                         │
│        [Cancel]         [Add] ← Click!  │
└─────────────────────────────────────────┘
```

1. Type your email
2. Click "Add"

### Step 7: Save

```
┌─────────────────────────────────────────┐
│ Test users (1)                          │
│                                         │
│ ✓ your-email@gmail.com            [X]   │
│                                         │
│              [SAVE AND CONTINUE] ← Click!│
└─────────────────────────────────────────┘
```

Click **"SAVE AND CONTINUE"**

### Step 8: Done!

Click through the summary page and you're done!

---

## Quick Summary

```
1. OAuth consent screen
2. Click "EDIT APP" button
3. Navigate to Page 3 (Test users)
4. Click "+ ADD USERS"
5. Add your email
6. Save
```

## Why Is It Hidden?

Google puts test users inside the OAuth consent screen configuration wizard.

**It's NOT on the main page - you MUST click "EDIT APP" to access it!**

---

## Still Can't Find It?

### Make Sure You're Here:

```
✅ APIs & Services → OAuth consent screen
❌ NOT: APIs & Services → Credentials
❌ NOT: APIs & Services → Library
```

### Look for These Buttons at Top:

```
[EDIT APP]  [PUBLISH APP]  [DELETE APP]
```

If you see these buttons, you're in the right place!

Click **"EDIT APP"** and go to Page 3.

---

## Alternative: Already Have Credentials?

If you already created your OAuth credentials but forgot to add test users:

1. Go back to OAuth consent screen
2. Click "EDIT APP"
3. Click "Save and Continue" on Page 1
4. Click "Save and Continue" on Page 2
5. **Page 3 is Test users** - add your email
6. Click "Save and Continue" to finish

---

## Visual Flowchart

```
Start
  │
  ├─ Google Cloud Console
  │
  ├─ Menu → APIs & Services
  │
  ├─ Click "OAuth consent screen"
  │
  ├─ See main page? ✅
  │
  ├─ Click "EDIT APP" button
  │
  ├─ Wizard opens
  │     │
  │     ├─ Page 1: Skip (Save & Continue)
  │     ├─ Page 2: Skip (Save & Continue)
  │     ├─ Page 3: ADD TEST USERS HERE! ✅
  │     └─ Page 4: Done
  │
  └─ Success! ✅
```

---

## Common Mistakes

### ❌ Mistake 1: Looking on main page

```
OAuth consent screen (main page)
└─ Scrolling down... ← Test users NOT here!
```

### ❌ Mistake 2: Wrong section

```
APIs & Services
├─ Credentials ← NOT here!
├─ OAuth consent screen ← YES, but...
└─ Library ← NOT here!
```

### ✅ Correct Way

```
OAuth consent screen
└─ Click "EDIT APP"
    └─ Go to Page 3
        └─ Add test users ← HERE! ✅
```

---

## Need More Help?

- Full setup guide: `GOOGLE_SETUP_COMPLETE_GUIDE.md`
- Quick fix guide: `FIX_ACCESS_BLOCKED.md`
- OAuth verification: `GOOGLE_OAUTH_VERIFICATION_FIX.md`

---

**Remember: Test users are in the EDIT APP wizard, Page 3!**
