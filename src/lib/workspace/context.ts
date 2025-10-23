import { cookies } from "next/headers";
import { db } from "@/src/db";
import { workspaceMembers, workspaces } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

const WORKSPACE_COOKIE_NAME = "current-workspace-id";

/**
 * Get the current workspace ID from cookies
 */
export async function getCurrentWorkspaceId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(WORKSPACE_COOKIE_NAME)?.value || null;
}

/**
 * Set the current workspace ID in cookies
 */
export async function setCurrentWorkspaceId(workspaceId: string) {
  const cookieStore = await cookies();
  cookieStore.set(WORKSPACE_COOKIE_NAME, workspaceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

/**
 * Clear the current workspace ID from cookies
 */
export async function clearCurrentWorkspaceId() {
  const cookieStore = await cookies();
  cookieStore.delete(WORKSPACE_COOKIE_NAME);
}

/**
 * Get the current workspace for a user
 * If workspace ID is in cookie, use that
 * Otherwise, get user's first workspace (without setting cookie - only read)
 * Note: Cookie can only be set in Server Actions or Route Handlers
 */
export async function getCurrentWorkspace(userId: string) {
  let workspaceId = await getCurrentWorkspaceId();

  // If no workspace in cookie, get user's first workspace
  if (!workspaceId) {
    const [membership] = await db
      .select({
        workspaceId: workspaceMembers.workspaceId,
      })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId))
      .limit(1);

    if (!membership) {
      return null;
    }

    workspaceId = membership.workspaceId;
    // Note: We don't set the cookie here because this function can be called from Server Components
    // The cookie will be set during login or workspace switching (which are API routes)
  }

  // Verify user has access to this workspace
  const [membership] = await db
    .select({
      workspaceId: workspaceMembers.workspaceId,
      role: workspaceMembers.role,
      isActive: workspaceMembers.isActive,
    })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      )
    )
    .limit(1);

  if (!membership || !membership.isActive) {
    // User doesn't have access to this workspace, get their first active workspace
    const [newMembership] = await db
      .select({
        workspaceId: workspaceMembers.workspaceId,
      })
      .from(workspaceMembers)
      .where(
        and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.isActive, true))
      )
      .limit(1);

    if (!newMembership) {
      return null;
    }

    workspaceId = newMembership.workspaceId;
  }

  // Get full workspace details with user's role
  const [result] = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      slug: workspaces.slug,
      description: workspaces.description,
      ownerId: workspaces.ownerId,
      isActive: workspaces.isActive,
      email: workspaces.email,
      website: workspaces.website,
      logo: workspaces.logo,
      createdAt: workspaces.createdAt,
      updatedAt: workspaces.updatedAt,
      role: workspaceMembers.role,
    })
    .from(workspaces)
    .innerJoin(workspaceMembers, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(and(eq(workspaces.id, workspaceId), eq(workspaceMembers.userId, userId)))
    .limit(1);

  return result;
}

/**
 * Get all workspaces for a user
 */
export async function getUserWorkspaces(userId: string) {
  const userWorkspaces = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      slug: workspaces.slug,
      description: workspaces.description,
      ownerId: workspaces.ownerId,
      isActive: workspaces.isActive,
      role: workspaceMembers.role,
    })
    .from(workspaces)
    .innerJoin(workspaceMembers, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, userId));

  return userWorkspaces;
}
