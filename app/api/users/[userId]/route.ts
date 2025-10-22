import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/src/lib/auth/rbac";
import { z } from "zod";

const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(["ADMIN", "DEVELOPER", "DESIGNER", "MARKETER", "CLIENT"]).optional(),
});

/**
 * PATCH /api/users/[userId]
 * Update user (admin only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;
    const body = await req.json();
    const validated = updateUserSchema.parse(body);

    // Don't allow deactivating yourself
    if (userId === user.id && validated.isActive === false) {
      return NextResponse.json(
        { error: "You cannot deactivate yourself" },
        { status: 400 }
      );
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
