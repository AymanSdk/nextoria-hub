# Nextoria Hub Setup Guide

This app supports **multi-workspace** architecture where anyone can create an account and become the admin of their own workspace.

## 🚀 Quick Setup (First Time)

### Step 1: Clear the Database (Optional)

If you want to start fresh, clear any existing data:

```bash
bun run db:seed
```

### Step 2: Start the App

```bash
bun run dev
```

### Step 3: Create Your Account

1. Visit `http://localhost:3000/auth/signup`
2. Create your account with your email and password
3. You'll automatically become the admin of your own workspace
4. Start inviting team members and clients!

---

## 👥 Adding Team Members

Once you've created your account:

1. **Invite team members** via the Team Management page
2. They'll receive an invitation link
3. They sign up using the invitation link
4. They're automatically added to your workspace with the role you specified

### Workspace Structure

- **Your Workspace**: Each user gets their own workspace when they sign up
- **Invitations**: Admin can invite others to join their workspace
- **Role Permissions**: Controlled by their assigned role (ADMIN, DEVELOPER, DESIGNER, MARKETER, CLIENT)

---

## 🔄 Reset Everything

To start fresh:

```bash
# Clear all data
bun run db:seed

# Then create a new account via signup
```

---

## 🏗️ Architecture

- **Multi-Workspace**: Each admin has their own workspace
- **Projects**: Shared across workspace members
- **Tasks**: Assigned to workspace members
- **Invoices**: Client billing managed by admins
- **Chat**: Workspace communication channels
- **Invitations**: Invite team members and clients to join your workspace

---

## Need Help?

Check the main documentation:

- `README.md` - Full project documentation
- `QUICKSTART.md` - Development guide
- `IMPLEMENTATION_SUMMARY.md` - Feature overview
