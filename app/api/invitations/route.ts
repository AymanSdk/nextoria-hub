import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { invitations, workspaces, workspaceMembers, users } from "@/src/db/schema";
import { z } from "zod";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import { isAdmin } from "@/src/lib/auth/rbac";
import { sendInvitationEmail } from "@/src/lib/notifications/email";

// Force Node.js runtime for nodemailer compatibility
export const runtime = "nodejs";

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

    // Get user's workspace
    const [membership] = await db
      .select({
        workspaceId: workspaceMembers.workspaceId,
      })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, user.id))
      .limit(1);

    if (!membership) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Get pending invitations
    const pendingInvitations = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.workspaceId, membership.workspaceId),
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

    // Get user's workspace
    const [membership] = await db
      .select({
        workspaceId: workspaceMembers.workspaceId,
      })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, user.id))
      .limit(1);

    if (!membership) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Get workspace details
    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, membership.workspaceId))
      .limit(1);

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Check if user with this email already exists in workspace
    const existingMember = await db
      .select({
        userId: workspaceMembers.userId,
      })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userId, users.id))
      .where(
        and(
          eq(workspaceMembers.workspaceId, membership.workspaceId),
          eq(users.email, validated.email.toLowerCase())
        )
      )
      .limit(1);

    if (existingMember.length > 0) {
      return NextResponse.json(
        { error: "User with this email is already a member of this workspace" },
        { status: 400 }
      );
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, validated.email.toLowerCase()),
          eq(invitations.workspaceId, membership.workspaceId),
          eq(invitations.acceptedAt, null as any)
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 400 }
      );
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
        email: validated.email.toLowerCase(),
        role: validated.role,
        workspaceId: membership.workspaceId,
        invitedBy: user.id,
        token,
        expires: expiresAt,
        createdAt: new Date(),
      })
      .returning();

    // Generate invitation link
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://app.nextoria.studio";
    const invitationLink = `${baseUrl}/auth/signup?token=${token}`;

    // Send invitation email
    try {
      await sendInvitationEmail({
        to: validated.email,
        inviterName: user.name || user.email,
        inviterEmail: user.email,
        workspaceName: workspace.name,
        role: validated.role,
        invitationLink,
        expiresAt,
      });

      console.log(`✉️  Invitation email sent to ${validated.email}`);
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Continue anyway - invitation is created, user can be manually notified
    }

    return NextResponse.json(
      {
        invitation,
        message: `Invitation sent to ${validated.email}`,
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
