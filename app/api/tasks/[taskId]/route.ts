import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { getTask, updateTask, deleteTask } from "@/src/lib/api/tasks";
import { z } from "zod";

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: z.string().optional(),
  labels: z.string().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
  isArchived: z.boolean().optional(),
});

/**
 * GET /api/tasks/[taskId]
 * Get a single task
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    await getCurrentUser();

    const task = await getTask(params.taskId);

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tasks/[taskId]
 * Update a task
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const validated = updateTaskSchema.parse(body);

    const task = await updateTask(params.taskId, user.id, {
      ...validated,
      startDate: validated.startDate ? new Date(validated.startDate) : undefined,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
    });

    return NextResponse.json({ task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[taskId]
 * Delete a task
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    await getCurrentUser();
    await deleteTask(params.taskId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

