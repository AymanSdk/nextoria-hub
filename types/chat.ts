/**
 * Shared Chat Types
 */

import type { Role } from "@/src/lib/constants/roles";

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderImage?: string;
  senderRole?: Role;
  content: string;
  createdAt: Date | string | number; // Support multiple date formats
  attachments?: FileAttachment[];
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  isArchived: boolean;
  projectId: string | null;
  channelType?: string;
  unreadCount?: number;
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}
