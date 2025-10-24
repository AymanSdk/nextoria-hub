# Nextoria Hub

A modern, production-ready agency operations platform built with Next.js, TypeScript, and cutting-edge technologies.

## 🚀 Quick Start

Get running in 5 minutes:

```bash
# 1. Install dependencies
bun install

# 2. Setup environment
cp .env.example .env
# Add your DATABASE_URL and NEXTAUTH_SECRET

# 3. Setup database
bun run db:push

# 4. Start the app
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) and create your account!

## 📚 Complete Documentation

**All documentation is now available in your running app at:**

👉 **[http://localhost:3000/docs](http://localhost:3000/docs)**

The docs include:

- 📖 **Getting Started** - Quick start, installation, first project
- 🔒 **Security** - Security audit report, fixes, best practices
- 🏗️ **Architecture** - Tech stack, database schema, API routes
- ⚡ **Features** - Projects, tasks, chat, clients, invoicing, files
- 🔐 **Authentication** - Roles, permissions, session management
- 🎨 **UI & Design** - Design system, typography, colors
- 🚀 **Deployment** - Vercel deployment, environment setup

## ✨ Key Features

- **Multi-workspace** - Organize teams into separate workspaces
- **RBAC** - 5 roles (Admin, Developer, Designer, Marketer, Client)
- **Projects & Tasks** - Kanban boards, milestones, dependencies
- **Real-time Chat** - Team communication with file sharing
- **Client Portal** - Dedicated client access with approvals
- **Invoicing** - Create, send, track invoices with Stripe
- **Analytics** - Revenue tracking, project metrics

## 🛠️ Tech Stack

- **Next.js 15** + **TypeScript 5** + **Tailwind CSS v4**
- **Drizzle ORM** + **Neon Postgres**
- **NextAuth v5** + **Bcrypt**
- **ShadCN UI** + **Liveblocks** + **Tiptap**

## 🔐 Security

✅ All critical vulnerabilities fixed (October 2025 audit)

- Workspace isolation enforced
- Authorization checks on all API routes
- SQL injection protection
- Password hashing with Bcrypt

**Security Grade: B+** (was D before fixes)

## 📦 Scripts

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run db:push      # Push database schema
bun run db:studio    # Open Drizzle Studio
bun run lint         # Run linter
```

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Built With

- [Next.js](https://nextjs.org/)
- [ShadCN UI](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [NextAuth](https://next-auth.js.org/)

---

**Need help?** Visit the [comprehensive docs](http://localhost:3000/docs) in your running app.

Built with ❤️ by the Nextoria Hub team
