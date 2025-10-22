import { pgTable, text, timestamp, varchar, integer, pgEnum } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./users";
import { workspaces } from "./workspaces";
import { clients } from "./clients";

/**
 * Project Request Status Enum
 */
export const projectRequestStatusEnum = pgEnum("project_request_status", [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
]);

/**
 * Project Request Priority Enum
 */
export const projectRequestPriorityEnum = pgEnum("project_request_priority", [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

/**
 * Project Requests Table
 * Allows clients to submit project requests for agency review
 */
export const projectRequests = pgTable("project_requests", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Request Identity
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),

  // Workspace relationship
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),

  // Client who submitted the request
  requestedBy: text("requested_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Associated client record
  clientId: text("client_id").references(() => clients.id, {
    onDelete: "set null",
  }),

  // Request Details
  priority: projectRequestPriorityEnum("priority").default("MEDIUM").notNull(),
  status: projectRequestStatusEnum("status").default("PENDING").notNull(),

  // Budget Information (optional)
  estimatedBudget: integer("estimated_budget"), // Stored in cents
  budgetCurrency: varchar("budget_currency", { length: 3 }).default("USD"),

  // Timeline (optional)
  desiredStartDate: timestamp("desired_start_date", { mode: "date" }),
  desiredDeadline: timestamp("desired_deadline", { mode: "date" }),

  // Additional Requirements
  objectives: text("objectives"), // What client wants to achieve
  targetAudience: text("target_audience"), // Who is the target audience
  deliverables: text("deliverables"), // Expected deliverables
  additionalNotes: text("additional_notes"), // Any other information

  // Review & Response
  reviewedBy: text("reviewed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  reviewedAt: timestamp("reviewed_at", { mode: "date" }),
  reviewNotes: text("review_notes"), // Admin's notes/feedback

  // If approved, link to created project
  createdProjectId: text("created_project_id"),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Project Request Comments Table
 * Allow back-and-forth communication about the request
 */
export const projectRequestComments = pgTable("project_request_comments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  requestId: text("request_id")
    .notNull()
    .references(() => projectRequests.id, { onDelete: "cascade" }),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  content: text("content").notNull(),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});
