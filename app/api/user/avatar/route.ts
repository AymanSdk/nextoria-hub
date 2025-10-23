import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import {
  uploadFile,
  deleteFile,
  validateFileType,
  validateFileSize,
} from "@/src/lib/storage/s3";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/user/avatar
 * Upload user profile picture
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      console.error("Avatar upload: No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Avatar upload: User ID:", session.user.id);

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("Avatar upload: No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("Avatar upload: File received -", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Validate file type
    if (!validateFileType(file.type, ALLOWED_IMAGE_TYPES)) {
      console.error("Avatar upload: Invalid file type:", file.type);
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed" },
        { status: 400 }
      );
    }

    // Validate file size
    if (!validateFileSize(file.size, MAX_FILE_SIZE)) {
      console.error("Avatar upload: File too large:", file.size);
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    // Get current user to check for existing avatar
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser) {
      console.error("Avatar upload: User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Avatar upload: Current user image:", currentUser.image);

    // Delete old avatar from S3 if it exists and it's an S3 URL
    if (
      currentUser.image &&
      (currentUser.image.includes("amazonaws.com") ||
        currentUser.image.includes("r2.dev"))
    ) {
      try {
        const oldKey = currentUser.image.split("/").slice(-2).join("/"); // Extract key from URL
        console.log("Avatar upload: Deleting old avatar with key:", oldKey);
        await deleteFile(oldKey);
      } catch (error) {
        console.error("Error deleting old avatar:", error);
        // Continue anyway, don't block the upload
      }
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("Avatar upload: File converted to buffer, size:", buffer.length);

    // Upload to S3 in avatars folder
    const folder = `avatars/${session.user.id}`;
    console.log("Avatar upload: Uploading to S3 folder:", folder);

    const { url, key } = await uploadFile(buffer, file.name, file.type, folder);
    console.log("Avatar upload: S3 upload successful -", { url, key });

    // Update user avatar in database
    const [updatedUser] = await db
      .update(users)
      .set({
        image: url,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .returning();

    if (!updatedUser) {
      console.error("Avatar upload: Failed to update user in database");
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }

    console.log(
      "Avatar upload: Database updated successfully, new image URL:",
      updatedUser.image
    );

    return NextResponse.json({
      success: true,
      imageUrl: updatedUser.image,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
      },
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      {
        error: "Failed to upload avatar",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/avatar
 * Remove user profile picture
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user
    const [currentUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete avatar from S3 if it exists and it's an S3 URL
    if (currentUser.image && currentUser.image.includes("amazonaws.com")) {
      try {
        const key = currentUser.image.split("/").slice(-2).join("/"); // Extract key from URL
        await deleteFile(key);
      } catch (error) {
        console.error("Error deleting avatar:", error);
        // Continue anyway
      }
    }

    // Remove image from database
    const [updatedUser] = await db
      .update(users)
      .set({
        image: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .returning();

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
      },
    });
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return NextResponse.json({ error: "Failed to delete avatar" }, { status: 500 });
  }
}
