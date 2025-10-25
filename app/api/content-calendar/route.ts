import { NextRequest } from "next/server";
import { db } from "@/src/db";
import { contentCalendar } from "@/src/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import {
  requireAuth,
  requirePermission,
  apiSuccess,
  apiError,
  getClientIp,
} from "@/src/lib/api/middleware";
import { logCreate } from "@/src/lib/audit/logger";

/**
 * GET /api/content-calendar
 * List content calendar items
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "content", "read");
  if ("error" in auth) return apiError(auth.error, auth.status);

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  const projectId = searchParams.get("projectId");
  const campaignId = searchParams.get("campaignId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!workspaceId) {
    return apiError("workspaceId is required", 400);
  }

  try {
    let conditions = [eq(contentCalendar.workspaceId, workspaceId)];

    if (projectId) {
      conditions.push(eq(contentCalendar.projectId, projectId));
    }

    if (campaignId) {
      conditions.push(eq(contentCalendar.campaignId, campaignId));
    }

    if (startDate) {
      conditions.push(gte(contentCalendar.publishDate, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(contentCalendar.publishDate, new Date(endDate)));
    }

    const result = await db
      .select()
      .from(contentCalendar)
      .where(and(...conditions))
      .orderBy(desc(contentCalendar.publishDate));

    return apiSuccess(result);
  } catch (error) {
    console.error("Failed to fetch content calendar:", error);
    return apiError("Failed to fetch content calendar", 500);
  }
}

/**
 * POST /api/content-calendar
 * Create a new content calendar item
 */
export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "content", "create");
  if ("error" in auth) return apiError(auth.error, auth.status);

  try {
    const body = await request.json();
    const {
      title,
      description,
      workspaceId,
      projectId,
      campaignId,
      type,
      status,
      platform,
      publishDate,
      assignedTo,
      contentBody,
      tags,
      keywords,
      isRecurring,
    } = body;

    console.log("POST /api/content-calendar - Request body:", body);
    console.log("Auth user:", auth.user);

    if (!title || !workspaceId || !type) {
      return apiError("Missing required fields: title, workspaceId, type", 400);
    }

    const insertData = {
      title,
      description: description || null,
      workspaceId,
      projectId: projectId || null,
      campaignId: campaignId || null,
      type,
      status: status || "IDEA",
      platform: platform || null,
      publishDate: publishDate ? new Date(publishDate) : null,
      assignedTo: assignedTo || null,
      createdBy: auth.user.id,
      contentBody: contentBody || null,
      tags: tags || null,
      keywords: keywords || null,
      isRecurring: isRecurring || false,
    };

    console.log("Inserting data:", insertData);

    const [item] = await db.insert(contentCalendar).values(insertData).returning();

    console.log("Created item:", item);

    // Audit log (non-blocking)
    try {
      await logCreate({
        workspaceId,
        userId: auth.user.id,
        userEmail: auth.user.email || "",
        userRole: auth.user.role,
        entityType: "CONTENT",
        entityId: item.id,
        entityName: item.title,
        ipAddress: getClientIp(request),
      });
    } catch (auditError) {
      // Log the error but don't fail the request
      console.error("Failed to create audit log:", auditError);
    }

    return apiSuccess(item, 201);
  } catch (error: any) {
    console.error("Failed to create content calendar item - Full error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Return more detailed error in development
    if (process.env.NODE_ENV === "development") {
      return apiError(`Failed to create content: ${error.message}`, 500);
    }

    return apiError("Failed to create content calendar item", 500);
  }
}
