import { db } from "@/src/db";
import { projects, projectMembers, milestones } from "@/src/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Get all projects for a workspace
 */
export async function getProjects(workspaceId: string) {
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
  }>
) {
  const [updated] = await db
    .update(projects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning();

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
export async function addProjectMember(projectId: string, userId: string) {
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

  return member;
}

/**
 * Remove member from project
 */
export async function removeProjectMember(projectId: string, userId: string) {
  await db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      )
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
