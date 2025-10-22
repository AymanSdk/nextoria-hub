import { NextRequest } from "next/server";
import { db } from "@/src/db";
import { campaigns } from "@/src/db/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  requireAuth,
  requirePermission,
  apiSuccess,
  apiError,
  getClientIp,
} from "@/src/lib/api/middleware";
import { logCreate } from "@/src/lib/audit/logger";

/**
 * GET /api/campaigns
 * List all campaigns for workspace
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "campaigns", "read");
  if ("error" in auth) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  const projectId = searchParams.get("projectId");

  if (!workspaceId) {
    return apiError("workspaceId is required", 400);
  }

  try {
    let query = db
      .select()
      .from(campaigns)
      .where(eq(campaigns.workspaceId, workspaceId))
      .orderBy(desc(campaigns.createdAt));

    if (projectId) {
      query = db
        .select()
        .from(campaigns)
        .where(
          and(
            eq(campaigns.workspaceId, workspaceId),
            eq(campaigns.projectId, projectId)
          )
        )
        .orderBy(desc(campaigns.createdAt));
    }

    const result = await query;
    return apiSuccess(result);
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return apiError("Failed to fetch campaigns", 500);
  }
}

/**
 * POST /api/campaigns
 * Create a new campaign
 */
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "campaigns", "create");
  if ("error" in auth) return apiError(auth.error, auth.status);

  try {
    const body = await request.json();
    const {
      name,
      description,
      workspaceId,
      projectId,
      type,
      status,
      budgetAmount,
      currency,
      startDate,
      endDate,
      targetReach,
      targetConversions,
      tags,
    } = body;

    if (!name || !workspaceId || !type) {
      return apiError("Missing required fields: name, workspaceId, type", 400);
    }

    const [campaign] = await db
      .insert(campaigns)
      .values({
        name,
        description,
        workspaceId,
        projectId,
        type,
        status: status || "PLANNING",
        budgetAmount,
        currency: currency || "USD",
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        managerId: auth.user.id,
        targetReach,
        targetConversions,
        tags,
      })
      .returning();

    // Audit log
    await logCreate({
      workspaceId,
      userId: auth.user.id,
      userEmail: auth.user.email || "",
      userRole: auth.user.role,
      entityType: "PROJECT",
      entityId: campaign.id,
      entityName: campaign.name,
      ipAddress: getClientIp(request),
    });

    return apiSuccess(campaign, 201);
  } catch (error) {
    console.error("Failed to create campaign:", error);
    return apiError("Failed to create campaign", 500);
  }
}
