import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { deleteFile } from "@/src/lib/storage/s3";
import { db } from "@/src/db";
import { files } from "@/src/db/schema";
import { eq } from "drizzle-orm";

/**
 * DELETE /api/deliverables/[fileId]
 * Delete a deliverable
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await params;

    // Get file record
    const file = await db.query.files.findFirst({
      where: eq(files.id, fileId),
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Clients cannot delete files
    if (user.role === "CLIENT") {
      return NextResponse.json(
        { error: "Clients are not allowed to delete files" },
        { status: 403 }
      );
    }

    // Check if user has permission to delete (must be uploader or admin)
    if (file.uploadedBy !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized to delete this file" },
        { status: 403 }
      );
    }

    // Delete from S3
    await deleteFile(file.storageKey);

    // Delete from database (soft delete by archiving)
    await db.update(files).set({ isArchived: true }).where(eq(files.id, fileId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete deliverable error:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
