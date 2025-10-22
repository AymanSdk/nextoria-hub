import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { createTask, getTasks } from "@/src/lib/api/tasks";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  projectId: z.string(),
  assigneeId: z.string().optional(),
  status: z
    .enum([
      "BACKLOG",
      "TODO",
      "IN_PROGRESS",
      "IN_REVIEW",
      "BLOCKED",
      "DONE",
      "CANCELLED",
    ])
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
 * Get tasks for a project or all tasks for the user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    // If projectId is provided, get tasks for that project
    if (projectId) {
      const tasks = await getTasks(projectId);
      return NextResponse.json({ tasks });
    }

    // Otherwise, get all tasks for the user (assigned to them or created by them)
    const { db } = await import("@/src/db");
    const {
      tasks: tasksTable,
      projects,
      users,
    } = await import("@/src/db/schema");
    const { or, eq } = await import("drizzle-orm");

    const allTasks = await db
      .select({
        id: tasksTable.id,
        title: tasksTable.title,
        description: tasksTable.description,
        status: tasksTable.status,
        priority: tasksTable.priority,
        labels: tasksTable.labels,
        dueDate: tasksTable.dueDate,
        startDate: tasksTable.startDate,
        estimatedHours: tasksTable.estimatedHours,
        actualHours: tasksTable.actualHours,
        createdAt: tasksTable.createdAt,
        updatedAt: tasksTable.updatedAt,
        projectId: tasksTable.projectId,
        assigneeId: tasksTable.assigneeId,
        reporterId: tasksTable.reporterId,
        project: {
          id: projects.id,
          name: projects.name,
          slug: projects.slug,
          color: projects.color,
        },
        assignee: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
        },
      })
      .from(tasksTable)
      .leftJoin(projects, eq(tasksTable.projectId, projects.id))
      .leftJoin(users, eq(tasksTable.assigneeId, users.id))
      .where(
        or(
          eq(tasksTable.assigneeId, user.id),
          eq(tasksTable.reporterId, user.id)
        )
      )
      .orderBy(tasksTable.createdAt);

    return NextResponse.json({ tasks: allTasks });
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
      startDate: validated.startDate
        ? new Date(validated.startDate)
        : undefined,
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
