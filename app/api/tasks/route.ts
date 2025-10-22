import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { createTask, getTasks } from "@/src/lib/api/tasks";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  projectId: z.string(),
  assigneeId: z.string().optional(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "BLOCKED", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  labels: z.string().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().optional(),
  parentTaskId: z.string().optional(),
});

/**
 * GET /api/tasks
 * Get all tasks for a project
 */
export async function GET(req: NextRequest) {
  try {
    await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    const tasks = await getTasks(projectId);

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
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

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

