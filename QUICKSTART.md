# Nextoria Hub - Quick Start Checklist

## ⚡ Get Running in 5 Minutes

Follow this checklist to get Nextoria Hub running ASAP:

### ✅ Step 1: Install Dependencies (1 min)

```bash
cd /home/aymane-sdk/projects/nextoria-hub
npm install
```

### ✅ Step 2: Setup Database (2 min)

**Option A: Neon (Recommended - Free)**

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up → Create project → Copy connection string
3. Save for next step

**Option B: Local Postgres**

```bash
# Install & start PostgreSQL
createdb nextoria_hub
# Connection: postgresql://localhost/nextoria_hub
```

### ✅ Step 3: Configure Environment (1 min)

```bash
# Copy template
cp .env.example .env

# Edit .env and add:
# 1. DATABASE_URL from Step 2
# 2. NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
```

**Minimum required in `.env`:**

```env
DATABASE_URL="postgresql://your-neon-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="paste-generated-secret-here"
```

### ✅ Step 4: Setup Database (30 sec)

```bash
# Create all tables
npm run db:push

# Optional: Clear any existing data
npm run db:seed
```

### ✅ Step 5: Start the App (10 sec)

```bash
npm run dev
```

**Open:** [http://localhost:3000](http://localhost:3000)

### ✅ Step 6: Create Your Account

1. Visit [http://localhost:3000/auth/signup](http://localhost:3000/auth/signup)
2. Fill in your name, email, and password
3. Click "Create Account"
4. You'll automatically become the admin of your own workspace

---

## 🎉 You're Done!

You should now see:

- ✅ Your personal workspace dashboard
- ✅ Empty projects page (ready for your first project)
- ✅ Team management to invite members
- ✅ Analytics dashboard
- ✅ Chat channels
- ✅ Invoice management

---

## 🚨 Troubleshooting

### Can't connect to database?

- Check `DATABASE_URL` in `.env`
- Verify Neon project is active
- Test connection in Neon dashboard

### Port 3000 in use?

```bash
# Kill process
lsof -ti:3000 | xargs kill -9
# Or use different port
PORT=3001 npm run dev
```

### Missing tables?

```bash
npm run db:push
```

### NextAuth error?

- Ensure `NEXTAUTH_SECRET` is set in `.env`
- Generate: `openssl rand -base64 32`

---

## 📚 Full Setup Guide

For complete setup with OAuth, S3, Stripe, etc.:
**Read:** `SETUP.md`

---

## 🎯 What's Working?

With this minimal setup you get:

✅ **Authentication**

- Email/password sign up and sign in
- User sessions
- Role-based access
- Multi-workspace support

✅ **Project Management**

- Projects list
- Kanban boards
- Task management
- Comments
- File uploads (with S3)

✅ **Team Management**

- Invite team members
- Manage roles
- Team collaboration

✅ **Analytics**

- Revenue charts
- Task metrics
- Team utilization

✅ **Communication**

- Team chat
- Notifications
- Real-time updates

✅ **Billing**

- Invoice management
- Client portal
- Payment tracking

**Not working yet (optional):**

- ❌ OAuth (Google/GitHub) - needs setup
- ❌ File uploads - needs S3 setup
- ❌ Email sending - using test SMTP
- ❌ Payment processing - needs Stripe

See `SETUP.md` for setting these up!

---

## ⏱️ Time Breakdown

- **Install:** 1 min
- **Database setup:** 2 min
- **Environment config:** 1 min
- **Database migration:** 30 sec
- **Start app:** 10 sec

**Total:** ~5 minutes to running app! 🚀
