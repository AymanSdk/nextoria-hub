# Nextoria Hub

A modern, production-ready agency operations platform built with Next.js, TypeScript, and cutting-edge technologies. Designed for agencies to manage projects, tasks, clients, billing, and team collaboration in one unified platform.

## 🚀 Features

### Core Platform

- **🔐 Authentication & Authorization**

  - Email/password and OAuth (Google, GitHub) via NextAuth
  - Role-Based Access Control (RBAC): Admin, Developer, Designer, Marketer, Client
  - Secure session management with JWT
  - Password reset and email verification flows

- **📊 Project & Task Management**

  - Full-featured project lifecycle management
  - Kanban board with drag-and-drop (5 columns: Backlog, To Do, In Progress, In Review, Done)
  - Task dependencies, subtasks, and milestones
  - Rich task details: assignees, labels, priorities, due dates
  - Comments and activity tracking
  - File attachments

- **👥 Multi-Workspace Support**

  - Organize teams into separate workspaces
  - Workspace-level settings and branding
  - Member management with role assignments
  - Cross-workspace collaboration

- **🎨 Client Portal**

  - Dedicated portal for clients to track project progress
  - View deliverables and approve work
  - Download files and invoices
  - Limited access based on CLIENT role

- **💰 Billing & Invoicing**

  - Create and manage invoices
  - Track payment statuses (Draft, Sent, Paid, Overdue)
  - Line items and tax calculations
  - Stripe integration for online payments
  - PDF invoice generation

- **📈 Analytics & Reporting**

  - Revenue and expense tracking
  - Project status distribution
  - Task throughput metrics
  - Team utilization rates
  - Interactive charts with Recharts

- **💬 Team Communication**

  - Real-time chat channels
  - Direct messages
  - File sharing in chat
  - Notification system with email and in-app alerts

- **🔌 Integrations**

  - Slack notifications
  - Google Drive file access
  - Figma design file linking
  - Webhook support for custom integrations

- **📁 File Management**
  - S3-compatible storage
  - Presigned URLs for secure uploads
  - File versioning
  - Preview and download capabilities

## 🛠️ Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS v4** - Utility-first styling
- **ShadCN UI** - High-quality component library (New York style)
- **Recharts** - Data visualization
- **@dnd-kit** - Drag and drop for Kanban boards
- **React Hook Form + Zod** - Form handling and validation

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **Drizzle ORM** - Type-safe database queries
- **Neon Postgres** - Serverless Postgres database
- **NextAuth v5** - Authentication
- **Bcrypt** - Password hashing

### Storage & External Services

- **AWS S3** - File storage (or S3-compatible)
- **Stripe** - Payment processing
- **Nodemailer** - Email sending
- **Slack API** - Team notifications
- **Google Drive API** - File integration
- **Figma API** - Design file access

### Development & Testing

- **TypeScript 5** - Latest TypeScript features
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Unit testing
- **Playwright** - End-to-end testing
- **Drizzle Kit** - Database migrations

## 📦 Installation

### Prerequisites

- Node.js 20+ or Bun
- PostgreSQL database (Neon recommended)
- S3-compatible storage (AWS S3, Cloudflare R2, etc.)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/nextoria-hub.git
cd nextoria-hub
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Email
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_FROM="noreply@nextoriahub.com"

# S3 Storage
S3_ENDPOINT="https://s3.amazonaws.com"
S3_REGION="us-east-1"
S3_BUCKET_NAME="nextoria-hub-files"
S3_ACCESS_KEY_ID="your-access-key-id"
S3_SECRET_ACCESS_KEY="your-secret-access-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 4. Run database migrations

```bash
npm run db:push
# or generate and run migrations
npm run db:generate
npm run db:migrate
```

### 5. Seed the database (optional)

```bash
npm run db:seed
```

### 6. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 🗄️ Database Schema

The platform uses a comprehensive Postgres schema with the following main entities:

- **users** - User accounts and authentication
- **accounts** - OAuth provider connections
- **sessions** - Active user sessions
- **workspaces** - Organization/workspace containers
- **workspace_members** - User-workspace relationships
- **projects** - Project entities
- **project_members** - Project team assignments
- **tasks** - Task items with full metadata
- **comments** - Comments on tasks/projects
- **files** - File attachments and metadata
- **invoices** - Billing and invoicing
- **notifications** - In-app notifications
- **integrations** - Third-party integrations
- **chat_channels** & **chat_messages** - Internal communication

## 🔑 RBAC (Role-Based Access Control)

The platform implements a comprehensive RBAC system with the following roles:

| Role          | Access Level | Key Permissions                                                     |
| ------------- | ------------ | ------------------------------------------------------------------- |
| **ADMIN**     | Full access  | Manage everything, delete projects, manage workspace settings       |
| **DEVELOPER** | High         | Create/edit projects & tasks, view analytics, manage technical work |
| **DESIGNER**  | Medium       | Create/edit tasks, upload files, view assigned projects             |
| **MARKETER**  | Medium       | Create/edit tasks, view analytics, manage marketing content         |
| **CLIENT**    | Limited      | View assigned projects, approve deliverables, access client portal  |

Roles are enforced at:

- Middleware level (route guards)
- API route level (authorization checks)
- UI component level (conditional rendering)

## 📚 Project Structure

```
nextoria-hub/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Authentication pages
│   ├── api/                 # API routes
│   ├── dashboard/           # Main dashboard
│   ├── projects/            # Project management
│   ├── tasks/               # Task management
│   ├── analytics/           # Analytics & reports
│   ├── invoices/            # Billing & invoicing
│   ├── client/              # Client portal
│   ├── chat/                # Team chat
│   └── notifications/       # Notification center
├── components/              # React components
│   ├── ui/                  # ShadCN UI components
│   ├── layout/              # Layout components
│   ├── tasks/               # Task-related components
│   └── upload/              # File upload components
├── src/
│   ├── db/                  # Database
│   │   ├── schema/          # Drizzle schemas
│   │   └── index.ts         # DB instance
│   └── lib/                 # Utilities & libraries
│       ├── auth/            # Authentication logic
│       ├── api/             # API helper functions
│       ├── constants/       # Role & permission constants
│       ├── integrations/    # Third-party integrations
│       ├── notifications/   # Email notifications
│       └── storage/         # S3 file storage
├── public/                  # Static assets
├── drizzle/                 # Database migrations
└── docs/                    # Documentation & ADRs
```

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
# Run tests headless
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

```bash
npm run build
```

### Docker

```bash
docker build -t nextoria-hub .
docker run -p 3000:3000 nextoria-hub
```

### Environment-specific builds

```bash
# Production build
npm run build

# Type check
npm run type-check
```

## 🔧 Development Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
npm run db:generate      # Generate database migrations
npm run db:migrate       # Run migrations
npm run db:push          # Push schema changes
npm run db:studio        # Open Drizzle Studio
npm run db:seed          # Seed database with sample data
```

## 📖 Documentation

- [Architecture Decision Records (ADRs)](./docs/adr/)
- [API Documentation](./docs/api.md)
- [Database Schema](./docs/schema.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

Built with:

- [Next.js](https://nextjs.org/) by Vercel
- [ShadCN UI](https://ui.shadcn.com/) by shadcn
- [Drizzle ORM](https://orm.drizzle.team/) by Drizzle Team
- [NextAuth.js](https://next-auth.js.org/) by NextAuth
- Design inspiration from [Linear](https://linear.app/)

---

Built with ❤️ by the Nextoria Hub team
