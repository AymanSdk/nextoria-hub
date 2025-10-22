# Nextoria Hub - Routing Guide

## 📐 Clean Architecture

This app follows Next.js 14 App Router best practices with a **route group** pattern.

## 🗂️ Folder Structure

```
app/
├── (dashboard)/              # Route group (doesn't affect URLs)
│   ├── layout.tsx           # Shared layout with sidebar & header
│   ├── page.tsx             # Dashboard at "/"
│   ├── projects/
│   │   ├── page.tsx         # "/projects"
│   │   ├── new/
│   │   │   └── page.tsx     # "/projects/new"
│   │   └── [slug]/
│   │       └── page.tsx     # "/projects/[slug]"
│   ├── analytics/
│   │   └── page.tsx         # "/analytics"
│   ├── campaigns/
│   │   └── page.tsx         # "/campaigns"
│   ├── invoices/
│   │   └── page.tsx         # "/invoices"
│   ├── team/
│   │   └── page.tsx         # "/team"
│   └── settings/
│       └── page.tsx         # "/settings"
├── auth/
│   ├── signin/
│   │   └── page.tsx         # "/auth/signin"
│   └── signup/
│       └── page.tsx         # "/auth/signup"
├── onboarding/
│   └── page.tsx             # "/onboarding"
├── api/
│   └── ...                  # API routes
└── layout.tsx               # Root layout
```

## 🚀 Route Structure

### Public Routes

- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page

### Protected Routes (Require Authentication)

All these routes share the same sidebar and header from `(dashboard)/layout.tsx`:

#### Core Pages

- `/` - **Dashboard** (main overview)
- `/projects` - Projects list
- `/projects/new` - Create new project
- `/projects/[slug]` - Single project with Kanban board
- `/tasks` - Tasks overview
- `/team` - Team members
- `/settings` - Settings

#### Marketing Features

- `/campaigns` - Marketing campaigns
- `/content-calendar` - Content planning
- `/analytics` - Analytics & reports

#### Finance

- `/invoices` - Invoice management
- `/expenses` - Expense tracking

#### Communication

- `/chat` - Team chat
- `/files` - File management
- `/notifications` - Notifications center

#### Client Features

- `/client-portal` - Client-facing portal

## 📁 What is `(dashboard)`?

The parentheses `(dashboard)` create a **route group**:

- ✅ Groups related routes together
- ✅ Shares a common layout
- ❌ Does NOT add `/dashboard` to URLs

### Example:

```
app/(dashboard)/projects/page.tsx  →  URL: /projects
app/(dashboard)/analytics/page.tsx →  URL: /analytics
app/(dashboard)/page.tsx          →  URL: /
```

## 🎨 Shared Layout

All pages in `(dashboard)` share this layout:

```tsx
<div>
  <AppSidebar /> {/* Left sidebar navigation */}
  <div>
    <AppHeader /> {/* Top bar with user menu */}
    <main>
      {children} {/* Page content */}
    </main>
  </div>
</div>
```

## 🔒 Route Protection

Protected routes are handled by:

1. **Middleware** (`src/middleware.ts`) - Redirects unauthenticated users
2. **Page-level checks** - Each page verifies session

## 🧭 Navigation

Sidebar links are defined in `components/layout/app-sidebar.tsx`:

```tsx
const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  // ... more items
];
```

## 📱 Best Practices Applied

1. ✅ **Route Groups** - Clean URLs without nested segments
2. ✅ **Shared Layouts** - DRY principle for sidebar/header
3. ✅ **Colocated Components** - Related code stays together
4. ✅ **Type Safety** - Full TypeScript support
5. ✅ **Server Components** - Default to SSR for better performance
6. ✅ **Client Interactivity** - `"use client"` only where needed

## 🔄 How Routing Works

1. User visits `/projects`
2. Next.js looks for `app/(dashboard)/projects/page.tsx`
3. Wraps it with `app/(dashboard)/layout.tsx`
4. Wraps that with root `app/layout.tsx`
5. Renders: **Root Layout → Dashboard Layout → Projects Page**

## 🎯 Adding New Pages

To add a new page to the dashboard:

1. Create file in `(dashboard)`:

   ```bash
   mkdir app/(dashboard)/my-page
   touch app/(dashboard)/my-page/page.tsx
   ```

2. Add to sidebar navigation:

   ```tsx
   // components/layout/app-sidebar.tsx
   const navItems = [
     // ... existing items
     {
       title: "My Page",
       href: "/my-page",
       icon: MyIcon,
     },
   ];
   ```

3. Access at: `http://localhost:3000/my-page`

That's it! The new page automatically has the sidebar and header.

---

**This structure keeps your codebase clean, maintainable, and follows Next.js 14 best practices! 🚀**
