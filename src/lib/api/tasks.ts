import { db } from "@/src/db";
import {
  tasks,
  comments,
  taskActivity,
  projects,
  workspaceMembers,
} from "@/src/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { createNotification } from "@/src/lib/notifications/service";

/**
 * Get workspace admins
 */
async function getWorkspaceAdmins(workspaceId: string): Promise<string[]> {
  const admins = await db
    .select({ userId: workspaceMembers.userId })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.role, "ADMIN")
      )
    );

  return admins.map((a) => a.userId);
}

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
  status?:
    | "BACKLOG"
    | "TODO"
    | "IN_PROGRESS"
    | "IN_REVIEW"
    | "BLOCKED"
    | "DONE"
    | "CANCELLED";
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

  // Get project name for notification
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, data.projectId));

  // Send notification to assignee if assigned and not the reporter
  if (data.assigneeId && data.assigneeId !== data.reporterId) {
    try {
      await createNotification({
        userId: data.assigneeId,
        type: "TASK_ASSIGNED",
        title: "New task assigned to you",
        message: `You have been assigned to "${data.title}"${
          project ? ` in ${project.name}` : ""
        }`,
        actionUrl: `/tasks/${task.id}`,
        senderId: data.reporterId,
        metadata: {
          taskId: task.id,
          projectId: data.projectId,
        },
      });
    } catch (error) {
      console.error("Failed to send task assigned notification:", error);
    }
  }

  // Notify workspace admins
  if (project) {
    try {
      const adminIds = await getWorkspaceAdmins(project.workspaceId);
      for (const adminId of adminIds) {
        if (adminId !== data.reporterId && adminId !== data.assigneeId) {
          await createNotification({
            userId: adminId,
            type: "TASK_ASSIGNED",
            title: "New task created",
            message: `${data.assigneeId ? "Task assigned" : "Task created"}: "${
              data.title
            }"${project ? ` in ${project.name}` : ""}`,
            actionUrl: `/tasks/${task.id}`,
            senderId: data.reporterId,
            metadata: {
              taskId: task.id,
              projectId: data.projectId,
            },
          });
        }
      }
    } catch (error) {
      console.error("Failed to send admin notification:", error);
    }
  }

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
    status:
      | "BACKLOG"
      | "TODO"
      | "IN_PROGRESS"
      | "IN_REVIEW"
      | "BLOCKED"
      | "DONE"
      | "CANCELLED";
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
  // Get current task for comparison
  const [currentTask] = await db.select().from(tasks).where(eq(tasks.id, taskId));

  if (!currentTask) {
    throw new Error("Task not found");
  }

  const [updated] = await db
    .update(tasks)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId))
    .returning();

  // Get project name for notifications
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, currentTask.projectId));

  // Log activity and send notification for status changes
  if (data.status && data.status !== currentTask.status) {
    await logTaskActivity({
      taskId,
      userId,
      action: "status_changed",
      metadata: JSON.stringify({ newStatus: data.status }),
    });

    // Notify assignee of status change
    if (currentTask.assigneeId && currentTask.assigneeId !== userId) {
      try {
        await createNotification({
          userId: currentTask.assigneeId,
          type: "TASK_STATUS_CHANGED",
          title: "Task status updated",
          message: `"${currentTask.title}" status changed from ${currentTask.status} to ${
            data.status
          }${project ? ` in ${project.name}` : ""}`,
          actionUrl: `/tasks/${taskId}`,
          senderId: userId,
          metadata: {
            taskId,
            oldStatus: currentTask.status,
            newStatus: data.status,
          },
        });
      } catch (error) {
        console.error("Failed to send status change notification:", error);
      }
    }

    // Notify on completion
    if (data.status === "DONE" && currentTask.reporterId !== userId) {
      try {
        await createNotification({
          userId: currentTask.reporterId,
          type: "TASK_COMPLETED",
          title: "Task completed",
          message: `"${currentTask.title}" has been completed${
            project ? ` in ${project.name}` : ""
          }`,
          actionUrl: `/tasks/${taskId}`,
          senderId: userId,
          metadata: {
            taskId,
          },
        });
      } catch (error) {
        console.error("Failed to send completion notification:", error);
      }
    }

    // Notify workspace admins of status changes
    if (project) {
      try {
        const adminIds = await getWorkspaceAdmins(project.workspaceId);
        for (const adminId of adminIds) {
          if (
            adminId !== userId &&
            adminId !== currentTask.assigneeId &&
            adminId !== currentTask.reporterId
          ) {
            await createNotification({
              userId: adminId,
              type: "TASK_STATUS_CHANGED",
              title: "Task status updated",
              message: `"${currentTask.title}" status changed to ${data.status}${
                project ? ` in ${project.name}` : ""
              }`,
              actionUrl: `/tasks/${taskId}`,
              senderId: userId,
              metadata: {
                taskId,
                oldStatus: currentTask.status,
                newStatus: data.status,
              },
            });
          }
        }
      } catch (error) {
        console.error("Failed to send admin notification:", error);
      }
    }
  }

  // Log activity and send notification for assignment changes
  if (data.assigneeId && data.assigneeId !== currentTask.assigneeId) {
    await logTaskActivity({
      taskId,
      userId,
      action: "assigned",
      metadata: JSON.stringify({ assigneeId: data.assigneeId }),
    });

    // Notify new assignee
    if (data.assigneeId !== userId) {
      try {
        await createNotification({
          userId: data.assigneeId,
          type: "TASK_ASSIGNED",
          title: "Task assigned to you",
          message: `You have been assigned to "${currentTask.title}"${
            project ? ` in ${project.name}` : ""
          }`,
          actionUrl: `/tasks/${taskId}`,
          senderId: userId,
          metadata: {
            taskId,
            projectId: currentTask.projectId,
          },
        });
      } catch (error) {
        console.error("Failed to send assignment notification:", error);
      }
    }
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

  // Get task and project details for notification
  const [task] = await db.select().from(tasks).where(eq(tasks.id, data.taskId));

  if (task) {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, task.projectId));

    // Notify task assignee
    if (task.assigneeId && task.assigneeId !== data.authorId) {
      try {
        await createNotification({
          userId: task.assigneeId,
          type: "TASK_COMMENTED",
          title: "New comment on task",
          message: `New comment on "${task.title}"${
            project ? ` in ${project.name}` : ""
          }`,
          actionUrl: `/tasks/${data.taskId}`,
          senderId: data.authorId,
          metadata: {
            taskId: data.taskId,
            commentId: comment.id,
          },
        });
      } catch (error) {
        console.error("Failed to send comment notification to assignee:", error);
      }
    }

    // Notify task reporter if different from assignee and author
    if (
      task.reporterId &&
      task.reporterId !== data.authorId &&
      task.reporterId !== task.assigneeId
    ) {
      try {
        await createNotification({
          userId: task.reporterId,
          type: "TASK_COMMENTED",
          title: "New comment on task",
          message: `New comment on "${task.title}"${
            project ? ` in ${project.name}` : ""
          }`,
          actionUrl: `/tasks/${data.taskId}`,
          senderId: data.authorId,
          metadata: {
            taskId: data.taskId,
            commentId: comment.id,
          },
        });
      } catch (error) {
        console.error("Failed to send comment notification to reporter:", error);
      }
    }

    // Notify workspace admins
    if (project) {
      try {
        const adminIds = await getWorkspaceAdmins(project.workspaceId);
        for (const adminId of adminIds) {
          if (
            adminId !== data.authorId &&
            adminId !== task.assigneeId &&
            adminId !== task.reporterId
          ) {
            await createNotification({
              userId: adminId,
              type: "TASK_COMMENTED",
              title: "New comment on task",
              message: `New comment on "${task.title}"${
                project ? ` in ${project.name}` : ""
              }`,
              actionUrl: `/tasks/${data.taskId}`,
              senderId: data.authorId,
              metadata: {
                taskId: data.taskId,
                commentId: comment.id,
              },
            });
          }
        }
      } catch (error) {
        console.error("Failed to send admin comment notification:", error);
      }
    }
  }

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
