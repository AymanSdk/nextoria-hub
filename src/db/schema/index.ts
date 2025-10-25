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

// Project Requests
export * from "./project-requests";

// Clients
export * from "./clients";

// Files
export * from "./files";

// Drive Files
export * from "./drive-files";

// Billing
export * from "./invoices";

// Notifications
export * from "./notifications";

// Activity Logs
export * from "./activity-logs";

// Integrations
export * from "./integrations";

// Chat
export * from "./chat";

// Audit Logs
export * from "./audit-logs";

// Campaigns & Marketing
export * from "./campaigns";
export * from "./content-calendar";

// Finance
export * from "./expenses";

// Approvals
export * from "./approvals";

// Recurring Tasks
export * from "./recurring-tasks";

// Whiteboards
export * from "./whiteboards";

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
import {
  chatChannels,
  chatMessages,
  chatChannelMembers,
  chatMentions,
  messageReactions,
} from "./chat";
import { auditLogs } from "./audit-logs";
import { campaigns, campaignUpdates } from "./campaigns";
import { contentCalendar } from "./content-calendar";
import { expenses } from "./expenses";
import { approvals, approvalFiles, approvalComments } from "./approvals";
import { recurringTasks } from "./recurring-tasks";
import { clients, clientContacts } from "./clients";
import { projectRequests, projectRequestComments } from "./project-requests";
import { activityLogs } from "./activity-logs";
import { whiteboards } from "./whiteboards";

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
  projectRequests: many(projectRequests),
  whiteboards: many(whiteboards),
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
  projectRequests: many(projectRequests),
  whiteboards: many(whiteboards),
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
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
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
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
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

/**
 * Client Relations
 */
export const clientsRelations = relations(clients, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [clients.workspaceId],
    references: [workspaces.id],
  }),
  projects: many(projects),
  contacts: many(clientContacts),
  projectRequests: many(projectRequests),
  files: many(files),
  invoices: many(invoices),
}));

/**
 * Project Request Relations
 */
export const projectRequestsRelations = relations(projectRequests, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projectRequests.workspaceId],
    references: [workspaces.id],
  }),
  requestedBy: one(users, {
    fields: [projectRequests.requestedBy],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [projectRequests.clientId],
    references: [clients.id],
  }),
  reviewedBy: one(users, {
    fields: [projectRequests.reviewedBy],
    references: [users.id],
  }),
  comments: many(projectRequestComments),
}));

/**
 * File Relations
 */
export const filesRelations = relations(files, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [files.uploadedBy],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [files.projectId],
    references: [projects.id],
  }),
  task: one(tasks, {
    fields: [files.taskId],
    references: [tasks.id],
  }),
  client: one(clients, {
    fields: [files.clientId],
    references: [clients.id],
  }),
}));

/**
 * Whiteboard Relations
 */
export const whiteboardsRelations = relations(whiteboards, ({ one }) => ({
  createdBy: one(users, {
    fields: [whiteboards.createdBy],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [whiteboards.workspaceId],
    references: [workspaces.id],
  }),
}));
