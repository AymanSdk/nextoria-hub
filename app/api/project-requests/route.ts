import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { projectRequests, clients } from "@/src/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";

/**
 * Project Request Creation Schema
 */
const createProjectRequestSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  estimatedBudget: z.number().optional(),
  budgetCurrency: z.string().length(3).default("USD").optional(),
  desiredStartDate: z.string().optional(), // ISO date string
  desiredDeadline: z.string().optional(), // ISO date string
  objectives: z.string().optional(),
  targetAudience: z.string().optional(),
  deliverables: z.string().optional(),
  additionalNotes: z.string().optional(),
});

/**
 * GET /api/project-requests
 * Fetch project requests (filtered by role)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let requests;

    if (user.role === "CLIENT") {
      // Clients see only their own requests
      const conditions = [eq(projectRequests.requestedBy, user.id)];
      if (status) {
        conditions.push(eq(projectRequests.status, status as any));
      }

      requests = await db
        .select({
          id: projectRequests.id,
          title: projectRequests.title,
          description: projectRequests.description,
          priority: projectRequests.priority,
          status: projectRequests.status,
          estimatedBudget: projectRequests.estimatedBudget,
          budgetCurrency: projectRequests.budgetCurrency,
          desiredStartDate: projectRequests.desiredStartDate,
          desiredDeadline: projectRequests.desiredDeadline,
          objectives: projectRequests.objectives,
          targetAudience: projectRequests.targetAudience,
          deliverables: projectRequests.deliverables,
          additionalNotes: projectRequests.additionalNotes,
          reviewNotes: projectRequests.reviewNotes,
          createdProjectId: projectRequests.createdProjectId,
          createdAt: projectRequests.createdAt,
          updatedAt: projectRequests.updatedAt,
        })
        .from(projectRequests)
        .where(conditions.length > 1 ? and(...conditions) : conditions[0])
        .orderBy(desc(projectRequests.createdAt))
        .limit(50);
    } else {
      // Admins/Team see all requests
      const query = db
        .select({
          id: projectRequests.id,
          title: projectRequests.title,
          description: projectRequests.description,
          priority: projectRequests.priority,
          status: projectRequests.status,
          estimatedBudget: projectRequests.estimatedBudget,
          budgetCurrency: projectRequests.budgetCurrency,
          desiredStartDate: projectRequests.desiredStartDate,
          desiredDeadline: projectRequests.desiredDeadline,
          objectives: projectRequests.objectives,
          targetAudience: projectRequests.targetAudience,
          deliverables: projectRequests.deliverables,
          additionalNotes: projectRequests.additionalNotes,
          reviewNotes: projectRequests.reviewNotes,
          requestedBy: projectRequests.requestedBy,
          clientId: projectRequests.clientId,
          reviewedBy: projectRequests.reviewedBy,
          reviewedAt: projectRequests.reviewedAt,
          createdProjectId: projectRequests.createdProjectId,
          createdAt: projectRequests.createdAt,
          updatedAt: projectRequests.updatedAt,
        })
        .from(projectRequests);

      if (status) {
        requests = await query
          .where(eq(projectRequests.status, status as any))
          .orderBy(desc(projectRequests.createdAt))
          .limit(50);
      } else {
        requests = await query.orderBy(desc(projectRequests.createdAt)).limit(50);
      }
    }

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching project requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch project requests" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/project-requests
 * Create a new project request (clients only)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only clients can create project requests
    if (user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Only clients can submit project requests" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = createProjectRequestSchema.parse(body);

    // Find the client record for this user
    const [clientRecord] = await db
      .select()
      .from(clients)
      .where(eq(clients.email, user.email || ""))
      .limit(1);

    if (!clientRecord) {
      return NextResponse.json({ error: "Client record not found" }, { status: 404 });
    }

    // Create the project request
    const [newRequest] = await db
      .insert(projectRequests)
      .values({
        title: validated.title,
        description: validated.description,
        priority: validated.priority,
        status: "PENDING",
        workspaceId: clientRecord.workspaceId,
        requestedBy: user.id,
        clientId: clientRecord.id,
        estimatedBudget: validated.estimatedBudget,
        budgetCurrency: validated.budgetCurrency || "USD",
        desiredStartDate: validated.desiredStartDate
          ? new Date(validated.desiredStartDate)
          : null,
        desiredDeadline: validated.desiredDeadline
          ? new Date(validated.desiredDeadline)
          : null,
        objectives: validated.objectives,
        targetAudience: validated.targetAudience,
        deliverables: validated.deliverables,
        additionalNotes: validated.additionalNotes,
      })
      .returning();

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
  } catch (error) {
    console.error("Error creating project request:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        {
          error: firstError?.message || "Validation error",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create project request" },
      { status: 500 }
    );
  }
}
