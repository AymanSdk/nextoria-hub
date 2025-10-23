import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { projects, workspaceMembers } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { logActivity } from "@/src/lib/notifications/activity-logger";
import { z } from "zod";

const updateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").optional(),
  description: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
  priority: z.number().min(0).max(10).optional(),
  color: z.string().optional(),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  budgetAmount: z.number().optional().nullable(),
  budgetCurrency: z.string().optional(),
  clientId: z.string().optional().nullable(),
});

/**
 * PATCH /api/projects/[slug]
 * Update a project
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { slug } = await params;
    const body = await req.json();

    const validated = updateProjectSchema.parse(body);

    // Get original project for comparison
    const originalProject = await db.query.projects.findFirst({
      where: eq(projects.slug, slug),
    });

    if (!originalProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Build update object
    const updateData: any = {
      ...validated,
      updatedAt: new Date(),
    };

    // Handle date conversions
    if (validated.startDate !== undefined) {
      updateData.startDate = validated.startDate ? new Date(validated.startDate) : null;
    }
    if (validated.dueDate !== undefined) {
      updateData.dueDate = validated.dueDate ? new Date(validated.dueDate) : null;
    }

    // Update the project
    const [updatedProject] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.slug, slug))
      .returning();

    if (!updatedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get user's workspace
    const membership = await db.query.workspaceMembers.findFirst({
      where: eq(workspaceMembers.userId, user.id),
    });

    // Log activity
    if (membership) {
      // Log status change
      if (validated.status && validated.status !== originalProject.status) {
        await logActivity({
          workspaceId: membership.workspaceId,
          userId: user.id,
          activityType: "PROJECT_STATUS_CHANGED",
          entityType: "project",
          entityId: updatedProject.id,
          title: `changed "${updatedProject.name}" status to ${validated.status}`,
          description: `from ${originalProject.status}`,
        });
      }
      // Log completion
      else if (validated.status === "COMPLETED") {
        await logActivity({
          workspaceId: membership.workspaceId,
          userId: user.id,
          activityType: "PROJECT_COMPLETED",
          entityType: "project",
          entityId: updatedProject.id,
          title: `completed project "${updatedProject.name}"`,
        });
      }
      // Log general update
      else if (validated.name || validated.description || validated.budgetAmount) {
        await logActivity({
          workspaceId: membership.workspaceId,
          userId: user.id,
          activityType: "PROJECT_UPDATED",
          entityType: "project",
          entityId: updatedProject.id,
          title: `updated project "${updatedProject.name}"`,
        });
      }
    }

    return NextResponse.json({ project: updatedProject });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

/**
 * DELETE /api/projects/[slug]
 * Delete a project
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await getCurrentUser();
    const { slug } = await params;

    await db.delete(projects).where(eq(projects.slug, slug));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
