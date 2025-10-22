# Nextoria Hub - Deployment Guide

This guide walks you through deploying Nextoria Hub to production.

## Prerequisites

Before deploying, ensure you have:
- [ ] Neon Postgres database created
- [ ] AWS S3 bucket (or compatible) configured
- [ ] Stripe account set up (test & production keys)
- [ ] Email service configured (SMTP or SendGrid)
- [ ] OAuth apps created (Google, GitHub)
- [ ] Environment variables ready

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest deployment option for Next.js applications.

#### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-org/nextoria-hub.git
git push -u origin main
```

#### 2. Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** .next

#### 3. Add Environment Variables

Add all variables from `.env.example` in Vercel's Environment Variables section:

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret
# ... add all other variables
```

#### 4. Deploy

Click "Deploy" and Vercel will:
- Install dependencies
- Run build
- Deploy to production
- Provide you with a URL

#### 5. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed
4. Update `NEXTAUTH_URL` environment variable

### Option 2: Docker + Cloud Provider

#### 1. Create Dockerfile

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

#### 2. Build and Run

```bash
docker build -t nextoria-hub .
docker run -p 3000:3000 --env-file .env nextoria-hub
```

#### 3. Deploy to Cloud Provider

Choose your provider:
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **DigitalOcean App Platform**
- **Railway**
- **Render**

## Post-Deployment Checklist

### 1. Database Setup

```bash
# Run migrations
npm run db:migrate

# Optional: Seed demo data
npm run db:seed
```

### 2. Verify Environment Variables

Test each integration:
- [ ] Authentication works (email + OAuth)
- [ ] File uploads to S3 work
- [ ] Email notifications send
- [ ] Stripe test payment works

### 3. Security Checklist

- [ ] HTTPS enabled
- [ ] Strong `NEXTAUTH_SECRET` generated
- [ ] CORS configured properly
- [ ] Rate limiting enabled (if applicable)
- [ ] Database backups configured
- [ ] Secrets not in version control

### 4. Monitoring Setup

#### Error Tracking (Sentry)

1. Create Sentry project
2. Add `SENTRY_DSN` to environment variables
3. Initialize in `app/layout.tsx`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

#### Analytics (Optional)

Consider adding:
- Vercel Analytics
- Google Analytics
- PostHog

### 5. Performance Optimization

#### Image Optimization

Configure `next.config.ts`:

```typescript
const config = {
  images: {
    domains: ['your-s3-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
};
```

#### Caching

Enable ISR for static pages:

```typescript
export const revalidate = 3600; // 1 hour
```

## Domain Configuration

### 1. DNS Setup

Point your domain to deployment:

**Vercel:**
```
A     @       76.76.21.21
CNAME www     cname.vercel-dns.com
```

**Other Providers:**
Follow their specific DNS instructions.

### 2. SSL Certificate

- Vercel: Automatic via Let's Encrypt
- Others: Use Cloudflare or manual certificate

## Database Backups

### Neon Postgres

Neon provides automatic backups. Configure:
1. Retention period
2. Backup schedule
3. Point-in-time recovery

### Manual Backup

```bash
pg_dump $DATABASE_URL > backup.sql
```

## Scaling Considerations

### Database

- Enable connection pooling
- Add read replicas for read-heavy operations
- Monitor query performance

### File Storage

- Enable CDN for S3 (CloudFront, Cloudflare)
- Set appropriate cache headers
- Monitor storage costs

### Application

- Use edge functions for auth middleware
- Enable Next.js ISR for static pages
- Configure proper cache headers

## Rollback Plan

### Vercel

1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

### Docker

```bash
docker pull nextoria-hub:previous-tag
docker stop nextoria-hub
docker run -d nextoria-hub:previous-tag
```

## Troubleshooting

### Build Fails

- Check TypeScript errors: `npm run type-check`
- Check environment variables
- Review build logs

### Database Connection Issues

- Verify `DATABASE_URL` format
- Check database is accessible from deployment
- Verify SSL mode if required

### OAuth Not Working

- Check callback URLs match deployment URL
- Verify OAuth app credentials
- Check `NEXTAUTH_URL` is correct

## Support

For issues:
1. Check documentation
2. Review GitHub issues
3. Contact support@nextoriahub.com

---

**Last Updated:** 2025-10-22

