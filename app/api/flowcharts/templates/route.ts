import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { flowcharts } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";

// GET - Get all flowchart templates
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");

    // Build query
    let query = db
      .select()
      .from(flowcharts)
      .where(eq(flowcharts.isTemplate, true))
      .orderBy(desc(flowcharts.createdAt));

    // Filter by category if provided
    if (category) {
      query = db
        .select()
        .from(flowcharts)
        .where(eq(flowcharts.templateCategory, category))
        .orderBy(desc(flowcharts.createdAt));
    }

    const templates = await query;

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}
