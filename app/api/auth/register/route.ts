import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { users, workspaces, workspaceMembers, invitations } from "@/src/db/schema";
import { hashPassword, validatePassword } from "@/src/lib/auth/password";
import { eq, and, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, invitationToken } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if this is the first user (will be admin)
    const existingUsers = await db.select().from(users).limit(1);
    const isFirstUser = existingUsers.length === 0;

    let invitation = null;
    let userRole = "DEVELOPER"; // Default role for new signups
    let workspaceId = null;

    // If invitation token provided, validate it
    if (invitationToken) {
      const [inv] = await db
        .select()
        .from(invitations)
        .where(
          and(eq(invitations.token, invitationToken), isNull(invitations.acceptedAt))
        )
        .limit(1);

      if (!inv) {
        return NextResponse.json(
          { error: "Invalid or expired invitation" },
          { status: 400 }
        );
      }

      // Check if invitation has expired
      if (new Date() > new Date(inv.expires)) {
        return NextResponse.json(
          { error: "Invitation has expired. Please request a new one." },
          { status: 400 }
        );
      }

      // Check if email matches invitation
      if (inv.email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json(
          { error: "Email does not match the invitation" },
          { status: 400 }
        );
      }

      invitation = inv;
      userRole = inv.role;
      workspaceId = inv.workspaceId;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: passwordValidation.errors[0] }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Determine user role (first user is ADMIN, or use invitation role, or default)
    const finalRole = isFirstUser ? "ADMIN" : invitation?.role || userRole;

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: finalRole as any,
        isActive: true,
      })
      .returning();

    // If first user, create default workspace and add user as owner
    if (isFirstUser) {
      const [workspace] = await db
        .insert(workspaces)
        .values({
          id: nanoid(),
          name: "Nextoria Agency",
          slug: "nextoria-agency",
          description: "Your digital agency operations hub",
          ownerId: newUser.id,
          isActive: true,
        })
        .returning();

      workspaceId = workspace.id;
    } else if (!workspaceId) {
      // If no invitation, add to default workspace
      const [defaultWorkspace] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.slug, "nextoria-agency"))
        .limit(1);

      if (defaultWorkspace) {
        workspaceId = defaultWorkspace.id;
      }
    }

    // Add user to workspace if we have one
    if (workspaceId) {
      await db.insert(workspaceMembers).values({
        id: nanoid(),
        workspaceId: workspaceId,
        userId: newUser.id,
        role: finalRole as any,
        isActive: true,
        joinedAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Mark invitation as accepted if it exists
    if (invitation) {
      await db
        .update(invitations)
        .set({
          acceptedAt: new Date(),
        })
        .where(eq(invitations.id, invitation.id));
    }

    console.log(
      `✓ User ${email} created with role ${finalRole}${
        isFirstUser ? " (FIRST USER - ADMIN)" : ""
      } and added to workspace`
    );

    // Return success (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
