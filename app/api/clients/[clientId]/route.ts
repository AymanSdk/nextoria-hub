import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { clients } from "@/src/db/schema";
import { eq } from "drizzle-orm";
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
  { params }: { params: { clientId: string } }
) {
  try {
    const user = await getCurrentUser();

    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, params.clientId))
      .limit(1);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/clients/[clientId]
 * Update a client
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const validated = updateClientSchema.parse(body);

    const [updatedClient] = await db
      .update(clients)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, params.clientId))
      .returning();

    if (!updatedClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client: updatedClient });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clients/[clientId]
 * Delete a client
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const user = await getCurrentUser();

    await db.delete(clients).where(eq(clients.id, params.clientId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}

