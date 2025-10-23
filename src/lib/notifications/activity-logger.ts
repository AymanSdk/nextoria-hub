/**
 * Activity Logger Service
 * Log and retrieve activities for the activity feed
 */

import { db } from "@/src/db";
import { activityLogs, users } from "@/src/db/schema";
import { eq, desc, and } from "drizzle-orm";

interface LogActivityParams {
  workspaceId: string;
  userId: string | null;
  activityType: string;
  entityType: string;
  entityId: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an activity to the activity feed
 */
export async function logActivity(params: LogActivityParams) {
  try {
    const activity = await db
      .insert(activityLogs)
      .values({
        workspaceId: params.workspaceId,
        userId: params.userId,
        activityType: params.activityType,
        entityType: params.entityType,
        entityId: params.entityId,
        title: params.title,
        description: params.description,
        metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
      })
      .returning();

    return activity[0];
  } catch (error) {
    console.error("Error logging activity:", error);
    return null;
  }
}

interface GetRecentActivitiesParams {
  workspaceId: string;
  userId?: string;
  limit?: number;
  entityType?: string;
}

/**
 * Get recent activities for the activity feed
 */
export async function getRecentActivities(params: GetRecentActivitiesParams) {
  const { workspaceId, userId, limit = 10, entityType } = params;

  try {
    let query = db
      .select({
        activity: activityLogs,
        user: users,
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .where(eq(activityLogs.workspaceId, workspaceId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);

    // Filter by user if provided
    if (userId) {
      query = db
        .select({
          activity: activityLogs,
          user: users,
        })
        .from(activityLogs)
        .leftJoin(users, eq(activityLogs.userId, users.id))
        .where(
          and(
            eq(activityLogs.workspaceId, workspaceId),
            eq(activityLogs.userId, userId)
          )
        )
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit);
    }

    // Filter by entity type if provided
    if (entityType) {
      query = db
        .select({
          activity: activityLogs,
          user: users,
        })
        .from(activityLogs)
        .leftJoin(users, eq(activityLogs.userId, users.id))
        .where(
          and(
            eq(activityLogs.workspaceId, workspaceId),
            eq(activityLogs.entityType, entityType)
          )
        )
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit);
    }

    const activities = await query;

    return activities.map((a) => ({
      ...a.activity,
      user: a.user
        ? {
            id: a.user.id,
            name: a.user.name || "Unknown",
            email: a.user.email,
            avatarUrl: a.user.image || null,
          }
        : null,
    }));
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return [];
  }
}

/**
 * Helper functions for common activity types
 */

export async function logTaskCreated(params: {
  workspaceId: string;
  userId: string;
  taskId: string;
  taskTitle: string;
  projectName?: string;
}) {
  return logActivity({
    workspaceId: params.workspaceId,
    userId: params.userId,
    activityType: "TASK_CREATED",
    entityType: "task",
    entityId: params.taskId,
    title: `created task "${params.taskTitle}"`,
    description: params.projectName ? `in ${params.projectName}` : undefined,
    metadata: { taskId: params.taskId, taskTitle: params.taskTitle },
  });
}

export async function logTaskStatusChanged(params: {
  workspaceId: string;
  userId: string;
  taskId: string;
  taskTitle: string;
  oldStatus: string;
  newStatus: string;
}) {
  return logActivity({
    workspaceId: params.workspaceId,
    userId: params.userId,
    activityType: "TASK_STATUS_CHANGED",
    entityType: "task",
    entityId: params.taskId,
    title: `moved "${params.taskTitle}" to ${params.newStatus}`,
    description: `from ${params.oldStatus}`,
    metadata: { taskId: params.taskId, oldStatus: params.oldStatus, newStatus: params.newStatus },
  });
}

export async function logProjectCreated(params: {
  workspaceId: string;
  userId: string;
  projectId: string;
  projectName: string;
}) {
  return logActivity({
    workspaceId: params.workspaceId,
    userId: params.userId,
    activityType: "PROJECT_CREATED",
    entityType: "project",
    entityId: params.projectId,
    title: `created project "${params.projectName}"`,
    metadata: { projectId: params.projectId, projectName: params.projectName },
  });
}

export async function logInvoiceSent(params: {
  workspaceId: string;
  userId: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName?: string;
}) {
  return logActivity({
    workspaceId: params.workspaceId,
    userId: params.userId,
    activityType: "INVOICE_SENT",
    entityType: "invoice",
    entityId: params.invoiceId,
    title: `sent invoice ${params.invoiceNumber}`,
    description: params.clientName ? `to ${params.clientName}` : undefined,
    metadata: { invoiceId: params.invoiceId, invoiceNumber: params.invoiceNumber },
  });
}

export async function logFileUploaded(params: {
  workspaceId: string;
  userId: string;
  fileId: string;
  fileName: string;
  entityType?: string;
  entityName?: string;
}) {
  return logActivity({
    workspaceId: params.workspaceId,
    userId: params.userId,
    activityType: "FILE_UPLOADED",
    entityType: "file",
    entityId: params.fileId,
    title: `uploaded "${params.fileName}"`,
    description: params.entityName ? `to ${params.entityName}` : undefined,
    metadata: { fileId: params.fileId, fileName: params.fileName },
  });
}

export async function logMemberJoined(params: {
  workspaceId: string;
  userId: string;
  memberName: string;
  role: string;
}) {
  return logActivity({
    workspaceId: params.workspaceId,
    userId: params.userId,
    activityType: "MEMBER_JOINED",
    entityType: "workspace",
    entityId: params.workspaceId,
    title: `${params.memberName} joined the team`,
    description: `as ${params.role}`,
    metadata: { memberName: params.memberName, role: params.role },
  });
}

