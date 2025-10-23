import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./users";
import { workspaces } from "./workspaces";

/**
 * Activity Logs Table
 * Tracks all activities across the workspace for the homepage feed
 */
export const activityLogs = pgTable("activity_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  // Workspace context
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  
  // Actor (user who performed the action)
  userId: text("user_id")
    .references(() => users.id, { onDelete: "set null" }),
  
  // Activity details
  activityType: varchar("activity_type", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }), // "task", "project", "invoice", etc.
  entityId: text("entity_id"),
  
  // Display info
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  
  // Additional context (JSON)
  metadata: text("metadata"),
  
  // Timestamp
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Export types
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

