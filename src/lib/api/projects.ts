import { db } from "@/src/db";
import { projects, projectMembers, milestones, workspaceMembers } from "@/src/db/schema";
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
 * Get all projects for a workspace
 */
export async function getProjects(workspaceId: string) {
  try {
    return await db.query.projects.findMany({
      where: eq(projects.workspaceId, workspaceId),
      orderBy: [desc(projects.updatedAt)],
      with: {
        owner: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        members: {
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
        },
      },
    });
  } catch (error) {
    console.error(
      "Error in getProjects with relations, falling back to simple query:",
      error
    );
    // Fallback to simple query without relations
    return await db
      .select()
      .from(projects)
      .where(eq(projects.workspaceId, workspaceId))
      .orderBy(desc(projects.updatedAt));
  }
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string) {
  return await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
    with: {
      owner: {
        columns: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      members: {
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
      },
      milestones: true,
    },
  });
}

/**
 * Create a new project
 */
export async function createProject(data: {
  name: string;
  slug: string;
  description?: string;
  workspaceId: string;
  ownerId: string;
  clientId?: string;
  status?: "DRAFT" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  priority?: number;
  startDate?: Date;
  dueDate?: Date;
  budgetAmount?: number;
  budgetCurrency?: string;
  color?: string;
  coverImage?: string;
}) {
  const [project] = await db
    .insert(projects)
    .values({
      id: nanoid(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return project;
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    status: "DRAFT" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
    priority: number;
    startDate: Date;
    dueDate: Date;
    budgetAmount: number;
    budgetCurrency: string;
    color: string;
    coverImage: string;
    isArchived: boolean;
  }>,
  updatedBy?: string
) {
  // Get current project for comparison
  const [currentProject] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));

  const [updated] = await db
    .update(projects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning();

  // Notify members of status changes
  if (data.status && currentProject && data.status !== currentProject.status) {
    // Get all project members
    const members = await db
      .select({ userId: projectMembers.userId })
      .from(projectMembers)
      .where(eq(projectMembers.projectId, projectId));

    // Get workspace admins
    const adminIds = await getWorkspaceAdmins(updated.workspaceId);

    // Combine members and admins (removing duplicates)
    const memberIds = members.map((m) => m.userId);
    const allNotifyIds = [...new Set([...memberIds, ...adminIds])];

    // Notify each member and admin
    for (const userId of allNotifyIds) {
      if (userId !== updatedBy) {
        try {
          await createNotification({
            userId: userId,
            type: "PROJECT_STATUS_CHANGED",
            title: "Project status updated",
            message: `"${updated.name}" status changed from ${currentProject.status} to ${data.status}`,
            actionUrl: `/projects/${updated.slug}`,
            senderId: updatedBy,
            metadata: {
              projectId,
              oldStatus: currentProject.status,
              newStatus: data.status,
            },
          });
        } catch (error) {
          console.error("Failed to send project status notification:", error);
        }
      }
    }

    // Notify on completion
    if (data.status === "COMPLETED") {
      try {
        await createNotification({
          userId: updated.ownerId,
          type: "PROJECT_MILESTONE",
          title: "Project completed",
          message: `Project "${updated.name}" has been completed!`,
          actionUrl: `/projects/${updated.slug}`,
          senderId: updatedBy,
          metadata: {
            projectId,
          },
        });
      } catch (error) {
        console.error("Failed to send project completion notification:", error);
      }
    }
  }

  return updated;
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string) {
  await db.delete(projects).where(eq(projects.id, projectId));
}

/**
 * Add member to project
 */
export async function addProjectMember(
  projectId: string,
  userId: string,
  addedBy?: string
) {
  const [member] = await db
    .insert(projectMembers)
    .values({
      id: nanoid(),
      projectId,
      userId,
      canEdit: true,
      addedAt: new Date(),
    })
    .returning();

  // Get project details for notification
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));

  // Notify the added member
  if (project) {
    try {
      await createNotification({
        userId: userId,
        type: "PROJECT_MEMBER_ADDED",
        title: "Added to project",
        message: `You have been added to the project "${project.name}"`,
        actionUrl: `/projects/${project.slug}`,
        senderId: addedBy,
        metadata: {
          projectId,
        },
      });
    } catch (error) {
      console.error("Failed to send project member added notification:", error);
    }

    // Notify workspace admins
    try {
      const adminIds = await getWorkspaceAdmins(project.workspaceId);
      for (const adminId of adminIds) {
        if (adminId !== addedBy && adminId !== userId) {
          await createNotification({
            userId: adminId,
            type: "PROJECT_MEMBER_ADDED",
            title: "Project member added",
            message: `New member added to "${project.name}"`,
            actionUrl: `/projects/${project.slug}`,
            senderId: addedBy,
            metadata: {
              projectId,
              newMemberId: userId,
            },
          });
        }
      }
    } catch (error) {
      console.error("Failed to send admin notification for project member:", error);
    }
  }

  return member;
}

/**
 * Remove member from project
 */
export async function removeProjectMember(projectId: string, userId: string) {
  await db
    .delete(projectMembers)
    .where(
      and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId))
    );
}

/**
 * Create milestone
 */
export async function createMilestone(data: {
  projectId: string;
  name: string;
  description?: string;
  dueDate?: Date;
  order?: number;
}) {
  const [milestone] = await db
    .insert(milestones)
    .values({
      id: nanoid(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return milestone;
}
