import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { invoices, invoiceLineItems, users, projects, clients } from "@/src/db/schema";
import { eq, desc, and, or, ilike, inArray } from "drizzle-orm";
import { logActivity } from "@/src/lib/notifications/activity-logger";
import { nanoid } from "nanoid";

/**
 * Generate invoice number
 */
function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `INV-${year}-${random}`;
}

/**
 * GET /api/invoices
 * List all invoices (with filters)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const projectId = searchParams.get("projectId");
    const search = searchParams.get("search");

    // Build query conditions
    const conditions = [];

    // Role-based filtering
    if (session.user.role === "CLIENT") {
      // Find client record
      const [clientRecord] = await db
        .select()
        .from(clients)
        .where(eq(clients.email, session.user.email || ""))
        .limit(1);

      if (clientRecord) {
        // Get invoices for this client's projects
        const clientProjects = await db
          .select({ id: projects.id })
          .from(projects)
          .where(eq(projects.clientId, clientRecord.id));

        const projectIds = clientProjects.map((p) => p.id);

        if (projectIds.length > 0) {
          conditions.push(
            or(
              eq(invoices.clientId, clientRecord.id),
              inArray(invoices.projectId, projectIds)
            )
          );
        } else {
          conditions.push(eq(invoices.clientId, clientRecord.id));
        }
      } else {
        return NextResponse.json({ invoices: [], total: 0 });
      }
    }

    // Apply filters
    if (status) {
      conditions.push(eq(invoices.status, status as any));
    }
    if (clientId) {
      conditions.push(eq(invoices.clientId, clientId));
    }
    if (projectId) {
      conditions.push(eq(invoices.projectId, projectId));
    }
    if (search) {
      conditions.push(ilike(invoices.invoiceNumber, `%${search}%`));
    }

    // Fetch invoices
    const userInvoices = await db
      .select()
      .from(invoices)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(invoices.createdAt))
      .limit(100);

    return NextResponse.json({
      invoices: userInvoices,
      total: userInvoices.length,
    });
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invoices
 * Create a new invoice
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and certain roles can create invoices
    if (session.user.role === "CLIENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      clientId,
      projectId,
      lineItems,
      dueDate,
      notes,
      terms,
      taxRate = 0,
      status = "DRAFT",
    } = body;

    // Validate required fields
    if (!clientId || !lineItems || lineItems.length === 0) {
      return NextResponse.json(
        { error: "Client and line items are required" },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = lineItems.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = Math.round((subtotal * taxRate) / 10000);
    const total = subtotal + taxAmount;

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber();
    const issueDate = new Date();
    const calculatedDueDate = dueDate ? new Date(dueDate) : new Date();
    if (!dueDate) {
      calculatedDueDate.setDate(calculatedDueDate.getDate() + 30);
    }

    // Get user's workspace from workspace_members table
    const { workspaceMembers, workspaces } = await import("@/src/db/schema/workspaces");
    const [membership] = await db
      .select({ workspaceId: workspaceMembers.workspaceId })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, session.user.id))
      .limit(1);

    if (!membership) {
      return NextResponse.json(
        { error: "No workspace found for user. Please contact your administrator." },
        { status: 400 }
      );
    }

    const workspaceId = membership.workspaceId;

    // Create invoice
    const [invoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        workspaceId,
        projectId: projectId || null,
        clientId,
        status: status as any,
        subtotal,
        taxRate,
        taxAmount,
        total,
        currency: "USD",
        issueDate,
        dueDate: calculatedDueDate,
        notes,
        terms,
        createdBy: session.user.id,
      })
      .returning();

    // Create line items
    await db.insert(invoiceLineItems).values(
      lineItems.map((item: any, idx: number) => ({
        invoiceId: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.quantity * item.unitPrice,
        order: idx,
      }))
    );

    // Get client details for activity log
    const client = await db.query.clients.findFirst({
      where: eq(clients.id, clientId),
    });

    // Log activity
    await logActivity({
      workspaceId: workspaceId,
      userId: session.user.id,
      activityType: status === "SENT" ? "INVOICE_SENT" : "INVOICE_CREATED",
      entityType: "invoice",
      entityId: invoice.id,
      title: `${status === "SENT" ? "sent" : "created"} invoice ${invoiceNumber}`,
      description: client?.name ? `to ${client.name}` : undefined,
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create invoice" },
      { status: 500 }
    );
  }
}
