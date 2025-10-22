/**
 * Role-Based Access Control (RBAC) Constants
 * 
 * These roles define access levels across the Nextoria Hub platform.
 * Roles are hierarchical and extensible for future requirements.
 */

export const ROLES = {
  ADMIN: "ADMIN",
  DEVELOPER: "DEVELOPER",
  DESIGNER: "DESIGNER",
  MARKETER: "MARKETER",
  CLIENT: "CLIENT",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Role Hierarchy & Permissions
 * Higher levels inherit permissions from lower levels
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 5,
  DEVELOPER: 4,
  DESIGNER: 3,
  MARKETER: 3,
  CLIENT: 1,
};

/**
 * Role Descriptions
 */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN: "Full system access - manage everything",
  DEVELOPER: "Code & technical tasks - manage development workflows",
  DESIGNER: "Assets & creative work - manage design deliverables",
  MARKETER: "Campaigns & analytics - manage marketing operations",
  CLIENT: "Portal-only access - view/approve deliverables",
};

/**
 * Check if a role has permission based on hierarchy
 */
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Get all roles a user can manage (lower in hierarchy)
 */
export function getManageableRoles(userRole: Role): Role[] {
  const userLevel = ROLE_HIERARCHY[userRole];
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, level]) => level < userLevel)
    .map(([role]) => role as Role);
}

/**
 * Team member roles (Nextoria team)
 */
export const TEAM_ROLES: Role[] = [
  ROLES.ADMIN,
  ROLES.DEVELOPER,
  ROLES.DESIGNER,
  ROLES.MARKETER,
];

/**
 * Check if a role is a team member (not a client)
 */
export function isTeamMember(role: Role): boolean {
  return TEAM_ROLES.includes(role);
}

/**
 * Check if a role is a client
 */
export function isClient(role: Role): boolean {
  return role === ROLES.CLIENT;
}

