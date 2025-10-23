import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { workspaces } from "./workspaces";
import { users } from "./users";
import { projects } from "./projects";
import { clients } from "./clients";
import { tasks } from "./tasks";

/**
 * Google Drive Files Table
 * Links to Google Drive files from projects, clients, and tasks
 */
export const driveFiles = pgTable("drive_files", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),

  // Google Drive file details
  driveFileId: text("drive_file_id").notNull(),
  fileName: varchar("file_name", { length: 500 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  webViewLink: text("web_view_link").notNull(),
  size: varchar("size", { length: 50 }),

  // Link details
  linkType: varchar("link_type", { length: 20 }).notNull(), // project, client, task

  // Linked entities (only one will be set based on linkType)
  projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }),
  clientId: text("client_id").references(() => clients.id, { onDelete: "cascade" }),
  taskId: text("task_id").references(() => tasks.id, { onDelete: "cascade" }),

  // Metadata
  description: text("description"),
  tags: text("tags"), // Comma-separated tags

  // Linked by
  linkedBy: text("linked_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Export types
export type DriveFile = typeof driveFiles.$inferSelect;
export type NewDriveFile = typeof driveFiles.$inferInsert;
