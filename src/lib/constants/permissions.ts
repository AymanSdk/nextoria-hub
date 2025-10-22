import { Role, ROLES } from "./roles";

/**
 * Permission Constants
 * Define granular permissions for different resources
 */

export const PERMISSIONS = {
  // User & Auth
  MANAGE_USERS: "MANAGE_USERS",
  INVITE_USERS: "INVITE_USERS",
  DELETE_USERS: "DELETE_USERS",
  
  // Workspace
  MANAGE_WORKSPACE: "MANAGE_WORKSPACE",
  DELETE_WORKSPACE: "DELETE_WORKSPACE",
  
  // Projects
  CREATE_PROJECT: "CREATE_PROJECT",
  EDIT_PROJECT: "EDIT_PROJECT",
  DELETE_PROJECT: "DELETE_PROJECT",
  VIEW_PROJECT: "VIEW_PROJECT",
  
  // Tasks
  CREATE_TASK: "CREATE_TASK",
  EDIT_TASK: "EDIT_TASK",
  DELETE_TASK: "DELETE_TASK",
  ASSIGN_TASK: "ASSIGN_TASK",
  
  // Files
  UPLOAD_FILE: "UPLOAD_FILE",
  DELETE_FILE: "DELETE_FILE",
  
  // Billing
  MANAGE_BILLING: "MANAGE_BILLING",
  VIEW_INVOICES: "VIEW_INVOICES",
  CREATE_INVOICE: "CREATE_INVOICE",
  
  // Analytics
  VIEW_ANALYTICS: "VIEW_ANALYTICS",
  
  // Integrations
  MANAGE_INTEGRATIONS: "MANAGE_INTEGRATIONS",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Role-Permission Mapping
 * Define which roles have which permissions
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  
  [ROLES.DEVELOPER]: [
    PERMISSIONS.CREATE_PROJECT,
    PERMISSIONS.EDIT_PROJECT,
    PERMISSIONS.VIEW_PROJECT,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK,
    PERMISSIONS.ASSIGN_TASK,
    PERMISSIONS.UPLOAD_FILE,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_INVOICES,
  ],
  
  [ROLES.DESIGNER]: [
    PERMISSIONS.VIEW_PROJECT,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK,
    PERMISSIONS.UPLOAD_FILE,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  
  [ROLES.MARKETER]: [
    PERMISSIONS.VIEW_PROJECT,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK,
    PERMISSIONS.UPLOAD_FILE,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_INVOICES,
  ],
  
  [ROLES.CLIENT]: [
    PERMISSIONS.VIEW_PROJECT,
    PERMISSIONS.VIEW_INVOICES,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

