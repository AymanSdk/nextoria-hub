/**
 * Role-Based Access Control (RBAC) Utilities
 * Middleware and helpers for permission checking
 */

import { Role } from "@/src/lib/constants/roles";

/**
 * Permission Matrix
 * Defines what each role can do
 */
export const permissions = {
  // Admin: Full access to everything
  // 🔒 ONLY admins can connect/disconnect integrations (like Slack/ClickUp model)
  ADMIN: {
    workspaces: ["create", "read", "update", "delete"],
    users: ["create", "read", "update", "delete", "invite", "manage_roles"],
    projects: ["create", "read", "update", "delete"],
    tasks: ["create", "read", "update", "delete"],
    files: ["create", "read", "update", "delete"],
    invoices: ["create", "read", "update", "delete", "send"],
    expenses: ["create", "read", "update", "delete", "approve"],
    campaigns: ["create", "read", "update", "delete"],
    content: ["create", "read", "update", "delete", "publish"],
    approvals: ["create", "read", "update", "approve", "reject"],
    chat: ["create", "read", "update", "delete"],
    integrations: ["connect", "disconnect", "read", "update", "manage_folders"],
    analytics: ["read"],
    auditLogs: ["read"],
  },

  // Developer: Full access to projects and tasks
  // 🔒 Can only READ integrations, cannot connect/disconnect
  DEVELOPER: {
    workspaces: ["read"],
    users: ["read"],
    projects: ["create", "read", "update"],
    tasks: ["create", "read", "update", "delete"],
    files: ["create", "read", "update"],
    invoices: ["read"],
    expenses: ["create", "read"],
    campaigns: ["read"],
    content: ["read"],
    approvals: ["create", "read"],
    chat: ["create", "read", "update"],
    integrations: ["read"], // Can use but not manage
    analytics: ["read"],
    auditLogs: [],
  },

  // Designer: Focus on creative work
  // 🔒 Can only READ integrations, cannot connect/disconnect
  DESIGNER: {
    workspaces: ["read"],
    users: ["read"],
    projects: ["create", "read", "update"],
    tasks: ["create", "read", "update"],
    files: ["create", "read", "update", "delete"],
    invoices: ["read"],
    expenses: ["create", "read"],
    campaigns: ["read"],
    content: ["create", "read", "update"],
    approvals: ["create", "read"],
    chat: ["create", "read", "update"],
    integrations: ["read"], // Can use but not manage
    analytics: ["read"],
    auditLogs: [],
  },

  // Marketer: Focus on campaigns and content
  // 🔒 Can only READ integrations, cannot connect/disconnect
  MARKETER: {
    workspaces: ["read"],
    users: ["read"],
    projects: ["read", "update"],
    tasks: ["create", "read", "update"],
    files: ["create", "read", "update"],
    invoices: ["read"],
    expenses: ["create", "read"],
    campaigns: ["create", "read", "update", "delete"],
    content: ["create", "read", "update", "delete", "publish"],
    approvals: ["create", "read"],
    chat: ["create", "read", "update"],
    integrations: ["read"], // Can use but not manage
    analytics: ["read"],
    auditLogs: [],
  },

  // Client: Limited read access and approvals
  // 🔒 NO access to integrations at all
  CLIENT: {
    workspaces: ["read"],
    users: ["read"],
    projects: ["read"],
    tasks: ["read"],
    files: ["read"],
    invoices: ["read"],
    expenses: [],
    campaigns: ["read"],
    content: ["read"],
    approvals: ["read", "approve", "reject"],
    chat: ["create", "read"],
    integrations: [], // No access to integrations
    analytics: [],
    auditLogs: [],
  },
} as const;

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: Role,
  resource: keyof typeof permissions.ADMIN,
  action: string
): boolean {
  const rolePermissions = permissions[role];
  if (!rolePermissions) return false;

  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;

  return resourcePermissions.includes(action as never);
}

/**
 * Require permission or throw error
 */
export function requirePermission(
  role: Role,
  resource: keyof typeof permissions.ADMIN,
  action: string
): void {
  if (!hasPermission(role, resource, action)) {
    throw new Error(
      `Forbidden: ${role} does not have permission to ${action} ${resource}`
    );
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(role: Role): boolean {
  return role === "ADMIN";
}

/**
 * Check if user can manage users
 */
export function canManageUsers(role: Role): boolean {
  return hasPermission(role, "users", "manage_roles");
}

/**
 * Check if user can approve expenses
 */
export function canApproveExpenses(role: Role): boolean {
  return hasPermission(role, "expenses", "approve");
}

/**
 * Check if user can send invoices
 */
export function canSendInvoices(role: Role): boolean {
  return hasPermission(role, "invoices", "send");
}

/**
 * Check if user can publish content
 */
export function canPublishContent(role: Role): boolean {
  return hasPermission(role, "content", "publish");
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role) {
  return permissions[role] || {};
}
