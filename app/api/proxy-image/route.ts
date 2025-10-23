import { NextRequest, NextResponse } from "next/server";
import { getSignedFileUrl } from "@/src/lib/storage/s3";

/**
 * GET /api/proxy-image?url=https://...
 * Proxy private R2 images through Next.js with presigned URLs
 * This is needed for old images that use private R2 URLs before public access was enabled
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get("url");

    console.log("Proxy Image: Received request for URL:", imageUrl);

    if (!imageUrl) {
      return NextResponse.json({ error: "URL parameter required" }, { status: 400 });
    }

    // Extract key from R2 URL
    // Example URL: https://be037cfe664ce61ffdd6f9a9a49fa1e2.r2.cloudflarestorage.com/nextoria-hub-files/avatars/xG_Hvc2_BNn53DOZsXQ_6/file.png
    // We need: avatars/xG_Hvc2_BNn53DOZsXQ_6/file.png

    const urlParts = new URL(imageUrl);
    const pathParts = urlParts.pathname.split("/").filter(Boolean); // Remove empty strings

    console.log("Proxy Image: Path parts:", pathParts);

    // Skip the bucket name (first part) and get the rest
    const key = pathParts.slice(1).join("/");

    console.log("Proxy Image: Extracted key:", key);

    if (!key) {
      return NextResponse.json(
        { error: "Invalid image URL - could not extract key" },
        { status: 400 }
      );
    }

    // Get presigned URL (valid for 1 hour)
    console.log("Proxy Image: Getting signed URL for key:", key);
    const signedUrl = await getSignedFileUrl(key, 3600);
    console.log("Proxy Image: Got signed URL");

    // Fetch the image
    const imageResponse = await fetch(signedUrl);

    if (!imageResponse.ok) {
      console.error(
        "Proxy Image: Failed to fetch from signed URL, status:",
        imageResponse.status
      );
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 404 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get("content-type") || "image/png";

    console.log("Proxy Image: Successfully fetched image, size:", imageBuffer.byteLength);

    // Return image with caching headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
