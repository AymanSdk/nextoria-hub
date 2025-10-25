/**
 * Email Service
 * Send emails using Nodemailer
 */

import nodemailer from "nodemailer";

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Create email transporter
 */
function createTransporter() {
  // In production, use a real email service (SendGrid, Mailgun, etc.)
  // For now, using a test configuration
  if (process.env.SMTP_HOST) {
    // Handle both CommonJS and ES Module exports
    // Note: The method is createTransport (not createTransporter!)
    const createTransport =
      (nodemailer as any).createTransport || (nodemailer as any).default?.createTransport;

    if (!createTransport) {
      console.error("Nodemailer createTransport not available, falling back to dev mode");
      return {
        sendMail: async (options: any) => {
          console.log("📧 Email (dev mode - nodemailer unavailable):");
          console.log("To:", options.to);
          console.log("Subject:", options.subject);
          console.log("---");
          return { messageId: "dev-" + Date.now() };
        },
      };
    }

    return createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to console logging in development
  return {
    sendMail: async (options: any) => {
      console.log("📧 Email (dev mode):");
      console.log("To:", options.to);
      console.log("Subject:", options.subject);
      console.log("---");
      return { messageId: "dev-" + Date.now() };
    },
  };
}

/**
 * Send an email
 */
export async function sendEmail(params: EmailParams) {
  const transporter = createTransporter();

  try {
    const info = await transporter.sendMail({
      from: params.from || process.env.EMAIL_FROM || "noreply@nextoria.app",
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
  workspaceName: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px;
          border-radius: 12px;
          color: white;
        }
        .content {
          background: white;
          color: #333;
          padding: 30px;
          border-radius: 8px;
          margin-top: 20px;
        }
        .button {
          display: inline-block;
          padding: 14px 28px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 style="margin: 0;">Welcome to ${params.workspaceName}! 🎉</h1>
        <div class="content">
          <p>Hi ${params.name},</p>
          <p>We're excited to have you on board! Your account has been created and you're ready to get started.</p>
          <p>Here's what you can do next:</p>
          <ul>
            <li>Complete your profile</li>
            <li>Explore your projects</li>
            <li>Connect with your team</li>
          </ul>
          <a href="${
            process.env.NEXT_PUBLIC_APP_URL || "https://app.nextoria.studio"
          }" class="button">Get Started</a>
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            If you have any questions, feel free to reach out to your project manager.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: params.to,
    subject: `Welcome to ${params.workspaceName}!`,
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(params: { to: string; resetLink: string }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #f9fafb;
          padding: 30px;
          border-radius: 8px;
        }
        .button {
          display: inline-block;
          padding: 14px 28px;
          background: #0070f3;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Reset Your Password</h2>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="${params.resetLink}" class="button">Reset Password</a>
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: params.to,
    subject: "Reset Your Password",
    html,
  });
}

/**
 * Send invitation email
 */
export async function sendInvitationEmail(params: {
  to: string;
  inviterName: string;
  inviterEmail: string;
  workspaceName: string;
  role: string;
  invitationLink: string;
  expiresAt: Date;
}) {
  const roleDisplay = params.role.charAt(0) + params.role.slice(1).toLowerCase();
  const expiryDate = params.expiresAt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background-color: #f3f4f6;
          padding: 40px 20px;
        }
        .email-wrapper {
          max-width: 480px;
          margin: 0 auto;
        }
        .email-container {
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: #6366f1;
          padding: 32px 32px 28px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }
        .header p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 15px;
          font-weight: 400;
        }
        .content {
          padding: 32px;
        }
        .greeting {
          color: #111827;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .content p {
          color: #4b5563;
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 16px;
        }
        .invitation-card {
          background: #f9fafb;
          border-radius: 10px;
          padding: 20px;
          margin: 24px 0;
          border: 1px solid #e5e7eb;
        }
        .invitation-card .detail-row {
          display: flex;
          padding: 8px 0;
        }
        .invitation-card .detail-label {
          color: #6b7280;
          font-size: 14px;
          min-width: 90px;
        }
        .invitation-card .detail-value {
          color: #111827;
          font-size: 14px;
          font-weight: 600;
        }
        .button-container {
          text-align: center;
          margin: 28px 0;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: #6366f1;
          color: #ffffff;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }
        .button:hover {
          background: #5558e3;
        }
        .expiry-notice {
          background: #fef9f3;
          border: 1px solid #fed7aa;
          border-radius: 10px;
          padding: 14px 16px;
          margin: 24px 0;
          font-size: 13px;
          color: #92400e;
          text-align: center;
        }
        .expiry-notice strong {
          color: #78350f;
        }
        .footer-text {
          padding: 0 32px 32px;
          text-align: center;
          font-size: 13px;
          color: #9ca3af;
        }
        @media only screen and (max-width: 480px) {
          body {
            padding: 20px 12px;
          }
          .content {
            padding: 24px;
          }
          .header {
            padding: 28px 24px 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-container">
          <div class="header">
            <h1>You're Invited</h1>
            <p>Join ${params.workspaceName}</p>
          </div>
          
          <div class="content">
            <div class="greeting">Hello there!</div>
            <p><strong>${params.inviterName}</strong> has invited you to join <strong>${params.workspaceName}</strong> as a <strong>${roleDisplay}</strong>.</p>
            
            <div class="invitation-card">
              <div class="detail-row">
                <div class="detail-label">Workspace:</div>
                <div class="detail-value">${params.workspaceName}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Your Role:</div>
                <div class="detail-value">${roleDisplay}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Invited by:</div>
                <div class="detail-value">${params.inviterName}</div>
              </div>
            </div>

            <p>Click the button below to accept your invitation and get started:</p>
            
            <div class="button-container">
              <a href="${params.invitationLink}" class="button">Accept Invitation</a>
            </div>

            <div class="expiry-notice">
              <strong>Note:</strong> This invitation expires on ${expiryDate}
            </div>

            <p style="margin-bottom: 0;">If you weren't expecting this invitation, you can safely ignore this email.</p>
          </div>

          <div class="footer-text">
            Nextoria Studio
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
You're Invited to ${params.workspaceName}!

${params.inviterName} has invited you to join ${params.workspaceName} as a ${roleDisplay}.

Accept your invitation: ${params.invitationLink}

This invitation expires on ${expiryDate}.

If you're not sure why you received this email, you can safely ignore it.
  `;

  return sendEmail({
    from: `${params.inviterName} via Nextoria <${
      process.env.EMAIL_FROM || "manager@nextoria.studio"
    }>`,
    to: params.to,
    subject: `You're invited to join ${params.workspaceName}`,
    html,
    text,
  });
}
