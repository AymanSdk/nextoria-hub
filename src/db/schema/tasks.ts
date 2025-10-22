import { pgTable, text, timestamp, varchar, boolean, pgEnum, integer } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./users";
import { projects } from "./projects";

/**
 * Task Status Enum
 */
export const taskStatusEnum = pgEnum("task_status", [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "BLOCKED",
  "DONE",
  "CANCELLED",
]);

/**
 * Task Priority Enum
 */
export const taskPriorityEnum = pgEnum("task_priority", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

/**
 * Tasks Table
 */
export const tasks = pgTable("tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  // Identity
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  
  // Relationships
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  
  parentTaskId: text("parent_task_id"), // For subtasks
  
  // Assignment
  assigneeId: text("assignee_id")
    .references(() => users.id, { onDelete: "set null" }),
  
  reporterId: text("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Status & Priority
  status: taskStatusEnum("status").default("TODO").notNull(),
  priority: taskPriorityEnum("priority").default("MEDIUM").notNull(),
  
  // Labels (stored as comma-separated tags)
  labels: text("labels"), // e.g., "bug,frontend,urgent"
  
  // Dates
  startDate: timestamp("start_date", { mode: "date" }),
  dueDate: timestamp("due_date", { mode: "date" }),
  completedAt: timestamp("completed_at", { mode: "date" }),
  
  // Time tracking
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  
  // Ordering (for kanban board)
  order: integer("order").default(0),
  
  // Flags
  isArchived: boolean("is_archived").default(false),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Task Dependencies Table
 * For tracking task dependencies (blocked by / blocks)
 */
export const taskDependencies = pgTable("task_dependencies", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  taskId: text("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  
  dependsOnTaskId: text("depends_on_task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Comments Table
 * Comments on tasks/projects
 */
export const comments = pgTable("comments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  // Polymorphic relationships (can comment on tasks or projects)
  taskId: text("task_id")
    .references(() => tasks.id, { onDelete: "cascade" }),
  
  projectId: text("project_id")
    .references(() => projects.id, { onDelete: "cascade" }),
  
  // Author
  authorId: text("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Content
  content: text("content").notNull(),
  
  // Threading
  parentCommentId: text("parent_comment_id"), // For nested replies
  
  // Metadata
  isEdited: boolean("is_edited").default(false),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Task Activity Log
 * Track all changes to tasks for audit trail
 */
export const taskActivity = pgTable("task_activity", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  taskId: text("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  action: varchar("action", { length: 50 }).notNull(), // e.g., "status_changed", "assigned", "commented"
  metadata: text("metadata"), // JSON string for additional data
  
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Export types
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type TaskActivity = typeof taskActivity.$inferSelect;

