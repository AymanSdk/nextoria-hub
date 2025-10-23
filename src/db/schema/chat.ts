import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./users";
import { workspaces } from "./workspaces";
import { projects } from "./projects";

/**
 * Chat Channels Table
 * Chat rooms per workspace or project
 */
export const chatChannels = pgTable("chat_channels", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  // Workspace/Project
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),

  projectId: text("project_id").references(() => projects.id, {
    onDelete: "cascade",
  }),

  // Channel info
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  // Flags
  isPrivate: boolean("is_private").default(false).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),

  // Channel type
  channelType: varchar("channel_type", { length: 50 }).default("general").notNull(),

  // Created by
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Chat Messages Table
 */
export const chatMessages = pgTable("chat_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  channelId: text("channel_id")
    .notNull()
    .references(() => chatChannels.id, { onDelete: "cascade" }),

  // Sender
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Message content
  content: text("content").notNull(),

  // Threading
  parentMessageId: text("parent_message_id"), // For replies

  // Attachments (reference to files table via JSON array of file IDs)
  attachments: text("attachments"), // JSON array

  // Metadata
  isEdited: boolean("is_edited").default(false).notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Chat Channel Members Table
 */
export const chatChannelMembers = pgTable("chat_channel_members", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  channelId: text("channel_id")
    .notNull()
    .references(() => chatChannels.id, { onDelete: "cascade" }),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Last read message (for unread counts)
  lastReadMessageId: text("last_read_message_id"),

  // Timestamps
  joinedAt: timestamp("joined_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Chat Mentions Table
 * Track @mentions in messages
 */
export const chatMentions = pgTable("chat_mentions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  messageId: text("message_id")
    .notNull()
    .references(() => chatMessages.id, { onDelete: "cascade" }),

  mentionedUserId: text("mentioned_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Message Reactions Table
 * Emoji reactions to messages
 */
export const messageReactions = pgTable("message_reactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  messageId: text("message_id")
    .notNull()
    .references(() => chatMessages.id, { onDelete: "cascade" }),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  emoji: varchar("emoji", { length: 10 }).notNull(),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Export types
export type ChatChannel = typeof chatChannels.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type ChatChannelMember = typeof chatChannelMembers.$inferSelect;
export type ChatMention = typeof chatMentions.$inferSelect;
export type MessageReaction = typeof messageReactions.$inferSelect;
