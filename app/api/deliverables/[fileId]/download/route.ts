import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { getSignedFileUrl } from "@/src/lib/storage/s3";
import { db } from "@/src/db";
import { files, fileAccessLog } from "@/src/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/deliverables/[fileId]/download
 * Get presigned URL to download a deliverable
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { fileId } = await params;

    // Get file record
    const file = await db.query.files.findFirst({
      where: eq(files.id, fileId),
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Generate presigned download URL (valid for 1 hour)
    const downloadUrl = await getSignedFileUrl(file.storageKey, 3600);

    // Log access
    await db.insert(fileAccessLog).values({
      fileId: file.id,
      userId: user.id,
      action: "download",
      ipAddress: req.headers.get("x-forwarded-for") || req.ip || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      downloadUrl,
      fileName: file.name,
      mimeType: file.mimeType,
      size: file.size,
    });
  } catch (error) {
    console.error("Download deliverable error:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    );
  }
}
