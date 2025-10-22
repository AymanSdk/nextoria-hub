import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import {
  users,
  workspaces,
  workspaceMembers,
  invitations,
} from "@/src/db/schema";
import { hashPassword, validatePassword } from "@/src/lib/auth/password";
import { eq, and, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, invitationToken } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Require invitation token
    if (!invitationToken) {
      return NextResponse.json(
        { error: "Invitation token is required. Please contact an admin." },
        { status: 400 }
      );
    }

    // Validate invitation
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.token, invitationToken),
          isNull(invitations.acceptedAt)
        )
      )
      .limit(1);

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 400 }
      );
    }

    // Check if invitation has expired
    if (new Date() > new Date(invitation.expires)) {
      return NextResponse.json(
        { error: "Invitation has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if email matches invitation
    if (invitation.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: "Email does not match the invitation" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with role from invitation
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: invitation.role as any, // Use role from invitation
        isActive: true,
      })
      .returning();

    // Add user to workspace
    await db.insert(workspaceMembers).values({
      id: nanoid(),
      workspaceId: invitation.workspaceId,
      userId: newUser.id,
      role: invitation.role as any,
      isActive: true,
      joinedAt: new Date(),
      updatedAt: new Date(),
    });

    // Mark invitation as accepted
    await db
      .update(invitations)
      .set({
        acceptedAt: new Date(),
      })
      .where(eq(invitations.id, invitation.id));

    console.log(
      `✓ User ${email} created with role ${invitation.role} and added to workspace`
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
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
