"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { RichTextRenderer } from "./rich-text-renderer";
import { UserRoleBadge } from "./user-role-badge";
import { MessageAttachmentsList } from "./message-attachment";
import { FileAttachment } from "@/types/chat";
import type { Role } from "@/src/lib/constants/roles";
import { cn } from "@/lib/utils";

/**
 * Safely parse date from various formats
 */
function parseMessageDate(date: Date | string | number): Date {
  if (date instanceof Date) return date;
  if (typeof date === "number") return new Date(date);
  if (typeof date === "string") {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderImage?: string;
  senderRole?: Role;
  content: string;
  createdAt: number;
  attachments?: FileAttachment[];
}

interface MessageGroupProps {
  messages: Message[];
  isCurrentUser: boolean;
}

export function MessageGroup({ messages, isCurrentUser }: MessageGroupProps) {
  if (messages.length === 0) return null;

  const firstMessage = messages[0];

  return (
    <div
      className={cn(
        "flex gap-3 group -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 hover:bg-muted/40 transition-colors",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar - Only show for first message in group (other users) */}
      {!isCurrentUser && (
        <Avatar className='h-10 w-10 shrink-0'>
          <AvatarImage src={firstMessage.senderImage || undefined} />
          <AvatarFallback className='bg-primary/10 text-primary font-medium'>
            {firstMessage.senderName?.charAt(0).toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Messages */}
      <div
        className={cn(
          "flex flex-col max-w-[80%] sm:max-w-[75%] gap-1",
          isCurrentUser ? "items-end" : "items-start"
        )}
      >
        {/* Header - Show once for the group */}
        <div
          className={cn(
            "flex items-center gap-2 mb-1 flex-wrap",
            isCurrentUser ? "flex-row-reverse" : ""
          )}
        >
          <span className='text-sm font-semibold text-foreground'>
            {isCurrentUser ? "You" : firstMessage.senderName}
          </span>
          {firstMessage.senderRole && (
            <UserRoleBadge role={firstMessage.senderRole} size='sm' />
          )}
          <span className='text-xs text-muted-foreground whitespace-nowrap'>
            {formatDistanceToNow(parseMessageDate(firstMessage.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        {/* Message Bubbles */}
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "px-4 py-2.5 rounded-2xl shadow-sm w-full",
              isCurrentUser
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-muted text-foreground rounded-bl-md",
              index > 0 && "mt-0.5"
            )}
          >
            <RichTextRenderer
              content={message.content}
              className={cn(
                "text-sm leading-relaxed",
                isCurrentUser ? "prose-invert" : ""
              )}
            />
            {message.attachments && message.attachments.length > 0 && (
              <MessageAttachmentsList attachments={message.attachments} />
            )}
          </div>
        ))}
      </div>

      {/* Avatar - Only show for current user */}
      {isCurrentUser && (
        <Avatar className='h-10 w-10 shrink-0'>
          <AvatarImage src={firstMessage.senderImage} />
          <AvatarFallback className='bg-primary text-primary-foreground font-medium'>
            {firstMessage.senderName?.charAt(0).toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
