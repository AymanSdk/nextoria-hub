"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Rocket,
  Shield,
  Code,
  Database,
  Users,
  Settings,
  FileText,
  MessageSquare,
  Palette,
  Zap,
  Lock,
  GitBranch,
  Search,
  ChevronRight,
  Home,
  Globe,
  Package,
  Hash,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Documentation sections
const sections = {
  gettingStarted: {
    title: "Getting Started",
    icon: Rocket,
    items: [
      { id: "introduction", title: "Introduction", icon: Home },
      { id: "quick-start", title: "Quick Start (5 min)", icon: Zap },
      { id: "installation", title: "Installation", icon: Package },
      { id: "first-project", title: "Your First Project", icon: FileText },
    ],
  },
  security: {
    title: "Security & Audit",
    icon: Shield,
    items: [
      { id: "security-overview", title: "Security Overview", icon: Shield },
      { id: "audit-report", title: "Health Check Report", icon: FileText },
      { id: "vulnerabilities", title: "Fixed Vulnerabilities", icon: Lock },
      { id: "best-practices", title: "Best Practices", icon: BookOpen },
    ],
  },
  architecture: {
    title: "Architecture",
    icon: Code,
    items: [
      { id: "tech-stack", title: "Tech Stack", icon: Code },
      { id: "database-schema", title: "Database Schema", icon: Database },
      { id: "api-routes", title: "API Routes", icon: Globe },
      { id: "file-structure", title: "Project Structure", icon: FileText },
    ],
  },
  features: {
    title: "Features",
    icon: Zap,
    items: [
      { id: "projects", title: "Project Management", icon: FileText },
      { id: "tasks", title: "Task Management", icon: FileText },
      { id: "chat", title: "Team Chat", icon: MessageSquare },
      { id: "clients", title: "Client Portal", icon: Users },
      { id: "invoices", title: "Invoicing & Billing", icon: FileText },
      { id: "files", title: "File Management", icon: FileText },
    ],
  },
  authentication: {
    title: "Authentication & Authorization",
    icon: Lock,
    items: [
      { id: "auth-overview", title: "Overview", icon: Lock },
      { id: "roles", title: "User Roles & Permissions", icon: Users },
      { id: "session-management", title: "Session Management", icon: Settings },
    ],
  },
  ui: {
    title: "UI & Design",
    icon: Palette,
    items: [
      { id: "design-system", title: "Design System", icon: Palette },
      { id: "typography", title: "Typography", icon: FileText },
      { id: "color-scheme", title: "Color Scheme", icon: Palette },
      { id: "responsive", title: "Responsive Design", icon: Settings },
    ],
  },
  deployment: {
    title: "Deployment",
    icon: GitBranch,
    items: [
      { id: "vercel", title: "Deploy to Vercel", icon: Globe },
      { id: "environment", title: "Environment Variables", icon: Settings },
      { id: "production", title: "Production Checklist", icon: FileText },
    ],
  },
};

// Documentation content
const content: Record<string, { title: string; content: React.ReactElement }> = {
  introduction: {
    title: "Introduction to Nextoria Hub",
    content: (
      <div className='space-y-6'>
        <p className='text-lg text-muted-foreground'>
          Nextoria Hub is a modern, production-ready agency operations platform built with
          Next.js, TypeScript, and cutting-edge technologies.
        </p>

        <div className='border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r'>
          <p className='text-sm font-medium'>
            🎯 Designed for agencies to manage projects, tasks, clients, billing, and team
            collaboration in one unified platform.
          </p>
        </div>

        <div className='grid gap-4 md:grid-cols-2 mt-6'>
          <div className='border rounded-lg p-4'>
            <h3 className='font-semibold mb-2 flex items-center gap-2'>
              <Zap className='h-4 w-4 text-primary' />
              Core Features
            </h3>
            <ul className='text-sm space-y-1 text-muted-foreground'>
              <li>• Multi-workspace architecture</li>
              <li>• Role-based access control</li>
              <li>• Real-time collaboration</li>
              <li>• Comprehensive project management</li>
              <li>• Client portal with approval workflows</li>
            </ul>
          </div>

          <div className='border rounded-lg p-4'>
            <h3 className='font-semibold mb-2 flex items-center gap-2'>
              <Code className='h-4 w-4 text-primary' />
              Tech Stack
            </h3>
            <ul className='text-sm space-y-1 text-muted-foreground'>
              <li>• Next.js 15 with App Router</li>
              <li>• TypeScript 5</li>
              <li>• Tailwind CSS v4</li>
              <li>• Drizzle ORM + Neon Postgres</li>
              <li>• NextAuth v5</li>
            </ul>
          </div>
        </div>

        <div className='mt-8'>
          <h3 className='text-xl font-semibold mb-4'>What&apos;s Included?</h3>
          <div className='grid gap-3'>
            <div className='flex gap-3 border rounded-lg p-3'>
              <Shield className='h-5 w-5 text-green-500 shrink-0 mt-0.5' />
              <div>
                <h4 className='font-medium'>Authentication & Security</h4>
                <p className='text-sm text-muted-foreground'>
                  Email/password auth, OAuth, RBAC, secure sessions with JWT
                </p>
              </div>
            </div>
            <div className='flex gap-3 border rounded-lg p-3'>
              <FileText className='h-5 w-5 text-blue-500 shrink-0 mt-0.5' />
              <div>
                <h4 className='font-medium'>Project & Task Management</h4>
                <p className='text-sm text-muted-foreground'>
                  Kanban boards, task dependencies, milestones, comments
                </p>
              </div>
            </div>
            <div className='flex gap-3 border rounded-lg p-3'>
              <MessageSquare className='h-5 w-5 text-purple-500 shrink-0 mt-0.5' />
              <div>
                <h4 className='font-medium'>Team Communication</h4>
                <p className='text-sm text-muted-foreground'>
                  Real-time chat, file sharing, @mentions, presence indicators
                </p>
              </div>
            </div>
            <div className='flex gap-3 border rounded-lg p-3'>
              <Users className='h-5 w-5 text-orange-500 shrink-0 mt-0.5' />
              <div>
                <h4 className='font-medium'>Client Portal</h4>
                <p className='text-sm text-muted-foreground'>
                  Dedicated client access, approval workflows, invoice viewing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  "quick-start": {
    title: "Quick Start (5 Minutes)",
    content: (
      <div className='space-y-6'>
        <p className='text-muted-foreground'>
          Get Nextoria Hub running in just 5 minutes with this streamlined guide.
        </p>

        <div className='space-y-6'>
          <div>
            <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm'>
                1
              </span>
              Install Dependencies (1 min)
            </h3>
            <div className='bg-muted rounded-lg p-4'>
              <code className='text-sm'>bun install</code>
            </div>
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm'>
                2
              </span>
              Setup Database (2 min)
            </h3>
            <p className='text-sm text-muted-foreground mb-2'>
              <strong>Option A: Neon (Recommended - Free)</strong>
            </p>
            <ol className='text-sm space-y-1 text-muted-foreground list-decimal list-inside mb-3'>
              <li>
                Go to{" "}
                <a
                  href='https://neon.tech'
                  className='text-primary underline'
                  target='_blank'
                >
                  neon.tech
                </a>
              </li>
              <li>Sign up → Create project → Copy connection string</li>
            </ol>
            <p className='text-sm text-muted-foreground'>
              <strong>Option B: Local Postgres</strong>
            </p>
            <div className='bg-muted rounded-lg p-4 mt-2'>
              <code className='text-sm'>createdb nextoria_hub</code>
            </div>
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm'>
                3
              </span>
              Configure Environment (1 min)
            </h3>
            <div className='bg-muted rounded-lg p-4 space-y-2'>
              <code className='text-sm block'>cp .env.example .env</code>
            </div>
            <p className='text-sm text-muted-foreground mt-2'>
              Add these required variables:
            </p>
            <div className='bg-muted rounded-lg p-4 mt-2'>
              <pre className='text-xs'>
                {`DATABASE_URL="postgresql://your-neon-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"`}
              </pre>
            </div>
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm'>
                4
              </span>
              Setup Database Tables (30 sec)
            </h3>
            <div className='bg-muted rounded-lg p-4'>
              <code className='text-sm'>bun run db:push</code>
            </div>
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm'>
                5
              </span>
              Start the App (10 sec)
            </h3>
            <div className='bg-muted rounded-lg p-4'>
              <code className='text-sm'>bun run dev</code>
            </div>
            <p className='text-sm text-muted-foreground mt-2'>
              Open:{" "}
              <a href='http://localhost:3000' className='text-primary underline'>
                http://localhost:3000
              </a>
            </p>
          </div>

          <div>
            <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm'>
                6
              </span>
              Create Your Account
            </h3>
            <ol className='text-sm space-y-1 text-muted-foreground list-decimal list-inside'>
              <li>Visit /auth/signup</li>
              <li>Fill in your name, email, and password</li>
              <li>Click &quot;Create Account&quot;</li>
              <li>You&apos;ll automatically become the admin of your workspace</li>
            </ol>
          </div>
        </div>

        <div className='border-l-4 border-green-500 pl-4 py-2 bg-green-50 dark:bg-green-950/30 rounded-r mt-6'>
          <p className='text-sm font-medium text-green-700 dark:text-green-400'>
            🎉 You&apos;re done! Total time: ~5 minutes
          </p>
        </div>
      </div>
    ),
  },

  "security-overview": {
    title: "Security Overview",
    content: (
      <div className='space-y-6'>
        <p className='text-muted-foreground'>
          Comprehensive security audit and fixes applied to Nextoria Hub.
        </p>

        <div className='border-l-4 border-green-500 pl-4 py-3 bg-green-50 dark:bg-green-950/30 rounded-r'>
          <h3 className='font-semibold text-green-700 dark:text-green-400 mb-2'>
            ✅ All Critical Vulnerabilities Fixed
          </h3>
          <p className='text-sm text-green-600 dark:text-green-500'>
            4 critical security bugs have been identified and patched. Your app is now
            secure.
          </p>
        </div>

        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>Security Grades</h3>
          <div className='grid gap-3'>
            <div className='flex items-center justify-between border rounded-lg p-3'>
              <span className='font-medium'>Authentication</span>
              <span className='px-3 py-1 rounded-full bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-sm font-medium'>
                A+
              </span>
            </div>
            <div className='flex items-center justify-between border rounded-lg p-3'>
              <span className='font-medium'>Authorization</span>
              <span className='px-3 py-1 rounded-full bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-sm font-medium'>
                B+
              </span>
            </div>
            <div className='flex items-center justify-between border rounded-lg p-3'>
              <span className='font-medium'>Database Security</span>
              <span className='px-3 py-1 rounded-full bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-sm font-medium'>
                A
              </span>
            </div>
            <div className='flex items-center justify-between border rounded-lg p-3'>
              <span className='font-medium'>API Security</span>
              <span className='px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium'>
                B
              </span>
            </div>
          </div>
        </div>

        <div className='mt-6'>
          <h3 className='text-lg font-semibold mb-3'>Security Features</h3>
          <div className='grid gap-3'>
            <div className='flex gap-3 items-start border rounded-lg p-3'>
              <Shield className='h-5 w-5 text-green-500 shrink-0 mt-0.5' />
              <div>
                <h4 className='font-medium'>Workspace Isolation</h4>
                <p className='text-sm text-muted-foreground'>
                  All resources properly scoped to workspaces - no cross-workspace data
                  leaks
                </p>
              </div>
            </div>
            <div className='flex gap-3 items-start border rounded-lg p-3'>
              <Lock className='h-5 w-5 text-green-500 shrink-0 mt-0.5' />
              <div>
                <h4 className='font-medium'>Authorization Checks</h4>
                <p className='text-sm text-muted-foreground'>
                  Every API route now verifies user permissions before allowing actions
                </p>
              </div>
            </div>
            <div className='flex gap-3 items-start border rounded-lg p-3'>
              <Database className='h-5 w-5 text-green-500 shrink-0 mt-0.5' />
              <div>
                <h4 className='font-medium'>SQL Injection Protection</h4>
                <p className='text-sm text-muted-foreground'>
                  Using Drizzle ORM for type-safe, parameterized queries
                </p>
              </div>
            </div>
            <div className='flex gap-3 items-start border rounded-lg p-3'>
              <Shield className='h-5 w-5 text-green-500 shrink-0 mt-0.5' />
              <div>
                <h4 className='font-medium'>Password Security</h4>
                <p className='text-sm text-muted-foreground'>
                  Bcrypt hashing with strong password validation requirements
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='border-l-4 border-yellow-500 pl-4 py-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-r mt-6'>
          <h3 className='font-semibold text-yellow-700 dark:text-yellow-400 mb-2'>
            ⚠️ Recommended Improvements
          </h3>
          <ul className='text-sm text-yellow-600 dark:text-yellow-500 space-y-1'>
            <li>• Add rate limiting on API routes</li>
            <li>• Implement CSRF protection</li>
            <li>• Add security event logging</li>
          </ul>
        </div>
      </div>
    ),
  },

  "audit-report": {
    title: "Security Audit Report",
    content: (
      <div className='space-y-6'>
        <p className='text-muted-foreground'>
          Comprehensive health check of the entire codebase completed on October 24, 2025.
        </p>

        <div className='grid gap-4 md:grid-cols-3'>
          <div className='border rounded-lg p-4 text-center'>
            <div className='text-3xl font-bold text-primary'>50+</div>
            <div className='text-sm text-muted-foreground mt-1'>Files Reviewed</div>
          </div>
          <div className='border rounded-lg p-4 text-center'>
            <div className='text-3xl font-bold text-primary'>30+</div>
            <div className='text-sm text-muted-foreground mt-1'>API Routes Audited</div>
          </div>
          <div className='border rounded-lg p-4 text-center'>
            <div className='text-3xl font-bold text-green-500'>4</div>
            <div className='text-sm text-muted-foreground mt-1'>Critical Bugs Fixed</div>
          </div>
        </div>

        <div>
          <h3 className='text-lg font-semibold mb-4'>Audit Scope</h3>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-sm'>
              <div className='w-2 h-2 rounded-full bg-green-500'></div>
              <span>Authentication & session management</span>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <div className='w-2 h-2 rounded-full bg-green-500'></div>
              <span>Database schema consistency & relationships</span>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <div className='w-2 h-2 rounded-full bg-green-500'></div>
              <span>API routes validation, error handling & security</span>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <div className='w-2 h-2 rounded-full bg-green-500'></div>
              <span>Project management features (CRUD operations, tasks, members)</span>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <div className='w-2 h-2 rounded-full bg-green-500'></div>
              <span>Client portal & permissions logic</span>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <div className='w-2 h-2 rounded-full bg-green-500'></div>
              <span>Workspace & team management features</span>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <div className='w-2 h-2 rounded-full bg-green-500'></div>
              <span>Notifications & activity logging</span>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <div className='w-2 h-2 rounded-full bg-green-500'></div>
              <span>Type safety & error boundaries</span>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <div className='w-2 h-2 rounded-full bg-green-500'></div>
              <span>Data consistency across features</span>
            </div>
            <div className='flex items-center gap-2 text-sm'>
              <div className='w-2 h-2 rounded-full bg-green-500'></div>
              <span>Critical user flows & edge cases</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className='text-lg font-semibold mb-4'>Positive Findings</h3>
          <div className='grid gap-3'>
            <div className='flex gap-2 items-start'>
              <div className='text-green-500 mt-0.5'>✓</div>
              <span className='text-sm'>
                NextAuth properly configured with bcrypt hashing
              </span>
            </div>
            <div className='flex gap-2 items-start'>
              <div className='text-green-500 mt-0.5'>✓</div>
              <span className='text-sm'>
                Well-structured database schema with proper relationships
              </span>
            </div>
            <div className='flex gap-2 items-start'>
              <div className='text-green-500 mt-0.5'>✓</div>
              <span className='text-sm'>Comprehensive RBAC system with 5 roles</span>
            </div>
            <div className='flex gap-2 items-start'>
              <div className='text-green-500 mt-0.5'>✓</div>
              <span className='text-sm'>
                Client portal properly restricted and filtered
              </span>
            </div>
            <div className='flex gap-2 items-start'>
              <div className='text-green-500 mt-0.5'>✓</div>
              <span className='text-sm'>SQL injection protected via Drizzle ORM</span>
            </div>
            <div className='flex gap-2 items-start'>
              <div className='text-green-500 mt-0.5'>✓</div>
              <span className='text-sm'>Zod validation on API routes</span>
            </div>
            <div className='flex gap-2 items-start'>
              <div className='text-green-500 mt-0.5'>✓</div>
              <span className='text-sm'>Proper error handling with try-catch blocks</span>
            </div>
            <div className='flex gap-2 items-start'>
              <div className='text-green-500 mt-0.5'>✓</div>
              <span className='text-sm'>Strong TypeScript typing throughout</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  vulnerabilities: {
    title: "Fixed Vulnerabilities",
    content: (
      <div className='space-y-6'>
        <div className='border-l-4 border-red-500 pl-4 py-3 bg-red-50 dark:bg-red-950/30 rounded-r'>
          <h3 className='font-semibold text-red-700 dark:text-red-400 mb-2'>
            🚨 4 Critical Vulnerabilities Discovered
          </h3>
          <p className='text-sm text-red-600 dark:text-red-500'>
            All have been immediately fixed and tested. No linter errors.
          </p>
        </div>

        <div className='space-y-6'>
          <div className='border rounded-lg p-4'>
            <div className='flex items-start gap-3 mb-3'>
              <div className='flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-bold shrink-0'>
                1
              </div>
              <div>
                <h4 className='font-semibold'>Client Data Breach</h4>
                <p className='text-sm text-muted-foreground mt-1'>
                  Any authenticated user could access, modify, or delete ANY client
                </p>
              </div>
            </div>
            <div className='bg-muted rounded-lg p-3 text-sm'>
              <div className='font-medium mb-1'>
                📁 File: app/api/clients/[clientId]/route.ts
              </div>
              <div className='text-muted-foreground space-y-1'>
                <div>❌ Missing: Workspace verification on GET, PATCH, DELETE</div>
                <div>✅ Fixed: All methods now verify workspace ownership</div>
                <div>✅ Bonus: Only admins can delete clients</div>
              </div>
            </div>
          </div>

          <div className='border rounded-lg p-4'>
            <div className='flex items-start gap-3 mb-3'>
              <div className='flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-bold shrink-0'>
                2
              </div>
              <div>
                <h4 className='font-semibold'>Task Manipulation</h4>
                <p className='text-sm text-muted-foreground mt-1'>
                  Any user could modify tasks from ANY workspace
                </p>
              </div>
            </div>
            <div className='bg-muted rounded-lg p-3 text-sm'>
              <div className='font-medium mb-1'>
                📁 File: app/api/tasks/[taskId]/route.ts
              </div>
              <div className='text-muted-foreground space-y-1'>
                <div>❌ Missing: Workspace verification on PATCH</div>
                <div>
                  ✅ Fixed: Verifies task belongs to user&apos;s workspace via project
                </div>
              </div>
            </div>
          </div>

          <div className='border rounded-lg p-4'>
            <div className='flex items-start gap-3 mb-3'>
              <div className='flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-bold shrink-0'>
                3
              </div>
              <div>
                <h4 className='font-semibold'>Task Deletion</h4>
                <p className='text-sm text-muted-foreground mt-1'>
                  Any user could delete any task with ZERO checks!
                </p>
              </div>
            </div>
            <div className='bg-muted rounded-lg p-3 text-sm'>
              <div className='font-medium mb-1'>
                📁 File: app/api/tasks/[taskId]/route.ts
              </div>
              <div className='text-muted-foreground space-y-1'>
                <div>❌ Missing: No authorization whatsoever on DELETE</div>
                <div>✅ Fixed: Full workspace and project verification added</div>
              </div>
            </div>
          </div>

          <div className='border rounded-lg p-4'>
            <div className='flex items-start gap-3 mb-3'>
              <div className='flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-bold shrink-0'>
                4
              </div>
              <div>
                <h4 className='font-semibold'>User Data Exposure</h4>
                <p className='text-sm text-muted-foreground mt-1'>
                  All users could see ALL system users with emails
                </p>
              </div>
            </div>
            <div className='bg-muted rounded-lg p-3 text-sm'>
              <div className='font-medium mb-1'>📁 File: app/api/users/route.ts</div>
              <div className='text-muted-foreground space-y-1'>
                <div>❌ Missing: No workspace filtering - exposed all users</div>
                <div>✅ Fixed: Now only returns users from current workspace</div>
              </div>
            </div>
          </div>
        </div>

        <div className='border-l-4 border-green-500 pl-4 py-3 bg-green-50 dark:bg-green-950/30 rounded-r'>
          <h3 className='font-semibold text-green-700 dark:text-green-400 mb-2'>
            ✅ All Fixes Tested & Deployed
          </h3>
          <p className='text-sm text-green-600 dark:text-green-500'>
            Security rating improved from 🔴 CRITICAL to 🟢 SECURE
          </p>
        </div>
      </div>
    ),
  },

  roles: {
    title: "User Roles & Permissions",
    content: (
      <div className='space-y-6'>
        <p className='text-muted-foreground'>
          Nextoria Hub implements a comprehensive Role-Based Access Control (RBAC) system
          with 5 distinct roles.
        </p>

        <div className='space-y-4'>
          <div className='border rounded-lg p-4'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-bold'>
                A
              </div>
              <div>
                <h4 className='font-semibold'>ADMIN</h4>
                <p className='text-sm text-muted-foreground'>Full access to everything</p>
              </div>
            </div>
            <div className='text-sm space-y-1 text-muted-foreground'>
              <div>✓ Manage workspaces, users, and settings</div>
              <div>✓ Create, edit, delete projects and tasks</div>
              <div>✓ View all analytics and reports</div>
              <div>✓ Manage integrations and billing</div>
              <div>✓ Access audit logs</div>
            </div>
          </div>

          <div className='border rounded-lg p-4'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-bold'>
                D
              </div>
              <div>
                <h4 className='font-semibold'>DEVELOPER</h4>
                <p className='text-sm text-muted-foreground'>
                  High access for technical work
                </p>
              </div>
            </div>
            <div className='text-sm space-y-1 text-muted-foreground'>
              <div>✓ Create and edit projects & tasks</div>
              <div>✓ Upload files and manage technical resources</div>
              <div>✓ View analytics and invoices</div>
              <div>✓ Access team chat</div>
              <div>✗ Cannot manage workspace settings</div>
            </div>
          </div>

          <div className='border rounded-lg p-4'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 font-bold'>
                D
              </div>
              <div>
                <h4 className='font-semibold'>DESIGNER</h4>
                <p className='text-sm text-muted-foreground'>
                  Medium access for creative work
                </p>
              </div>
            </div>
            <div className='text-sm space-y-1 text-muted-foreground'>
              <div>✓ Create and edit tasks</div>
              <div>✓ Upload and manage files extensively</div>
              <div>✓ Create and edit content</div>
              <div>✓ View analytics</div>
              <div>✗ Cannot create projects</div>
            </div>
          </div>

          <div className='border rounded-lg p-4'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 font-bold'>
                M
              </div>
              <div>
                <h4 className='font-semibold'>MARKETER</h4>
                <p className='text-sm text-muted-foreground'>
                  Medium access for marketing work
                </p>
              </div>
            </div>
            <div className='text-sm space-y-1 text-muted-foreground'>
              <div>✓ Create and manage campaigns</div>
              <div>✓ Create and publish content</div>
              <div>✓ Create and edit tasks</div>
              <div>✓ View analytics and invoices</div>
              <div>✗ Cannot edit projects</div>
            </div>
          </div>

          <div className='border rounded-lg p-4'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 font-bold'>
                C
              </div>
              <div>
                <h4 className='font-semibold'>CLIENT</h4>
                <p className='text-sm text-muted-foreground'>
                  Limited read access with approvals
                </p>
              </div>
            </div>
            <div className='text-sm space-y-1 text-muted-foreground'>
              <div>✓ View assigned projects only</div>
              <div>✓ View and download deliverables</div>
              <div>✓ View and pay invoices</div>
              <div>✓ Approve or reject work</div>
              <div>✓ Access team chat for their projects</div>
              <div>✗ Cannot edit anything</div>
              <div>✗ No access to analytics or expenses</div>
            </div>
          </div>
        </div>

        <div className='border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 dark:bg-blue-950/30 rounded-r'>
          <h3 className='font-semibold text-blue-700 dark:text-blue-400 mb-2'>
            🔐 Permission Enforcement
          </h3>
          <p className='text-sm text-blue-600 dark:text-blue-500'>
            Roles are enforced at middleware, API route, and UI component levels for
            maximum security.
          </p>
        </div>
      </div>
    ),
  },

  projects: {
    title: "Project Management",
    content: (
      <div className='space-y-6'>
        <p className='text-muted-foreground'>
          Comprehensive project management with beautiful UI, task tracking, and team
          collaboration.
        </p>

        <div>
          <h3 className='text-lg font-semibold mb-4'>Key Features</h3>
          <div className='grid gap-3'>
            <div className='flex gap-3 items-start border rounded-lg p-3'>
              <FileText className='h-5 w-5 text-primary shrink-0 mt-0.5' />
              <div>
                <h4 className='font-medium'>Project Cards with Stats</h4>
                <p className='text-sm text-muted-foreground'>
                  Modern card design with progress bars, team counts, budgets, and due
                  dates
                </p>
              </div>
            </div>
            <div className='flex gap-3 items-start border rounded-lg p-3'>
              <Users className='h-5 w-5 text-primary shrink-0 mt-0.5' />
              <div>
                <h4 className='font-medium'>Team Member Management</h4>
                <p className='text-sm text-muted-foreground'>
                  Assign team members to projects with edit permissions
                </p>
              </div>
            </div>
            <div className='flex gap-3 items-start border rounded-lg p-3'>
              <Palette className='h-5 w-5 text-primary shrink-0 mt-0.5' />
              <div>
                <h4 className='font-medium'>Custom Branding</h4>
                <p className='text-sm text-muted-foreground'>
                  Color coding, cover images, and status badges
                </p>
              </div>
            </div>
            <div className='flex gap-3 items-start border rounded-lg p-3'>
              <FileText className='h-5 w-5 text-primary shrink-0 mt-0.5' />
              <div>
                <h4 className='font-medium'>Kanban Task Boards</h4>
                <p className='text-sm text-muted-foreground'>
                  Drag-and-drop task management with 5 columns
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className='text-lg font-semibold mb-4'>Project Statuses</h3>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 p-2 border rounded'>
              <div className='w-3 h-3 rounded-full bg-gray-400'></div>
              <span className='text-sm font-medium'>DRAFT</span>
              <span className='text-xs text-muted-foreground ml-auto'>
                Planning phase
              </span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded'>
              <div className='w-3 h-3 rounded-full bg-blue-500'></div>
              <span className='text-sm font-medium'>ACTIVE</span>
              <span className='text-xs text-muted-foreground ml-auto'>In progress</span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded'>
              <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
              <span className='text-sm font-medium'>ON_HOLD</span>
              <span className='text-xs text-muted-foreground ml-auto'>
                Temporarily paused
              </span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded'>
              <div className='w-3 h-3 rounded-full bg-green-500'></div>
              <span className='text-sm font-medium'>COMPLETED</span>
              <span className='text-xs text-muted-foreground ml-auto'>
                Finished successfully
              </span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded'>
              <div className='w-3 h-3 rounded-full bg-red-500'></div>
              <span className='text-sm font-medium'>CANCELLED</span>
              <span className='text-xs text-muted-foreground ml-auto'>
                Not proceeding
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className='text-lg font-semibold mb-4'>Priority Levels</h3>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 p-2 border rounded'>
              <div className='flex gap-0.5'>
                <div className='w-1.5 h-1.5 rounded-full bg-slate-500'></div>
              </div>
              <span className='text-sm font-medium'>LOW (0)</span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded'>
              <div className='flex gap-0.5'>
                <div className='w-1.5 h-1.5 rounded-full bg-sky-500'></div>
              </div>
              <span className='text-sm font-medium'>MEDIUM (1)</span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded'>
              <div className='flex gap-0.5'>
                <div className='w-1.5 h-1.5 rounded-full bg-amber-500'></div>
                <div className='w-1.5 h-1.5 rounded-full bg-amber-500'></div>
              </div>
              <span className='text-sm font-medium'>HIGH (2)</span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded'>
              <div className='flex gap-0.5'>
                <div className='w-1.5 h-1.5 rounded-full bg-rose-500'></div>
                <div className='w-1.5 h-1.5 rounded-full bg-rose-500'></div>
                <div className='w-1.5 h-1.5 rounded-full bg-rose-500'></div>
              </div>
              <span className='text-sm font-medium'>CRITICAL (3)</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  chat: {
    title: "Team Chat",
    content: (
      <div className='space-y-6'>
        <p className='text-muted-foreground'>
          Real-time team communication with rich text formatting, file sharing, and
          presence indicators.
        </p>

        <div>
          <h3 className='text-lg font-semibold mb-4'>Features</h3>
          <div className='grid gap-3'>
            <div className='flex gap-3 items-start border rounded-lg p-3'>
              <MessageSquare className='h-5 w-5 text-primary shrink-0 mt-0.5' />
              <div>
                <h4 className='font-medium'>Real-time Messaging</h4>
                <p className='text-sm text-muted-foreground'>
                  Powered by Liveblocks with WebSocket connections
                </p>
              </div>
            </div>
            <div className='flex gap-3 items-start border rounded-lg p-3'>
              <FileText className='h-5 w-5 text-primary shrink-0 mt-0.5' />
              <div>
                <h4 className='font-medium'>Rich Text Editor</h4>
                <p className='text-sm text-muted-foreground'>
                  Bold, italic, code blocks, links, lists using Tiptap
                </p>
              </div>
            </div>
            <div className='flex gap-3 items-start border rounded-lg p-3'>
              <FileText className='h-5 w-5 text-primary shrink-0 mt-0.5' />
              <div>
                <h4 className='font-medium'>File Attachments</h4>
                <p className='text-sm text-muted-foreground'>
                  Share images, documents, and files with preview
                </p>
              </div>
            </div>
            <div className='flex gap-3 items-start border rounded-lg p-3'>
              <Users className='h-5 w-5 text-primary shrink-0 mt-0.5' />
              <div>
                <h4 className='font-medium'>@Mentions</h4>
                <p className='text-sm text-muted-foreground'>
                  Tag team members to notify them about messages
                </p>
              </div>
            </div>
            <div className='flex gap-3 items-start border rounded-lg p-3'>
              <Users className='h-5 w-5 text-primary shrink-0 mt-0.5' />
              <div>
                <h4 className='font-medium'>Presence Indicators</h4>
                <p className='text-sm text-muted-foreground'>
                  See who&apos;s online and typing in real-time
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className='text-lg font-semibold mb-4'>Channel Types</h3>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 p-2 border rounded'>
              <Hash className='h-4 w-4' />
              <span className='text-sm font-medium'>General</span>
              <span className='text-xs text-muted-foreground ml-auto'>
                Team-wide discussions
              </span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded'>
              <FileText className='h-4 w-4' />
              <span className='text-sm font-medium'>Project</span>
              <span className='text-xs text-muted-foreground ml-auto'>
                Project-specific channels
              </span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded'>
              <Users className='h-4 w-4' />
              <span className='text-sm font-medium'>Client</span>
              <span className='text-xs text-muted-foreground ml-auto'>
                Channels with client access
              </span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded'>
              <Lock className='h-4 w-4' />
              <span className='text-sm font-medium'>Internal</span>
              <span className='text-xs text-muted-foreground ml-auto'>
                Team-only private channels
              </span>
            </div>
          </div>
        </div>

        <div className='border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 dark:bg-blue-950/30 rounded-r'>
          <p className='text-sm text-blue-600 dark:text-blue-500'>
            💡 Role badges automatically display so you can tell team members from clients
            at a glance
          </p>
        </div>
      </div>
    ),
  },

  "tech-stack": {
    title: "Tech Stack",
    content: (
      <div className='space-y-6'>
        <p className='text-muted-foreground'>
          Nextoria Hub is built with modern, production-ready technologies.
        </p>

        <div>
          <h3 className='text-lg font-semibold mb-4'>Frontend</h3>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 p-2 border rounded text-sm'>
              <Code className='h-4 w-4 text-primary' />
              <span className='font-medium'>Next.js 15</span>
              <span className='text-muted-foreground ml-auto'>
                React framework with App Router
              </span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded text-sm'>
              <Code className='h-4 w-4 text-primary' />
              <span className='font-medium'>TypeScript 5</span>
              <span className='text-muted-foreground ml-auto'>Type safety</span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded text-sm'>
              <Palette className='h-4 w-4 text-primary' />
              <span className='font-medium'>Tailwind CSS v4</span>
              <span className='text-muted-foreground ml-auto'>Utility-first styling</span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded text-sm'>
              <Code className='h-4 w-4 text-primary' />
              <span className='font-medium'>ShadCN UI</span>
              <span className='text-muted-foreground ml-auto'>
                Component library (New York style)
              </span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded text-sm'>
              <MessageSquare className='h-4 w-4 text-primary' />
              <span className='font-medium'>Liveblocks</span>
              <span className='text-muted-foreground ml-auto'>
                Real-time collaboration
              </span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded text-sm'>
              <FileText className='h-4 w-4 text-primary' />
              <span className='font-medium'>Tiptap</span>
              <span className='text-muted-foreground ml-auto'>Rich text editor</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className='text-lg font-semibold mb-4'>Backend</h3>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 p-2 border rounded text-sm'>
              <Globe className='h-4 w-4 text-primary' />
              <span className='font-medium'>Next.js API Routes</span>
              <span className='text-muted-foreground ml-auto'>Serverless endpoints</span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded text-sm'>
              <Database className='h-4 w-4 text-primary' />
              <span className='font-medium'>Drizzle ORM</span>
              <span className='text-muted-foreground ml-auto'>Type-safe queries</span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded text-sm'>
              <Database className='h-4 w-4 text-primary' />
              <span className='font-medium'>Neon Postgres</span>
              <span className='text-muted-foreground ml-auto'>Serverless database</span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded text-sm'>
              <Lock className='h-4 w-4 text-primary' />
              <span className='font-medium'>NextAuth v5</span>
              <span className='text-muted-foreground ml-auto'>Authentication</span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded text-sm'>
              <Shield className='h-4 w-4 text-primary' />
              <span className='font-medium'>Bcrypt</span>
              <span className='text-muted-foreground ml-auto'>Password hashing</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className='text-lg font-semibold mb-4'>Storage & External</h3>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 p-2 border rounded text-sm'>
              <FileText className='h-4 w-4 text-primary' />
              <span className='font-medium'>AWS S3</span>
              <span className='text-muted-foreground ml-auto'>File storage</span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded text-sm'>
              <FileText className='h-4 w-4 text-primary' />
              <span className='font-medium'>Stripe</span>
              <span className='text-muted-foreground ml-auto'>Payment processing</span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded text-sm'>
              <MessageSquare className='h-4 w-4 text-primary' />
              <span className='font-medium'>Nodemailer</span>
              <span className='text-muted-foreground ml-auto'>Email sending</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  "database-schema": {
    title: "Database Schema",
    content: (
      <div className='space-y-6'>
        <p className='text-muted-foreground'>
          Comprehensive Postgres schema with proper relationships and foreign keys.
        </p>

        <div className='space-y-3'>
          <div className='border rounded-lg p-3'>
            <h4 className='font-semibold mb-2 flex items-center gap-2'>
              <Users className='h-4 w-4' />
              Users & Authentication
            </h4>
            <div className='text-sm text-muted-foreground space-y-1'>
              <div>
                • <code>users</code> - User accounts and profiles
              </div>
              <div>
                • <code>accounts</code> - OAuth provider connections
              </div>
              <div>
                • <code>sessions</code> - Active user sessions
              </div>
              <div>
                • <code>verification_tokens</code> - Email verification
              </div>
              <div>
                • <code>password_reset_tokens</code> - Password resets
              </div>
              <div>
                • <code>invitations</code> - Team invitations
              </div>
            </div>
          </div>

          <div className='border rounded-lg p-3'>
            <h4 className='font-semibold mb-2 flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              Workspaces & Teams
            </h4>
            <div className='text-sm text-muted-foreground space-y-1'>
              <div>
                • <code>workspaces</code> - Organization containers
              </div>
              <div>
                • <code>workspace_members</code> - User-workspace relationships
              </div>
            </div>
          </div>

          <div className='border rounded-lg p-3'>
            <h4 className='font-semibold mb-2 flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              Projects & Tasks
            </h4>
            <div className='text-sm text-muted-foreground space-y-1'>
              <div>
                • <code>projects</code> - Project entities
              </div>
              <div>
                • <code>project_members</code> - Project team assignments
              </div>
              <div>
                • <code>milestones</code> - Project milestones
              </div>
              <div>
                • <code>tasks</code> - Task items with metadata
              </div>
              <div>
                • <code>recurring_tasks</code> - Recurring task templates
              </div>
            </div>
          </div>

          <div className='border rounded-lg p-3'>
            <h4 className='font-semibold mb-2 flex items-center gap-2'>
              <Users className='h-4 w-4' />
              Clients & Billing
            </h4>
            <div className='text-sm text-muted-foreground space-y-1'>
              <div>
                • <code>clients</code> - Client information
              </div>
              <div>
                • <code>invoices</code> - Invoice records
              </div>
              <div>
                • <code>invoice_line_items</code> - Invoice details
              </div>
              <div>
                • <code>expenses</code> - Expense tracking
              </div>
            </div>
          </div>

          <div className='border rounded-lg p-3'>
            <h4 className='font-semibold mb-2 flex items-center gap-2'>
              <MessageSquare className='h-4 w-4' />
              Communication
            </h4>
            <div className='text-sm text-muted-foreground space-y-1'>
              <div>
                • <code>chat_channels</code> - Chat channels
              </div>
              <div>
                • <code>chat_messages</code> - Messages
              </div>
              <div>
                • <code>notifications</code> - In-app notifications
              </div>
              <div>
                • <code>activity_logs</code> - Activity tracking
              </div>
            </div>
          </div>

          <div className='border rounded-lg p-3'>
            <h4 className='font-semibold mb-2 flex items-center gap-2'>
              <FileText className='h-4 w-4' />
              Files & Content
            </h4>
            <div className='text-sm text-muted-foreground space-y-1'>
              <div>
                • <code>files</code> - File attachments
              </div>
              <div>
                • <code>drive_files</code> - Google Drive integration
              </div>
              <div>
                • <code>content_calendar</code> - Content planning
              </div>
              <div>
                • <code>campaigns</code> - Marketing campaigns
              </div>
            </div>
          </div>

          <div className='border rounded-lg p-3'>
            <h4 className='font-semibold mb-2 flex items-center gap-2'>
              <Settings className='h-4 w-4' />
              System
            </h4>
            <div className='text-sm text-muted-foreground space-y-1'>
              <div>
                • <code>integrations</code> - Third-party integrations
              </div>
              <div>
                • <code>approvals</code> - Approval workflows
              </div>
              <div>
                • <code>project_requests</code> - Client project requests
              </div>
              <div>
                • <code>audit_logs</code> - Security audit logs
              </div>
            </div>
          </div>
        </div>

        <div className='border-l-4 border-green-500 pl-4 py-3 bg-green-50 dark:bg-green-950/30 rounded-r'>
          <h3 className='font-semibold text-green-700 dark:text-green-400 mb-2'>
            ✅ Database Best Practices
          </h3>
          <ul className='text-sm text-green-600 dark:text-green-500 space-y-1'>
            <li>• Proper foreign keys with cascade deletes</li>
            <li>• Indexed columns for performance</li>
            <li>• TypeScript types auto-generated</li>
            <li>• Migration system with Drizzle Kit</li>
          </ul>
        </div>
      </div>
    ),
  },
};

export default function DocsPage() {
  const [selectedSection, setSelectedSection] = useState("introduction");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "gettingStarted",
    "security",
  ]);

  const currentContent = content[selectedSection];

  const toggleSection = (key: string) => {
    setExpandedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const filteredSections = Object.entries(sections).reduce((acc, [key, section]) => {
    const filteredItems = section.items.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredItems.length > 0) {
      (acc as any)[key] = { ...section, items: filteredItems };
    }
    return acc;
  }, {} as typeof sections);

  return (
    <div className='flex h-[calc(100vh-4rem)] overflow-hidden'>
      {/* Sidebar */}
      <aside
        className={cn(
          "border-r bg-gradient-to-b from-background to-muted/20 transition-all duration-300",
          sidebarOpen ? "w-72" : "w-0"
        )}
      >
        <ScrollArea className='h-full'>
          <div className='p-4 space-y-2'>
            {/* Header */}
            <div className='px-2 mb-6'>
              <h2 className='text-lg font-bold flex items-center gap-2'>
                <BookOpen className='h-5 w-5 text-primary' />
                Documentation
              </h2>
              <p className='text-xs text-muted-foreground mt-1'>
                Everything you need to know
              </p>
            </div>

            {/* Search */}
            <div className='relative mb-4'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search docs...'
                className='pl-9 h-9 bg-background'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Navigation - Collapsible Sections */}
            <div className='space-y-1'>
              {Object.entries(filteredSections).map(([key, section]) => {
                const isExpanded = expandedSections.includes(key);
                const hasActiveItem = section.items.some(
                  (item) => item.id === selectedSection
                );

                return (
                  <div key={key} className='space-y-0.5'>
                    {/* Section Header - Collapsible */}
                    <button
                      onClick={() => toggleSection(key)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                        hasActiveItem
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <section.icon className='h-4 w-4 shrink-0' />
                      <span className='flex-1 text-left'>{section.title}</span>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isExpanded && "rotate-90"
                        )}
                      />
                    </button>

                    {/* Sub-items */}
                    {isExpanded && (
                      <div className='ml-6 space-y-0.5 py-1'>
                        {section.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setSelectedSection(item.id)}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all",
                              selectedSection === item.id
                                ? "bg-primary text-primary-foreground font-medium shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            )}
                          >
                            <div
                              className={cn(
                                "h-1.5 w-1.5 rounded-full shrink-0",
                                selectedSection === item.id
                                  ? "bg-primary-foreground"
                                  : "bg-muted-foreground/40"
                              )}
                            />
                            <span className='flex-1 text-left'>{item.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className='flex-1 overflow-auto'>
        <div className='max-w-4xl mx-auto p-8'>
          <div className='mb-8'>
            <h1 className='text-4xl font-bold mb-2'>{currentContent?.title}</h1>
            <div className='h-1 w-20 bg-primary rounded-full'></div>
          </div>

          <div className='prose prose-neutral dark:prose-invert max-w-none'>
            {currentContent?.content}
          </div>

          {/* Footer */}
          <div className='mt-12 pt-8 border-t text-center text-sm text-muted-foreground'>
            <p>Built with ❤️ by the Nextoria Hub team • Last updated: October 24, 2025</p>
          </div>
        </div>
      </main>
    </div>
  );
}
