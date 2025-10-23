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
    <div className='p-4 bg-background'>
      {/* Show attached files */}
      {attachments.length > 0 && (
        <div className='mb-3 p-3 bg-muted/50 rounded-lg border'>
          <p className='text-xs text-muted-foreground mb-2 font-medium'>
            {attachments.length} file{attachments.length !== 1 ? "s" : ""} attached
          </p>
          <div className='flex flex-wrap gap-2'>
            {attachments.map((file, index) => (
              <div
                key={file.id}
                className='flex items-center gap-2 px-3 py-2 bg-background rounded-md border text-sm group hover:border-primary/50 transition-colors'
              >
                <span className='truncate max-w-[150px]'>{file.name}</span>
                <button
                  onClick={() =>
                    setAttachments((prev) => prev.filter((_, i) => i !== index))
                  }
                  className='text-muted-foreground hover:text-destructive transition-colors text-lg leading-none'
                  title='Remove file'
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='flex items-end gap-3'>
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

          <div className='absolute right-3 bottom-3 flex items-center gap-1 z-10'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8 hover:bg-muted rounded-lg'
              disabled={disabled}
              title='Add emoji (coming soon)'
            >
              <Smile className='h-4 w-4 text-muted-foreground' />
            </Button>

            <FileUploadButton onFilesUploaded={handleFilesUploaded} disabled={disabled} />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isEmpty || disabled}
          size='icon'
          className='h-12 w-12 rounded-xl shrink-0 shadow-md'
          title='Send message (Enter)'
        >
          <SendHorizonal className='h-5 w-5' />
        </Button>
      </div>
      <p className='text-xs text-muted-foreground mt-3 px-1'>
        Press{" "}
        <kbd className='px-1.5 py-0.5 bg-muted rounded text-xs font-mono'>Enter</kbd> to
        send,{" "}
        <kbd className='px-1.5 py-0.5 bg-muted rounded text-xs font-mono'>
          Shift+Enter
        </kbd>{" "}
        for new line
      </p>
    </div>
  );
}
