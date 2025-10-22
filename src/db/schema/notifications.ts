import { pgTable, text, timestamp, varchar, boolean, pgEnum } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./users";

/**
 * Notification Type Enum
 */
export const notificationTypeEnum = pgEnum("notification_type", [
  "TASK_ASSIGNED",
  "TASK_COMMENTED",
  "TASK_STATUS_CHANGED",
  "PROJECT_INVITATION",
  "INVOICE_SENT",
  "INVOICE_PAID",
  "MENTION",
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
  
  // Email notifications
  emailEnabled: boolean("email_enabled").default(true).notNull(),
  emailTaskAssigned: boolean("email_task_assigned").default(true).notNull(),
  emailTaskCommented: boolean("email_task_commented").default(true).notNull(),
  emailMentions: boolean("email_mentions").default(true).notNull(),
  emailInvoices: boolean("email_invoices").default(true).notNull(),
  
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

