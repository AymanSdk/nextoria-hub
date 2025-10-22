import { pgTable, text, timestamp, varchar, integer, pgEnum, boolean } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./users";
import { projects } from "./projects";
import { workspaces } from "./workspaces";

/**
 * Invoice Status Enum
 */
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "DRAFT",
  "SENT",
  "VIEWED",
  "PAID",
  "OVERDUE",
  "CANCELLED",
]);

/**
 * Invoices Table
 */
export const invoices = pgTable("invoices", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  // Invoice number (auto-incremented, formatted like INV-2024-001)
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  
  // Relationships
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  
  projectId: text("project_id")
    .references(() => projects.id, { onDelete: "set null" }),
  
  clientId: text("client_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Status
  status: invoiceStatusEnum("status").default("DRAFT").notNull(),
  
  // Amounts (stored in cents)
  subtotal: integer("subtotal").notNull(),
  taxRate: integer("tax_rate").default(0), // Percentage * 100 (e.g., 10% = 1000)
  taxAmount: integer("tax_amount").default(0),
  total: integer("total").notNull(),
  
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  
  // Dates
  issueDate: timestamp("issue_date", { mode: "date" }).defaultNow().notNull(),
  dueDate: timestamp("due_date", { mode: "date" }).notNull(),
  paidAt: timestamp("paid_at", { mode: "date" }),
  
  // Notes
  notes: text("notes"),
  terms: text("terms"),
  
  // Payment
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  
  // Metadata
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Invoice Line Items Table
 */
export const invoiceLineItems = pgTable("invoice_line_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  
  description: text("description").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: integer("unit_price").notNull(), // In cents
  amount: integer("amount").notNull(), // quantity * unitPrice
  
  order: integer("order").default(0),
  
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Payments Table
 * Track payment history
 */
export const payments = pgTable("payments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  
  amount: integer("amount").notNull(), // In cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  
  // Payment method
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // "stripe", "manual", etc.
  
  // Stripe
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),
  
  // Status
  isSuccessful: boolean("is_successful").default(true).notNull(),
  
  // Notes
  notes: text("notes"),
  
  // Timestamps
  paidAt: timestamp("paid_at", { mode: "date" }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Export types
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;

