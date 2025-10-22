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

### ✅ Step 4: Setup Database & Seed Data (30 sec)

```bash
# Create all tables
npm run db:push

# Add demo data
npm run db:seed
```

### ✅ Step 5: Start the App (10 sec)

```bash
npm run dev
```

**Open:** [http://localhost:3000](http://localhost:3000)

### ✅ Step 6: Sign In

Use any demo account:

- **Email:** `admin@nextoria.com`
- **Password:** `password123`

---

## 🎉 You're Done!

You should now see:

- ✅ Dashboard with stats
- ✅ Projects page with sample projects
- ✅ Kanban board with tasks
- ✅ Analytics with charts
- ✅ Team chat
- ✅ Invoices

---

## 📝 All Demo Accounts

| Email                  | Password    | Role      |
| ---------------------- | ----------- | --------- |
| admin@nextoria.com     | password123 | Admin     |
| developer@nextoria.com | password123 | Developer |
| designer@nextoria.com  | password123 | Designer  |
| marketer@nextoria.com  | password123 | Marketer  |
| client@example.com     | password123 | Client    |

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
npm run db:seed
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

- Email/password sign in
- User sessions
- Role-based access

✅ **Project Management**

- Projects list
- Kanban boards
- Task management
- Comments

✅ **Analytics**

- Revenue charts
- Task metrics
- Team utilization

✅ **Communication**

- Team chat
- Notifications

✅ **Billing**

- Invoice management
- Client portal

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
