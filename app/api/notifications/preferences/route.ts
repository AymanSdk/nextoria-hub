import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { notificationPreferences } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const preferencesSchema = z.object({
  emailEnabled: z.boolean().optional(),
  emailTaskAssigned: z.boolean().optional(),
  emailTaskCommented: z.boolean().optional(),
  emailTaskStatusChanged: z.boolean().optional(),
  emailTaskDueSoon: z.boolean().optional(),
  emailProjectInvitation: z.boolean().optional(),
  emailProjectUpdates: z.boolean().optional(),
  emailInvoices: z.boolean().optional(),
  emailFileShared: z.boolean().optional(),
  emailApprovals: z.boolean().optional(),
  emailMentions: z.boolean().optional(),
  inAppEnabled: z.boolean().optional(),
  dailyDigest: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
});

/**
 * GET /api/notifications/preferences
 * Get notification preferences for current user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let [prefs] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, user.id));

    // Create default preferences if they don't exist
    if (!prefs) {
      [prefs] = await db
        .insert(notificationPreferences)
        .values({
          userId: user.id,
        })
        .returning();
    }

    return NextResponse.json({ preferences: prefs });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

/**
 * PATCH /api/notifications/preferences
 * Update notification preferences for current user
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = preferencesSchema.parse(body);

    // Check if preferences exist
    const [existing] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, user.id));

    let prefs;
    if (existing) {
      [prefs] = await db
        .update(notificationPreferences)
        .set({
          ...validated,
          updatedAt: new Date(),
        })
        .where(eq(notificationPreferences.userId, user.id))
        .returning();
    } else {
      [prefs] = await db
        .insert(notificationPreferences)
        .values({
          userId: user.id,
          ...validated,
        })
        .returning();
    }

    return NextResponse.json({ preferences: prefs });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating preferences:", error);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
