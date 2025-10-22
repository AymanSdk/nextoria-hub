import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { clients } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { nanoid } from "nanoid";

const createClientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  companyName: z.string().optional(),
  email: z.string().email("Invalid email"),
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
  workspaceId: z.string(),
});

/**
 * GET /api/clients
 * Get all clients for a workspace
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    // If workspaceId is provided, use it; otherwise fetch all clients for the user's workspace
    let allClients: (typeof clients.$inferSelect)[] = [];

    if (workspaceId) {
      allClients = await db
        .select()
        .from(clients)
        .where(eq(clients.workspaceId, workspaceId))
        .orderBy(clients.name);
    } else {
      // Fetch all clients (for file upload use case)
      const { workspaces } = await import("@/src/db/schema");
      const [defaultWorkspace] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.slug, "nextoria-agency"))
        .limit(1);

      if (defaultWorkspace) {
        allClients = await db
          .select()
          .from(clients)
          .where(eq(clients.workspaceId, defaultWorkspace.id))
          .orderBy(clients.name);
      } else {
        allClients = [];
      }
    }

    return NextResponse.json({ clients: allClients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

/**
 * POST /api/clients
 * Create a new client
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const validated = createClientSchema.parse(body);

    const [newClient] = await db
      .insert(clients)
      .values({
        id: nanoid(),
        ...validated,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ client: newClient }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
