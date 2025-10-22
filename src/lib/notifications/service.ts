/**
 * Notification Service
 * Create and send notifications (in-app and email)
 */

import { db } from "@/src/db";
import { notifications, notificationPreferences, users } from "@/src/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendEmail } from "@/src/lib/notifications/email";

type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_COMMENTED"
  | "TASK_STATUS_CHANGED"
  | "PROJECT_INVITATION"
  | "INVOICE_SENT"
  | "INVOICE_PAID"
  | "MENTION"
  | "SYSTEM";

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  senderId?: string;
}

/**
 * Create a notification
 */
export async function createNotification(params: CreateNotificationParams) {
  const notification = await db
    .insert(notifications)
    .values({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      actionUrl: params.actionUrl,
      metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
      senderId: params.senderId,
    })
    .returning();

  // Check user's notification preferences
  const [prefs] = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, params.userId));

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, params.userId));

  // Send email if enabled
  if (prefs?.emailEnabled && shouldSendEmail(params.type, prefs)) {
    await sendEmail({
      to: user.email,
      subject: params.title,
      html: generateEmailHtml(params),
    });
  }

  return notification[0];
}

/**
 * Check if email should be sent for this notification type
 */
function shouldSendEmail(
  type: NotificationType,
  prefs: typeof notificationPreferences.$inferSelect
): boolean {
  switch (type) {
    case "TASK_ASSIGNED":
      return prefs.emailTaskAssigned;
    case "TASK_COMMENTED":
      return prefs.emailTaskCommented;
    case "MENTION":
      return prefs.emailMentions;
    case "INVOICE_SENT":
    case "INVOICE_PAID":
      return prefs.emailInvoices;
    default:
      return true;
  }
}

/**
 * Generate email HTML for notification
 */
function generateEmailHtml(params: CreateNotificationParams): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
        .header {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #111;
        }
        .message {
          background: white;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: #0070f3;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">${params.title}</div>
        <div class="message">
          ${params.message}
        </div>
        ${
          params.actionUrl
            ? `<a href="${params.actionUrl}" class="button">View Details</a>`
            : ""
        }
        <div class="footer">
          <p>You're receiving this email because of your notification preferences.</p>
          <p><a href="/settings/notifications">Manage your notification settings</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Notify about task assignment
 */
export async function notifyTaskAssigned(params: {
  taskId: string;
  taskTitle: string;
  assigneeId: string;
  assignedBy: string;
  projectName: string;
}) {
  return createNotification({
    userId: params.assigneeId,
    type: "TASK_ASSIGNED",
    title: "New Task Assigned",
    message: `You've been assigned to "${params.taskTitle}" in ${params.projectName}`,
    actionUrl: `/tasks/${params.taskId}`,
    senderId: params.assignedBy,
    metadata: {
      taskId: params.taskId,
      projectName: params.projectName,
    },
  });
}

/**
 * Notify about task comment
 */
export async function notifyTaskComment(params: {
  taskId: string;
  taskTitle: string;
  commentAuthor: string;
  commentPreview: string;
  notifyUserId: string;
}) {
  return createNotification({
    userId: params.notifyUserId,
    type: "TASK_COMMENTED",
    title: "New Comment",
    message: `${params.commentAuthor} commented on "${params.taskTitle}": ${params.commentPreview}`,
    actionUrl: `/tasks/${params.taskId}`,
    senderId: params.commentAuthor,
    metadata: {
      taskId: params.taskId,
    },
  });
}

/**
 * Notify about mention
 */
export async function notifyMention(params: {
  mentionedUserId: string;
  mentionedBy: string;
  context: string;
  contextUrl: string;
}) {
  return createNotification({
    userId: params.mentionedUserId,
    type: "MENTION",
    title: "You were mentioned",
    message: `${params.mentionedBy} mentioned you in ${params.context}`,
    actionUrl: params.contextUrl,
    senderId: params.mentionedBy,
  });
}

/**
 * Notify about invoice sent
 */
export async function notifyInvoiceSent(params: {
  clientId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate: Date;
}) {
  return createNotification({
    userId: params.clientId,
    type: "INVOICE_SENT",
    title: "New Invoice",
    message: `Invoice ${params.invoiceNumber} for ${params.amount / 100} ${
      params.currency
    } is ready. Due ${params.dueDate.toLocaleDateString()}`,
    actionUrl: `/invoices/${params.invoiceNumber}`,
    metadata: {
      invoiceNumber: params.invoiceNumber,
      amount: params.amount,
    },
  });
}

/**
 * Notify about invoice payment
 */
export async function notifyInvoicePaid(params: {
  userId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
}) {
  return createNotification({
    userId: params.userId,
    type: "INVOICE_PAID",
    title: "Payment Received",
    message: `Payment of ${params.amount / 100} ${
      params.currency
    } received for invoice ${params.invoiceNumber}`,
    actionUrl: `/invoices/${params.invoiceNumber}`,
    metadata: {
      invoiceNumber: params.invoiceNumber,
      amount: params.amount,
    },
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string) {
  return db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.id, notificationId))
    .returning();
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string) {
  return db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.userId, userId))
    .returning();
}

/**
 * Get unread count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );

  return result[0]?.count || 0;
}
