import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";

/**
 * GET /api/integrations/google-drive/auth
 * Initiates Google Drive OAuth flow
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const redirectUri =
      process.env.GOOGLE_DRIVE_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google-drive/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: "Google Drive integration not configured" },
        { status: 500 }
      );
    }

    // Google OAuth2 scopes for Drive
    const scopes = [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/userinfo.email",
    ];

    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
      state: user.id, // Pass user ID for verification in callback
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Google Drive auth error:", error);
    return NextResponse.json(
      { error: "Failed to initiate Google Drive authentication" },
      { status: 500 }
    );
  }
}
