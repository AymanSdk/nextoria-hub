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
  | "TASK_DUE_SOON"
  | "TASK_OVERDUE"
  | "TASK_COMPLETED"
  | "PROJECT_INVITATION"
  | "PROJECT_STATUS_CHANGED"
  | "PROJECT_MILESTONE"
  | "PROJECT_MEMBER_ADDED"
  | "PROJECT_MEMBER_REMOVED"
  | "INVOICE_SENT"
  | "INVOICE_PAID"
  | "INVOICE_OVERDUE"
  | "PAYMENT_RECEIVED"
  | "FILE_UPLOADED"
  | "FILE_SHARED"
  | "FILE_COMMENTED"
  | "TEAM_MEMBER_JOINED"
  | "WORKSPACE_INVITATION"
  | "CLIENT_REQUEST_SUBMITTED"
  | "CLIENT_MESSAGE"
  | "CLIENT_FILE_UPLOADED"
  | "APPROVAL_REQUESTED"
  | "APPROVAL_APPROVED"
  | "APPROVAL_REJECTED"
  | "CAMPAIGN_LAUNCHED"
  | "CAMPAIGN_COMPLETED"
  | "CAMPAIGN_MILESTONE"
  | "EXPENSE_SUBMITTED"
  | "EXPENSE_APPROVED"
  | "EXPENSE_REJECTED"
  | "MENTION"
  | "CHAT_MESSAGE"
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
    case "TASK_STATUS_CHANGED":
    case "TASK_COMPLETED":
      return prefs.emailTaskStatusChanged;
    case "TASK_DUE_SOON":
    case "TASK_OVERDUE":
      return prefs.emailTaskDueSoon;
    case "PROJECT_INVITATION":
      return prefs.emailProjectInvitation;
    case "PROJECT_STATUS_CHANGED":
    case "PROJECT_MILESTONE":
    case "PROJECT_MEMBER_ADDED":
    case "PROJECT_MEMBER_REMOVED":
      return prefs.emailProjectUpdates;
    case "INVOICE_SENT":
    case "INVOICE_PAID":
    case "INVOICE_OVERDUE":
    case "PAYMENT_RECEIVED":
      return prefs.emailInvoices;
    case "FILE_UPLOADED":
    case "FILE_SHARED":
    case "FILE_COMMENTED":
      return prefs.emailFileShared;
    case "APPROVAL_REQUESTED":
    case "APPROVAL_APPROVED":
    case "APPROVAL_REJECTED":
      return prefs.emailApprovals;
    case "MENTION":
    case "CHAT_MESSAGE":
      return prefs.emailMentions;
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
 * Notify about task status change
 */
export async function notifyTaskStatusChanged(params: {
  taskId: string;
  taskTitle: string;
  notifyUserId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
}) {
  return createNotification({
    userId: params.notifyUserId,
    type: "TASK_STATUS_CHANGED",
    title: "Task Status Updated",
    message: `"${params.taskTitle}" moved from ${params.oldStatus} to ${params.newStatus}`,
    actionUrl: `/tasks/${params.taskId}`,
    senderId: params.changedBy,
    metadata: {
      taskId: params.taskId,
      oldStatus: params.oldStatus,
      newStatus: params.newStatus,
    },
  });
}

/**
 * Notify about task due soon
 */
export async function notifyTaskDueSoon(params: {
  taskId: string;
  taskTitle: string;
  assigneeId: string;
  dueDate: Date;
}) {
  return createNotification({
    userId: params.assigneeId,
    type: "TASK_DUE_SOON",
    title: "Task Due Soon",
    message: `"${params.taskTitle}" is due ${params.dueDate.toLocaleDateString()}`,
    actionUrl: `/tasks/${params.taskId}`,
    metadata: {
      taskId: params.taskId,
      dueDate: params.dueDate.toISOString(),
    },
  });
}

/**
 * Notify about project member added
 */
export async function notifyProjectMemberAdded(params: {
  projectId: string;
  projectName: string;
  projectSlug: string;
  newMemberId: string;
  addedBy: string;
}) {
  return createNotification({
    userId: params.newMemberId,
    type: "PROJECT_MEMBER_ADDED",
    title: "Added to Project",
    message: `You've been added to the project "${params.projectName}"`,
    actionUrl: `/projects/${params.projectSlug}`,
    senderId: params.addedBy,
    metadata: {
      projectId: params.projectId,
      projectName: params.projectName,
    },
  });
}

/**
 * Notify about project status change
 */
export async function notifyProjectStatusChanged(params: {
  projectId: string;
  projectName: string;
  projectSlug: string;
  memberIds: string[];
  oldStatus: string;
  newStatus: string;
  changedBy: string;
}) {
  const notifications = await Promise.all(
    params.memberIds.map((memberId) =>
      createNotification({
        userId: memberId,
        type: "PROJECT_STATUS_CHANGED",
        title: "Project Status Updated",
        message: `"${params.projectName}" status changed from ${params.oldStatus} to ${params.newStatus}`,
        actionUrl: `/projects/${params.projectSlug}`,
        senderId: params.changedBy,
        metadata: {
          projectId: params.projectId,
          oldStatus: params.oldStatus,
          newStatus: params.newStatus,
        },
      })
    )
  );
  return notifications;
}

/**
 * Notify about file upload
 */
export async function notifyFileUploaded(params: {
  fileId: string;
  fileName: string;
  uploadedBy: string;
  notifyUserIds: string[];
  entityType: string;
  entityName: string;
  actionUrl: string;
}) {
  const notifications = await Promise.all(
    params.notifyUserIds.map((userId) =>
      createNotification({
        userId,
        type: "FILE_UPLOADED",
        title: "New File Uploaded",
        message: `${params.fileName} was uploaded to ${params.entityName}`,
        actionUrl: params.actionUrl,
        senderId: params.uploadedBy,
        metadata: {
          fileId: params.fileId,
          fileName: params.fileName,
          entityType: params.entityType,
        },
      })
    )
  );
  return notifications;
}

/**
 * Notify about approval request
 */
export async function notifyApprovalRequested(params: {
  approvalId: string;
  title: string;
  approverId: string;
  requestedBy: string;
}) {
  return createNotification({
    userId: params.approverId,
    type: "APPROVAL_REQUESTED",
    title: "Approval Requested",
    message: `Your approval is needed for "${params.title}"`,
    actionUrl: `/approvals/${params.approvalId}`,
    senderId: params.requestedBy,
    metadata: {
      approvalId: params.approvalId,
    },
  });
}

/**
 * Notify about approval decision
 */
export async function notifyApprovalDecision(params: {
  approvalId: string;
  title: string;
  requesterId: string;
  decision: "APPROVED" | "REJECTED";
  decidedBy: string;
}) {
  return createNotification({
    userId: params.requesterId,
    type: params.decision === "APPROVED" ? "APPROVAL_APPROVED" : "APPROVAL_REJECTED",
    title: params.decision === "APPROVED" ? "Approval Granted" : "Approval Rejected",
    message: `Your request for "${params.title}" was ${params.decision.toLowerCase()}`,
    actionUrl: `/approvals/${params.approvalId}`,
    senderId: params.decidedBy,
    metadata: {
      approvalId: params.approvalId,
      decision: params.decision,
    },
  });
}

/**
 * Notify about expense submission
 */
export async function notifyExpenseSubmitted(params: {
  expenseId: string;
  title: string;
  amount: number;
  approverIds: string[];
  submittedBy: string;
}) {
  const notifications = await Promise.all(
    params.approverIds.map((approverId) =>
      createNotification({
        userId: approverId,
        type: "EXPENSE_SUBMITTED",
        title: "Expense Submitted",
        message: `New expense "${params.title}" ($${params.amount / 100}) needs approval`,
        actionUrl: `/expenses/${params.expenseId}`,
        senderId: params.submittedBy,
        metadata: {
          expenseId: params.expenseId,
          amount: params.amount,
        },
      })
    )
  );
  return notifications;
}

/**
 * Notify about expense decision
 */
export async function notifyExpenseDecision(params: {
  expenseId: string;
  title: string;
  submitterId: string;
  decision: "APPROVED" | "REJECTED";
  decidedBy: string;
}) {
  return createNotification({
    userId: params.submitterId,
    type: params.decision === "APPROVED" ? "EXPENSE_APPROVED" : "EXPENSE_REJECTED",
    title: params.decision === "APPROVED" ? "Expense Approved" : "Expense Rejected",
    message: `Your expense "${params.title}" was ${params.decision.toLowerCase()}`,
    actionUrl: `/expenses/${params.expenseId}`,
    senderId: params.decidedBy,
    metadata: {
      expenseId: params.expenseId,
      decision: params.decision,
    },
  });
}

/**
 * Notify about campaign launch
 */
export async function notifyCampaignLaunched(params: {
  campaignId: string;
  campaignName: string;
  teamMemberIds: string[];
  launchedBy: string;
}) {
  const notifications = await Promise.all(
    params.teamMemberIds.map((memberId) =>
      createNotification({
        userId: memberId,
        type: "CAMPAIGN_LAUNCHED",
        title: "Campaign Launched",
        message: `"${params.campaignName}" campaign has been launched`,
        actionUrl: `/campaigns/${params.campaignId}`,
        senderId: params.launchedBy,
        metadata: {
          campaignId: params.campaignId,
          campaignName: params.campaignName,
        },
      })
    )
  );
  return notifications;
}

/**
 * Notify about client request
 */
export async function notifyClientRequest(params: {
  requestId: string;
  title: string;
  clientName: string;
  adminIds: string[];
  requestedBy: string;
}) {
  const notifications = await Promise.all(
    params.adminIds.map((adminId) =>
      createNotification({
        userId: adminId,
        type: "CLIENT_REQUEST_SUBMITTED",
        title: "New Client Request",
        message: `${params.clientName} submitted a request: "${params.title}"`,
        actionUrl: `/project-requests/${params.requestId}`,
        senderId: params.requestedBy,
        metadata: {
          requestId: params.requestId,
        },
      })
    )
  );
  return notifications;
}

/**
 * Notify about team member joined
 */
export async function notifyTeamMemberJoined(params: {
  newMemberId: string;
  newMemberName: string;
  role: string;
  teamMemberIds: string[];
}) {
  const notifications = await Promise.all(
    params.teamMemberIds
      .filter((id) => id !== params.newMemberId)
      .map((memberId) =>
        createNotification({
          userId: memberId,
          type: "TEAM_MEMBER_JOINED",
          title: "New Team Member",
          message: `${params.newMemberName} joined as ${params.role}`,
          actionUrl: `/team`,
          senderId: params.newMemberId,
          metadata: {
            newMemberId: params.newMemberId,
            role: params.role,
          },
        })
      )
  );
  return notifications;
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
