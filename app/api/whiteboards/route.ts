import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { getCurrentWorkspace } from "@/src/lib/workspace/context";
import { db } from "@/src/db";
import { whiteboards } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";

// GET - List all whiteboards for the current workspace
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get workspace ID from query params or user's active workspace
    const searchParams = req.nextUrl.searchParams;
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
    }

    // Fetch whiteboards for this workspace
    const userWhiteboards = await db
      .select()
      .from(whiteboards)
      .where(eq(whiteboards.workspaceId, workspaceId))
      .orderBy(desc(whiteboards.updatedAt));

    return NextResponse.json(userWhiteboards);
  } catch (error) {
    console.error("Error fetching whiteboards:", error);
    return NextResponse.json({ error: "Failed to fetch whiteboards" }, { status: 500 });
  }
}

// POST - Create/Save a new whiteboard
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
    const { name, description, data, thumbnail } = body;

    if (!name || !data) {
      return NextResponse.json({ error: "Name and data are required" }, { status: 400 });
    }

    // Create new whiteboard
    const [newWhiteboard] = await db
      .insert(whiteboards)
      .values({
        name,
        description,
        data,
        thumbnail,
        createdBy: session.user.id,
        workspaceId: workspace.id,
      })
      .returning();

    return NextResponse.json(newWhiteboard, { status: 201 });
  } catch (error) {
    console.error("Error creating whiteboard:", error);
    return NextResponse.json({ error: "Failed to create whiteboard" }, { status: 500 });
  }
}
