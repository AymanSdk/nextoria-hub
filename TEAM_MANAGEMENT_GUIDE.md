# Team Management Guide

## Overview

Nextoria Hub is now configured as an **internal tool** for Nextoria Agency. The system uses an **invite-only** model to manage team members and clients.

## How It Works

### 1. **Two Types of Users**

#### Team Members (Login Access)

- **ADMIN**: Full access to everything, including team management
- **DEVELOPER**: Access to projects, tasks, and client management
- **DESIGNER**: Access to projects, tasks, and design tools
- **MARKETER**: Access to campaigns, content calendar, and analytics
- **CLIENT**: Limited access to client portal only

#### Clients (Records Only)

- Stored in the "Clients" section (`/clients`)
- Do not have login access by default
- Used for project assignment and management
- Can optionally be given login access with CLIENT role if needed

---

## Adding Team Members

### As an Admin:

1. **Navigate to Team Management**

   - Click "Team" in the sidebar (Admin only)
   - Or go to `/team`

2. **Invite a New Team Member**

   - Click "Invite Team Member" button
   - Enter their email address
   - Select their role (Admin, Developer, Designer, Marketer, or Client)
   - Click "Send Invitation"
   - Copy the invitation link that appears

3. **Share the Invitation Link**
   - Currently, you need to manually share the link with the team member
   - In production, this would be sent via email automatically
   - The link expires in 7 days

### Team Member Signup Process:

1. The invited person receives the invitation link
2. They click the link and are taken to `/auth/signup?token=xxxxx`
3. They fill in their name, email (must match invitation), and password
4. Upon signup, they are automatically:
   - Added to the Nextoria Agency workspace
   - Assigned the role specified in the invitation
   - Given appropriate access permissions

---

## Managing Team Members

### View Team Members

- Go to `/team`
- See all team members with their roles and status
- View stats: Total Members, Active Members, Admins

### Deactivate/Activate Members

- Click the three-dot menu next to any team member
- Select "Deactivate" to disable their access
- Select "Activate" to restore their access
- Note: You cannot deactivate yourself

### Pending Invitations

- View all pending (not yet accepted) invitations
- See expiration dates
- Revoke invitations if needed

---

## Adding Clients

### Option 1: Clients as Records Only (Recommended for most clients)

1. **Navigate to Clients**

   - Click "Clients" in the sidebar
   - Or go to `/clients`

2. **Add a New Client**

   - Click "Add Client" button
   - Fill in client details:
     - Name, Company Name
     - Contact information
     - Address details
     - Tax ID, Industry, etc.
   - Click "Create Client"

3. **Assign Projects to Client**
   - When creating a new project, select the client from the dropdown
   - One client can have multiple projects

### Option 2: Clients with Login Access (For client portal)

If you want a client to log in and view their projects:

**Method 1: From Client Detail Page (Recommended)**

1. Go to the client's page
2. Click "Invite to Portal" button in the header
3. This will create an invitation with role "CLIENT"
4. Copy and share the invitation link with the client
5. They can sign up and access the Client Portal

**Method 2: From Team Management**

1. Go to Team page
2. Invite them as a team member with role "CLIENT"
3. They will have access to the Client Portal
4. They can view their assigned projects and invoices
5. Limited permissions compared to team members

---

## Important Notes

### Security

- ✅ Public signup is **disabled** - requires invitation token
- ✅ Only admins can invite new team members
- ✅ Invitations expire after 7 days
- ✅ Email must match the invitation

### Admin Access

- Create your account via signup to become an admin
- Each user gets their own workspace with full admin rights
- Role: ADMIN (for your own workspace)

### Roles & Permissions

| Role      | Dashboard | Projects  | Tasks | Clients | Campaigns | Team | Analytics | Invoices  |
| --------- | --------- | --------- | ----- | ------- | --------- | ---- | --------- | --------- |
| ADMIN     | ✅        | ✅        | ✅    | ✅      | ✅        | ✅   | ✅        | ✅        |
| DEVELOPER | ✅        | ✅        | ✅    | ✅      | ❌        | ❌   | ❌        | ✅        |
| DESIGNER  | ✅        | ✅        | ✅    | ✅      | ❌        | ❌   | ❌        | ✅        |
| MARKETER  | ✅        | ✅        | ✅    | ✅      | ✅        | ❌   | ✅        | ✅        |
| CLIENT    | ❌        | View Only | ❌    | ❌      | ❌        | ❌   | ❌        | View Only |

---

## Quick Start Example

### Adding Your First Team Member:

1. Log in to your workspace as admin
2. Go to "Team" in the sidebar
3. Click "Invite Team Member"
4. Enter their email (e.g., `developer@example.com`)
5. Select role: "Developer"
6. Click "Send Invitation"
7. Copy the invitation link (e.g., `http://localhost:3000/auth/signup?token=abc123xyz`)
8. Send the link to your colleague via Slack, email, etc.
9. They click the link, fill in their details, and sign up
10. They can now log in and access your workspace!

### Adding Your First Client:

1. Go to "Clients" in the sidebar
2. Click "Add Client"
3. Fill in client details (e.g., "Acme Corp", contact@acme.com)
4. Save the client
5. When creating a project, you can now assign it to "Acme Corp"

### Giving a Client Portal Access:

1. Go to the client's detail page
2. Click "Invite to Portal" button
3. Copy the invitation link
4. Send it to the client via email
5. They can sign up and view their projects!

---

## Future Enhancements

- 📧 Automatic email sending for invitations
- 🔄 Bulk invite multiple team members
- 📊 Client portal with dedicated views
- 🔐 Two-factor authentication
- 📱 Mobile app access

---

## Need Help?

For issues or questions, contact your workspace admin or check the documentation in the `/docs` folder.
