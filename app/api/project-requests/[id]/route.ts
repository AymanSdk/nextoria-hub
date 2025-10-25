import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { projectRequests } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

/**
 * Project Request Update Schema (for admins)
 */
const updateProjectRequestSchema = z.object({
  status: z.enum(["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"]).optional(),
  reviewNotes: z.string().optional(),
  createdProjectId: z.string().optional(),
});

/**
 * GET /api/project-requests/[id]
 * Fetch a single project request by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [request] = await db
      .select()
      .from(projectRequests)
      .where(eq(projectRequests.id, id))
      .limit(1);

    if (!request) {
      return NextResponse.json({ error: "Project request not found" }, { status: 404 });
    }

    // Clients can only view their own requests
    if (user.role === "CLIENT" && request.requestedBy !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: request });
  } catch (error) {
    console.error("Error fetching project request:", error);
    return NextResponse.json(
      { error: "Failed to fetch project request" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/project-requests/[id]
 * Update a project request (review, approve, reject)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and team members can update project requests
    if (user.role === "CLIENT") {
      return NextResponse.json(
        { error: "Only team members can review project requests" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const validated = updateProjectRequestSchema.parse(body);

    // Check if request exists
    const [existingRequest] = await db
      .select()
      .from(projectRequests)
      .where(eq(projectRequests.id, id))
      .limit(1);

    if (!existingRequest) {
      return NextResponse.json({ error: "Project request not found" }, { status: 404 });
    }

    // Update the request
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validated.status) {
      updateData.status = validated.status;
      updateData.reviewedBy = user.id;
      updateData.reviewedAt = new Date();
    }

    if (validated.reviewNotes !== undefined) {
      updateData.reviewNotes = validated.reviewNotes;
    }

    if (validated.createdProjectId) {
      updateData.createdProjectId = validated.createdProjectId;
    }

    const [updatedRequest] = await db
      .update(projectRequests)
      .set(updateData)
      .where(eq(projectRequests.id, id))
      .returning();

    return NextResponse.json({ success: true, data: updatedRequest });
  } catch (error) {
    console.error("Error updating project request:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update project request" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/project-requests/[id]
 * Delete a project request
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if request exists
    const [existingRequest] = await db
      .select()
      .from(projectRequests)
      .where(eq(projectRequests.id, id))
      .limit(1);

    if (!existingRequest) {
      return NextResponse.json({ error: "Project request not found" }, { status: 404 });
    }

    // Clients can only delete their own requests if they're still pending
    if (user.role === "CLIENT") {
      if (
        existingRequest.requestedBy !== user.id ||
        existingRequest.status !== "PENDING"
      ) {
        return NextResponse.json(
          { error: "Cannot delete this request" },
          { status: 403 }
        );
      }
    }

    await db.delete(projectRequests).where(eq(projectRequests.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project request:", error);
    return NextResponse.json(
      { error: "Failed to delete project request" },
      { status: 500 }
    );
  }
}
