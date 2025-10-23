/**
 * Mention parsing and utilities
 */

export interface Mention {
  userId: string;
  username: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Parse mentions from HTML content
 * Format: <span data-type="mention" data-id="user_id">@username</span>
 */
export function parseMentions(html: string): Mention[] {
  const mentions: Mention[] = [];
  const mentionRegex =
    /<span[^>]*data-type="mention"[^>]*data-id="([^"]+)"[^>]*>@([^<]+)<\/span>/g;

  let match;
  while ((match = mentionRegex.exec(html)) !== null) {
    mentions.push({
      userId: match[1],
      username: match[2],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return mentions;
}

/**
 * Extract user IDs from mentions
 */
export function extractMentionedUserIds(html: string): string[] {
  const mentions = parseMentions(html);
  return mentions.map((m) => m.userId);
}

/**
 * Check if content has mentions
 */
export function hasMentions(html: string): boolean {
  return html.includes('data-type="mention"');
}
