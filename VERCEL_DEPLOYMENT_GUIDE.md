# 🚀 Vercel Deployment Guide for Nextoria Hub

## ✅ Pre-Deployment Checklist

Your app **IS READY** for Vercel deployment! Here's what you need to configure:

### Required Environment Variables

| Variable                | Description                     | Priority     | Where to Get                                  |
| ----------------------- | ------------------------------- | ------------ | --------------------------------------------- |
| `DATABASE_URL`          | Neon Postgres connection string | **REQUIRED** | [Neon Console](https://console.neon.tech)     |
| `NEXTAUTH_URL`          | Your Vercel app URL             | **REQUIRED** | Auto-set by Vercel or use your domain         |
| `NEXTAUTH_SECRET`       | JWT encryption secret           | **REQUIRED** | Generate: `openssl rand -base64 32`           |
| `LIVEBLOCKS_SECRET_KEY` | Real-time collaboration         | **REQUIRED** | [Liveblocks Dashboard](https://liveblocks.io) |

### Optional Environment Variables (Features will be disabled without these)

| Variable                                    | Feature                      | Where to Get                                             |
| ------------------------------------------- | ---------------------------- | -------------------------------------------------------- |
| `UPLOADTHING_SECRET` + `UPLOADTHING_APP_ID` | File uploads                 | [UploadThing](https://uploadthing.com)                   |
| `S3_*` variables (Alternative)              | AWS S3/Cloudflare R2 storage | AWS/Cloudflare Console                                   |
| `STRIPE_SECRET_KEY`                         | Payment processing           | [Stripe Dashboard](https://dashboard.stripe.com)         |
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | Google Drive integration     | [Google Cloud Console](https://console.cloud.google.com) |

---

## 📝 Step-by-Step Deployment

### 1. **Prepare Your Database** (5 minutes)

```bash
# Make sure you have a Neon Postgres database ready
# Get your connection string from: https://console.neon.tech

# Test your database connection locally first
echo "DATABASE_URL=postgresql://..." >> .env
bun run db:push
```

### 2. **Get Required API Keys** (10 minutes)

#### A. NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output - this is your `NEXTAUTH_SECRET`

#### B. Liveblocks (Required for Chat/Whiteboard/Flowcharts)

1. Go to [Liveblocks](https://liveblocks.io)
2. Create a free account
3. Create a new project
4. Copy your **Secret Key** (starts with `sk_prod_...`)

#### C. UploadThing (Optional but recommended for file uploads)

1. Go to [UploadThing](https://uploadthing.com)
2. Create a free account
3. Create a new app
4. Copy your **Secret** and **App ID**

### 3. **Deploy to Vercel** (3 minutes)

#### Option A: Deploy via Vercel Dashboard (Easiest)

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect Next.js
4. **DO NOT DEPLOY YET** - Add environment variables first

#### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (will prompt for config)
vercel
```

### 4. **Configure Environment Variables in Vercel**

In the Vercel Dashboard → Your Project → Settings → Environment Variables, add:

#### ✅ Required Variables

```
DATABASE_URL=postgresql://username:password@host.neon.tech/neondb?sslmode=require
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-generated-secret-here
LIVEBLOCKS_SECRET_KEY=sk_prod_your-key-here
```

#### 🔧 Optional Variables (add if you want these features)

```
# File uploads (choose one option)
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=your_app_id

# OR use S3/R2
STORAGE_PROVIDER=r2
S3_ENDPOINT=https://your-bucket.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
S3_BUCKET_NAME=your-bucket
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Payments (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 5. **Setup Database Schema** (2 minutes)

After deployment, you need to push your database schema:

#### Option A: From Local Machine (Easiest)

```bash
# Make sure your .env has the production DATABASE_URL
DATABASE_URL="postgresql://prod-url..." bun run db:push
```

#### Option B: From Vercel (Recommended for automation)

Add this to your Vercel project settings:

- Settings → General → Build & Development Settings
- Add this to **Install Command**:

```bash
bun install && bun run db:push
```

**⚠️ WARNING:** This will run on every deployment. For production, consider using migrations instead.

### 6. **Deploy!**

Click "Deploy" in Vercel or run:

```bash
vercel --prod
```

---

## 🎯 Post-Deployment Steps

### 1. **Create Your First User**

Visit: `https://your-app.vercel.app/auth/signup`

### 2. **Verify Features Work**

✅ Authentication - Sign in/out
✅ Dashboard - Create projects
✅ Real-time Chat - If LIVEBLOCKS_SECRET_KEY is set
✅ Whiteboard - If LIVEBLOCKS_SECRET_KEY is set
✅ File Uploads - If UPLOADTHING or S3 variables are set
✅ Flowcharts - If LIVEBLOCKS_SECRET_KEY is set

### 3. **Set Custom Domain (Optional)**

Vercel Dashboard → Your Project → Settings → Domains

---

## 🔧 Important Configuration Notes

### Build Command

Vercel auto-detects: `next build`
**✅ No changes needed**

### Output Directory

Vercel auto-detects: `.next`
**✅ No changes needed**

### Node Version

Using Node 20+ (Vercel default)
**✅ Compatible**

### Framework Preset

Vercel auto-detects: Next.js
**✅ No changes needed**

---

## 🐛 Troubleshooting

### Build Fails with "Cannot find module"

**Solution:** Check your imports use `@/` aliases correctly

### Database Connection Error

**Solution:**

1. Verify `DATABASE_URL` has `?sslmode=require`
2. Check Neon database is active (not paused)
3. Verify IP allowlist in Neon (Vercel uses dynamic IPs - use "Allow all")

### Liveblocks Features Don't Work

**Solution:**

1. Verify `LIVEBLOCKS_SECRET_KEY` is set
2. Check it starts with `sk_prod_` or `sk_dev_`
3. Verify Liveblocks project is active

### File Uploads Fail

**Solution:**

1. If using UploadThing: Verify both `UPLOADTHING_SECRET` and `UPLOADTHING_APP_ID` are set
2. If using S3/R2: Verify all S3\_\* variables are set and bucket has CORS configured

### NextAuth Error: "NEXTAUTH_URL is not set"

**Solution:**
Vercel usually auto-sets this, but you can manually set it to your deployment URL

---

## 📊 Expected Build Output

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (X/X)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    X kB           X kB
├ ○ /auth/signin                         X kB           X kB
├ ○ /dashboard                           X kB           X kB
└ λ /api/*                              (API routes)
```

---

## 🎉 Success Checklist

- [ ] Database URL configured
- [ ] NextAuth secret generated and set
- [ ] Liveblocks key configured (for real-time features)
- [ ] UploadThing or S3 configured (for file uploads)
- [ ] Database schema pushed (`db:push`)
- [ ] Build successful on Vercel
- [ ] App accessible at deployment URL
- [ ] Can sign up and create account
- [ ] Dashboard loads correctly

---

## 💡 Pro Tips

1. **Use Preview Deployments:** Every git push creates a preview URL for testing
2. **Database Branching:** Neon offers database branching - use it for preview deployments
3. **Environment Variables:** Use different variables for preview vs production
4. **Analytics:** Enable Vercel Analytics (Settings → Analytics)
5. **Monitoring:** Consider setting up Sentry for error tracking

---

## 🔗 Useful Links

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Neon Docs](https://neon.tech/docs/introduction)
- [Liveblocks Docs](https://liveblocks.io/docs)

---

## 📞 Need Help?

If you encounter issues:

1. Check Vercel deployment logs: Dashboard → Your Project → Deployments → [Latest] → Logs
2. Check Vercel runtime logs: Dashboard → Your Project → Logs
3. Verify all environment variables are set correctly
4. Test build locally first: `bun run build`

---

**Ready to deploy? Start with Step 1! 🚀**
