import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { whiteboards } from "@/src/db/schema";
import { eq } from "drizzle-orm";

// GET - Get a specific whiteboard
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

    const [whiteboard] = await db
      .select()
      .from(whiteboards)
      .where(eq(whiteboards.id, id));

    if (!whiteboard) {
      return NextResponse.json({ error: "Whiteboard not found" }, { status: 404 });
    }

    return NextResponse.json(whiteboard);
  } catch (error) {
    console.error("Error fetching whiteboard:", error);
    return NextResponse.json({ error: "Failed to fetch whiteboard" }, { status: 500 });
  }
}

// PUT - Update a whiteboard
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
    const { name, description, data, thumbnail } = body;

    console.log("Updating whiteboard:", {
      id,
      name,
      recordCount: data ? Object.keys(data).length : 0,
      dataSize: data ? JSON.stringify(data).length : 0,
    });

    // Only update fields that are provided
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (data !== undefined) updateData.data = data;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;

    // Update whiteboard
    const [updatedWhiteboard] = await db
      .update(whiteboards)
      .set(updateData)
      .where(eq(whiteboards.id, id))
      .returning();

    if (!updatedWhiteboard) {
      console.error("Whiteboard not found:", id);
      return NextResponse.json({ error: "Whiteboard not found" }, { status: 404 });
    }

    console.log("Whiteboard updated successfully:", {
      id: updatedWhiteboard.id,
      name: updatedWhiteboard.name,
      updatedAt: updatedWhiteboard.updatedAt,
    });

    return NextResponse.json(updatedWhiteboard);
  } catch (error) {
    console.error("Error updating whiteboard:", error);
    return NextResponse.json({ error: "Failed to update whiteboard" }, { status: 500 });
  }
}

// DELETE - Delete a whiteboard
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

    await db.delete(whiteboards).where(eq(whiteboards.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting whiteboard:", error);
    return NextResponse.json({ error: "Failed to delete whiteboard" }, { status: 500 });
  }
}
