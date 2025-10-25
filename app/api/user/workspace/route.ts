import { NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { getCurrentWorkspace } from "@/src/lib/workspace/context";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const workspace = await getCurrentWorkspace(session.user.id);

    if (!workspace) {
      return NextResponse.json(
        { success: false, error: "No workspace found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
      },
    });
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch workspace" },
      { status: 500 }
    );
  }
}
