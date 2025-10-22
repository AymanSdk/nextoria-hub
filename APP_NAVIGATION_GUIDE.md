# Nextoria Hub - Navigation Guide

## 🚀 Quick Start

After signing up, you'll be redirected to `/onboarding` where you can complete your profile. You can skip this and go straight to the dashboard.

## 📍 Main Routes & Pages

### Core Navigation

#### 1. **Dashboard** (`/`)

- **Role**: All users
- **Features**:
  - Overview of projects, tasks, revenue
  - Admin-only metrics: MRR, campaigns, expenses, team utilization
  - Blocked tasks alerts
  - Recent projects

#### 2. **Projects** (`/projects`)

- **Role**: All users
- **Features**:
  - Grid view of all projects
  - Project statistics
  - Progress tracking
  - Click any project to see Kanban board

#### 3. **Project Detail** (`/projects/[slug]`)

- **Role**: All users
- **Features**:
  - Kanban board (Backlog, TODO, In Progress, In Review, Done)
  - Project overview
  - Team members
  - Task management

#### 4. **Tasks** (`/tasks`)

- **Role**: All users
- **Features**:
  - Overview page
  - Link to projects (tasks are managed within projects)

### Marketing Features

#### 5. **Campaigns** (`/campaigns`)

- **Role**: Admin, Marketer
- **Features**:
  - Campaign management
  - Budget tracking
  - Metrics: reach, impressions, clicks, conversions
  - Status tracking
  - Filter by status

#### 6. **Content Calendar** (`/content-calendar`)

- **Role**: Admin, Marketer, Designer
- **Features**:
  - Calendar view of content
  - List view
  - Content types (blog posts, social media, etc.)
  - Platform-specific content
  - Publishing workflow

### Finance Features

#### 7. **Expenses** (`/expenses`)

- **Role**: Admin, Developer, Designer, Marketer
- **Features**:
  - Expense tracking
  - Approval workflow
  - Categories
  - Receipt uploads
  - Analytics

#### 8. **Invoices** (`/invoices`)

- **Role**: All users
- **Features**:
  - Invoice management
  - Payment tracking
  - PDF export (coming soon)
  - Status tracking (Draft, Sent, Paid, Overdue)

### Client Portal

#### 9. **Client Portal** (`/client-portal`)

- **Role**: Client (or all users can view)
- **Features**:
  - Project overview
  - Progress tracking
  - Invoice viewing
  - Deliverable downloads
  - Pending approvals
  - Support chat

### Analytics

#### 10. **Analytics** (`/analytics`)

- **Role**: Admin, Marketer
- **Features**:
  - Project completion rates
  - Task analytics
  - Team productivity
  - Revenue growth
  - Campaign performance
  - Financial summary

### Team Management

#### 11. **Team** (`/team`)

- **Role**: Admin only
- **Features**:
  - User management
  - Role assignment (Admin, Developer, Designer, Marketer, Client)
  - Active/inactive status
  - User statistics

### Settings

#### 12. **Profile Settings** (`/settings/profile`)

- **Role**: All users
- **Features**:
  - Personal information
  - Phone, bio, timezone

#### 13. **Workspace Settings** (`/settings/workspace`)

- **Role**: Admin only
- **Features**:
  - General settings
  - Branding (colors, logo)
  - Custom domain
  - Feature toggles
  - Notification settings
  - Billing

### Other Pages

#### 14. **Chat** (`/chat`)

- **Role**: All users
- **Status**: Coming soon

#### 15. **Files** (`/files`)

- **Role**: All users
- **Status**: Coming soon

#### 16. **Notifications** (`/notifications`)

- **Role**: All users
- **Features**: Notification center

## 👥 User Roles & Access

### Admin

- **Full access** to all features
- Can manage users and roles
- Can view analytics
- Can manage workspace settings

### Developer

- Project and task management
- Can view campaigns
- Can submit expenses
- Can view invoices

### Designer

- Project and task management
- Content calendar access
- Can submit expenses
- Approval workflows

### Marketer

- Campaign management
- Content calendar
- Analytics access
- Project collaboration

### Client

- View assigned projects
- Client portal access
- Invoice viewing
- Approval workflows
- Limited access to other features

## 🎨 Navigation Sidebar

The sidebar dynamically shows items based on your role:

### All Users See:

- Dashboard
- Projects
- Tasks
- Chat
- Files
- Invoices

### Admins See:

- All above, plus:
- Campaigns
- Content Calendar
- Team
- Analytics
- Expenses

### Marketers See:

- All base items, plus:
- Campaigns
- Content Calendar
- Analytics
- Expenses

### Designers See:

- All base items, plus:
- Content Calendar
- Expenses

### Clients See:

- All base items, plus:
- Client Portal (instead of admin features)

## 🔗 Quick Links

### After Sign Up:

1. You'll be redirected to `/onboarding`
2. Complete your profile or skip
3. You'll land on the dashboard (`/`)

### First Steps:

1. **Explore the Dashboard** - See overview of your workspace
2. **Create a Project** - Click "New Project" from `/projects`
3. **Invite Team Members** - Go to `/team` (admin only)
4. **Set Up Workspace** - Configure at `/settings/workspace` (admin only)

## 📱 Mobile Responsive

All pages are fully responsive and work on:

- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🔍 Search

Use the search bar in the header to quickly find:

- Projects
- Tasks
- Team members
- Files (coming soon)

## 🌙 Dark Mode

Toggle dark mode from:

- The theme switcher in your user menu (top right)
- System default is respected

## 🚨 Common Issues

### "404 Not Found"

- Make sure you're logged in
- Check if your role has access to the page
- Try refreshing the page
- Clear browser cache

### "Forbidden" Errors

- You may not have permission for that page
- Contact your admin to change your role
- Some features are role-restricted

### Onboarding Loop

- If you keep getting redirected to onboarding
- Click "Continue to Dashboard" or "Skip for now"
- The button will take you to `/` (dashboard)

## 📊 API Routes (for developers)

All API routes follow the pattern:

- `/api/[resource]` - List/Create
- `/api/[resource]/[id]` - Get/Update/Delete

Available APIs:

- `/api/campaigns`
- `/api/expenses`
- `/api/approvals`
- `/api/content-calendar`
- `/api/audit-logs` (admin only)

## 🎯 Feature Status

✅ **Production Ready:**

- Dashboard
- Projects & Tasks
- Campaigns
- Content Calendar
- Expenses
- Client Portal
- Analytics
- Team Management
- User Settings
- Invoices (basic)

🚧 **Coming Soon:**

- Real-time Chat
- File Management UI
- Advanced Invoice features
- Integration pages
- Task detail drawer

## 🆘 Need Help?

If you encounter issues:

1. Check this navigation guide
2. Review the role permissions above
3. Try logging out and back in
4. Clear browser cache
5. Check browser console for errors

## 🎉 Enjoy Nextoria Hub!

You now have a fully functional agency operations platform with:

- Project management
- Campaign tracking
- Expense management
- Analytics
- Client portal
- Team collaboration

Happy managing! 🚀
