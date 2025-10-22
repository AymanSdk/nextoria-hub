"use client";

import { useEffect, useRef, useState } from "react";
import { useSelf, useOthers, useUpdateMyPresence } from "@/liveblocks.config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Loader2, MessageSquare } from "lucide-react";

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
  // Fallback to current time if invalid
  return new Date();
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: number;
}

interface ChatMessageListProps {
  channelId: string;
  messages: Message[];
}

export function ChatMessageList({ channelId, messages }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentUser = useSelf();
  const others = useOthers();
  const updatePresence = useUpdateMyPresence();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Update last seen timestamp
  useEffect(() => {
    updatePresence({ lastSeenAt: Date.now() });
  }, [messages, updatePresence]);

  // Show typing indicators
  const typingUsers = others
    .filter((other) => other.presence?.isTyping)
    .map((other) => other.info?.name || "Someone");

  return (
    <div className='flex flex-col h-full'>
      <ScrollArea className='flex-1'>
        <div className='px-4 sm:px-6 lg:px-8 py-6' ref={scrollRef}>
          <div className='space-y-4'>
            {messages.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-96 text-muted-foreground'>
                <div className='h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4'>
                  <MessageSquare className='h-8 w-8' />
                </div>
                <p className='font-medium text-foreground'>No messages yet</p>
                <p className='text-sm'>Be the first to say something!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = message.senderId === currentUser?.id;

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 group hover:bg-muted/30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 rounded-lg transition-colors ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isCurrentUser && (
                      <Avatar className='h-10 w-10 mt-1 shrink-0'>
                        <AvatarImage src={message.senderAvatar} />
                        <AvatarFallback className='bg-primary/10 text-primary font-medium'>
                          {message.senderName?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`flex flex-col max-w-[75%] sm:max-w-[70%] ${
                        isCurrentUser ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`flex items-baseline gap-2 mb-1 ${
                          isCurrentUser ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span className='text-sm font-semibold text-foreground'>
                          {isCurrentUser ? "You" : message.senderName}
                        </span>
                        <span className='text-xs text-muted-foreground whitespace-nowrap'>
                          {formatDistanceToNow(parseMessageDate(message.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <div
                        className={`px-4 py-2.5 rounded-2xl ${
                          isCurrentUser
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        }`}
                      >
                        <p className='text-sm whitespace-pre-wrap break-words leading-relaxed'>
                          {message.content}
                        </p>
                      </div>
                    </div>

                    {isCurrentUser && (
                      <Avatar className='h-10 w-10 mt-1 shrink-0'>
                        <AvatarImage src={message.senderAvatar} />
                        <AvatarFallback className='bg-primary text-primary-foreground font-medium'>
                          {message.senderName?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className='px-4 py-2 text-sm text-muted-foreground flex items-center gap-2 border-t bg-background/95'>
          <Loader2 className='h-3 w-3 animate-spin' />
          <span className='font-medium'>
            {typingUsers.length === 1
              ? `${typingUsers[0]} is typing...`
              : typingUsers.length === 2
              ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
              : `${typingUsers.length} people are typing...`}
          </span>
        </div>
      )}
    </div>
  );
}
