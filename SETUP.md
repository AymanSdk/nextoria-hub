# Nextoria Hub - Complete Setup Guide

This guide will walk you through setting up Nextoria Hub from scratch. Follow each step carefully.

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 20+** or **Bun** installed ([Download Node.js](https://nodejs.org/))
- ✅ **Git** installed
- ✅ A code editor (VS Code recommended)
- ✅ Terminal/Command Line access

Check your versions:

```bash
node --version  # Should be v20 or higher
npm --version   # Should be 10 or higher
```

---

## 🚀 Step 1: Clone & Install

### 1.1 Navigate to the project directory

```bash
cd /home/aymane-sdk/projects/nextoria-hub
```

### 1.2 Install dependencies

```bash
npm install
# or if using bun
bun install
```

This will install all required packages (~200+ dependencies). Wait for it to complete.

---

## 🗄️ Step 2: Database Setup (Neon Postgres)

### 2.1 Create a Neon Account

1. Go to [Neon.tech](https://neon.tech/)
2. Sign up for a free account (no credit card required)
3. Click **"Create a project"**

### 2.2 Create Your Database

1. **Project name:** `nextoria-hub`
2. **Region:** Choose closest to you (e.g., US East, EU West)
3. **Postgres version:** 16 (default)
4. Click **"Create project"**

### 2.3 Get Your Connection String

1. After project creation, you'll see a connection string
2. Click **"Copy"** next to the connection string
3. It looks like: `postgresql://username:password@host/database?sslmode=require`

**Important:** Save this connection string - you'll need it in the next step!

### Alternative: Local Postgres

If you prefer local development:

```bash
# Install PostgreSQL locally
# macOS
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb nextoria_hub

# Your connection string will be:
# postgresql://localhost/nextoria_hub
```

---

## 🔧 Step 3: Environment Configuration

### 3.1 Create .env file

```bash
cp .env.example .env
```

### 3.2 Edit .env file

Open `.env` in your editor and fill in these values:

#### Database

```env
DATABASE_URL="your-neon-connection-string-from-step-2.3"
```

#### NextAuth (Required)

```env
NEXTAUTH_URL="http://localhost:3000"
# Generate a secret (run this command):
# openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"
```

To generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET`.

#### Email (For now, use these test values)

```env
EMAIL_SERVER_HOST="smtp.ethereal.email"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-test-email"
EMAIL_SERVER_PASSWORD="your-test-password"
EMAIL_FROM="noreply@nextoriahub.com"
```

**Get free test email credentials:**

1. Go to [Ethereal Email](https://ethereal.email/)
2. Click "Create Ethereal Account"
3. Copy the SMTP credentials

#### OAuth (Optional - can skip for now)

```env
# Leave empty for now - we'll set these up later if needed
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

#### S3 Storage (Optional - can skip for now)

```env
# Leave empty for now - file uploads will be disabled
S3_ENDPOINT=""
S3_REGION=""
S3_BUCKET_NAME=""
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
```

#### Stripe (Optional - can skip for now)

```env
# Leave empty for now
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

---

## 🏗️ Step 4: Database Setup

### 4.1 Push Database Schema

This creates all tables in your database:

```bash
npm run db:push
```

You should see output like:

```
✓ Applying schema changes...
✓ Tables created successfully!
```

### 4.2 Verify Tables Were Created

You can verify in Neon dashboard:

1. Go to your Neon project
2. Click "Tables" tab
3. You should see 20+ tables (users, projects, tasks, etc.)

### 4.3 Seed Demo Data

This adds test users and sample data:

```bash
npm run db:seed
```

You should see:

```
🌱 Seeding database...
Creating users...
Creating workspace...
Creating projects...
Creating tasks...
✅ Database seeded successfully!

Demo Accounts:
Admin:      admin@nextoria.com / password123
Developer:  developer@nextoria.com / password123
Designer:   designer@nextoria.com / password123
Marketer:   marketer@nextoria.com / password123
Client:     client@example.com / password123
```

---

## 🎨 Step 5: Run the Application

### 5.1 Start Development Server

```bash
npm run dev
```

You should see:

```
  ▲ Next.js 16.0.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

✓ Ready in 2.5s
```

### 5.2 Open in Browser

1. Open your browser
2. Go to: [http://localhost:3000](http://localhost:3000)
3. You should be redirected to `/auth/signin`

### 5.3 Sign In

Use one of the demo accounts:

**Admin Access:**

- Email: `admin@nextoria.com`
- Password: `password123`

After signing in, you'll see the dashboard! 🎉

---

## ✅ Step 6: Verify Everything Works

### 6.1 Test Navigation

Visit these pages to ensure they load:

- ✅ Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- ✅ Projects: [http://localhost:3000/projects](http://localhost:3000/projects)
- ✅ Analytics: [http://localhost:3000/analytics](http://localhost:3000/analytics)
- ✅ Invoices: [http://localhost:3000/invoices](http://localhost:3000/invoices)
- ✅ Chat: [http://localhost:3000/chat](http://localhost:3000/chat)
- ✅ Notifications: [http://localhost:3000/notifications](http://localhost:3000/notifications)

### 6.2 Test Features

Try these actions:

1. **View Projects:** Go to Projects page
2. **Open Project:** Click "Website Redesign"
3. **View Kanban Board:** See tasks organized by status
4. **Check Analytics:** View charts and metrics
5. **Sign Out:** Click your avatar → Sign Out

---

## 🔐 Step 7: OAuth Setup (Optional)

If you want to enable Google/GitHub sign-in:

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "Nextoria Hub"
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Copy **Client ID** and **Client Secret**
8. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

### GitHub OAuth

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name:** Nextoria Hub
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**
5. Copy **Client ID**
6. Click **Generate a new client secret** → Copy it
7. Add to `.env`:
   ```env
   GITHUB_CLIENT_ID="your-client-id"
   GITHUB_CLIENT_SECRET="your-client-secret"
   ```

**Restart your dev server after adding OAuth credentials.**

---

## 📦 Step 8: S3 Storage Setup (Optional)

For file uploads to work, you need S3 or compatible storage:

### Option A: AWS S3

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **S3**
3. Click **Create bucket**
4. Bucket name: `nextoria-hub-files-[your-name]`
5. Region: Choose closest to you
6. **Block all public access:** YES
7. Create bucket
8. Go to **IAM** → **Users** → **Create user**
9. Attach policy: `AmazonS3FullAccess`
10. Create **Access Key** → Copy credentials
11. Add to `.env`:
    ```env
    S3_ENDPOINT="https://s3.amazonaws.com"
    S3_REGION="us-east-1"  # your region
    S3_BUCKET_NAME="nextoria-hub-files-your-name"
    S3_ACCESS_KEY_ID="your-access-key"
    S3_SECRET_ACCESS_KEY="your-secret-key"
    ```

### Option B: Cloudflare R2 (Free 10GB)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **R2** → **Create bucket**
3. Bucket name: `nextoria-hub-files`
4. Go to **Manage R2 API Tokens** → **Create API Token**
5. Permissions: **Object Read & Write**
6. Copy credentials
7. Add to `.env`:
   ```env
   S3_ENDPOINT="https://[account-id].r2.cloudflarestorage.com"
   S3_REGION="auto"
   S3_BUCKET_NAME="nextoria-hub-files"
   S3_ACCESS_KEY_ID="your-access-key"
   S3_SECRET_ACCESS_KEY="your-secret-key"
   ```

---

## 💳 Step 9: Stripe Setup (Optional)

For payment processing:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create account or sign in
3. Go to **Developers** → **API keys**
4. Copy **Publishable key** and **Secret key** (use test mode)
5. Add to `.env`:
   ```env
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   ```

---

## 🧪 Step 10: Testing

### Run Type Check

```bash
npm run type-check
```

### Run Linter

```bash
npm run lint
```

### Run Tests (when you add them)

```bash
npm run test
```

### Run E2E Tests

```bash
npm run test:e2e
```

---

## 🔥 Common Issues & Solutions

### Issue 1: Database Connection Failed

**Error:** `Failed to connect to database`

**Solution:**

1. Check your `DATABASE_URL` in `.env`
2. Ensure Neon project is active
3. Check your internet connection
4. Verify connection string format

### Issue 2: Port 3000 Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**

```bash
# Kill process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Or use different port:
PORT=3001 npm run dev
```

### Issue 3: NextAuth Error

**Error:** `[next-auth][error][NO_SECRET]`

**Solution:**

1. Ensure `NEXTAUTH_SECRET` is set in `.env`
2. Generate new secret: `openssl rand -base64 32`
3. Restart dev server

### Issue 4: Modules Not Found

**Error:** `Cannot find module '@/...'`

**Solution:**

```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue 5: Database Schema Issues

**Error:** `relation "users" does not exist`

**Solution:**

```bash
# Re-push schema
npm run db:push

# If that fails, reset and re-seed
npm run db:push
npm run db:seed
```

---

## 📱 Step 11: Mobile Testing

To test on your phone:

1. Find your local IP:

   ```bash
   # macOS/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Update `.env`:

   ```env
   NEXTAUTH_URL="http://YOUR-LOCAL-IP:3000"
   ```

3. Restart server

4. On your phone, visit: `http://YOUR-LOCAL-IP:3000`

---

## 🚀 Next Steps

Now that everything is running:

### 1. Customize Your Workspace

- Update workspace name and branding
- Add team members
- Create your first real project

### 2. Configure Integrations

- Set up Slack notifications
- Connect Google Drive
- Add Figma integration

### 3. Explore Features

- Create tasks and move them on Kanban board
- Upload files (if S3 is configured)
- Generate invoices
- View analytics

### 4. Development

- Review code in `src/` and `app/` directories
- Customize components in `components/`
- Modify database schema in `src/db/schema/`
- Add new features!

---

## 📚 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:push          # Push schema changes
npm run db:studio        # Open Drizzle Studio (DB GUI)
npm run db:seed          # Seed demo data

# Testing
npm run lint             # Run ESLint
npm run type-check       # TypeScript check
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests

# Utilities
npm run db:generate      # Generate migrations
```

---

## 🎓 Learning Resources

### Documentation

- `README.md` - Complete feature list
- `DEPLOYMENT.md` - Production deployment guide
- `docs/adr/` - Architecture decisions
- `PROJECT_SUMMARY.md` - Project overview

### Code Structure

- `app/` - Next.js pages and API routes
- `components/` - React components
- `src/db/schema/` - Database tables
- `src/lib/` - Utility functions
- `public/` - Static assets

### Key Files

- `src/lib/auth/config.ts` - NextAuth configuration
- `src/middleware.ts` - Route protection
- `drizzle.config.ts` - Database configuration
- `src/db/schema/index.ts` - All database schemas

---

## 💬 Need Help?

If you encounter issues:

1. Check this SETUP.md file
2. Review error messages carefully
3. Check `.env` configuration
4. Verify database connection
5. Check the console for errors
6. Review `README.md` for features

---

## ✅ Setup Complete!

You now have a fully functional agency operations platform running locally!

**What you can do:**

- ✅ Sign in with demo accounts
- ✅ Manage projects and tasks
- ✅ Use Kanban boards
- ✅ View analytics
- ✅ Create invoices
- ✅ Team chat
- ✅ Client portal

**Next Steps:**

1. Visit [http://localhost:3000/auth/signup](http://localhost:3000/auth/signup)
2. Create your account (you'll be the admin of your workspace)
3. Start inviting team members and managing projects!

**Access the app:** [http://localhost:3000](http://localhost:3000)

Happy building! 🚀

---

**Last Updated:** October 22, 2025
