import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { uploadFile, validateFileType, validateFileSize } from "@/src/lib/storage/s3";
import { db } from "@/src/db";
import { files } from "@/src/db/schema";
import { nanoid } from "nanoid";

const ALLOWED_FILE_TYPES = [
  "image/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/*",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * POST /api/upload
 * Upload a file to S3 and store metadata in database
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string | null;
    const taskId = formData.get("taskId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!validateFileType(file.type, ALLOWED_FILE_TYPES)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (!validateFileSize(file.size, MAX_FILE_SIZE)) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const folder = projectId
      ? `projects/${projectId}`
      : taskId
      ? `tasks/${taskId}`
      : "general";

    const { key, url } = await uploadFile(buffer, file.name, file.type, folder);

    // Save file metadata to database
    const [fileRecord] = await db
      .insert(files)
      .values({
        id: nanoid(),
        name: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        storageKey: key,
        storageUrl: url,
        projectId: projectId || null,
        taskId: taskId || null,
        uploadedBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ file: fileRecord }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

