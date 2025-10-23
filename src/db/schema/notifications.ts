import { pgTable, text, timestamp, varchar, boolean, pgEnum } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./users";

/**
 * Notification Type Enum
 */
export const notificationTypeEnum = pgEnum("notification_type", [
  // Tasks
  "TASK_ASSIGNED",
  "TASK_COMMENTED",
  "TASK_STATUS_CHANGED",
  "TASK_DUE_SOON",
  "TASK_OVERDUE",
  "TASK_COMPLETED",
  // Projects
  "PROJECT_INVITATION",
  "PROJECT_STATUS_CHANGED",
  "PROJECT_MILESTONE",
  "PROJECT_MEMBER_ADDED",
  "PROJECT_MEMBER_REMOVED",
  // Invoices & Payments
  "INVOICE_SENT",
  "INVOICE_PAID",
  "INVOICE_OVERDUE",
  "PAYMENT_RECEIVED",
  // Files & Documents
  "FILE_UPLOADED",
  "FILE_SHARED",
  "FILE_COMMENTED",
  // Team & Workspace
  "TEAM_MEMBER_JOINED",
  "WORKSPACE_INVITATION",
  // Clients
  "CLIENT_REQUEST_SUBMITTED",
  "CLIENT_MESSAGE",
  "CLIENT_FILE_UPLOADED",
  // Approvals
  "APPROVAL_REQUESTED",
  "APPROVAL_APPROVED",
  "APPROVAL_REJECTED",
  // Campaigns
  "CAMPAIGN_LAUNCHED",
  "CAMPAIGN_COMPLETED",
  "CAMPAIGN_MILESTONE",
  // Expenses
  "EXPENSE_SUBMITTED",
  "EXPENSE_APPROVED",
  "EXPENSE_REJECTED",
  // Chat & Mentions
  "MENTION",
  "CHAT_MESSAGE",
  // System
  "SYSTEM",
]);

/**
 * Notifications Table
 */
export const notifications = pgTable("notifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  // Recipient
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Type & content
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // Action link
  actionUrl: text("action_url"),
  
  // Metadata (JSON string)
  metadata: text("metadata"),
  
  // Status
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at", { mode: "date" }),
  
  // Sender (optional)
  senderId: text("sender_id")
    .references(() => users.id, { onDelete: "set null" }),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Notification Preferences Table
 * User preferences for notification delivery
 */
export const notificationPreferences = pgTable("notification_preferences", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Email notifications - Global
  emailEnabled: boolean("email_enabled").default(true).notNull(),
  
  // Task notifications
  emailTaskAssigned: boolean("email_task_assigned").default(true).notNull(),
  emailTaskCommented: boolean("email_task_commented").default(true).notNull(),
  emailTaskStatusChanged: boolean("email_task_status_changed").default(false).notNull(),
  emailTaskDueSoon: boolean("email_task_due_soon").default(true).notNull(),
  
  // Project notifications
  emailProjectInvitation: boolean("email_project_invitation").default(true).notNull(),
  emailProjectUpdates: boolean("email_project_updates").default(true).notNull(),
  
  // Invoice notifications
  emailInvoices: boolean("email_invoices").default(true).notNull(),
  
  // File notifications
  emailFileShared: boolean("email_file_shared").default(true).notNull(),
  
  // Approval notifications
  emailApprovals: boolean("email_approvals").default(true).notNull(),
  
  // Mention notifications
  emailMentions: boolean("email_mentions").default(true).notNull(),
  
  // In-app notifications
  inAppEnabled: boolean("in_app_enabled").default(true).notNull(),
  
  // Digest
  dailyDigest: boolean("daily_digest").default(false).notNull(),
  weeklyDigest: boolean("weekly_digest").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Export types
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;

