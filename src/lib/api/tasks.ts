import { db } from "@/src/db";
import { tasks, comments, taskActivity } from "@/src/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Get all tasks for a project
 */
export async function getTasks(projectId: string) {
  return await db.query.tasks.findMany({
    where: eq(tasks.projectId, projectId),
    orderBy: [desc(tasks.createdAt)],
    with: {
      assignee: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      reporter: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

/**
 * Get a single task by ID
 */
export async function getTask(taskId: string) {
  return await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    with: {
      assignee: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      reporter: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      comments: {
        with: {
          author: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: [desc(comments.createdAt)],
      },
      activity: {
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: [desc(taskActivity.createdAt)],
      },
    },
  });
}

/**
 * Create a new task
 */
export async function createTask(data: {
  title: string;
  description?: string;
  projectId: string;
  reporterId: string;
  assigneeId?: string;
  status?: "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "BLOCKED" | "DONE" | "CANCELLED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  labels?: string;
  startDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  parentTaskId?: string;
}) {
  const [task] = await db
    .insert(tasks)
    .values({
      id: nanoid(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Log activity
  await logTaskActivity({
    taskId: task.id,
    userId: data.reporterId,
    action: "task_created",
    metadata: JSON.stringify({ title: data.title }),
  });

  return task;
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  userId: string,
  data: Partial<{
    title: string;
    description: string;
    status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "BLOCKED" | "DONE" | "CANCELLED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    assigneeId: string;
    labels: string;
    startDate: Date;
    dueDate: Date;
    estimatedHours: number;
    actualHours: number;
    isArchived: boolean;
  }>
) {
  const [updated] = await db
    .update(tasks)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId))
    .returning();

  // Log activity
  if (data.status) {
    await logTaskActivity({
      taskId,
      userId,
      action: "status_changed",
      metadata: JSON.stringify({ newStatus: data.status }),
    });
  }

  if (data.assigneeId) {
    await logTaskActivity({
      taskId,
      userId,
      action: "assigned",
      metadata: JSON.stringify({ assigneeId: data.assigneeId }),
    });
  }

  return updated;
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string) {
  await db.delete(tasks).where(eq(tasks.id, taskId));
}

/**
 * Add comment to task
 */
export async function addTaskComment(data: {
  taskId: string;
  authorId: string;
  content: string;
  parentCommentId?: string;
}) {
  const [comment] = await db
    .insert(comments)
    .values({
      id: nanoid(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // Log activity
  await logTaskActivity({
    taskId: data.taskId,
    userId: data.authorId,
    action: "commented",
    metadata: JSON.stringify({ commentId: comment.id }),
  });

  return comment;
}

/**
 * Update comment
 */
export async function updateComment(commentId: string, content: string) {
  const [updated] = await db
    .update(comments)
    .set({
      content,
      isEdited: true,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, commentId))
    .returning();

  return updated;
}

/**
 * Delete comment
 */
export async function deleteComment(commentId: string) {
  await db.delete(comments).where(eq(comments.id, commentId));
}

/**
 * Log task activity
 */
async function logTaskActivity(data: {
  taskId: string;
  userId: string;
  action: string;
  metadata?: string;
}) {
  await db.insert(taskActivity).values({
    id: nanoid(),
    ...data,
    createdAt: new Date(),
  });
}

/**
 * Get task activity
 */
export async function getTaskActivity(taskId: string) {
  return await db.query.taskActivity.findMany({
    where: eq(taskActivity.taskId, taskId),
    orderBy: [desc(taskActivity.createdAt)],
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

