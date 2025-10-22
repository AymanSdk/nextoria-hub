import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { getPresignedUploadUrl, validateFileType } from "@/src/lib/storage/s3";
import { z } from "zod";

const presignedUrlSchema = z.object({
  fileName: z.string(),
  mimeType: z.string(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
});

const ALLOWED_FILE_TYPES = [
  "image/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/*",
];

/**
 * POST /api/upload/presigned
 * Get presigned URL for client-side direct upload to S3
 */
export async function POST(req: NextRequest) {
  try {
    await getCurrentUser();
    const body = await req.json();

    const validated = presignedUrlSchema.parse(body);

    // Validate file type
    if (!validateFileType(validated.mimeType, ALLOWED_FILE_TYPES)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );
    }

    // Determine folder
    const folder = validated.projectId
      ? `projects/${validated.projectId}`
      : validated.taskId
      ? `tasks/${validated.taskId}`
      : "general";

    // Get presigned URL
    const { uploadUrl, key, finalUrl } = await getPresignedUploadUrl(
      validated.fileName,
      validated.mimeType,
      folder
    );

    return NextResponse.json({
      uploadUrl,
      key,
      finalUrl,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Presigned URL error:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}

