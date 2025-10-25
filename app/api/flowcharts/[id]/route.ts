import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { flowcharts } from "@/src/db/schema";
import { eq } from "drizzle-orm";

// GET - Get a specific flowchart
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [flowchart] = await db.select().from(flowcharts).where(eq(flowcharts.id, id));

    if (!flowchart) {
      return NextResponse.json({ error: "Flowchart not found" }, { status: 404 });
    }

    return NextResponse.json(flowchart);
  } catch (error) {
    console.error("Error fetching flowchart:", error);
    return NextResponse.json({ error: "Failed to fetch flowchart" }, { status: 500 });
  }
}

// PUT - Update a flowchart
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    console.log("Updating flowchart:", {
      id,
      name,
      nodesCount: data?.nodes?.length || 0,
      edgesCount: data?.edges?.length || 0,
    });

    // Only update fields that are provided
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (data !== undefined) updateData.data = data;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (isTemplate !== undefined) updateData.isTemplate = isTemplate;
    if (templateCategory !== undefined) updateData.templateCategory = templateCategory;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (shareToken !== undefined) updateData.shareToken = shareToken;

    // Update flowchart
    const [updatedFlowchart] = await db
      .update(flowcharts)
      .set(updateData)
      .where(eq(flowcharts.id, id))
      .returning();

    if (!updatedFlowchart) {
      console.error("Flowchart not found:", id);
      return NextResponse.json({ error: "Flowchart not found" }, { status: 404 });
    }

    console.log("Flowchart updated successfully:", {
      id: updatedFlowchart.id,
      name: updatedFlowchart.name,
      updatedAt: updatedFlowchart.updatedAt,
    });

    return NextResponse.json(updatedFlowchart);
  } catch (error) {
    console.error("Error updating flowchart:", error);
    return NextResponse.json({ error: "Failed to update flowchart" }, { status: 500 });
  }
}

// DELETE - Delete a flowchart
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Delete flowchart
    const [deletedFlowchart] = await db
      .delete(flowcharts)
      .where(eq(flowcharts.id, id))
      .returning();

    if (!deletedFlowchart) {
      return NextResponse.json({ error: "Flowchart not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id: deletedFlowchart.id });
  } catch (error) {
    console.error("Error deleting flowchart:", error);
    return NextResponse.json({ error: "Failed to delete flowchart" }, { status: 500 });
  }
}
