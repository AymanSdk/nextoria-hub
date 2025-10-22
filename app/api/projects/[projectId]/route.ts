import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { getProject, updateProject, deleteProject } from "@/src/lib/api/projects";
import { z } from "zod";

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
  priority: z.number().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  budgetAmount: z.number().optional(),
  budgetCurrency: z.string().optional(),
  color: z.string().optional(),
  isArchived: z.boolean().optional(),
});

/**
 * GET /api/projects/[projectId]
 * Get a single project
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await getCurrentUser();

    const project = await getProject(params.projectId);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/projects/[projectId]
 * Update a project
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    await getCurrentUser();
    const body = await req.json();

    const validated = updateProjectSchema.parse(body);

    const project = await updateProject(params.projectId, {
      ...validated,
      startDate: validated.startDate ? new Date(validated.startDate) : undefined,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
    });

    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[projectId]
 * Delete a project
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const user = await getCurrentUser();

    // Only ADMIN can delete projects
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await deleteProject(params.projectId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

