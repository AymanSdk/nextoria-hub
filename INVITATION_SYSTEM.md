# Email Invitation System

## Overview

The Nextoria platform now includes a fully functional email invitation system that allows admins to invite teammates and clients to join their workspace via email.

## Features

✅ **Email Invitations**: Send professional, branded invitation emails
✅ **Role-Based Access**: Invite users with specific roles (Admin, Developer, Designer, Marketer, Client)
✅ **Secure Tokens**: Unique, time-limited invitation tokens (7-day expiration)
✅ **Duplicate Prevention**: Prevents duplicate invitations to the same email
✅ **Beautiful Templates**: Professional HTML email templates with gradient design
✅ **Domain Configuration**: Uses app.nextoria.studio as the primary domain
✅ **Fallback Support**: Graceful degradation if email service is unavailable

## How It Works

### 1. Admin Sends Invitation

From the Team Management page (`/team`), admins can:

- Click "Invite Team Member"
- Enter email address
- Select role (Admin, Developer, Designer, Marketer, or Client)
- Send invitation

### 2. Email is Sent

The system:

- Generates a unique 32-character token
- Creates invitation record in database
- Sends branded email to the recipient
- Sets 7-day expiration

### 3. Recipient Accepts

The recipient:

- Receives email with invitation link
- Clicks "Accept Invitation" button
- Gets redirected to signup page with token
- Creates account (pre-filled with email and role)
- Automatically joins the workspace

## Email Template

The invitation email includes:

- **Professional Design**: Gradient header with purple/blue theme
- **Clear Information**: Workspace name, role, and inviter details
- **Call-to-Action**: Prominent "Accept Invitation" button
- **Expiration Notice**: Yellow highlighted expiry date
- **Plain Text Version**: For email clients that don't support HTML

## API Endpoints

### Create Invitation

```
POST /api/invitations
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "role": "DEVELOPER"
}
```

**Response:**

```json
{
  "invitation": {
    "id": "abc123...",
    "email": "user@example.com",
    "role": "DEVELOPER",
    "token": "xyz789...",
    "expires": "2025-11-01T00:00:00.000Z",
    "workspaceId": "workspace_id",
    "invitedBy": "inviter_id",
    "createdAt": "2025-10-25T00:00:00.000Z"
  },
  "message": "Invitation sent to user@example.com"
}
```

### Get Pending Invitations

```
GET /api/invitations
```

Returns all pending invitations for the current workspace.

### Delete Invitation

```
DELETE /api/invitations/[invitationId]
```

Cancels a pending invitation.

## Components

### InviteTeamMemberDialog

Location: `components/team/invite-team-member-dialog.tsx`

Features:

- Email input with validation
- Role selection dropdown
- Loading states
- Success/error toasts

### InviteClientDialog

Location: `components/clients/invite-client-dialog.tsx`

Features:

- Pre-filled client email
- Automatically sets role to CLIENT
- Simplified interface for client invitations

### PendingInvitations

Location: `components/team/pending-invitations.tsx`

Features:

- Lists all pending invitations
- Shows invitation details
- Copy invitation link
- Delete invitation option

## Database Schema

### invitations Table

```sql
CREATE TABLE invitations (
  id TEXT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  role role_enum NOT NULL DEFAULT 'CLIENT',
  workspace_id TEXT NOT NULL,
  invited_by TEXT NOT NULL REFERENCES users(id),
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Security Features

1. **Token Generation**: Uses nanoid for cryptographically secure tokens
2. **Expiration**: 7-day expiration on all invitations
3. **Single Use**: Tokens are marked as used after acceptance
4. **Admin Only**: Only workspace admins can send invitations
5. **Duplicate Prevention**: Checks for existing members and pending invitations
6. **Email Validation**: Server-side email format validation with Zod

## Email Service Configuration

The system supports multiple email providers. See `EMAIL_SETUP.md` for detailed configuration instructions.

### Quick Setup

Add to `.env.local`:

```bash
# Domain Configuration
NEXTAUTH_URL="https://app.nextoria.studio"
NEXT_PUBLIC_APP_URL="https://app.nextoria.studio"

# Email Service (Example: Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@nextoria.studio"
```

### Supported Email Services

- **Gmail** (Development/Small Scale)
- **SendGrid** (Recommended for Production)
- **Amazon SES** (Cost-Effective High Volume)
- **Mailgun** (Pay-as-you-go)
- **Postmark** (Transactional Focus)

## Development Mode

When SMTP credentials are not configured, the system operates in development mode:

- Emails are logged to console instead of being sent
- Invitation links are displayed in the UI
- Console output includes:
  ```
  📧 Email (dev mode):
  To: user@example.com
  Subject: You're invited to join Workspace Name
  ---
  ```

## Error Handling

The system gracefully handles errors:

1. **Email Send Failure**: Invitation is still created, admin is notified
2. **Duplicate Invitations**: Returns error message
3. **Expired Tokens**: Shows error on signup page
4. **Invalid Tokens**: Redirects to signup with error
5. **Permission Denied**: Only admins can send invitations

## Testing

### Manual Testing

1. **Send Invitation**:

   ```bash
   curl -X POST http://localhost:3000/api/invitations \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","role":"DEVELOPER"}'
   ```

2. **Check Email**: Verify email was sent (or check console logs in dev mode)

3. **Accept Invitation**: Click link in email or navigate to:
   ```
   https://app.nextoria.studio/auth/signup?token=YOUR_TOKEN
   ```

### Automated Testing

Test files can be added to:

- `tests/api/invitations.test.ts` - API endpoint tests
- `tests/components/invite-dialog.test.tsx` - Component tests
- `tests/e2e/invitation-flow.test.ts` - End-to-end tests

## Usage Examples

### Inviting a Team Member

```typescript
// From a Server Action or API Route
const response = await fetch("/api/invitations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "developer@example.com",
    role: "DEVELOPER",
  }),
});

const data = await response.json();
console.log("Invitation sent:", data.message);
```

### Checking Pending Invitations

```typescript
const response = await fetch("/api/invitations");
const { invitations } = await response.json();

console.log(`${invitations.length} pending invitations`);
```

## UI Locations

1. **Team Management** (`/team`)

   - "Invite Team Member" button in top right
   - Shows pending invitations list
   - Manage team members

2. **Client Management** (`/clients`)

   - "Invite to Portal" button for each client
   - Quick client invitation workflow

3. **Settings** (`/settings`)
   - Email configuration settings
   - Notification preferences

## Customization

### Email Templates

Edit email templates in:

```
src/lib/notifications/email.ts
```

Customize:

- Colors and branding
- Logo and images
- Email copy
- Button styles
- Footer information

### Invitation Expiry

Change expiration time in:

```typescript
// app/api/invitations/route.ts
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7); // Change 7 to desired days
```

### Allowed Roles

Update role options in:

```typescript
// app/api/invitations/route.ts
const createInvitationSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "DEVELOPER", "DESIGNER", "MARKETER", "CLIENT"]),
});
```

## Troubleshooting

### Emails Not Sending

1. Check SMTP credentials in environment variables
2. Verify email service is configured correctly
3. Check console logs for error messages
4. Test with a simple email service like Gmail first

### Invitation Link Not Working

1. Verify token is valid and not expired
2. Check database for invitation record
3. Ensure NEXTAUTH_URL is set correctly
4. Clear browser cookies and try again

### Permission Errors

1. Verify user has ADMIN role
2. Check workspace membership
3. Review auth middleware configuration

## Production Deployment

Before deploying:

1. ✅ Configure production SMTP credentials
2. ✅ Set NEXTAUTH_URL to `https://app.nextoria.studio`
3. ✅ Set NEXT_PUBLIC_APP_URL to `https://app.nextoria.studio`
4. ✅ Configure DNS records (SPF, DKIM, DMARC)
5. ✅ Test invitation flow end-to-end
6. ✅ Monitor email deliverability
7. ✅ Set up error tracking (Sentry)

## Future Enhancements

Potential improvements:

- [ ] Bulk invitations (CSV upload)
- [ ] Custom invitation messages
- [ ] Invitation reminders
- [ ] Invitation analytics
- [ ] Role change after invitation
- [ ] Invitation templates
- [ ] Multi-language support
- [ ] Custom expiration times per invitation
- [ ] Integration with Slack/Discord notifications

## Support

For issues or questions:

- Review this documentation
- Check `EMAIL_SETUP.md` for email configuration
- Review application logs
- Contact support@nextoria.studio

---

**Last Updated**: October 25, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
