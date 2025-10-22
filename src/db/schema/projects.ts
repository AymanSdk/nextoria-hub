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
import { workspaces } from "./workspaces";
import { clients } from "./clients";

/**
 * Project Status Enum
 */
export const projectStatusEnum = pgEnum("project_status", [
  "DRAFT",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
]);

/**
 * Projects Table
 */
export const projects = pgTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Identity
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  description: text("description"),

  // Workspace relationship
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),

  // Ownership & Assignment
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Client relationship (optional)
  clientId: text("client_id").references(() => clients.id, {
    onDelete: "set null",
  }),

  // Status & Tracking
  status: projectStatusEnum("status").default("DRAFT").notNull(),
  priority: integer("priority").default(0), // 0=low, 1=medium, 2=high, 3=critical

  // Dates
  startDate: timestamp("start_date", { mode: "date" }),
  dueDate: timestamp("due_date", { mode: "date" }),
  completedAt: timestamp("completed_at", { mode: "date" }),

  // Budget (optional)
  budgetAmount: integer("budget_amount"), // Stored in cents
  budgetCurrency: varchar("budget_currency", { length: 3 }).default("USD"),

  // Cover/Branding
  coverImage: text("cover_image"),
  color: varchar("color", { length: 7 }).default("#0070f3"),

  // Visibility
  isTemplate: boolean("is_template").default(false),
  isArchived: boolean("is_archived").default(false),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Project Members Table
 * Users assigned to specific projects
 */
export const projectMembers = pgTable("project_members", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Member role in project (optional - can override workspace role)
  canEdit: boolean("can_edit").default(true),

  // Timestamps
  addedAt: timestamp("added_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Milestones Table
 * Project milestones and phases
 */
export const milestones = pgTable("milestones", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  dueDate: timestamp("due_date", { mode: "date" }),
  completedAt: timestamp("completed_at", { mode: "date" }),

  order: integer("order").default(0),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Export types
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectMember = typeof projectMembers.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
