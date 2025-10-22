# Nextoria Hub - Complete URL Structure

## 🌐 All Routes

### 🔓 Public Routes

| URL             | Description                               |
| --------------- | ----------------------------------------- |
| `/auth/signin`  | Sign in page                              |
| `/auth/signup`  | Sign up page (auto-joins Nextoria Agency) |
| `/auth/signout` | Sign out                                  |

### 🔒 Protected Routes (Require Login)

#### Dashboard & Overview

| URL           | Description                                 | Roles |
| ------------- | ------------------------------------------- | ----- |
| `/`           | **Main Dashboard** - Overview of everything | All   |
| `/onboarding` | Profile setup (optional)                    | All   |

#### Projects & Tasks

| URL                | Description                      | Roles |
| ------------------ | -------------------------------- | ----- |
| `/projects`        | All projects list                | All   |
| `/projects/new`    | Create new project               | All   |
| `/projects/[slug]` | Project detail with Kanban board | All   |
| `/tasks`           | Tasks overview                   | All   |

#### Team & Collaboration

| URL              | Description             | Roles |
| ---------------- | ----------------------- | ----- |
| `/team`          | Team members management | Admin |
| `/chat`          | Team chat channels      | All   |
| `/files`         | File management         | All   |
| `/notifications` | Notification center     | All   |

#### Marketing

| URL                 | Description         | Roles                     |
| ------------------- | ------------------- | ------------------------- |
| `/campaigns`        | Campaign tracking   | Admin, Marketer           |
| `/content-calendar` | Content planning    | Admin, Marketer, Designer |
| `/analytics`        | Analytics & reports | Admin, Marketer           |

#### Finance

| URL         | Description        | Roles                                |
| ----------- | ------------------ | ------------------------------------ |
| `/invoices` | Invoice management | All                                  |
| `/expenses` | Expense tracking   | Admin, Developer, Designer, Marketer |

#### Client Features

| URL              | Description   | Roles       |
| ---------------- | ------------- | ----------- |
| `/client-portal` | Client portal | Client, All |

#### Settings

| URL                   | Description        | Roles |
| --------------------- | ------------------ | ----- |
| `/settings`           | User settings      | All   |
| `/settings/workspace` | Workspace settings | Admin |

## 🎨 Layout Structure

All protected routes (`/`, `/projects`, `/analytics`, etc.) share:

- **Left Sidebar** - Main navigation
- **Top Header** - User menu, search, notifications
- **Main Content** - Page-specific content

## 📱 After Login Flow

1. **Sign In** → `/auth/signin`
2. **Optional Onboarding** → `/onboarding`
3. **Dashboard** → `/` (main dashboard)

## 🔑 Quick Access

After logging in with your credentials:

```
Email:    aymane-sadiki@nextoria.studio
Password: Bingo1998@
```

You'll land at: **`http://localhost:3000/`** (Dashboard)

From there, navigate using the sidebar:

- Click **Projects** → Goes to `/projects`
- Click **Analytics** → Goes to `/analytics`
- Click **Nextoria logo** → Returns to `/` (Dashboard)

## ✅ Clean & Simple

- ✅ No confusing `/dashboard/...` URLs
- ✅ Short, clean URLs like `/projects`, `/analytics`
- ✅ Root `/` shows your main dashboard
- ✅ Consistent navigation across all pages
- ✅ Role-based access control built-in

---

**Everything works as expected in a modern SaaS application! 🎉**
