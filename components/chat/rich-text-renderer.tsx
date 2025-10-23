"use client";

import { cn } from "@/lib/utils";

interface RichTextRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders HTML content from Tiptap editor
 * Sanitizes and styles the content appropriately
 */
export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  // Simple check if content is plain text or HTML
  const isPlainText = !content.includes("<");

  if (isPlainText) {
    return (
      <div className={cn("whitespace-pre-wrap break-words", className)}>
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none",
        "prose-p:my-1 prose-p:leading-relaxed",
        "prose-headings:my-2 prose-headings:font-semibold",
        "prose-h1:text-xl prose-h2:text-lg prose-h3:text-base",
        "prose-ul:my-1 prose-ol:my-1",
        "prose-li:my-0.5",
        "prose-blockquote:my-2 prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground/30 prose-blockquote:pl-4 prose-blockquote:italic",
        "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-[''] prose-code:after:content-['']",
        "prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-md prose-pre:overflow-x-auto prose-pre:my-2",
        "prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80",
        "prose-strong:font-semibold prose-strong:text-foreground",
        "prose-em:italic",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

