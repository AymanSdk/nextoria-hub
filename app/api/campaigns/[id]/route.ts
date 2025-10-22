import { NextRequest } from "next/server";
import { db } from "@/src/db";
import { campaigns } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import {
  requireAuth,
  requirePermission,
  apiSuccess,
  apiError,
  getClientIp,
} from "@/src/lib/api/middleware";
import { logUpdate, logDelete } from "@/src/lib/audit/logger";

/**
 * GET /api/campaigns/[id]
 * Get single campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission(request, "campaigns", "read");
  if ("error" in auth) return apiError(auth.error, auth.status);

  try {
    const { id } = await params;
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, id));

    if (!campaign) {
      return apiError("Campaign not found", 404);
    }

    return apiSuccess(campaign);
  } catch (error) {
    console.error("Failed to fetch campaign:", error);
    return apiError("Failed to fetch campaign", 500);
  }
}

/**
 * PATCH /api/campaigns/[id]
 * Update campaign
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePermission(request, "campaigns", "update");
  if ("error" in auth) return apiError(auth.error, auth.status);

  try {
    const body = await request.json();
    const {
      name,
      description,
      type,
      status,
      budgetAmount,
      spentAmount,
      currency,
      startDate,
      endDate,
      reach,
      impressions,
      clicks,
      conversions,
      targetReach,
      targetConversions,
      tags,
    } = body;

    const [existing] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, params.id));

    if (!existing) {
      return apiError("Campaign not found", 404);
    }

    const [updated] = await db
      .update(campaigns)
      .set({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(status && { status }),
        ...(budgetAmount !== undefined && { budgetAmount }),
        ...(spentAmount !== undefined && { spentAmount }),
        ...(currency && { currency }),
        ...(startDate !== undefined && {
          startDate: startDate ? new Date(startDate) : null,
        }),
        ...(endDate !== undefined && {
          endDate: endDate ? new Date(endDate) : null,
        }),
        ...(reach !== undefined && { reach }),
        ...(impressions !== undefined && { impressions }),
        ...(clicks !== undefined && { clicks }),
        ...(conversions !== undefined && { conversions }),
        ...(targetReach !== undefined && { targetReach }),
        ...(targetConversions !== undefined && { targetConversions }),
        ...(tags !== undefined && { tags }),
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, params.id))
      .returning();

    // Audit log
    await logUpdate({
      workspaceId: existing.workspaceId,
      userId: auth.user.id,
      userEmail: auth.user.email || "",
      userRole: auth.user.role,
      entityType: "PROJECT",
      entityId: updated.id,
      entityName: updated.name,
      ipAddress: getClientIp(request),
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error("Failed to update campaign:", error);
    return apiError("Failed to update campaign", 500);
  }
}

/**
 * DELETE /api/campaigns/[id]
 * Delete campaign
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePermission(request, "campaigns", "delete");
  if ("error" in auth) return apiError(auth.error, auth.status);

  try {
    const [existing] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.id, params.id));

    if (!existing) {
      return apiError("Campaign not found", 404);
    }

    await db.delete(campaigns).where(eq(campaigns.id, params.id));

    // Audit log
    await logDelete({
      workspaceId: existing.workspaceId,
      userId: auth.user.id,
      userEmail: auth.user.email || "",
      userRole: auth.user.role,
      entityType: "PROJECT",
      entityId: params.id,
      entityName: existing.name,
      ipAddress: getClientIp(request),
    });

    return apiSuccess({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Failed to delete campaign:", error);
    return apiError("Failed to delete campaign", 500);
  }
}
