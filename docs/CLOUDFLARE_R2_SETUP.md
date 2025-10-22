# Cloudflare R2 Setup Guide - 10GB FREE Forever

## Why Cloudflare R2?

✅ **10GB FREE storage** (forever, not trial)
✅ **ZERO bandwidth costs** (unlimited downloads)
✅ **S3-compatible API** (existing code works!)
✅ **No credit card required** to start
✅ **70% cheaper** than AWS S3

Perfect for storing client deliverables, documents, images!

---

## Quick Setup (5 Minutes)

### Step 1: Create Cloudflare Account

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up (email + password)
3. ✅ No credit card needed!

### Step 2: Enable R2

```
Dashboard → R2 Object Storage → Purchase R2
→ Select "Free" plan (10GB)
→ Click "Get Started"
```

### Step 3: Create Bucket

```
R2 Dashboard → Create Bucket
→ Name: nextoria-hub-files
→ Location: Automatic (recommended)
→ Click "Create Bucket"
```

### Step 4: Generate API Token

```
R2 Dashboard → Manage R2 API Tokens
→ Click "Create API Token"
→ Token Name: nextoria-hub-app
→ Permissions:
   ✅ Object Read & Write
   ✅ Admin Read & Write
→ TTL: Forever
→ Click "Create API Token"
```

**Copy these values immediately** (shown only once):

- Access Key ID
- Secret Access Key
- Endpoint (format: `https://[account-id].r2.cloudflarestorage.com`)

### Step 5: Update Your .env File

Add to your `.env`:

```env
# Cloudflare R2 Storage (10GB FREE)
STORAGE_PROVIDER="r2"
S3_ENDPOINT="https://[your-account-id].r2.cloudflarestorage.com"
S3_REGION="auto"
S3_BUCKET_NAME="nextoria-hub-files"
S3_ACCESS_KEY_ID="your-r2-access-key-id"
S3_SECRET_ACCESS_KEY="your-r2-secret-access-key"
```

Replace `[your-account-id]` with your actual account ID from the endpoint.

### Step 6: Test It!

```bash
# Start your dev server
bun run dev

# Visit http://localhost:3000/files
# Try uploading a file!
```

---

## ✅ That's It!

Your app now uses Cloudflare R2:

- ✅ 10GB FREE storage
- ✅ FREE bandwidth (no download fees!)
- ✅ Existing code works (S3-compatible)
- ✅ No code changes needed!

---

## Optional: Custom Domain for R2

Want `https://files.yourdomain.com` instead of R2 URLs?

### Setup Custom Domain:

1. **In Cloudflare R2**:

   ```
   Your Bucket → Settings → Custom Domains
   → Add Domain: files.yourdomain.com
   → Follow DNS instructions
   ```

2. **Update .env**:
   ```env
   R2_PUBLIC_URL="https://files.yourdomain.com"
   ```

Benefits:

- ✅ Branded URLs
- ✅ Better SEO
- ✅ Professional appearance

---

## Monitoring Usage

**Check your R2 usage**:

```
R2 Dashboard → Your Bucket → Metrics
→ See storage used, requests, bandwidth
```

**Free Tier Limits**:

- 10GB storage
- 1 million Class A operations/month (writes)
- 10 million Class B operations/month (reads)
- Unlimited bandwidth ✅

---

## Troubleshooting

### Error: "Access Denied"

✅ **Check**:

- API token has correct permissions
- Bucket name matches `.env`
- Access Key ID and Secret are correct

### Error: "Endpoint not found"

✅ **Check**:

- Endpoint format: `https://[account-id].r2.cloudflarestorage.com`
- Account ID is correct (no brackets)

### Files not uploading?

✅ **Check**:

```bash
# Verify env variables are loaded
console.log(process.env.S3_ENDPOINT)
console.log(process.env.STORAGE_PROVIDER)
```

---

## What You Get FREE

```
Storage: 10GB/month
Operations:
  - Writes: 1 million/month
  - Reads: 10 million/month
Bandwidth: UNLIMITED (FREE egress!)

Typical usage (files only):
- 5,000 PDFs (2MB each)
- 10,000 images (1MB each)
- 20,000 documents (500KB each)

Cost: $0/month ✅
```

---

## Scaling Beyond FREE

If you exceed 10GB:

```
Additional Storage: $0.015/GB/month
Additional Operations: Minimal cost
Bandwidth: Still FREE!

Example:
15GB total = 5GB extra
Cost: $0.08/month (just 8 cents!)
```

Still **70% cheaper** than AWS S3!

---

## Next: Add Google Drive (2TB FREE!)

You mentioned you have 2TB on Google Drive - perfect!

**Hybrid Setup**:

- **R2**: Client deliverables, documents (10GB FREE)
- **Google Drive**: Large files, videos (2TB from your plan)

See `docs/GOOGLE_DRIVE_INTEGRATION.md` for setup.

---

## Support

**Cloudflare R2 Docs**: https://developers.cloudflare.com/r2/
**Dashboard**: https://dash.cloudflare.com/
**Status**: https://www.cloudflarestatus.com/

---

**Status**: ✅ Ready to use!
**Cost**: FREE (10GB included)
**Setup Time**: 5 minutes
