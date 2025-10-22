import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { invoices, invoiceLineItems, clients, projects } from "@/src/db/schema";
import { eq, and, or, inArray } from "drizzle-orm";

/**
 * GET /api/invoices/[id]
 * Get invoice details with line items
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch invoice
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Check permissions for CLIENT role
    if (session.user.role === "CLIENT") {
      // Find client record
      const [clientRecord] = await db
        .select()
        .from(clients)
        .where(eq(clients.email, session.user.email || ""))
        .limit(1);

      if (clientRecord) {
        // Check if invoice belongs to this client or their projects
        const clientProjects = await db
          .select({ id: projects.id })
          .from(projects)
          .where(eq(projects.clientId, clientRecord.id));

        const projectIds = clientProjects.map((p) => p.id);
        const hasAccess =
          invoice.clientId === clientRecord.id ||
          (invoice.projectId && projectIds.includes(invoice.projectId));

        if (!hasAccess) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Fetch line items
    const lineItems = await db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, id))
      .orderBy(invoiceLineItems.order);

    return NextResponse.json({ invoice, lineItems });
  } catch (error: any) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/invoices/[id]
 * Update invoice
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins and certain roles can update invoices
    if (session.user.role === "CLIENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, notes, terms, dueDate, lineItems, taxRate } = body;

    // Fetch existing invoice
    const [existingInvoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1);

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (terms !== undefined) updateData.terms = terms;
    if (dueDate) updateData.dueDate = new Date(dueDate);

    // If line items are updated, recalculate totals
    if (lineItems) {
      const subtotal = lineItems.reduce(
        (sum: number, item: any) => sum + item.quantity * item.unitPrice,
        0
      );
      const calculatedTaxRate =
        taxRate !== undefined ? taxRate : existingInvoice.taxRate || 0;
      const taxAmount = Math.round((subtotal * calculatedTaxRate) / 10000);
      const total = subtotal + taxAmount;

      updateData.subtotal = subtotal;
      updateData.taxRate = calculatedTaxRate;
      updateData.taxAmount = taxAmount;
      updateData.total = total;

      // Delete old line items
      await db.delete(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, id));

      // Insert new line items
      await db.insert(invoiceLineItems).values(
        lineItems.map((item: any, idx: number) => ({
          invoiceId: id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
          order: idx,
        }))
      );
    }

    // Update status-specific fields
    if (status === "PAID" && !existingInvoice.paidAt) {
      updateData.paidAt = new Date();
    }

    // Update invoice
    const [updatedInvoice] = await db
      .update(invoices)
      .set(updateData)
      .where(eq(invoices.id, id))
      .returning();

    // Fetch updated line items
    const updatedLineItems = await db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, id))
      .orderBy(invoiceLineItems.order);

    return NextResponse.json({ invoice: updatedInvoice, lineItems: updatedLineItems });
  } catch (error: any) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update invoice" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/invoices/[id]
 * Delete invoice
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can delete invoices
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check if invoice exists
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Delete invoice (line items will be cascade deleted)
    await db.delete(invoices).where(eq(invoices.id, id));

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
