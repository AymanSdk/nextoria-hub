/**
 * Shared Chat Types
 */

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderImage?: string;
  content: string;
  createdAt: Date | string | number; // Support multiple date formats
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  isArchived: boolean;
  projectId: string | null;
}
