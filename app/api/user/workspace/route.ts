import { NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { getCurrentWorkspace } from "@/src/lib/workspace/context";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspace = await getCurrentWorkspace(session.user.id);

    if (!workspace) {
      return NextResponse.json({ error: "No workspace found" }, { status: 404 });
    }

    return NextResponse.json({ workspaceId: workspace.id });
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return NextResponse.json({ error: "Failed to fetch workspace" }, { status: 500 });
  }
}
