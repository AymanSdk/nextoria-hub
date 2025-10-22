import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./users";
import { projects } from "./projects";
import { files } from "./files";
import { tasks } from "./tasks";

/**
 * Approval Status Enum
 */
export const approvalStatusEnum = pgEnum("approval_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REVISION_REQUESTED",
]);

/**
 * Approval Type Enum
 */
export const approvalTypeEnum = pgEnum("approval_type", [
  "DESIGN",
  "CONTENT",
  "DELIVERABLE",
  "INVOICE",
  "EXPENSE",
  "OTHER",
]);

/**
 * Approvals Table
 * Client and internal approval workflows
 */
export const approvals = pgTable("approvals", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Identity
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  // Type
  type: approvalTypeEnum("type").notNull(),
  status: approvalStatusEnum("status").default("PENDING").notNull(),

  // Relationships
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  taskId: text("task_id").references(() => tasks.id, { onDelete: "set null" }),

  // Requester
  requestedBy: text("requested_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Approver
  approverId: text("approver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Response
  respondedAt: timestamp("responded_at", { mode: "date" }),
  responseNotes: text("response_notes"),

  // Due date
  dueDate: timestamp("due_date", { mode: "date" }),

  // Version tracking (for revision requests)
  version: integer("version").default(1).notNull(),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Approval Files Table
 * Files attached to approvals
 */
export const approvalFiles = pgTable("approval_files", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  approvalId: text("approval_id")
    .notNull()
    .references(() => approvals.id, { onDelete: "cascade" }),

  fileId: text("file_id")
    .notNull()
    .references(() => files.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Approval Comments Table
 * Feedback on approval items
 */
export const approvalComments = pgTable("approval_comments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  approvalId: text("approval_id")
    .notNull()
    .references(() => approvals.id, { onDelete: "cascade" }),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  content: text("content").notNull(),

  // Position markers (for design feedback)
  positionX: integer("position_x"),
  positionY: integer("position_y"),
  pageNumber: integer("page_number"),

  isResolved: boolean("is_resolved").default(false),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Export types
export type Approval = typeof approvals.$inferSelect;
export type NewApproval = typeof approvals.$inferInsert;
export type ApprovalFile = typeof approvalFiles.$inferSelect;
export type ApprovalComment = typeof approvalComments.$inferSelect;
