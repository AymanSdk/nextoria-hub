import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { workspaces } from "./workspaces";

/**
 * Clients Table
 * External clients that we work with
 */
export const clients = pgTable("clients", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Workspace relationship
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),

  // Client Identity
  name: varchar("name", { length: 255 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  website: varchar("website", { length: 255 }),

  // Address
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }),

  // Business Details
  taxId: varchar("tax_id", { length: 50 }), // VAT/EIN/Tax ID
  industry: varchar("industry", { length: 100 }),

  // Additional Info
  notes: text("notes"),
  logo: text("logo"), // URL to client logo

  // Status
  isActive: boolean("is_active").default(true).notNull(),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Client Contacts Table
 * Multiple contacts per client
 */
export const clientContacts = pgTable("client_contacts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  clientId: text("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  position: varchar("position", { length: 100 }), // Job title

  isPrimary: boolean("is_primary").default(false), // Primary contact

  notes: text("notes"),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Export types
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type ClientContact = typeof clientContacts.$inferSelect;
export type NewClientContact = typeof clientContacts.$inferInsert;
