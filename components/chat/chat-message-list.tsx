"use client";

import { useEffect, useRef, useState } from "react";
import { useSelf, useOthers, useUpdateMyPresence } from "@/liveblocks.config";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquare, ArrowDown } from "lucide-react";
import { MessageGroup } from "./message-group";
import { FileAttachment } from "@/types/chat";
import type { Role } from "@/src/lib/constants/roles";

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
  senderImage?: string;
  senderRole?: Role;
  content: string;
  createdAt: number;
  attachments?: FileAttachment[];
}

interface ChatMessageListProps {
  channelId: string;
  messages: Message[];
}

export function ChatMessageList({ channelId, messages }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useSelf();
  const others = useOthers();
  const updatePresence = useUpdateMyPresence();
  const [visibleCount, setVisibleCount] = useState(20); // Show only 20 messages initially
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!showJumpToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showJumpToBottom]);

  // Update last seen timestamp
  useEffect(() => {
    updatePresence({ lastSeenAt: Date.now() });
  }, [messages, updatePresence]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const isNearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 100;
    setShowJumpToBottom(!isNearBottom);
  };

  // Jump to bottom function
  const jumpToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowJumpToBottom(false);
  };

  // Show typing indicators
  const typingUsers = others
    .filter((other) => other.presence?.isTyping)
    .map((other) => other.info?.name || "Someone");

  // Get visible messages (most recent ones)
  const visibleMessages = messages.slice(-visibleCount);
  const hasOlderMessages = messages.length > visibleCount;

  // Load more messages
  const loadOlderMessages = () => {
    setIsLoadingMore(true);
    // Increase visible count by 20
    setTimeout(() => {
      setVisibleCount((prev) => prev + 20);
      setIsLoadingMore(false);
    }, 300); // Small delay for better UX
  };

  // Group consecutive messages from the same sender
  const groupMessages = (msgs: Message[]) => {
    const groups: Message[][] = [];
    let currentGroup: Message[] = [];

    msgs.forEach((msg, index) => {
      if (index === 0) {
        currentGroup = [msg];
      } else {
        const prevMsg = msgs[index - 1];
        const timeDiff = msg.createdAt - prevMsg.createdAt;
        const isSameSender = msg.senderId === prevMsg.senderId;
        const isWithinFiveMinutes = timeDiff < 5 * 60 * 1000; // 5 minutes

        if (isSameSender && isWithinFiveMinutes) {
          currentGroup.push(msg);
        } else {
          groups.push(currentGroup);
          currentGroup = [msg];
        }
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  };

  const messageGroups = groupMessages(visibleMessages);

  return (
    <div className='flex flex-col h-full relative'>
      <ScrollArea className='flex-1 h-0' onScrollCapture={handleScroll}>
        <div className='px-4 sm:px-6 py-6' ref={scrollRef}>
          <div className='space-y-0'>
            {/* Load Older Messages Button */}
            {hasOlderMessages && (
              <div className='flex justify-center pb-4'>
                <button
                  onClick={loadOlderMessages}
                  disabled={isLoadingMore}
                  className='px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      Loading...
                    </>
                  ) : (
                    <>
                      ↑ Load {Math.min(20, messages.length - visibleCount)} older messages
                    </>
                  )}
                </button>
              </div>
            )}

            {messages.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-96 text-muted-foreground'>
                <div className='h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4'>
                  <MessageSquare className='h-8 w-8' />
                </div>
                <p className='font-medium text-foreground'>No messages yet</p>
                <p className='text-sm'>Be the first to say something!</p>
              </div>
            ) : (
              messageGroups.map((group, index) => {
                const isCurrentUser = group[0].senderId === currentUser?.id;
                return (
                  <MessageGroup
                    key={group[0].id}
                    messages={group}
                    isCurrentUser={isCurrentUser}
                  />
                );
              })
            )}
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </ScrollArea>

      {/* Jump to Bottom Button */}
      {showJumpToBottom && (
        <Button
          onClick={jumpToBottom}
          size='icon'
          className='absolute bottom-20 right-6 rounded-full shadow-lg z-10'
          title='Jump to latest'
        >
          <ArrowDown className='h-4 w-4' />
        </Button>
      )}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className='px-6 py-3 text-sm text-muted-foreground flex items-center gap-2 border-t bg-background'>
          <Loader2 className='h-3.5 w-3.5 animate-spin' />
          <span>
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
