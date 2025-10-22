"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useUpdateMyPresence } from "@/liveblocks.config";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal, Paperclip, Smile } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const updatePresence = useUpdateMyPresence();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!message.trim() || disabled) return;

    onSendMessage(message.trim());
    setMessage("");
    updatePresence({ isTyping: false });

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (value: string) => {
    setMessage(value);

    // Update typing presence
    if (value.length > 0) {
      updatePresence({ isTyping: true });
    } else {
      updatePresence({ isTyping: false });
    }

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  };

  return (
    <div className='p-4'>
      <div className='flex items-end gap-3'>
        <div className='flex-1 relative'>
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Type a message... (Enter to send, Shift+Enter for new line)'
            disabled={disabled}
            className='min-h-[52px] max-h-[200px] resize-none pr-20 rounded-xl border-2 focus-visible:ring-2'
            rows={1}
          />

          <div className='absolute right-3 bottom-3 flex items-center gap-1'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8 hover:bg-muted'
              disabled={disabled}
              title='Add emoji'
            >
              <Smile className='h-4 w-4 text-muted-foreground' />
            </Button>

            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8 hover:bg-muted'
              disabled={disabled}
              title='Attach file'
            >
              <Paperclip className='h-4 w-4 text-muted-foreground' />
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          size='icon'
          className='h-[52px] w-[52px] rounded-xl'
        >
          <SendHorizonal className='h-5 w-5' />
        </Button>
      </div>
    </div>
  );
}
