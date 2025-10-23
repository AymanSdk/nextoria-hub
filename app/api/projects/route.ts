import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { createProject, getProjects } from "@/src/lib/api/projects";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  workspaceId: z.string(),
  clientId: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
  priority: z.number().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  budgetAmount: z.number().optional(),
  budgetCurrency: z.string().optional(),
  color: z.string().optional(),
});

/**
 * GET /api/projects
 * Get all projects for a workspace
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    console.log("Fetching projects for workspaceId:", workspaceId);
    const projects = await getProjects(workspaceId);
    console.log("Found projects:", projects?.length || 0);

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const validated = createProjectSchema.parse(body);

    const project = await createProject({
      ...validated,
      ownerId: user.id,
      startDate: validated.startDate ? new Date(validated.startDate) : undefined,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
