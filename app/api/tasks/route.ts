import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { tasks, projects, workspaceMembers } from "@/src/db/schema";
import { desc, eq } from "drizzle-orm";
import { createTask } from "@/src/lib/api/tasks";
import { logTaskCreated } from "@/src/lib/notifications/activity-logger";
import { notifyTaskAssigned } from "@/src/lib/notifications/service";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  projectId: z.string().min(1, "Project ID is required"),
  assigneeId: z.string().optional(),
  status: z
    .enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE", "CANCELLED"])
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  labels: z.string().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().optional(),
  parentTaskId: z.string().optional(),
});

/**
 * GET /api/tasks
 * List all tasks
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    const allTasks = await db.query.tasks.findMany({
      orderBy: [desc(tasks.createdAt)],
      with: {
        project: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
      limit: 100, // Limit to recent 100 tasks
    });

    return NextResponse.json({ tasks: allTasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const validated = createTaskSchema.parse(body);

    const task = await createTask({
      ...validated,
      reporterId: user.id,
      startDate: validated.startDate ? new Date(validated.startDate) : undefined,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
    });

    // Get project details for activity log
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, validated.projectId),
    });

    // Get user's workspace
    const membership = await db.query.workspaceMembers.findFirst({
      where: eq(workspaceMembers.userId, user.id),
    });

    // Log activity
    if (membership && project) {
      await logTaskCreated({
        workspaceId: membership.workspaceId,
        userId: user.id,
        taskId: task.id,
        taskTitle: task.title,
        projectName: project.name,
      });
    }

    // Notify assignee if task was assigned during creation
    if (validated.assigneeId && validated.assigneeId !== user.id && project) {
      await notifyTaskAssigned({
        taskId: task.id,
        taskTitle: task.title,
        assigneeId: validated.assigneeId,
        assignedBy: user.id,
        projectName: project.name,
      });
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
