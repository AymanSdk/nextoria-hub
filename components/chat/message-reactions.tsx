"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Smile, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MessageReactionsProps {
  messageId: string;
  reactions?: Array<{
    emoji: string;
    count: number;
    userReacted?: boolean;
  }>;
  onReact: (messageId: string, emoji: string) => Promise<void>;
  currentUserId?: string;
}

const COMMON_EMOJIS = ["👍", "❤️", "😊", "🎉", "🚀", "👀", "😮", "😂"];

export function MessageReactions({
  messageId,
  reactions = [],
  onReact,
  currentUserId,
}: MessageReactionsProps) {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const handleReaction = async (emoji: string) => {
    await onReact(messageId, emoji);
    setIsEmojiPickerOpen(false);
  };

  if (reactions.length === 0 && !currentUserId) {
    return null;
  }

  return (
    <div className='flex items-center gap-1 mt-1 flex-wrap'>
      {reactions.map((reaction) => (
        <Button
          key={reaction.emoji}
          variant='ghost'
          size='sm'
          className={cn(
            "h-7 px-2 text-xs gap-1 hover:bg-primary/10",
            reaction.userReacted && "bg-primary/20 hover:bg-primary/30"
          )}
          onClick={() => handleReaction(reaction.emoji)}
        >
          <span>{reaction.emoji}</span>
          <span className='text-muted-foreground'>{reaction.count}</span>
        </Button>
      ))}

      <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
          >
            <Plus className='h-3 w-3' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-2'>
          <div className='grid grid-cols-4 gap-1'>
            {COMMON_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant='ghost'
                size='sm'
                className='h-10 w-10 text-lg p-0'
                onClick={() => handleReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
