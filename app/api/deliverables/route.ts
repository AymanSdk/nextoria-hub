import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/src/lib/auth/session";
import { uploadFile, validateFileType, validateFileSize } from "@/src/lib/storage/s3";
import { db } from "@/src/db";
import { files, clients } from "@/src/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

const ALLOWED_FILE_TYPES = [
  "image/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/*",
  "video/*",
  "application/zip",
  "application/x-rar-compressed",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for deliverables

/**
 * GET /api/deliverables
 * List deliverables for a client
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    // Verify client exists
    const client = await db.query.clients.findFirst({
      where: eq(clients.id, clientId),
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Authorization: Clients can only access their own deliverables
    if (user.role === "CLIENT") {
      // Find the client record for this user
      const [clientRecord] = await db
        .select()
        .from(clients)
        .where(eq(clients.email, user.email || ""))
        .limit(1);

      if (!clientRecord) {
        return NextResponse.json({ error: "Client record not found" }, { status: 403 });
      }

      // Ensure they're requesting their own deliverables
      if (clientRecord.id !== clientId) {
        return NextResponse.json(
          {
            error: "You don't have permission to access these deliverables",
          },
          { status: 403 }
        );
      }
    }
    // For non-client users (team members), allow access to all deliverables

    // Get all deliverables for this client
    const deliverables = await db.query.files.findMany({
      where: and(eq(files.clientId, clientId), eq(files.isArchived, false)),
      orderBy: [desc(files.createdAt)],
      with: {
        uploadedBy: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ deliverables });
  } catch (error) {
    console.error("Get deliverables error:", error);
    return NextResponse.json({ error: "Failed to fetch deliverables" }, { status: 500 });
  }
}

/**
 * POST /api/deliverables
 * Upload a deliverable file for a client
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const clientId = formData.get("clientId") as string;
    const description = formData.get("description") as string | null;
    const tags = formData.get("tags") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    // Verify client exists
    const client = await db.query.clients.findFirst({
      where: eq(clients.id, clientId),
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Validate file type
    if (!validateFileType(file.type, ALLOWED_FILE_TYPES)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    // Validate file size
    if (!validateFileSize(file.size, MAX_FILE_SIZE)) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3 in clients folder
    const folder = `clients/${clientId}/deliverables`;
    const { key, url } = await uploadFile(buffer, file.name, file.type, folder);

    // Save file metadata to database
    const [fileRecord] = await db
      .insert(files)
      .values({
        name: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        storageKey: key,
        storageUrl: url,
        clientId,
        uploadedBy: user.id,
        description,
        tags,
      })
      .returning();

    return NextResponse.json({ file: fileRecord }, { status: 201 });
  } catch (error) {
    console.error("Upload deliverable error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
