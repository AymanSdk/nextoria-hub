import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import {
  getCurrentWorkspaceId,
  setCurrentWorkspaceId,
} from "@/src/lib/workspace/context";
import { db } from "@/src/db";
import { integrations } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/integrations/google-drive/callback
 * Handles OAuth callback from Google
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    console.log("User from session:", user);

    if (!user) {
      return NextResponse.redirect(
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/files?error=unauthorized`
      );
    }

    // Get workspace ID from cookie or database
    let workspaceId = await getCurrentWorkspaceId();
    console.log("Workspace ID from cookie:", workspaceId);

    // If no workspace in cookie, get user's first workspace
    if (!workspaceId) {
      console.log("No workspace in cookie, fetching from database for user:", user.id);

      const { workspaceMembers } = await import("@/src/db/schema");
      const memberships = await db
        .select({ workspaceId: workspaceMembers.workspaceId })
        .from(workspaceMembers)
        .where(eq(workspaceMembers.userId, user.id));

      console.log("Found memberships:", memberships);

      if (memberships.length === 0) {
        console.error("User has no workspace memberships!");
        return NextResponse.redirect(
          `${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/files?error=no_workspace`
        );
      }

      workspaceId = memberships[0].workspaceId;
      console.log("Using workspace ID:", workspaceId);

      // Set the workspace cookie for future requests
      await setCurrentWorkspaceId(workspaceId);
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      console.error("Google Drive OAuth error:", error);
      return NextResponse.redirect(
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/files?error=access_denied`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/files?error=no_code`
      );
    }

    // Verify state matches user ID
    if (state !== user.id) {
      return NextResponse.redirect(
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/files?error=invalid_state`
      );
    }

    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
    const redirectUri =
      process.env.GOOGLE_DRIVE_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google-drive/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/files?error=config_missing`
      );
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("Token exchange error:", error);
      return NextResponse.redirect(
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/files?error=token_exchange_failed`
      );
    }

    const tokens = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const userInfo = await userInfoResponse.json();

    // Check if integration already exists
    const existingIntegration = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.workspaceId, workspaceId),
          eq(integrations.type, "GOOGLE_DRIVE")
        )
      )
      .limit(1);

    const config = JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: Date.now() + tokens.expires_in * 1000,
      scope: tokens.scope,
      email: userInfo.email,
    });

    if (existingIntegration.length > 0) {
      // Update existing integration
      await db
        .update(integrations)
        .set({
          config,
          isActive: true,
          lastSyncAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, existingIntegration[0].id));
    } else {
      // Create new integration
      await db.insert(integrations).values({
        workspaceId,
        type: "GOOGLE_DRIVE",
        name: "Google Drive",
        description: `Connected to ${userInfo.email}`,
        config,
        isActive: true,
        connectedBy: user.id,
        lastSyncAt: new Date(),
      });
    }

    return NextResponse.redirect(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/files?tab=drive&connected=true`
    );
  } catch (error) {
    console.error("Google Drive callback error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.redirect(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/files?error=callback_failed`
    );
  }
}
