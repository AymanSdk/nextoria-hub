/**
 * Email Verification Utilities
 * Handles email verification tokens and emails
 */

import { db } from "@/src/db";
import { users, verificationTokens } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { sendEmail } from "@/src/lib/notifications/email";

/**
 * Generate a 6-digit verification code
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a verification token for a user
 * Now generates a simple 6-digit code instead of long token
 */
export async function generateVerificationToken(email: string) {
  // Delete any existing tokens for this email
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email));

  // Create new 6-digit verification code (expires in 24 hours)
  const token = generateVerificationCode();
  const expires = new Date();
  expires.setHours(expires.getHours() + 24);

  await db.insert(verificationTokens).values({
    identifier: email,
    token,
    expires,
  });

  return token;
}

/**
 * Verify an email using a 6-digit code
 */
export async function verifyEmail(code: string, email?: string) {
  // Normalize code (remove spaces, convert to string)
  const normalizedCode = code.toString().replace(/\s/g, "");

  // Validate code format (6 digits)
  if (!/^\d{6}$/.test(normalizedCode)) {
    return { success: false, error: "Invalid code format. Please enter a 6-digit code." };
  }

  // Find the token
  const [verificationToken] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, normalizedCode))
    .limit(1);

  if (!verificationToken) {
    return { success: false, error: "Invalid verification code" };
  }

  // If email provided, also match on email for extra security
  if (email && verificationToken.identifier.toLowerCase() !== email.toLowerCase()) {
    return { success: false, error: "Invalid verification code for this email" };
  }

  // Check if token has expired
  if (new Date() > verificationToken.expires) {
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.token, normalizedCode));
    return { success: false, error: "Verification code has expired" };
  }

  // Find the user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, verificationToken.identifier))
    .limit(1);

  if (!user) {
    return { success: false, error: "User not found" };
  }

  // Update user's email verification status
  await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, user.id));

  // Delete the used token
  await db.delete(verificationTokens).where(eq(verificationTokens.token, normalizedCode));

  return { success: true, email: user.email };
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(params: {
  to: string;
  name: string;
  token: string;
}) {
  const verificationLink = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/auth/verify-email`;

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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        .button-container {
          text-align: center;
          margin: 28px 0;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: #667eea;
          color: #ffffff;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }
        .button:hover {
          background: #5568d3;
        }
        .security-notice {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 14px 16px;
          margin: 24px 0;
          font-size: 13px;
          color: #991b1b;
        }
        .security-notice strong {
          color: #7f1d1d;
        }
        .expiry-notice {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 14px 16px;
          margin: 24px 0;
          font-size: 13px;
          color: #166534;
          text-align: center;
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
            <h1>Verify Your Email</h1>
            <p>Welcome to Nextoria Studio</p>
          </div>
          
          <div class="content">
            <div class="greeting">Hi ${params.name}!</div>
            <p>Thanks for signing up! Please use the verification code below to activate your account and get started.</p>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 13px; margin-bottom: 8px; font-weight: 600; letter-spacing: 1px;">YOUR VERIFICATION CODE</p>
              <div style="background: white; border-radius: 8px; padding: 20px; margin: 0 auto; max-width: 200px;">
                <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; margin: 0; font-family: 'Courier New', monospace;">${params.token}</p>
              </div>
            </div>

            <p style="text-align: center; font-size: 14px; color: #666;">Enter this code on the verification page to complete your registration</p>

            <div class="button-container">
              <a href="${verificationLink}" class="button">Go to Verification Page</a>
            </div>

            <div class="expiry-notice">
              This verification code expires in <strong>24 hours</strong>
            </div>

            <div class="security-notice">
              <strong>Security Notice:</strong> If you didn't create an account, you can safely ignore this email.
            </div>
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
Hi ${params.name}!

Thanks for signing up for Nextoria Studio. Please use this verification code to activate your account:

VERIFICATION CODE: ${params.token}

Visit this page to enter your code:
${verificationLink}

This code expires in 24 hours.

If you didn't create an account, you can safely ignore this email.

---
Nextoria Studio
  `;

  return sendEmail({
    to: params.to,
    subject: "Verify Your Email Address - Nextoria Studio",
    html,
    text,
  });
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string) {
  // Find user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    return { success: false, error: "User not found" };
  }

  // Check if already verified
  if (user.emailVerified) {
    return { success: false, error: "Email already verified" };
  }

  // Generate new token
  const token = await generateVerificationToken(user.email);

  // Send email
  await sendVerificationEmail({
    to: user.email,
    name: user.name || "User",
    token,
  });

  return { success: true };
}
