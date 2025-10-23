import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { workspaceMembers, workspaces } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { isAdmin } from "@/src/lib/auth/rbac";
import { z } from "zod";

const updateMemberSchema = z.object({
  role: z.enum(["ADMIN", "DEVELOPER", "DESIGNER", "MARKETER", "CLIENT"]).optional(),
  isActive: z.boolean().optional(),
});

/**
 * PATCH /api/workspaces/[workspaceId]/members/[userId]
 * Update a workspace member's role or status
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; userId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const { workspaceId, userId } = await params;

    // Only admins can update members
    if (!isAdmin(currentUser.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Verify current user is admin of this workspace
    const [currentUserMembership] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, currentUser.id)
        )
      )
      .limit(1);

    if (!currentUserMembership || currentUserMembership.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only workspace admins can update members" },
        { status: 403 }
      );
    }

    // Get workspace to check ownership
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Don't allow changing the workspace owner's role/status
    if (userId === workspace.ownerId) {
      return NextResponse.json(
        { error: "Cannot modify the workspace owner" },
        { status: 400 }
      );
    }

    // Don't allow modifying yourself
    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot modify your own membership" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = updateMemberSchema.parse(body);

    // Update member
    const [updatedMember] = await db
      .update(workspaceMembers)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        )
      )
      .returning();

    if (!updatedMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(updatedMember);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error updating workspace member:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update member" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workspaces/[workspaceId]/members/[userId]
 * Remove a member from the workspace
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; userId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    const { workspaceId, userId } = await params;

    // Check if user is removing themselves (leave workspace)
    const isSelf = userId === currentUser.id;

    if (!isSelf) {
      // Only admins can remove other members
      if (!isAdmin(currentUser.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Verify current user is admin of this workspace
      const [currentUserMembership] = await db
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.userId, currentUser.id)
          )
        )
        .limit(1);

      if (!currentUserMembership || currentUserMembership.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Only workspace admins can remove members" },
          { status: 403 }
        );
      }
    }

    // Get workspace to check ownership
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Don't allow removing the workspace owner
    if (userId === workspace.ownerId) {
      return NextResponse.json(
        { error: "Cannot remove the workspace owner. Transfer ownership first." },
        { status: 400 }
      );
    }

    // Remove member
    await db
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        )
      );

    return NextResponse.json({
      success: true,
      message: isSelf ? "Left workspace successfully" : "Member removed successfully",
    });
  } catch (error: any) {
    console.error("Error removing workspace member:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove member" },
      { status: 500 }
    );
  }
}

