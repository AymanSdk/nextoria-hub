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
}

/**
 * Create email transporter
 */
function createTransporter() {
  // In production, use a real email service (SendGrid, Mailgun, etc.)
  // For now, using a test configuration
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransporter({
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
      from: process.env.EMAIL_FROM || "noreply@nextoria.app",
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
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
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
export async function sendPasswordResetEmail(params: {
  to: string;
  resetLink: string;
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
