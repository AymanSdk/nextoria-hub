import { pgTable, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users, roleEnum } from "./users";

/**
 * Workspaces Table
 * Multi-tenant workspace/organization support
 */
export const workspaces = pgTable("workspaces", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  // Identity
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  
  // Branding
  logo: text("logo"),
  description: text("description"),
  
  // Contact
  website: varchar("website", { length: 255 }),
  email: varchar("email", { length: 255 }),
  
  // Owner
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Workspace Members Table
 * Join table for users <-> workspaces with role assignment
 */
export const workspaceMembers = pgTable("workspace_members", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Role specific to this workspace
  role: roleEnum("role").default("CLIENT").notNull(),
  
  // Member status
  isActive: boolean("is_active").default(true).notNull(),
  
  // Timestamps
  joinedAt: timestamp("joined_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Workspace Settings Table
 * Custom settings and preferences per workspace
 */
export const workspaceSettings = pgTable("workspace_settings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  workspaceId: text("workspace_id")
    .notNull()
    .unique()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  
  // Branding
  primaryColor: varchar("primary_color", { length: 7 }).default("#000000"),
  accentColor: varchar("accent_color", { length: 7 }).default("#0070f3"),
  
  // Domain settings
  customDomain: varchar("custom_domain", { length: 255 }),
  
  // Features
  enableClientPortal: boolean("enable_client_portal").default(true),
  enableTimeTracking: boolean("enable_time_tracking").default(true),
  enableInvoicing: boolean("enable_invoicing").default(true),
  
  // Notifications
  emailNotifications: boolean("email_notifications").default(true),
  slackIntegration: boolean("slack_integration").default(false),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Export types
export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type NewWorkspaceMember = typeof workspaceMembers.$inferInsert;
export type WorkspaceSettings = typeof workspaceSettings.$inferSelect;

