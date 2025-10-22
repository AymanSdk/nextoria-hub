import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { users, workspaces, workspaceMembers } from "@/src/db/schema";
import { hashPassword, validatePassword } from "@/src/lib/auth/password";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "CLIENT", // Default role - admin can change this later
        isActive: true,
      })
      .returning();

    // Auto-add user to Nextoria Agency workspace (if it exists)
    const [agencyWorkspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.slug, "nextoria-agency"))
      .limit(1);

    if (agencyWorkspace) {
      await db.insert(workspaceMembers).values({
        id: nanoid(),
        workspaceId: agencyWorkspace.id,
        userId: newUser.id,
        role: "CLIENT", // Default role in workspace
        isActive: true,
        joinedAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✓ User ${email} added to Nextoria Agency workspace`);
    }

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
