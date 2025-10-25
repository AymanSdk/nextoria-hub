import { pgTable, text, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./users";
import { workspaces } from "./workspaces";

/**
 * Audit Log Entity Type Enum
 */
export const auditEntityTypeEnum = pgEnum("audit_entity_type", [
  "USER",
  "WORKSPACE",
  "PROJECT",
  "TASK",
  "INVOICE",
  "FILE",
  "ROLE",
  "INTEGRATION",
  "SETTING",
  "CONTENT",
  "CAMPAIGN",
  "APPROVAL",
  "EXPENSE",
]);

/**
 * Audit Log Action Enum
 */
export const auditActionEnum = pgEnum("audit_action", [
  "CREATE",
  "UPDATE",
  "DELETE",
  "VIEW",
  "DOWNLOAD",
  "SHARE",
  "LOGIN",
  "LOGOUT",
  "ROLE_CHANGE",
  "PERMISSION_CHANGE",
  "PAYMENT",
]);

/**
 * Audit Logs Table
 * Track all critical actions across the system
 */
export const auditLogs = pgTable("audit_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Workspace context
  workspaceId: text("workspace_id").references(() => workspaces.id, {
    onDelete: "cascade",
  }),

  // Actor
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),

  userEmail: varchar("user_email", { length: 255 }), // Stored for deleted users
  userRole: varchar("user_role", { length: 50 }),

  // Action details
  action: auditActionEnum("action").notNull(),
  entityType: auditEntityTypeEnum("entity_type").notNull(),
  entityId: text("entity_id"), // ID of the affected entity

  // Metadata
  description: text("description").notNull(), // Human-readable description
  metadata: text("metadata"), // JSON string with additional context

  // Request context
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),

  // Timestamp
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Export types
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
