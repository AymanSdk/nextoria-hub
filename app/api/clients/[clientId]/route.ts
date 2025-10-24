import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { getCurrentWorkspace } from "@/src/lib/workspace/context";
import { db } from "@/src/db";
import { clients } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  companyName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  industry: z.string().optional(),
  notes: z.string().optional(),
  logo: z.string().optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/clients/[clientId]
 * Get a single client
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { clientId } = await params;

    // 🔒 SECURITY: Verify client belongs to user's workspace
    const workspace = await getCurrentWorkspace(user.id);
    if (!workspace) {
      return NextResponse.json({ error: "No workspace access" }, { status: 403 });
    }

    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, clientId), eq(clients.workspaceId, workspace.id)))
      .limit(1);

    if (!client) {
      return NextResponse.json(
        { error: "Client not found or no access" },
        { status: 404 }
      );
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}

/**
 * PATCH /api/clients/[clientId]
 * Update a client
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { clientId } = await params;
    const body = await req.json();

    const validated = updateClientSchema.parse(body);

    // 🔒 SECURITY: Verify client belongs to user's workspace
    const workspace = await getCurrentWorkspace(user.id);
    if (!workspace) {
      return NextResponse.json({ error: "No workspace access" }, { status: 403 });
    }

    const [updatedClient] = await db
      .update(clients)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(and(eq(clients.id, clientId), eq(clients.workspaceId, workspace.id)))
      .returning();

    if (!updatedClient) {
      return NextResponse.json(
        { error: "Client not found or no access" },
        { status: 404 }
      );
    }

    return NextResponse.json({ client: updatedClient });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error("Error updating client:", error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

/**
 * DELETE /api/clients/[clientId]
 * Delete a client
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { clientId } = await params;

    // 🔒 SECURITY: Verify client belongs to user's workspace and user has permission
    const workspace = await getCurrentWorkspace(user.id);
    if (!workspace) {
      return NextResponse.json({ error: "No workspace access" }, { status: 403 });
    }

    // Only admins can delete clients
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can delete clients" },
        { status: 403 }
      );
    }

    const result = await db
      .delete(clients)
      .where(and(eq(clients.id, clientId), eq(clients.workspaceId, workspace.id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Client not found or no access" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}
