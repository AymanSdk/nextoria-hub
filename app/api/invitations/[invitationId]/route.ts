import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { invitations } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/src/lib/auth/rbac";

/**
 * DELETE /api/invitations/[invitationId]
 * Delete/revoke an invitation
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !isAdmin(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { invitationId } = await params;

    await db.delete(invitations).where(eq(invitations.id, invitationId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting invitation:", error);
    return NextResponse.json(
      { error: "Failed to delete invitation" },
      { status: 500 }
    );
  }
}

