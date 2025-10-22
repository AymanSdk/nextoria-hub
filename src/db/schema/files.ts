import { pgTable, text, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./users";
import { projects } from "./projects";
import { tasks } from "./tasks";
import { clients } from "./clients";

/**
 * Files Table
 * File storage and metadata
 */
export const files = pgTable("files", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // File metadata
  name: varchar("name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull(), // in bytes

  // Storage
  storageKey: text("storage_key").notNull(), // S3 key/path
  storageUrl: text("storage_url").notNull(), // Full URL

  // Relationships (polymorphic)
  projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }),

  taskId: text("task_id").references(() => tasks.id, { onDelete: "cascade" }),

  clientId: text("client_id").references(() => clients.id, { onDelete: "cascade" }),

  // Uploader
  uploadedBy: text("uploaded_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Tags & categorization
  tags: text("tags"), // Comma-separated
  description: text("description"),

  // Versioning
  version: integer("version").default(1),
  previousVersionId: text("previous_version_id"), // Self-reference to previous version

  // Flags
  isPublic: boolean("is_public").default(false),
  isArchived: boolean("is_archived").default(false),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * File Access Log
 * Track file downloads and views
 */
export const fileAccessLog = pgTable("file_access_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  fileId: text("file_id")
    .notNull()
    .references(() => files.id, { onDelete: "cascade" }),

  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),

  action: varchar("action", { length: 50 }).notNull(), // "view", "download"
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Export types
export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type FileAccessLog = typeof fileAccessLog.$inferSelect;
