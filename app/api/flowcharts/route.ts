import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { getCurrentWorkspace } from "@/src/lib/workspace/context";
import { db } from "@/src/db";
import { flowcharts } from "@/src/db/schema";
import { eq, desc, and } from "drizzle-orm";

// GET - List all flowcharts for the current workspace
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get workspace ID from query params
    const searchParams = req.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");
    const templatesOnly = searchParams.get("templates") === "true";

    if (!workspaceId && !templatesOnly) {
      return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
    }

    // Build query conditions
    const conditions = [];
    if (templatesOnly) {
      conditions.push(eq(flowcharts.isTemplate, true));
    } else {
      conditions.push(eq(flowcharts.workspaceId, workspaceId!));
    }

    // Fetch flowcharts
    const userFlowcharts = await db
      .select()
      .from(flowcharts)
      .where(and(...conditions))
      .orderBy(desc(flowcharts.updatedAt));

    return NextResponse.json(userFlowcharts);
  } catch (error) {
    console.error("Error fetching flowcharts:", error);
    return NextResponse.json({ error: "Failed to fetch flowcharts" }, { status: 500 });
  }
}

// POST - Create/Save a new flowchart
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id, // Optional: specify the ID (e.g., roomId from URL)
      name,
      description,
      data,
      thumbnail,
      isTemplate,
      templateCategory,
      isPublic,
      shareToken,
      workspaceId, // Get workspaceId from request body
    } = body;

    if (!name || !data) {
      return NextResponse.json({ error: "Name and data are required" }, { status: 400 });
    }

    // Use provided workspaceId or fall back to getting user's current workspace
    let finalWorkspaceId = workspaceId;

    if (!finalWorkspaceId) {
      const workspace = await getCurrentWorkspace(session.user.id);
      if (!workspace) {
        return NextResponse.json(
          {
            error: "No active workspace found. Please create or join a workspace first.",
          },
          { status: 400 }
        );
      }
      finalWorkspaceId = workspace.id;
    }

    // Create new flowchart - use provided ID or let database generate one
    const flowchartValues: any = {
      name,
      description,
      data,
      thumbnail,
      isTemplate: isTemplate || false,
      templateCategory,
      isPublic: isPublic || false,
      shareToken,
      createdBy: session.user.id,
      workspaceId: finalWorkspaceId,
    };

    // If ID is provided (e.g., roomId), use it
    if (id) {
      flowchartValues.id = id;
    }

    console.log("Creating flowchart with values:", {
      id: flowchartValues.id,
      name: flowchartValues.name,
      workspaceId: flowchartValues.workspaceId,
      createdBy: flowchartValues.createdBy,
    });

    const [newFlowchart] = await db
      .insert(flowcharts)
      .values(flowchartValues)
      .returning();

    console.log("Flowchart created successfully:", newFlowchart.id);
    return NextResponse.json(newFlowchart, { status: 201 });
  } catch (error) {
    console.error("Error creating flowchart:", error);
    // Return more detailed error information
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create flowchart";
    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
