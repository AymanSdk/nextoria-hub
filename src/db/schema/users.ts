import { pgTable, text, timestamp, varchar, boolean, pgEnum } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

/**
 * Role Enum
 */
export const roleEnum = pgEnum("role", [
  "ADMIN",
  "DEVELOPER",
  "DESIGNER",
  "MARKETER",
  "CLIENT",
]);

/**
 * Users Table
 * Core authentication and user identity
 */
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  // Identity
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  name: varchar("name", { length: 255 }),
  image: text("image"),
  
  // Auth
  password: text("password"), // Hashed password for email/password auth
  
  // Role & Status
  role: roleEnum("role").default("CLIENT").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  
  // Metadata
  bio: text("bio"),
  phone: varchar("phone", { length: 50 }),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  
  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Accounts Table (OAuth Providers)
 * Managed by NextAuth for OAuth connections
 */
export const accounts = pgTable("accounts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  type: varchar("type", { length: 50 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: timestamp("expires_at", { mode: "date" }),
  token_type: varchar("token_type", { length: 50 }),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
  
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Sessions Table
 * Managed by NextAuth for session tracking
 */
export const sessions = pgTable("sessions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  sessionToken: text("session_token").notNull().unique(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  expires: timestamp("expires", { mode: "date" }).notNull(),
  
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Verification Tokens Table
 * For email verification and magic links
 */
export const verificationTokens = pgTable("verification_tokens", {
  identifier: varchar("identifier", { length: 255 }).notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Password Reset Tokens Table
 * For forgot password flow
 */
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  token: text("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * User Invitations Table
 * For inviting new users to workspaces
 */
export const invitations = pgTable("invitations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  
  email: varchar("email", { length: 255 }).notNull(),
  role: roleEnum("role").default("CLIENT").notNull(),
  workspaceId: text("workspace_id").notNull(), // FK to workspaces
  invitedBy: text("invited_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  
  token: text("token").notNull().unique(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  acceptedAt: timestamp("accepted_at", { mode: "date" }),
  
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;

