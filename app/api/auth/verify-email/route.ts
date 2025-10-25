import { NextRequest, NextResponse } from "next/server";
import { verifyEmail } from "@/src/lib/auth/verification";

/**
 * Verify Email Endpoint
 * Verifies a user's email address using a 6-digit verification code
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, email } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      );
    }

    const result = await verifyEmail(code, email);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! You can now sign in.",
      email: result.email,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 });
  }
}
