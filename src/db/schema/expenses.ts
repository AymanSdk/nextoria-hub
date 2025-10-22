import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./users";
import { projects } from "./projects";
import { workspaces } from "./workspaces";

/**
 * Expense Category Enum
 */
export const expenseCategoryEnum = pgEnum("expense_category", [
  "SOFTWARE",
  "HARDWARE",
  "OFFICE_SUPPLIES",
  "TRAVEL",
  "MARKETING",
  "PROFESSIONAL_SERVICES",
  "UTILITIES",
  "SALARIES",
  "CONTRACTOR",
  "OTHER",
]);

/**
 * Expense Status Enum
 */
export const expenseStatusEnum = pgEnum("expense_status", [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "REIMBURSED",
]);

/**
 * Expenses Table
 * Track business expenses and project costs
 */
export const expenses = pgTable("expenses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Relationships
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),

  projectId: text("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),

  // Expense details
  description: text("description").notNull(),
  category: expenseCategoryEnum("category").notNull(),
  status: expenseStatusEnum("status").default("DRAFT").notNull(),

  // Amount
  amount: integer("amount").notNull(), // In cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),

  // Date
  expenseDate: timestamp("expense_date", { mode: "date" }).notNull(),

  // Vendor
  vendor: varchar("vendor", { length: 255 }),

  // Receipt
  receiptUrl: text("receipt_url"),

  // Submitter & Approver
  submittedBy: text("submitted_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  approvedBy: text("approved_by").references(() => users.id, {
    onDelete: "set null",
  }),

  approvedAt: timestamp("approved_at", { mode: "date" }),

  // Reimbursement
  isReimbursable: boolean("is_reimbursable").default(false).notNull(),
  reimbursedAt: timestamp("reimbursed_at", { mode: "date" }),

  // Notes
  notes: text("notes"),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Export types
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
