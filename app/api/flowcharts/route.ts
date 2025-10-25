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

    // Get user's current workspace
    const workspace = await getCurrentWorkspace(session.user.id);

    if (!workspace) {
      return NextResponse.json(
        { error: "No active workspace found. Please create or join a workspace first." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      name,
      description,
      data,
      thumbnail,
      isTemplate,
      templateCategory,
      isPublic,
      shareToken,
    } = body;

    if (!name || !data) {
      return NextResponse.json({ error: "Name and data are required" }, { status: 400 });
    }

    // Create new flowchart
    const [newFlowchart] = await db
      .insert(flowcharts)
      .values({
        name,
        description,
        data,
        thumbnail,
        isTemplate: isTemplate || false,
        templateCategory,
        isPublic: isPublic || false,
        shareToken,
        createdBy: session.user.id,
        workspaceId: workspace.id,
      })
      .returning();

    return NextResponse.json(newFlowchart, { status: 201 });
  } catch (error) {
    console.error("Error creating flowchart:", error);
    return NextResponse.json({ error: "Failed to create flowchart" }, { status: 500 });
  }
}
