import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { tasks, workspaceMembers, projects } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import {
  logTaskStatusChanged,
  logActivity,
} from "@/src/lib/notifications/activity-logger";
import { z } from "zod";

const updateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").optional(),
  description: z.string().optional(),
  assigneeId: z.string().optional().nullable(),
  status: z
    .enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE", "CANCELLED"])
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  labels: z.string().optional(),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  estimatedHours: z.number().optional().nullable(),
  actualHours: z.number().optional().nullable(),
});

/**
 * PATCH /api/tasks/[taskId]
 * Update a task
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const body = await req.json();

    const validated = updateTaskSchema.parse(body);

    // Get original task for comparison
    const originalTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: {
        project: true,
      },
    });

    if (!originalTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
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

    // Update the task
    const [updatedTask] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Get user's workspace
    const membership = await db.query.workspaceMembers.findFirst({
      where: eq(workspaceMembers.userId, user.id),
    });

    // Log activity based on what changed
    if (membership) {
      // Log status change
      if (validated.status && validated.status !== originalTask.status) {
        await logTaskStatusChanged({
          workspaceId: membership.workspaceId,
          userId: user.id,
          taskId: updatedTask.id,
          taskTitle: updatedTask.title,
          oldStatus: originalTask.status,
          newStatus: validated.status,
        });
      }
      // Log assignee change
      else if (
        validated.assigneeId !== undefined &&
        validated.assigneeId !== originalTask.assigneeId
      ) {
        await logActivity({
          workspaceId: membership.workspaceId,
          userId: user.id,
          activityType: "TASK_ASSIGNED",
          entityType: "task",
          entityId: updatedTask.id,
          title: `assigned "${updatedTask.title}"`,
          description: originalTask.project?.name
            ? `in ${originalTask.project.name}`
            : undefined,
        });
      }
      // Log general update
      else if (validated.title || validated.description || validated.priority) {
        await logActivity({
          workspaceId: membership.workspaceId,
          userId: user.id,
          activityType: "TASK_UPDATED",
          entityType: "task",
          entityId: updatedTask.id,
          title: `updated task "${updatedTask.title}"`,
          description: originalTask.project?.name
            ? `in ${originalTask.project.name}`
            : undefined,
        });
      }
    }

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/[taskId]
 * Delete a task
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    await getCurrentUser();
    const { taskId } = await params;

    await db.delete(tasks).where(eq(tasks.id, taskId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
