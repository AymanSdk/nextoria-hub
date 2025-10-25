import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { users, workspaces, workspaceMembers, invitations } from "@/src/db/schema";
import { hashPassword, validatePassword } from "@/src/lib/auth/password";
import { eq, and, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { setCurrentWorkspaceId } from "@/src/lib/workspace/context";
import {
  generateVerificationToken,
  sendVerificationEmail,
} from "@/src/lib/auth/verification";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, invitationToken } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let invitation = null;
    let userRole = "ADMIN"; // Default role for new signups (admin of their own workspace)
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

    // Determine user role (use invitation role if exists, otherwise default to ADMIN)
    const finalRole = invitation?.role || userRole;

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

    // Create a new workspace for this user if they don't have an invitation
    if (!workspaceId) {
      // Generate a unique workspace slug based on user name or email
      const baseSlug = (newUser.name || newUser.email)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 30);

      const workspaceSlug = `${baseSlug}-${nanoid(6)}`;

      const [workspace] = await db
        .insert(workspaces)
        .values({
          id: nanoid(),
          name: `${newUser.name}'s Workspace`,
          slug: workspaceSlug,
          description: "Your workspace",
          ownerId: newUser.id,
          isActive: true,
        })
        .returning();

      workspaceId = workspace.id;
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

    console.log(`✓ User ${email} created with role ${finalRole} and added to workspace`);

    // Generate verification token and send email
    const verificationToken = await generateVerificationToken(newUser.email);
    await sendVerificationEmail({
      to: newUser.email,
      name: newUser.name || "User",
      token: verificationToken,
    });

    console.log(`✓ Verification email sent to ${email}`);

    // Set the workspace cookie for the user
    if (workspaceId) {
      await setCurrentWorkspaceId(workspaceId);
    }

    // Return success (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
      message: "Account created! Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
