import { NextRequest } from "next/server";
import { db } from "@/src/db";
import { approvals } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, apiSuccess, apiError, getClientIp } from "@/src/lib/api/middleware";
import { logUpdate } from "@/src/lib/audit/logger";

/**
 * POST /api/approvals/[id]/respond
 * Respond to an approval request (approve/reject)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if ("error" in auth) return apiError(auth.error, auth.status);

  try {
    const { id } = await params;
    const body = await request.json();
    const { status, responseNotes } = body;

    if (!status || !["APPROVED", "REJECTED", "REVISION_REQUESTED"].includes(status)) {
      return apiError(
        "Invalid status. Must be APPROVED, REJECTED, or REVISION_REQUESTED",
        400
      );
    }

    const [existing] = await db.select().from(approvals).where(eq(approvals.id, id));

    if (!existing) {
      return apiError("Approval not found", 404);
    }

    // Check if user is the assigned approver
    if (existing.approverId !== auth.user.id) {
      return apiError("You are not authorized to respond to this approval", 403);
    }

    if (existing.status !== "PENDING") {
      return apiError("This approval has already been responded to", 400);
    }

    const [updated] = await db
      .update(approvals)
      .set({
        status,
        responseNotes,
        respondedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(approvals.id, id))
      .returning();

    // TODO: Send notification to requester

    return apiSuccess(updated);
  } catch (error) {
    console.error("Failed to respond to approval:", error);
    return apiError("Failed to respond to approval", 500);
  }
}
