/**
 * Chat utility functions
 */

/**
 * Convert HTML to plain text
 * Removes all HTML tags and entities
 */
export function htmlToPlainText(html: string): string {
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, "");
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
  
  return text.trim();
}

/**
 * Check if message content is empty
 * Handles both plain text and HTML
 */
export function isMessageEmpty(content: string): boolean {
  const plainText = htmlToPlainText(content);
  return !plainText || plainText.length === 0;
}

/**
 * Truncate message for preview
 */
export function truncateMessage(content: string, maxLength: number = 100): string {
  const plainText = htmlToPlainText(content);
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + "...";
}

/**
 * Extract links from message content
 */
export function extractLinks(content: string): string[] {
  const urlRegex = /https?:\/\/[^\s<]+/g;
  return content.match(urlRegex) || [];
}

/**
 * Check if content contains mentions
 */
export function hasMentions(content: string): boolean {
  // This will be expanded when we add mention support
  return content.includes("@");
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get file icon based on MIME type
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType.startsWith("video/")) return "🎥";
  if (mimeType.startsWith("audio/")) return "🎵";
  if (mimeType.includes("pdf")) return "📄";
  if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "📊";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "📊";
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar")) return "📦";
  if (mimeType.includes("code") || mimeType.includes("text")) return "📋";
  
  return "📎";
}

/**
 * Validate message content before sending
 */
export function validateMessageContent(content: string): {
  valid: boolean;
  error?: string;
} {
  if (isMessageEmpty(content)) {
    return { valid: false, error: "Message cannot be empty" };
  }
  
  const plainText = htmlToPlainText(content);
  
  if (plainText.length > 10000) {
    return { valid: false, error: "Message is too long (max 10,000 characters)" };
  }
  
  return { valid: true };
}

