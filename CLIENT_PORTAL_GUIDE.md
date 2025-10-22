# Client Portal Guide

## How It Works

The client portal allows clients to view their projects, invoices, and deliverables in a read-only interface.

## Setup Process

### 1. Add Client Record

First, add the client to your system:

1. Go to **Clients** (`/clients`)
2. Click **"Add Client"**
3. Fill in client details (name, email, company, etc.)
4. Save the client

**Important**: Make sure the email is correct - this is how we link the client's login to their projects!

### 2. Assign Projects to Client

When creating or editing a project:

1. Select the client from the **"Client"** dropdown
2. This links the project to that client record
3. One client can have multiple projects

### 3. Invite Client to Portal (Optional)

If you want the client to log in and view their projects:

1. Go to the client's detail page
2. Click **"Invite to Portal"** button
3. Copy the invitation link
4. Send it to the client
5. They sign up with the **same email** as their client record
6. They can now log in and see their projects!

## How Projects Appear for Clients

When a client logs in:

1. System finds their client record by matching their login email
2. Fetches all projects where `clientId` = their client record ID
3. Shows these projects in the Client Portal
4. Client can view project progress, tasks, and deliverables

## Email Matching is Critical!

⚠️ **Important**: The client's login email **must match** the email in their client record!

**Example:**

- Client record email: `john@acmecorp.com`
- Client invitation: Sent to `john@acmecorp.com`
- Client signs up with: `john@acmecorp.com` ✅ Projects will show!
- Client signs up with: `john.doe@acmecorp.com` ❌ Projects won't show!

## What Clients Can See

When logged in, clients have access to:

✅ **Projects**

- All projects assigned to them
- Project progress and status
- Task completion statistics
- Project descriptions and details

✅ **Invoices**

- Invoices for their projects
- Payment status
- Download paid invoices

✅ **Deliverables**

- Public files from their projects
- Download capabilities

✅ **Support**

- Contact project manager
- View messages

❌ **What They Cannot See**

- Other clients' projects
- Team member information
- Administrative settings
- Create or edit anything (read-only)

## Troubleshooting

### Client Can't See Their Projects

**Check:**

1. Is there a client record with the correct email?

   - Go to Clients → Find the client
   - Verify email matches their login email

2. Are projects assigned to that client?

   - Go to each project
   - Check if client is selected in the "Client" field

3. Did they sign up with the correct email?
   - They must use the same email as the client record

**Fix:**

- Update the client record email to match their login email, OR
- Have them sign up again with the correct invitation link

### Multiple Clients with Same Email

⚠️ Avoid this! Each client should have a unique email address.

If you need multiple people from the same company:

- Create separate client records for each contact person
- OR use the primary contact's email for the client record
- Use team roles (not CLIENT role) for additional contacts

## Best Practices

1. **Before Inviting**: Always create the client record first with the correct email
2. **Assign Projects**: Link projects to the client before they log in
3. **Test the Link**: Check that the invitation email matches the client record
4. **Communicate**: Tell the client to use the exact email from the invitation

## Example Workflow

### Adding "Acme Corp" as a Client

1. **Create Client Record**

   ```
   Name: John Smith
   Company: Acme Corp
   Email: john@acmecorp.com
   ```

2. **Create Project**

   ```
   Project: Website Redesign
   Client: Acme Corp (select from dropdown)
   ```

3. **Invite to Portal**

   - Go to Acme Corp's client page
   - Click "Invite to Portal"
   - Copy link: `http://yourapp.com/auth/signup?token=abc123`
   - Email to john@acmecorp.com

4. **Client Signs Up**
   - John receives email
   - Clicks link
   - Signs up with `john@acmecorp.com`
   - Logs in → Sees "Website Redesign" project ✅

---

## Technical Details

### Database Flow

```
clients table
├─ id: "client_123"
├─ email: "john@acmecorp.com"
└─ name: "John Smith"

projects table
├─ id: "proj_456"
├─ name: "Website Redesign"
└─ clientId: "client_123"  ← Links project to client

users table (after invitation)
├─ id: "user_789"
├─ email: "john@acmecorp.com"  ← Must match client email!
└─ role: "CLIENT"

Client Portal Query:
1. Find client where clients.email = user.email
2. Find projects where projects.clientId = client.id
3. Show those projects to the user
```

### Code Reference

The client portal logic is in:

- `app/(dashboard)/client-portal/page.tsx`
- Lines 59-81: Client record lookup and project fetching

---

Need help? Contact the admin at `aymane-sadiki@nextoria.studio`
