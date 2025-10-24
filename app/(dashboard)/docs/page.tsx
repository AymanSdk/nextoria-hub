import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Code2,
  Database,
  Flame,
  Kanban,
  Lightbulb,
  Lock,
  Rocket,
  Shield,
  Users,
  Zap,
  TrendingUp,
  Target,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CodeBlock } from "@/components/docs/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function DocsPage() {
  return (
    <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-3'>
            <BookOpen className='h-10 w-10' />
            <h1 className='text-5xl font-bold tracking-tight'>
              Nextoria Hub Documentation
            </h1>
          </div>
          <p className='mt-2 text-xl text-muted-foreground'>
            Complete technical documentation for your production-ready agency operations
            platform
          </p>
          <div className='flex flex-wrap gap-2 mt-4'>
            <Badge variant='default' className='text-sm'>
              Next.js 16
            </Badge>
            <Badge variant='default' className='text-sm'>
              React 19
            </Badge>
            <Badge variant='default' className='text-sm'>
              TypeScript 5
            </Badge>
            <Badge variant='default' className='text-sm'>
              Tailwind CSS v4
            </Badge>
            <Badge variant='default' className='text-sm'>
              Drizzle ORM
            </Badge>
            <Badge variant='default' className='text-sm'>
              NextAuth v5
            </Badge>
            <Badge variant='default' className='text-sm'>
              Neon Postgres
            </Badge>
            <Badge variant='default' className='text-sm'>
              ShadCN UI
            </Badge>
          </div>
        </div>

        {/* Quick Links */}
        <div className='grid gap-4 md:grid-cols-4 mb-8'>
          <Card className='cursor-pointer hover:bg-accent transition-colors'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Rocket className='h-5 w-5 text-blue-500' />
                Quick Start
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                Get up and running in 5 minutes
              </p>
            </CardContent>
          </Card>
          <Card className='cursor-pointer hover:bg-accent transition-colors'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Code2 className='h-5 w-5 text-green-500' />
                API Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>Explore all API endpoints</p>
            </CardContent>
          </Card>
          <Card className='cursor-pointer hover:bg-accent transition-colors'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Shield className='h-5 w-5 text-purple-500' />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>Authentication & RBAC guide</p>
            </CardContent>
          </Card>
          <Card className='cursor-pointer hover:bg-accent transition-colors'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <TrendingUp className='h-5 w-5 text-orange-500' />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>Tips & recommendations</p>
            </CardContent>
          </Card>
        </div>

        <Separator className='my-8' />

        {/* Installation & Setup */}
        <div className='mb-12'>
          <h2 className='text-3xl font-bold mb-6 flex items-center gap-2'>
            <Rocket className='h-8 w-8' />
            Installation & Setup
          </h2>

          <Alert className='mb-6'>
            <Lightbulb className='h-4 w-4' />
            <AlertTitle>Pro Tip</AlertTitle>
            <AlertDescription>
              This project uses <strong>Bun</strong> for faster package management and
              execution. All commands below use{" "}
              <code className='px-1.5 py-0.5 rounded bg-muted'>bun</code> but you can
              substitute with <code className='px-1.5 py-0.5 rounded bg-muted'>npm</code>{" "}
              or <code className='px-1.5 py-0.5 rounded bg-muted'>pnpm</code> if
              preferred.
            </AlertDescription>
          </Alert>

          <div className='grid gap-6 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Zap className='h-5 w-5' />
                  Prerequisites
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h4 className='font-semibold mb-2'>Required Software</h4>
                  <ul className='space-y-2 text-sm'>
                    <li className='flex items-center gap-2'>
                      <CheckCircle2 className='h-4 w-4 text-green-600' />
                      <span>
                        <strong>Node.js 20+</strong> or <strong>Bun 1.0+</strong>
                      </span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle2 className='h-4 w-4 text-green-600' />
                      <span>
                        <strong>PostgreSQL database</strong> (Neon recommended)
                      </span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle2 className='h-4 w-4 text-green-600' />
                      <span>
                        <strong>S3-compatible storage</strong> (AWS S3, Cloudflare R2)
                      </span>
                    </li>
                    <li className='flex items-center gap-2'>
                      <CheckCircle2 className='h-4 w-4 text-green-600' />
                      <span>Git for version control</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className='font-semibold mb-2'>
                    Install Bun (Optional but Recommended)
                  </h4>
                  <CodeBlock
                    code='curl -fsSL https://bun.sh/install | bash'
                    language='bash'
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Database className='h-5 w-5' />
                  External Services Setup
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h4 className='font-semibold mb-2'>Database (Neon)</h4>
                  <ol className='list-decimal list-inside space-y-1 text-sm text-muted-foreground'>
                    <li>
                      Sign up at{" "}
                      <a
                        href='https://neon.tech'
                        className='text-primary hover:underline'
                      >
                        neon.tech
                      </a>
                    </li>
                    <li>Create a new project</li>
                    <li>Copy the connection string</li>
                  </ol>
                </div>

                <div>
                  <h4 className='font-semibold mb-2'>
                    Storage (Cloudflare R2 or AWS S3)
                  </h4>
                  <ol className='list-decimal list-inside space-y-1 text-sm text-muted-foreground'>
                    <li>Create a storage bucket</li>
                    <li>Generate access credentials</li>
                    <li>Configure CORS for file uploads</li>
                  </ol>
                </div>

                <div>
                  <h4 className='font-semibold mb-2'>OAuth Providers (Optional)</h4>
                  <ul className='list-disc list-inside space-y-1 text-sm text-muted-foreground'>
                    <li>Google Cloud Console for Google OAuth</li>
                    <li>GitHub Settings for GitHub OAuth</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Step-by-Step Installation */}
        <div className='mb-12'>
          <h3 className='text-2xl font-bold mb-4'>Step-by-Step Installation</h3>

          <div className='space-y-6'>
            <div>
              <div className='flex items-center gap-3 mb-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold'>
                  1
                </div>
                <h4 className='text-xl font-semibold'>Clone the Repository</h4>
              </div>
              <CodeBlock
                code={`git clone https://github.com/your-org/nextoria-hub.git
cd nextoria-hub`}
                language='bash'
              />
            </div>

            <div>
              <div className='flex items-center gap-3 mb-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold'>
                  2
                </div>
                <h4 className='text-xl font-semibold'>Install Dependencies</h4>
              </div>
              <CodeBlock code='bun install' language='bash' />
              <Alert className='mt-4'>
                <Flame className='h-4 w-4' />
                <AlertTitle>Performance Tip</AlertTitle>
                <AlertDescription>
                  Bun installs packages <strong>10-25x faster</strong> than npm. If
                  you&rsquo;re using npm, expect installation to take 2-3 minutes.
                </AlertDescription>
              </Alert>
            </div>

            <div>
              <div className='flex items-center gap-3 mb-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold'>
                  3
                </div>
                <h4 className='text-xl font-semibold'>Configure Environment Variables</h4>
              </div>
              <p className='text-sm text-muted-foreground mb-3'>
                Create a <code className='px-1.5 py-0.5 rounded bg-muted'>.env</code> file
                in the root directory:
              </p>
              <CodeBlock code='cp .env.example .env' language='bash' />
              <p className='text-sm text-muted-foreground mt-3 mb-3'>
                Edit <code className='px-1.5 py-0.5 rounded bg-muted'>.env</code> with
                your configuration:
              </p>
              <CodeBlock
                filename='.env'
                language='bash'
                code={`# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://user:pass@host.neon.tech/nextoria_db?sslmode=require"

# ============================================
# NEXTAUTH AUTHENTICATION
# ============================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# ============================================
# OAUTH PROVIDERS (Optional)
# ============================================
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# ============================================
# EMAIL CONFIGURATION
# ============================================
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="Nextoria Hub <noreply@nextoriahub.com>"

# ============================================
# S3 STORAGE (AWS S3 / Cloudflare R2)
# ============================================
S3_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_BUCKET_NAME="nextoria-hub-files"
S3_ACCESS_KEY_ID="your-access-key-id"
S3_SECRET_ACCESS_KEY="your-secret-access-key"
S3_PUBLIC_URL="https://files.yourdomain.com"

# ============================================
# STRIPE PAYMENTS (Optional)
# ============================================
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ============================================
# INTEGRATIONS (Optional)
# ============================================
SLACK_BOT_TOKEN="xoxb-..."
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
GOOGLE_DRIVE_CLIENT_ID="..."
GOOGLE_DRIVE_CLIENT_SECRET="..."
FIGMA_ACCESS_TOKEN="..."`}
              />
              <Alert className='mt-4'>
                <Lightbulb className='h-4 w-4' />
                <AlertTitle>Security Best Practice</AlertTitle>
                <AlertDescription>
                  Generate a strong NEXTAUTH_SECRET using:{" "}
                  <code className='px-1.5 py-0.5 rounded bg-muted'>
                    openssl rand -base64 32
                  </code>
                  <br />
                  Never commit your{" "}
                  <code className='px-1.5 py-0.5 rounded bg-muted'>.env</code> file to
                  version control!
                </AlertDescription>
              </Alert>
            </div>

            <div>
              <div className='flex items-center gap-3 mb-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold'>
                  4
                </div>
                <h4 className='text-xl font-semibold'>Set Up Database</h4>
              </div>
              <p className='text-sm text-muted-foreground mb-3'>
                Push the database schema to your Postgres database:
              </p>
              <CodeBlock code='bun run db:push' language='bash' />
              <p className='text-sm text-muted-foreground mt-3 mb-3'>
                <strong>Optional:</strong> Seed with demo data:
              </p>
              <CodeBlock code='bun run db:seed' language='bash' />
              <Alert className='mt-4'>
                <AlertTriangle className='h-4 w-4' />
                <AlertTitle>Production Warning</AlertTitle>
                <AlertDescription>
                  For production, use{" "}
                  <code className='px-1.5 py-0.5 rounded bg-muted'>db:generate</code> and{" "}
                  <code className='px-1.5 py-0.5 rounded bg-muted'>db:migrate</code>{" "}
                  instead of{" "}
                  <code className='px-1.5 py-0.5 rounded bg-muted'>db:push</code> to
                  maintain migration history.
                </AlertDescription>
              </Alert>
            </div>

            <div>
              <div className='flex items-center gap-3 mb-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold'>
                  5
                </div>
                <h4 className='text-xl font-semibold'>Start Development Server</h4>
              </div>
              <CodeBlock code='bun run dev' language='bash' />
              <p className='text-sm text-muted-foreground mt-3'>
                Open{" "}
                <a href='http://localhost:3000' className='text-primary hover:underline'>
                  http://localhost:3000
                </a>{" "}
                in your browser 🎉
              </p>
            </div>
          </div>
        </div>

        {/* One-Click Setup Script */}
        <div className='mb-12'>
          <h3 className='text-2xl font-bold mb-4 flex items-center gap-2'>
            <Zap className='h-6 w-6' />
            One-Click Setup Script
          </h3>
          <p className='text-muted-foreground mb-4'>
            Copy and paste this script to set up everything automatically:
          </p>
          <CodeBlock
            filename='setup.sh'
            language='bash'
            code={`#!/bin/bash
# Nextoria Hub - Automated Setup Script
set -e

echo "🚀 Nextoria Hub Setup"
echo "===================="

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "📦 Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
fi

# Install dependencies
echo "📚 Installing dependencies..."
bun install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cat > .env << EOL
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
S3_ENDPOINT="https://your-endpoint"
S3_REGION="auto"
S3_BUCKET_NAME="nextoria-files"
S3_ACCESS_KEY_ID="your-key"
S3_SECRET_ACCESS_KEY="your-secret"
EOL
    echo "✅ .env file created! Please update with your actual credentials."
else
    echo "⚠️  .env file already exists, skipping..."
fi

# Push database schema
echo "🗄️  Setting up database..."
bun run db:push

# Seed database (optional)
read -p "Do you want to seed demo data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    bun run db:seed
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "To start the development server:"
echo "  bun run dev"
echo ""
echo "Next steps:"
echo "  1. Visit http://localhost:3000/auth/signup"
echo "  2. Create your account (you'll be the admin)"
echo "  3. Start building your workspace!"
echo ""
echo "🎉 Happy coding!"
`}
          />
        </div>

        <Separator className='my-12' />

        {/* Architecture & Technical Details */}
        <div className='mb-12'>
          <h2 className='text-3xl font-bold mb-6 flex items-center gap-2'>
            <Code2 className='h-8 w-8' />
            Architecture & Technical Deep Dive
          </h2>

          <div className='grid gap-6 lg:grid-cols-2 mb-8'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Database className='h-5 w-5' />
                  Database Schema (20+ Tables)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm'>
                  <li className='font-mono text-xs'>
                    <strong>users</strong> - User accounts with RBAC
                  </li>
                  <li className='font-mono text-xs'>
                    <strong>workspaces</strong> - Multi-tenant workspaces
                  </li>
                  <li className='font-mono text-xs'>
                    <strong>projects</strong> - Project management
                  </li>
                  <li className='font-mono text-xs'>
                    <strong>tasks</strong> - Kanban tasks with metadata
                  </li>
                  <li className='font-mono text-xs'>
                    <strong>comments</strong> - Task/project comments
                  </li>
                  <li className='font-mono text-xs'>
                    <strong>files</strong> - S3 file references
                  </li>
                  <li className='font-mono text-xs'>
                    <strong>invoices</strong> - Billing & payments
                  </li>
                  <li className='font-mono text-xs'>
                    <strong>expenses</strong> - Expense tracking
                  </li>
                  <li className='font-mono text-xs'>
                    <strong>campaigns</strong> - Marketing campaigns
                  </li>
                  <li className='font-mono text-xs'>
                    <strong>content_calendar</strong> - Content planning
                  </li>
                  <li className='font-mono text-xs'>
                    <strong>chat_channels</strong> & <strong>chat_messages</strong>
                  </li>
                  <li className='font-mono text-xs'>
                    <strong>notifications</strong> - In-app alerts
                  </li>
                  <li className='font-mono text-xs'>
                    <strong>integrations</strong> - Third-party services
                  </li>
                  <li className='font-mono text-xs'>
                    <strong>audit_logs</strong> - Activity tracking
                  </li>
                  <li className='font-mono text-xs'>
                    <strong>project_requests</strong> - Client requests
                  </li>
                  <li className='font-mono text-xs'>
                    <strong>approvals</strong> - Approval workflow
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Lock className='h-5 w-5' />
                  Security Features
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <h4 className='font-semibold text-sm mb-2'>Authentication</h4>
                  <ul className='space-y-1 text-sm text-muted-foreground'>
                    <li>• NextAuth v5 with JWT sessions</li>
                    <li>• Bcrypt password hashing (12 rounds)</li>
                    <li>• OAuth: Google & GitHub</li>
                    <li>• Email verification flow</li>
                  </ul>
                </div>
                <div>
                  <h4 className='font-semibold text-sm mb-2'>Authorization</h4>
                  <ul className='space-y-1 text-sm text-muted-foreground'>
                    <li>• 5-tier RBAC system</li>
                    <li>• Middleware-level route protection</li>
                    <li>• API-level permission checks</li>
                    <li>• Row-level security in queries</li>
                  </ul>
                </div>
                <div>
                  <h4 className='font-semibold text-sm mb-2'>Data Protection</h4>
                  <ul className='space-y-1 text-sm text-muted-foreground'>
                    <li>• Presigned S3 URLs (time-limited)</li>
                    <li>• SQL injection prevention (Drizzle ORM)</li>
                    <li>• CSRF protection</li>
                    <li>• Input validation with Zod</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RBAC Implementation */}
          <div className='mb-8'>
            <h3 className='text-xl font-bold mb-4 flex items-center gap-2'>
              <Shield className='h-6 w-6' />
              Role-Based Access Control (RBAC) Implementation
            </h3>
            <Tabs defaultValue='roles' className='w-full'>
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='roles'>Roles</TabsTrigger>
                <TabsTrigger value='permissions'>Permissions</TabsTrigger>
                <TabsTrigger value='middleware'>Middleware</TabsTrigger>
                <TabsTrigger value='usage'>Usage</TabsTrigger>
              </TabsList>

              <TabsContent value='roles' className='space-y-4'>
                <p className='text-sm text-muted-foreground'>
                  5 predefined roles with hierarchical permissions:
                </p>
                <CodeBlock
                  filename='src/lib/constants/roles.ts'
                  language='typescript'
                  showLineNumbers
                  code={`export const ROLES = {
  ADMIN: "ADMIN",        // Level 5 - Full access
  DEVELOPER: "DEVELOPER", // Level 4 - Technical work
  DESIGNER: "DESIGNER",   // Level 3 - Creative work
  MARKETER: "MARKETER",   // Level 3 - Marketing ops
  CLIENT: "CLIENT",       // Level 1 - Limited access
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 5,
  DEVELOPER: 4,
  DESIGNER: 3,
  MARKETER: 3,
  CLIENT: 1,
};

// Check if user has sufficient role level
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}`}
                />
              </TabsContent>

              <TabsContent value='permissions' className='space-y-4'>
                <p className='text-sm text-muted-foreground'>
                  Granular permissions matrix for each role:
                </p>
                <CodeBlock
                  filename='src/lib/auth/rbac.ts'
                  language='typescript'
                  showLineNumbers
                  code={`export const permissions = {
  ADMIN: {
    projects: ["create", "read", "update", "delete"],
    tasks: ["create", "read", "update", "delete"],
    users: ["create", "read", "update", "delete", "manage_roles"],
    invoices: ["create", "read", "update", "delete", "send"],
    expenses: ["create", "read", "update", "approve"],
    // ... full access to all resources
  },
  DEVELOPER: {
    projects: ["create", "read", "update"],
    tasks: ["create", "read", "update", "delete"],
    users: ["read"],
    invoices: ["read"],
    expenses: ["create", "read"],
    // ... focused on technical work
  },
  CLIENT: {
    projects: ["read"],
    tasks: ["read"],
    invoices: ["read"],
    approvals: ["read", "approve", "reject"],
    // ... minimal access
  },
} as const;

// Check specific permission
export function hasPermission(
  role: Role,
  resource: string,
  action: string
): boolean {
  return permissions[role]?.[resource]?.includes(action) ?? false;
}`}
                />
              </TabsContent>

              <TabsContent value='middleware' className='space-y-4'>
                <p className='text-sm text-muted-foreground'>
                  Route protection at the middleware level:
                </p>
                <CodeBlock
                  filename='src/middleware.ts'
                  language='typescript'
                  showLineNumbers
                  code={`import { auth } from "@/src/lib/auth/config";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/auth/signin", "/auth/signup"];
const ADMIN_ROUTES = ["/admin", "/settings/workspace"];

export default auth(async function middleware(req) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Require authentication
  if (!session?.user) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check admin-only routes
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});`}
                />
              </TabsContent>

              <TabsContent value='usage' className='space-y-4'>
                <p className='text-sm text-muted-foreground'>
                  Using RBAC in your application code:
                </p>
                <CodeBlock
                  filename='app/api/projects/route.ts'
                  language='typescript'
                  showLineNumbers
                  code={`import { auth } from "@/src/lib/auth/config";
import { hasPermission } from "@/src/lib/auth/rbac";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check permission to create projects
  if (!hasPermission(session.user.role, "projects", "create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Create project...
  return NextResponse.json({ success: true });
}`}
                />

                <h4 className='font-semibold mt-6 mb-2'>Component-Level Protection</h4>
                <CodeBlock
                  filename='components/project-actions.tsx'
                  language='typescript'
                  showLineNumbers
                  code={`"use client";

import { useSession } from "next-auth/react";
import { hasPermission } from "@/src/lib/auth/rbac";
import { Button } from "@/components/ui/button";

export function ProjectActions() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const canDelete = hasPermission(userRole, "projects", "delete");

  return (
    <div>
      {canDelete && (
        <Button variant="destructive">Delete Project</Button>
      )}
    </div>
  );
}`}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Separator className='my-12' />

        {/* API Routes Documentation */}
        <div className='mb-12'>
          <h2 className='text-3xl font-bold mb-6 flex items-center gap-2'>
            <Zap className='h-8 w-8' />
            API Routes Reference
          </h2>

          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Authentication Endpoints</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='font-mono text-sm space-y-2'>
                  <div className='flex items-center gap-3'>
                    <Badge variant='outline' className='font-mono'>
                      POST
                    </Badge>
                    <code>/api/auth/signin</code>
                    <span className='text-muted-foreground ml-auto'>
                      Sign in with credentials
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Badge variant='outline' className='font-mono'>
                      POST
                    </Badge>
                    <code>/api/auth/signup</code>
                    <span className='text-muted-foreground ml-auto'>
                      Create new account
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Badge variant='outline' className='font-mono'>
                      POST
                    </Badge>
                    <code>/api/auth/signout</code>
                    <span className='text-muted-foreground ml-auto'>
                      Sign out current user
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project & Task Endpoints</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='font-mono text-sm space-y-2'>
                  <div className='flex items-center gap-3'>
                    <Badge className='bg-blue-500 font-mono'>GET</Badge>
                    <code>/api/projects</code>
                    <span className='text-muted-foreground ml-auto'>
                      List all projects
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Badge variant='outline' className='font-mono'>
                      POST
                    </Badge>
                    <code>/api/projects</code>
                    <span className='text-muted-foreground ml-auto'>
                      Create new project
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Badge className='bg-green-500 font-mono'>PUT</Badge>
                    <code>/api/projects/[id]</code>
                    <span className='text-muted-foreground ml-auto'>Update project</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Badge variant='destructive' className='font-mono'>
                      DELETE
                    </Badge>
                    <code>/api/projects/[id]</code>
                    <span className='text-muted-foreground ml-auto'>Delete project</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Badge className='bg-blue-500 font-mono'>GET</Badge>
                    <code>/api/tasks</code>
                    <span className='text-muted-foreground ml-auto'>
                      List tasks (filtered)
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Badge variant='outline' className='font-mono'>
                      POST
                    </Badge>
                    <code>/api/tasks</code>
                    <span className='text-muted-foreground ml-auto'>Create new task</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File Upload Endpoint</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='font-mono text-sm space-y-2 mb-4'>
                  <div className='flex items-center gap-3'>
                    <Badge variant='outline' className='font-mono'>
                      POST
                    </Badge>
                    <code>/api/files/upload</code>
                    <span className='text-muted-foreground ml-auto'>
                      Get presigned S3 URL
                    </span>
                  </div>
                </div>

                <Alert>
                  <Lightbulb className='h-4 w-4' />
                  <AlertTitle>Pro Tip: Direct S3 Uploads</AlertTitle>
                  <AlertDescription>
                    Files are uploaded <strong>directly to S3</strong> using presigned
                    URLs, bypassing your server for better performance and reduced
                    bandwidth costs.
                  </AlertDescription>
                </Alert>

                <CodeBlock
                  filename='File Upload Flow'
                  language='typescript'
                  code={`// 1. Request presigned URL from API
const response = await fetch("/api/files/upload", {
  method: "POST",
  body: JSON.stringify({
    fileName: "document.pdf",
    fileType: "application/pdf",
    fileSize: 1024000,
  }),
});

const { uploadUrl, fileKey } = await response.json();

// 2. Upload directly to S3
await fetch(uploadUrl, {
  method: "PUT",
  body: file,
  headers: { "Content-Type": file.type },
});

// 3. Save file metadata to database
await fetch("/api/files", {
  method: "POST",
  body: JSON.stringify({
    key: fileKey,
    name: file.name,
    size: file.size,
    type: file.type,
  }),
});`}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className='my-12' />

        {/* Pro Tips & Best Practices */}
        <div className='mb-12'>
          <h2 className='text-3xl font-bold mb-6 flex items-center gap-2'>
            <Lightbulb className='h-8 w-8' />
            Pro Tips & Best Practices
          </h2>

          <div className='grid gap-6 md:grid-cols-2'>
            <Card className='border-blue-500/50'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Target className='h-5 w-5 text-blue-500' />
                  Performance Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div>
                  <h4 className='font-semibold mb-1'>
                    1. Use Server Components by Default
                  </h4>
                  <p className='text-muted-foreground'>
                    Only add{" "}
                    <code className='px-1 py-0.5 rounded bg-muted'>
                      &ldquo;use client&rdquo;
                    </code>{" "}
                    when you need interactivity, state, or browser APIs.
                  </p>
                </div>
                <div>
                  <h4 className='font-semibold mb-1'>2. Database Query Optimization</h4>
                  <p className='text-muted-foreground'>
                    Use <code className='px-1 py-0.5 rounded bg-muted'>.with()</code> for
                    eager loading relations and avoid N+1 queries.
                  </p>
                </div>
                <div>
                  <h4 className='font-semibold mb-1'>3. Image Optimization</h4>
                  <p className='text-muted-foreground'>
                    Always use Next.js{" "}
                    <code className='px-1 py-0.5 rounded bg-muted'>Image</code> component
                    for automatic optimization.
                  </p>
                </div>
                <div>
                  <h4 className='font-semibold mb-1'>4. API Response Caching</h4>
                  <p className='text-muted-foreground'>
                    Use React{" "}
                    <code className='px-1 py-0.5 rounded bg-muted'>cache()</code> and
                    Next.js{" "}
                    <code className='px-1 py-0.5 rounded bg-muted'>revalidate</code> for
                    data fetching.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className='border-green-500/50'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Shield className='h-5 w-5 text-green-500' />
                  Security Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div>
                  <h4 className='font-semibold mb-1'>1. Always Validate Input</h4>
                  <p className='text-muted-foreground'>
                    Use Zod schemas for all user input validation, both client and
                    server-side.
                  </p>
                </div>
                <div>
                  <h4 className='font-semibold mb-1'>2. Check Permissions Early</h4>
                  <p className='text-muted-foreground'>
                    Verify user permissions at the start of API routes before any database
                    queries.
                  </p>
                </div>
                <div>
                  <h4 className='font-semibold mb-1'>3. Use Environment Variables</h4>
                  <p className='text-muted-foreground'>
                    Never hardcode secrets. Use{" "}
                    <code className='px-1 py-0.5 rounded bg-muted'>process.env</code> for
                    all sensitive data.
                  </p>
                </div>
                <div>
                  <h4 className='font-semibold mb-1'>4. Sanitize Database Queries</h4>
                  <p className='text-muted-foreground'>
                    Drizzle ORM prevents SQL injection, but always validate user IDs and
                    filters.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className='border-purple-500/50'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Code2 className='h-5 w-5 text-purple-500' />
                  Code Quality
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div>
                  <h4 className='font-semibold mb-1'>1. TypeScript Strict Mode</h4>
                  <p className='text-muted-foreground'>
                    Keep{" "}
                    <code className='px-1 py-0.5 rounded bg-muted'>strict: true</code> in
                    tsconfig.json for maximum type safety.
                  </p>
                </div>
                <div>
                  <h4 className='font-semibold mb-1'>2. Component Composition</h4>
                  <p className='text-muted-foreground'>
                    Break large components into smaller, reusable pieces. Use ShadCN
                    patterns.
                  </p>
                </div>
                <div>
                  <h4 className='font-semibold mb-1'>3. Error Boundaries</h4>
                  <p className='text-muted-foreground'>
                    Implement error boundaries for graceful error handling in production.
                  </p>
                </div>
                <div>
                  <h4 className='font-semibold mb-1'>4. Testing</h4>
                  <p className='text-muted-foreground'>
                    Write tests for critical business logic and API routes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className='border-orange-500/50'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Database className='h-5 w-5 text-orange-500' />
                  Database Management
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div>
                  <h4 className='font-semibold mb-1'>1. Use Migrations in Production</h4>
                  <p className='text-muted-foreground'>
                    Run <code className='px-1 py-0.5 rounded bg-muted'>db:generate</code>{" "}
                    and <code className='px-1 py-0.5 rounded bg-muted'>db:migrate</code>{" "}
                    to track schema changes.
                  </p>
                </div>
                <div>
                  <h4 className='font-semibold mb-1'>2. Index Foreign Keys</h4>
                  <p className='text-muted-foreground'>
                    All foreign keys should have indexes for query performance.
                  </p>
                </div>
                <div>
                  <h4 className='font-semibold mb-1'>3. Connection Pooling</h4>
                  <p className='text-muted-foreground'>
                    Neon handles connection pooling automatically. Use{" "}
                    <code className='px-1 py-0.5 rounded bg-muted'>?sslmode=require</code>
                    .
                  </p>
                </div>
                <div>
                  <h4 className='font-semibold mb-1'>4. Backup Strategy</h4>
                  <p className='text-muted-foreground'>
                    Set up automated backups in your database provider&rsquo;s dashboard.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className='my-12' />

        {/* Future Improvements */}
        <div className='mb-12'>
          <h2 className='text-3xl font-bold mb-6 flex items-center gap-2'>
            <TrendingUp className='h-8 w-8' />
            Roadmap & Future Improvements
          </h2>

          <Alert className='mb-6 border-blue-500'>
            <Rocket className='h-4 w-4' />
            <AlertTitle>What&rsquo;s Next?</AlertTitle>
            <AlertDescription>
              Here are recommended enhancements to take your platform to the next level.
            </AlertDescription>
          </Alert>

          <div className='grid gap-6 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>🚀 High Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-3 text-sm'>
                  <li className='flex gap-3'>
                    <span className='text-muted-foreground'>1.</span>
                    <div>
                      <strong>Real-time WebSocket Integration</strong>
                      <p className='text-muted-foreground mt-1'>
                        Replace polling with WebSockets for chat and live task updates.
                        Consider Pusher or Socket.io.
                      </p>
                    </div>
                  </li>
                  <li className='flex gap-3'>
                    <span className='text-muted-foreground'>2.</span>
                    <div>
                      <strong>Advanced Search with Algolia/Meilisearch</strong>
                      <p className='text-muted-foreground mt-1'>
                        Implement full-text search across projects, tasks, and files for
                        instant results.
                      </p>
                    </div>
                  </li>
                  <li className='flex gap-3'>
                    <span className='text-muted-foreground'>3.</span>
                    <div>
                      <strong>Email Template System</strong>
                      <p className='text-muted-foreground mt-1'>
                        Use React Email for beautiful, responsive email templates.
                      </p>
                    </div>
                  </li>
                  <li className='flex gap-3'>
                    <span className='text-muted-foreground'>4.</span>
                    <div>
                      <strong>Time Tracking Integration</strong>
                      <p className='text-muted-foreground mt-1'>
                        Add time tracking to tasks with start/stop timers and automatic
                        calculations.
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>⭐ Medium Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-3 text-sm'>
                  <li className='flex gap-3'>
                    <span className='text-muted-foreground'>5.</span>
                    <div>
                      <strong>Mobile App (React Native / Expo)</strong>
                      <p className='text-muted-foreground mt-1'>
                        Build native mobile apps for iOS and Android with push
                        notifications.
                      </p>
                    </div>
                  </li>
                  <li className='flex gap-3'>
                    <span className='text-muted-foreground'>6.</span>
                    <div>
                      <strong>Advanced Analytics Dashboard</strong>
                      <p className='text-muted-foreground mt-1'>
                        Add Gantt charts, burndown charts, and velocity tracking.
                      </p>
                    </div>
                  </li>
                  <li className='flex gap-3'>
                    <span className='text-muted-foreground'>7.</span>
                    <div>
                      <strong>AI-Powered Features</strong>
                      <p className='text-muted-foreground mt-1'>
                        Use OpenAI API for task suggestions, automated descriptions, and
                        smart scheduling.
                      </p>
                    </div>
                  </li>
                  <li className='flex gap-3'>
                    <span className='text-muted-foreground'>8.</span>
                    <div>
                      <strong>Zapier/Make.com Integration</strong>
                      <p className='text-muted-foreground mt-1'>
                        Expose webhooks for no-code automation with 1000+ apps.
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>💡 Nice to Have</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-3 text-sm'>
                  <li className='flex gap-3'>
                    <span className='text-muted-foreground'>9.</span>
                    <div>
                      <strong>Multi-language Support (i18n)</strong>
                      <p className='text-muted-foreground mt-1'>
                        Add internationalization with next-intl for global teams.
                      </p>
                    </div>
                  </li>
                  <li className='flex gap-3'>
                    <span className='text-muted-foreground'>10.</span>
                    <div>
                      <strong>White-label / Custom Branding</strong>
                      <p className='text-muted-foreground mt-1'>
                        Allow workspace-level branding with custom logos and colors.
                      </p>
                    </div>
                  </li>
                  <li className='flex gap-3'>
                    <span className='text-muted-foreground'>11.</span>
                    <div>
                      <strong>Calendar View for Tasks</strong>
                      <p className='text-muted-foreground mt-1'>
                        Visualize tasks by due date in a calendar interface.
                      </p>
                    </div>
                  </li>
                  <li className='flex gap-3'>
                    <span className='text-muted-foreground'>12.</span>
                    <div>
                      <strong>Import from Trello/Asana/Jira</strong>
                      <p className='text-muted-foreground mt-1'>
                        Build migration tools to import existing projects.
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>🔧 Technical Improvements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-3 text-sm'>
                  <li className='flex gap-3'>
                    <span className='text-muted-foreground'>13.</span>
                    <div>
                      <strong>End-to-End Test Coverage</strong>
                      <p className='text-muted-foreground mt-1'>
                        Expand Playwright tests to cover all critical user flows.
                      </p>
                    </div>
                  </li>
                  <li className='flex gap-3'>
                    <span className='text-muted-foreground'>14.</span>
                    <div>
                      <strong>Redis Caching Layer</strong>
                      <p className='text-muted-foreground mt-1'>
                        Add Redis for session storage and frequently accessed data.
                      </p>
                    </div>
                  </li>
                  <li className='flex gap-3'>
                    <span className='text-muted-foreground'>15.</span>
                    <div>
                      <strong>Error Tracking (Sentry)</strong>
                      <p className='text-muted-foreground mt-1'>
                        Sentry is already installed! Configure it in production for error
                        monitoring.
                      </p>
                    </div>
                  </li>
                  <li className='flex gap-3'>
                    <span className='text-muted-foreground'>16.</span>
                    <div>
                      <strong>Rate Limiting</strong>
                      <p className='text-muted-foreground mt-1'>
                        Implement rate limiting on API routes with Upstash Redis.
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className='my-12' />

        {/* Common Tasks & Scripts */}
        <div className='mb-12'>
          <h2 className='text-3xl font-bold mb-6 flex items-center gap-2'>
            <Zap className='h-8 w-8' />
            Common Tasks & Useful Scripts
          </h2>

          <div className='grid gap-6 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Development Commands</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h4 className='font-semibold mb-2 flex items-center gap-2'>
                    <Rocket className='h-4 w-4' />
                    Start Development Server
                  </h4>
                  <CodeBlock code='bun run dev' language='bash' />
                </div>

                <div>
                  <h4 className='font-semibold mb-2 flex items-center gap-2'>
                    <Database className='h-4 w-4' />
                    Database Management
                  </h4>
                  <CodeBlock
                    code={`# Push schema changes (development)
bun run db:push

# Generate migrations (production)
bun run db:generate

# Run migrations
bun run db:migrate

# Open Drizzle Studio (visual DB editor)
bun run db:studio

# Seed database with demo data
bun run db:seed`}
                    language='bash'
                  />
                </div>

                <div>
                  <h4 className='font-semibold mb-2 flex items-center gap-2'>
                    <CheckCircle2 className='h-4 w-4' />
                    Quality Checks
                  </h4>
                  <CodeBlock
                    code={`# Run ESLint
bun run lint

# Type check
bun run type-check

# Run unit tests
bun run test

# Run E2E tests
bun run test:e2e`}
                    language='bash'
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Production Deployment</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h4 className='font-semibold mb-2'>Build for Production</h4>
                  <CodeBlock
                    code={`# Build optimized production bundle
bun run build

# Start production server
bun run start`}
                    language='bash'
                  />
                </div>

                <div>
                  <h4 className='font-semibold mb-2'>Deploy to Vercel</h4>
                  <CodeBlock
                    code={`# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod`}
                    language='bash'
                  />
                </div>

                <div>
                  <h4 className='font-semibold mb-2'>Environment Variables</h4>
                  <p className='text-sm text-muted-foreground mb-2'>
                    Add all variables from your{" "}
                    <code className='px-1 py-0.5 rounded bg-muted'>.env</code> file to
                    Vercel:
                  </p>
                  <CodeBlock
                    code={`# Via Vercel CLI
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET

# Or use the Vercel Dashboard:
# Project Settings → Environment Variables`}
                    language='bash'
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className='my-12' />

        {/* Troubleshooting */}
        <div className='mb-12'>
          <h2 className='text-3xl font-bold mb-6 flex items-center gap-2'>
            <AlertTriangle className='h-8 w-8' />
            Troubleshooting Common Issues
          </h2>

          <div className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Database Connection Errors</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Alert>
                  <AlertTriangle className='h-4 w-4' />
                  <AlertTitle>
                    Issue: &ldquo;Unable to connect to database&rdquo;
                  </AlertTitle>
                  <AlertDescription>
                    <ul className='list-disc list-inside mt-2 space-y-1'>
                      <li>
                        Check that{" "}
                        <code className='px-1 py-0.5 rounded bg-muted'>DATABASE_URL</code>{" "}
                        is correct in{" "}
                        <code className='px-1 py-0.5 rounded bg-muted'>.env</code>
                      </li>
                      <li>
                        Ensure{" "}
                        <code className='px-1 py-0.5 rounded bg-muted'>
                          ?sslmode=require
                        </code>{" "}
                        is appended to the connection string
                      </li>
                      <li>Verify your database is running and accessible</li>
                      <li>Check firewall rules allow connections from your IP</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>File Upload Failures</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Alert>
                  <AlertTriangle className='h-4 w-4' />
                  <AlertTitle>
                    Issue: &ldquo;Failed to upload file to S3&rdquo;
                  </AlertTitle>
                  <AlertDescription>
                    <ul className='list-disc list-inside mt-2 space-y-1'>
                      <li>
                        Verify S3 credentials are correct in{" "}
                        <code className='px-1 py-0.5 rounded bg-muted'>.env</code>
                      </li>
                      <li>Check bucket CORS configuration allows uploads</li>
                      <li>Ensure bucket exists and is accessible</li>
                      <li>
                        Verify IAM permissions include{" "}
                        <code className='px-1 py-0.5 rounded bg-muted'>s3:PutObject</code>
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div>
                  <h4 className='font-semibold mb-2'>CORS Configuration for S3/R2:</h4>
                  <CodeBlock
                    filename='cors.json'
                    language='json'
                    code={`[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]`}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Authentication Issues</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Alert>
                  <AlertTriangle className='h-4 w-4' />
                  <AlertTitle>
                    Issue: &ldquo;Session not persisting&rdquo; or &ldquo;Redirecting to
                    login&rdquo;
                  </AlertTitle>
                  <AlertDescription>
                    <ul className='list-disc list-inside mt-2 space-y-1'>
                      <li>
                        Regenerate{" "}
                        <code className='px-1 py-0.5 rounded bg-muted'>
                          NEXTAUTH_SECRET
                        </code>{" "}
                        using:{" "}
                        <code className='px-1 py-0.5 rounded bg-muted'>
                          openssl rand -base64 32
                        </code>
                      </li>
                      <li>
                        Ensure{" "}
                        <code className='px-1 py-0.5 rounded bg-muted'>NEXTAUTH_URL</code>{" "}
                        matches your current domain
                      </li>
                      <li>Check browser allows cookies (required for sessions)</li>
                      <li>Clear browser cookies and try again</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Build Errors</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <Alert>
                  <AlertTriangle className='h-4 w-4' />
                  <AlertTitle>
                    Issue: &ldquo;Type error&rdquo; or &ldquo;Module not found&rdquo;
                  </AlertTitle>
                  <AlertDescription>
                    <ul className='list-disc list-inside mt-2 space-y-1'>
                      <li>
                        Delete <code className='px-1 py-0.5 rounded bg-muted'>.next</code>{" "}
                        folder and rebuild
                      </li>
                      <li>
                        Clear node_modules:{" "}
                        <code className='px-1 py-0.5 rounded bg-muted'>
                          rm -rf node_modules &amp;&amp; bun install
                        </code>
                      </li>
                      <li>
                        Run type check:{" "}
                        <code className='px-1 py-0.5 rounded bg-muted'>
                          bun run type-check
                        </code>
                      </li>
                      <li>Ensure all imports use correct paths</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className='my-12' />

        {/* Footer */}
        <div className='rounded-lg border bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-8 text-center'>
          <h3 className='text-2xl font-bold mb-2'>🎉 You&rsquo;re All Set!</h3>
          <p className='text-muted-foreground mb-4'>
            You now have a complete understanding of Nextoria Hub&rsquo;s architecture and
            capabilities.
          </p>
          <div className='flex flex-wrap justify-center gap-3 mt-6'>
            <Link href='/projects'>
              <Button variant='default'>
                <Kanban className='mr-2 h-4 w-4' />
                Start Managing Projects
              </Button>
            </Link>
            <Link href='/team'>
              <Button variant='outline'>
                <Users className='mr-2 h-4 w-4' />
                Invite Team Members
              </Button>
            </Link>
            <Link href='/settings'>
              <Button variant='outline'>
                <Settings className='mr-2 h-4 w-4' />
                Configure Settings
              </Button>
            </Link>
          </div>
          <p className='text-sm text-muted-foreground mt-6'>
            Last updated: October 22, 2025 • Built with ❤️ by the Nextoria Hub team
          </p>
        </div>
      </div>
    </div>
  );
}
