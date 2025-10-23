"use client";

import { useState, useRef } from "react";
import { useUpdateMyPresence } from "@/liveblocks.config";
import { Button } from "@/components/ui/button";
import { SendHorizonal, Smile } from "lucide-react";
import { RichTextEditor, RichTextEditorRef } from "./rich-text-editor";
import { FileUploadButton } from "./file-upload-button";
import { isMessageEmpty } from "@/lib/chat-utils";
import { FileAttachment } from "@/types/chat";

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: FileAttachment[]) => void;
  disabled?: boolean;
  channelId?: string;
  workspaceId?: string;
}

export function ChatInput({
  onSendMessage,
  disabled,
  channelId,
  workspaceId,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const updatePresence = useUpdateMyPresence();
  const editorRef = useRef<RichTextEditorRef>(null);

  const handleSubmit = () => {
    if (!editorRef.current || disabled) return;

    const content = editorRef.current.getHTML();

    // Check if message is empty and no attachments
    if (isMessageEmpty(content) && attachments.length === 0) return;

    onSendMessage(content || "<p></p>", attachments.length > 0 ? attachments : undefined);

    // Clear editor and attachments
    editorRef.current.clear();
    setMessage("");
    setAttachments([]);
    updatePresence({ isTyping: false });
  };

  const handleFilesUploaded = (files: FileAttachment[]) => {
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleChange = (content: string) => {
    setMessage(content);

    // Update typing presence
    const isEmpty = isMessageEmpty(content);
    if (!isEmpty) {
      updatePresence({ isTyping: true });
    } else {
      updatePresence({ isTyping: false });
    }
  };

  const isEmpty = isMessageEmpty(message) && attachments.length === 0;

  return (
    <div className='p-3 sm:p-4 border-t bg-background'>
      <div className='flex items-end gap-2 sm:gap-3'>
        <div className='flex-1 relative'>
          <RichTextEditor
            ref={editorRef}
            placeholder='Type a message...'
            content={message}
            onChange={handleChange}
            onSubmit={handleSubmit}
            editable={!disabled}
            showToolbar={true}
            channelId={channelId}
            workspaceId={workspaceId}
          />

          <div className='absolute right-2 bottom-2 flex items-center gap-0.5 sm:gap-1 z-10'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-7 w-7 sm:h-8 sm:w-8 hover:bg-muted'
              disabled={disabled}
              title='Add emoji (coming soon)'
            >
              <Smile className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground' />
            </Button>

            <FileUploadButton onFilesUploaded={handleFilesUploaded} disabled={disabled} />
          </div>

          {/* Show attached files */}
          {attachments.length > 0 && (
            <div className='absolute bottom-full left-0 right-0 mb-2 p-2 bg-muted rounded-lg border'>
              <div className='flex flex-wrap gap-2'>
                {attachments.map((file, index) => (
                  <div
                    key={file.id}
                    className='flex items-center gap-2 px-2 py-1 bg-background rounded text-xs'
                  >
                    <span>{file.name}</span>
                    <button
                      onClick={() =>
                        setAttachments((prev) => prev.filter((_, i) => i !== index))
                      }
                      className='text-muted-foreground hover:text-foreground'
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isEmpty || disabled}
          size='icon'
          className='h-[48px] w-[48px] sm:h-[52px] sm:w-[52px] rounded-xl shrink-0'
          title='Send message (Enter)'
        >
          <SendHorizonal className='h-4 w-4 sm:h-5 sm:w-5' />
        </Button>
      </div>
      <p className='text-[10px] sm:text-xs text-muted-foreground mt-2 px-1'>
        Press <kbd className='px-1 py-0.5 bg-muted rounded text-[10px]'>Enter</kbd> to
        send, <kbd className='px-1 py-0.5 bg-muted rounded text-[10px]'>Shift+Enter</kbd>{" "}
        for new line • Use toolbar for formatting
      </p>
    </div>
  );
}
