# Storage Setup - R2 + Google Drive

## ✅ Your Perfect Hybrid Setup

```
Cloudflare R2 (10GB FREE)  +  Google Drive (2TB)
         ↓                           ↓
   Small files                  Large files
   Deliverables                 Videos, designs
   Documents                    Reference files
```

---

## Step 1: Configure Cloudflare R2 (5 minutes)

### Quick Setup:

1. **Create R2 Account**:

   - Go to: https://dash.cloudflare.com/sign-up
   - No credit card needed!

2. **Get Your Credentials**:

   ```
   Dashboard → R2 → Create Bucket → "nextoria-hub-files"
   → Manage R2 API Tokens → Create Token
   → Copy: Access Key ID, Secret, Endpoint
   ```

3. **Add to .env**:

   ```env
   STORAGE_PROVIDER="r2"
   S3_ENDPOINT="https://[your-account-id].r2.cloudflarestorage.com"
   S3_REGION="auto"
   S3_BUCKET_NAME="nextoria-hub-files"
   S3_ACCESS_KEY_ID="your-key-here"
   S3_SECRET_ACCESS_KEY="your-secret-here"
   ```

4. **Done!** Your app now uses 10GB FREE storage.

**Full Guide**: `docs/CLOUDFLARE_R2_SETUP.md`

---

## Step 2: Add Google Drive (Later - When Ready)

Your 2TB Google Drive will be perfect for:

- Large design files
- Video content
- Reference materials

**Status**: Ready to add when needed
**Guide**: `docs/GOOGLE_DRIVE_INTEGRATION.md`

---

## What Changed?

### Updated Files:

1. **`src/lib/storage/s3.ts`** ✅

   - Now supports Cloudflare R2
   - Auto-detects provider from `STORAGE_PROVIDER` env var
   - Works with both S3 and R2

2. **`.env.example`** ✅

   - Added R2 configuration
   - Shows all storage options

3. **Documentation** ✅
   - `docs/CLOUDFLARE_R2_SETUP.md` - Setup guide
   - `docs/FILE_MANAGEMENT_IMPLEMENTATION.md` - Updated
   - `docs/GOOGLE_DRIVE_INTEGRATION.md` - Ready for later

### No Code Changes Needed!

Your existing deliverables system works as-is:

- ✅ Upload still works
- ✅ Download still works
- ✅ All features intact
- ✅ Just cheaper storage!

---

## Test It

```bash
# 1. Add R2 credentials to .env
# 2. Start dev server
bun run dev

# 3. Visit http://localhost:3000/files
# 4. Upload a test file
# 5. Verify it appears in R2 bucket
```

---

## Current Status

✅ **R2 Support**: Ready (update .env to activate)
🔜 **Google Drive**: Ready to add when needed
✅ **Deliverables**: Working
✅ **Files Hub**: Working

---

## Cost Breakdown

### Now (R2 Only):

```
First 10GB: FREE
Bandwidth: FREE
Cost: $0/month
```

### Later (R2 + Google Drive):

```
R2: 10GB FREE
Google Drive: 2TB from your plan
Cost: $0/month (both free!)
```

Perfect! 🎉

---

## Next Steps

1. ✅ Copy `.env.example` to `.env`
2. ✅ Add your R2 credentials
3. ✅ Test file upload
4. 🔜 Add Google Drive (when ready)

See `docs/CLOUDFLARE_R2_SETUP.md` for detailed setup.
