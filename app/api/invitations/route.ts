import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { invitations, workspaces } from "@/src/db/schema";
import { z } from "zod";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import { isAdmin } from "@/src/lib/auth/rbac";

const createInvitationSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "DEVELOPER", "DESIGNER", "MARKETER", "CLIENT"]),
});

/**
 * GET /api/invitations
 * Get all pending invitations for the workspace
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get workspace
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.slug, "nextoria-agency"))
      .limit(1);

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Get pending invitations
    const pendingInvitations = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.workspaceId, workspace.id),
          eq(invitations.acceptedAt, null as any)
        )
      );

    return NextResponse.json({ invitations: pendingInvitations });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 });
  }
}

/**
 * POST /api/invitations
 * Create a new invitation
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createInvitationSchema.parse(body);

    // Get workspace
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.slug, "nextoria-agency"))
      .limit(1);

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Generate unique token
    const token = nanoid(32);

    // Create invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [invitation] = await db
      .insert(invitations)
      .values({
        id: nanoid(),
        email: validated.email,
        role: validated.role,
        workspaceId: workspace.id,
        invitedBy: user.id,
        token,
        expires: expiresAt,
        createdAt: new Date(),
      })
      .returning();

    // In a production app, you would send an email here
    // For now, we'll return the invitation link
    const invitationLink = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/auth/signup?token=${token}`;

    console.log(`
      ✉️  Invitation created for ${validated.email}
      🔗 Invitation link: ${invitationLink}
      ⏰ Expires: ${expiresAt.toLocaleString()}
    `);

    return NextResponse.json(
      {
        invitation,
        invitationLink, // In production, don't return this - send it via email
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error creating invitation:", error);
    return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
  }
}
