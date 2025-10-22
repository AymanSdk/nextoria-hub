# Nextoria Agency Setup Guide

This app is configured for **internal use** at Nextoria Agency.

## 🚀 Quick Setup (First Time)

### Step 1: Set Your Admin Credentials (Optional)

You can customize your admin credentials by setting environment variables:

```bash
export ADMIN_EMAIL="your.email@nextoria.com"
export ADMIN_NAME="Your Name"
export ADMIN_PASSWORD="YourSecurePassword123!"
```

Or just use the defaults:

- Email: `aymane-sadiki@nextoria.studio`
- Password: `Bingo1998@`

### Step 2: Run Agency Setup

```bash
bun run src/db/setup-agency.ts
```

This will create:

- ✅ Your admin user account
- ✅ "Nextoria Agency" workspace
- ✅ You as the workspace owner

### Step 3: Start the App

```bash
bun run dev
```

### Step 4: Sign In

Visit `http://localhost:3000/auth/signin` and use your admin credentials.

---

## 👥 Adding Team Members

Once you're set up:

1. **Share the signup link** with team members: `http://localhost:3000/auth/signup`
2. They create their accounts (will be assigned CLIENT role by default)
3. **You promote them** to appropriate roles (DEVELOPER, DESIGNER, MARKETER) via settings

### Workspace Structure

- **One Workspace**: Nextoria Agency (shared by all team members)
- **All Projects**: Visible to everyone in the workspace
- **Role Permissions**: Controlled by their assigned role

---

## 🔄 Reset Everything

To start fresh:

```bash
# Clear all data
bun run db:seed

# Re-run agency setup
bun run src/db/setup-agency.ts
```

---

## 📝 Admin Credentials

Your admin account:

- **Email**: aymane-sadiki@nextoria.studio
- **Password**: Bingo1998@

---

## 🏗️ Architecture

- **Single Workspace**: All team members belong to "Nextoria Agency"
- **Projects**: Shared across the team
- **Tasks**: Assigned to team members
- **Invoices**: Client billing managed by admins
- **Chat**: Team communication channels

---

## Need Help?

Check the main documentation:

- `README.md` - Full project documentation
- `QUICKSTART.md` - Development guide
- `IMPLEMENTATION_SUMMARY.md` - Feature overview
