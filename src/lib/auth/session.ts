import { auth } from "./config";
import { cache } from "react";
import { Role } from "@/src/lib/constants/roles";

/**
 * Get current user session (cached for request)
 */
export const getSession = cache(async () => {
  return await auth();
});

/**
 * Get current user or throw error
 */
export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: Role) {
  const session = await getSession();
  return session?.user?.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(roles: Role[]) {
  const session = await getSession();
  return session?.user ? roles.includes(session.user.role) : false;
}

/**
 * Require authentication (throw if not authenticated)
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  return user;
}

/**
 * Require specific role (throw if user doesn't have role)
 */
export async function requireRole(role: Role) {
  const user = await getCurrentUser();

  if (user.role !== role) {
    throw new Error(`Forbidden: ${role} role required`);
  }

  return user;
}

/**
 * Require any of the specified roles
 */
export async function requireAnyRole(roles: Role[]) {
  const user = await getCurrentUser();

  if (!roles.includes(user.role)) {
    throw new Error(`Forbidden: One of [${roles.join(", ")}] roles required`);
  }

  return user;
}

