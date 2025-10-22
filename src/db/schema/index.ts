/**
 * Database Schema Index
 * Central export for all Drizzle ORM schemas
 */

// Users & Auth
export * from "./users";

// Workspaces
export * from "./workspaces";

// Projects & Tasks
export * from "./projects";
export * from "./tasks";

// Files
export * from "./files";

// Billing
export * from "./invoices";

// Notifications
export * from "./notifications";

// Integrations
export * from "./integrations";

// Chat
export * from "./chat";

// Relations (for Drizzle relational queries)
import { relations } from "drizzle-orm";
import { users, accounts, sessions, invitations } from "./users";
import { workspaces, workspaceMembers, workspaceSettings } from "./workspaces";
import { projects, projectMembers, milestones } from "./projects";
import { tasks, comments, taskDependencies, taskActivity } from "./tasks";
import { files, fileAccessLog } from "./files";
import { invoices, invoiceLineItems, payments } from "./invoices";
import { notifications, notificationPreferences } from "./notifications";
import { integrations, webhooks, webhookDeliveries } from "./integrations";
import { chatChannels, chatMessages, chatChannelMembers } from "./chat";

/**
 * User Relations
 */
export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  ownedWorkspaces: many(workspaces),
  workspaceMemberships: many(workspaceMembers),
  ownedProjects: many(projects),
  projectMemberships: many(projectMembers),
  assignedTasks: many(tasks),
  createdTasks: many(tasks),
  comments: many(comments),
  uploadedFiles: many(files),
  createdInvoices: many(invoices),
  notifications: many(notifications),
  notificationPreferences: one(notificationPreferences),
  chatMessages: many(chatMessages),
}));

/**
 * Workspace Relations
 */
export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id],
  }),
  members: many(workspaceMembers),
  settings: one(workspaceSettings),
  projects: many(projects),
  integrations: many(integrations),
  chatChannels: many(chatChannels),
}));

/**
 * Project Relations
 */
export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  members: many(projectMembers),
  tasks: many(tasks),
  milestones: many(milestones),
  files: many(files),
  invoices: many(invoices),
  chatChannels: many(chatChannels),
  comments: many(comments),
}));

/**
 * Task Relations
 */
export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
  }),
  reporter: one(users, {
    fields: [tasks.reporterId],
    references: [users.id],
  }),
  parentTask: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id],
  }),
  subtasks: many(tasks),
  comments: many(comments),
  files: many(files),
  activity: many(taskActivity),
  dependencies: many(taskDependencies),
}));

/**
 * Invoice Relations
 */
export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [invoices.workspaceId],
    references: [workspaces.id],
  }),
  project: one(projects, {
    fields: [invoices.projectId],
    references: [projects.id],
  }),
  client: one(users, {
    fields: [invoices.clientId],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [invoices.createdBy],
    references: [users.id],
  }),
  lineItems: many(invoiceLineItems),
  payments: many(payments),
}));

/**
 * Chat Relations
 */
export const chatChannelsRelations = relations(chatChannels, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [chatChannels.workspaceId],
    references: [workspaces.id],
  }),
  project: one(projects, {
    fields: [chatChannels.projectId],
    references: [projects.id],
  }),
  creator: one(users, {
    fields: [chatChannels.createdBy],
    references: [users.id],
  }),
  messages: many(chatMessages),
  members: many(chatChannelMembers),
}));

