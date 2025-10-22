import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

/**
 * Upload file to S3
 */
export async function uploadFile(
  file: Buffer,
  fileName: string,
  mimeType: string,
  folder: string = "uploads"
): Promise<{ key: string; url: string }> {
  const fileExtension = fileName.split(".").pop();
  const key = `${folder}/${nanoid()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  const url = `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`;

  return { key, url };
}

/**
 * Delete file from S3
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Get signed URL for file access (for private files)
 */
export async function getSignedFileUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Get presigned URL for upload (client-side direct upload)
 */
export async function getPresignedUploadUrl(
  fileName: string,
  mimeType: string,
  folder: string = "uploads",
  expiresIn: number = 3600
): Promise<{ uploadUrl: string; key: string; finalUrl: string }> {
  const fileExtension = fileName.split(".").pop();
  const key = `${folder}/${nanoid()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
  const finalUrl = `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${key}`;

  return { uploadUrl, key, finalUrl };
}

/**
 * Validate file type
 */
export function validateFileType(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.some((type) => {
    if (type.endsWith("/*")) {
      const prefix = type.slice(0, -2);
      return mimeType.startsWith(prefix);
    }
    return mimeType === type;
  });
}

/**
 * Validate file size
 */
export function validateFileSize(
  size: number,
  maxSize: number = 10 * 1024 * 1024 // 10MB default
): boolean {
  return size <= maxSize;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

