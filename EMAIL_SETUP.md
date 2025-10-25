# Email Configuration Guide

This guide explains how to configure email functionality for sending invitations to teammates and clients.

## Environment Variables

Add the following environment variables to your `.env.local` or production environment:

### Required Email Configuration

```bash
# App URL (use your production domain)
NEXTAUTH_URL="https://app.nextoria.studio"
NEXT_PUBLIC_APP_URL="https://app.nextoria.studio"

# Email Configuration
SMTP_HOST="smtp.gmail.com"              # Your SMTP server
SMTP_PORT="587"                         # SMTP port (587 for TLS, 465 for SSL)
SMTP_SECURE="false"                     # Set to "true" if using port 465 (SSL)
SMTP_USER="your-email@gmail.com"        # SMTP username
SMTP_PASS="your-app-password"           # SMTP password or app-specific password
EMAIL_FROM="noreply@nextoria.studio"    # Sender email address
```

## Recommended Email Services

### 1. Gmail (For Development/Small Scale)

**Setup:**

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password in `SMTP_PASS`

**Configuration:**

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-digit-app-password"
```

**Limitations:**

- 500 emails per day (free)
- Gmail branding on emails
- Not recommended for production

### 2. SendGrid (Recommended for Production)

**Setup:**

1. Sign up at https://sendgrid.com
2. Create an API Key
3. Configure sender authentication

**Configuration:**

```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
EMAIL_FROM="noreply@nextoria.studio"
```

**Benefits:**

- Free tier: 100 emails/day
- Paid plans start at $19.95/month (40,000 emails)
- Excellent deliverability
- Analytics and tracking

### 3. Amazon SES (Cost-Effective for High Volume)

**Setup:**

1. Sign up for AWS SES
2. Verify your domain
3. Create SMTP credentials

**Configuration:**

```bash
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-ses-smtp-username"
SMTP_PASS="your-ses-smtp-password"
EMAIL_FROM="noreply@nextoria.studio"
```

**Benefits:**

- Very affordable ($0.10 per 1,000 emails)
- Highly scalable
- Integrates with other AWS services

### 4. Mailgun

**Setup:**

1. Sign up at https://mailgun.com
2. Verify your domain
3. Get SMTP credentials

**Configuration:**

```bash
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="postmaster@mg.yourdomain.com"
SMTP_PASS="your-mailgun-password"
EMAIL_FROM="noreply@nextoria.studio"
```

**Benefits:**

- Free tier: 5,000 emails for 3 months
- Pay-as-you-go pricing
- Good documentation and support

### 5. Postmark (Best for Transactional Emails)

**Setup:**

1. Sign up at https://postmarkapp.com
2. Verify sender signature
3. Get SMTP credentials

**Configuration:**

```bash
SMTP_HOST="smtp.postmarkapp.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-postmark-server-token"
SMTP_PASS="your-postmark-server-token"
EMAIL_FROM="noreply@nextoria.studio"
```

**Benefits:**

- Free trial: 100 emails
- Excellent deliverability
- Focus on transactional emails
- $15/month for 10,000 emails

## Testing Email Configuration

### Development Mode

If SMTP credentials are not configured, emails will be logged to the console instead of being sent. This is useful for development:

```
📧 Email (dev mode):
To: user@example.com
Subject: You're invited to join Workspace Name
---
```

### Testing with Real Emails

1. Configure SMTP credentials in `.env.local`
2. Restart your development server
3. Invite a user from the Team Management page
4. Check the email inbox

## Email Templates

The system includes pre-designed email templates for:

### 1. Team Member Invitations

- Professional gradient design
- Clear call-to-action button
- Invitation details (workspace, role, inviter)
- Expiration notice
- Both HTML and plain text versions

### 2. Client Invitations

- Same design as team invitations
- Tailored messaging for clients
- Client portal access information

### 3. Welcome Emails

- Sent when a user completes registration
- Links to getting started resources

## Customizing Email Templates

Email templates are located in `src/lib/notifications/email.ts`. You can customize:

- Colors and branding
- Logo and images
- Text content
- Button styles
- Footer information

## Domain Configuration

For best deliverability, configure the following DNS records for your domain:

### SPF Record

```
v=spf1 include:_spf.youremailprovider.com ~all
```

### DKIM Record

Your email provider will give you specific DKIM records to add.

### DMARC Record

```
v=DMARC1; p=none; rua=mailto:admin@nextoria.studio
```

## Troubleshooting

### Emails Not Being Sent

1. **Check environment variables** - Ensure all SMTP variables are set correctly
2. **Check console logs** - Look for error messages
3. **Verify credentials** - Test SMTP credentials with your provider
4. **Check firewall** - Ensure port 587 or 465 is not blocked
5. **Review rate limits** - Check if you've exceeded your provider's limits

### Emails Going to Spam

1. **Configure SPF, DKIM, and DMARC** records
2. **Use a verified domain** for EMAIL_FROM
3. **Warm up your sending domain** gradually
4. **Monitor bounce rates** and complaint rates
5. **Use reputable email service** (SendGrid, AWS SES, etc.)

### Email Formatting Issues

1. **Test in multiple clients** (Gmail, Outlook, Apple Mail)
2. **Use inline CSS** for styling
3. **Include plain text version** (already implemented)
4. **Test on mobile devices**

## Production Checklist

Before deploying to production:

- [ ] Configure production SMTP credentials
- [ ] Set NEXTAUTH_URL to production domain (https://app.nextoria.studio)
- [ ] Set NEXT_PUBLIC_APP_URL to production domain
- [ ] Set EMAIL_FROM to a verified domain
- [ ] Configure SPF, DKIM, and DMARC records
- [ ] Test invitation emails
- [ ] Monitor email deliverability
- [ ] Set up email bounce handling
- [ ] Configure email rate limiting if needed

## Security Best Practices

1. **Never commit .env files** - Keep credentials secret
2. **Use app-specific passwords** - Don't use your main email password
3. **Rotate credentials regularly**
4. **Monitor for unauthorized access**
5. **Use environment variables** - Never hardcode credentials
6. **Enable 2FA** on email provider accounts
7. **Restrict SMTP access** by IP if possible

## Support

For issues or questions:

- Check the email service provider's documentation
- Review application logs for error messages
- Contact your email service provider's support
- Check the Nextoria documentation

---

Last Updated: October 2025
