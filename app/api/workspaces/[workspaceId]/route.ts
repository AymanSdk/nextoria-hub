import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import {
  workspaces,
  workspaceMembers,
  projects,
  tasks,
  invoices,
  chatChannels,
} from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/src/lib/auth/rbac";
import { z } from "zod";

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  website: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
});

/**
 * PATCH /api/workspaces/[workspaceId]
 * Update workspace details
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { workspaceId: id } = await params;

    // Only admins can update workspaces
    if (!isAdmin(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verify user is a member of this workspace
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, user.id))
      .limit(1);

    if (!membership || membership.workspaceId !== id) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = updateWorkspaceSchema.parse(body);

    // Update workspace
    const [updatedWorkspace] = await db
      .update(workspaces)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, id))
      .returning();

    return NextResponse.json(updatedWorkspace);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error updating workspace:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update workspace" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]
 * Delete workspace (owner only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { workspaceId: id } = await params;

    // Only admins can delete workspaces
    if (!isAdmin(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get workspace and verify ownership
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id))
      .limit(1);

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    if (workspace.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Only the workspace owner can delete it" },
        { status: 403 }
      );
    }

    // Delete workspace (cascade will handle related records)
    await db.delete(workspaces).where(eq(workspaces.id, id));

    return NextResponse.json({
      success: true,
      message: "Workspace deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting workspace:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete workspace" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workspaces/[workspaceId]
 * Get workspace details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { workspaceId: id } = await params;

    // Verify user is a member of this workspace
    const [membership] = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, user.id))
      .limit(1);

    if (!membership || membership.workspaceId !== id) {
      return NextResponse.json(
        { error: "You are not a member of this workspace" },
        { status: 403 }
      );
    }

    // Get workspace details
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id))
      .limit(1);

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    return NextResponse.json(workspace);
  } catch (error: any) {
    console.error("Error fetching workspace:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch workspace" },
      { status: 500 }
    );
  }
}
