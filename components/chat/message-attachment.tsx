"use client";

import { FileAttachment } from "@/types/chat";
import { formatFileSize, getFileIcon } from "@/lib/chat-utils";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileIcon } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface MessageAttachmentProps {
  attachment: FileAttachment;
}

export function MessageAttachment({ attachment }: MessageAttachmentProps) {
  const [imageError, setImageError] = useState(false);
  const isImage = attachment.type.startsWith("image/") && !imageError;

  if (isImage) {
    return (
      <div className='relative group max-w-sm'>
        <a
          href={attachment.url}
          target='_blank'
          rel='noopener noreferrer'
          className='block rounded-lg overflow-hidden border border-border hover:border-primary transition-colors'
        >
          <Image
            src={attachment.url}
            alt={attachment.name}
            width={400}
            height={300}
            className='w-full h-auto object-cover'
            onError={() => setImageError(true)}
          />
        </a>
        <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
          <Button size='sm' variant='secondary' asChild>
            <a href={attachment.url} target='_blank' rel='noopener noreferrer'>
              <ExternalLink className='h-4 w-4 mr-2' />
              Open
            </a>
          </Button>
          <Button size='sm' variant='secondary' asChild>
            <a href={attachment.url} download={attachment.name}>
              <Download className='h-4 w-4 mr-2' />
              Download
            </a>
          </Button>
        </div>
        <p className='text-xs text-muted-foreground mt-1 truncate'>{attachment.name}</p>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors max-w-sm'>
      <div className='flex-shrink-0 text-2xl'>{getFileIcon(attachment.type)}</div>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium truncate'>{attachment.name}</p>
        <p className='text-xs text-muted-foreground'>{formatFileSize(attachment.size)}</p>
      </div>
      <Button size='sm' variant='ghost' asChild>
        <a href={attachment.url} download={attachment.name} title='Download'>
          <Download className='h-4 w-4' />
        </a>
      </Button>
    </div>
  );
}

interface MessageAttachmentsListProps {
  attachments: FileAttachment[];
}

export function MessageAttachmentsList({ attachments }: MessageAttachmentsListProps) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className='flex flex-col gap-2 mt-2'>
      {attachments.map((attachment) => (
        <MessageAttachment key={attachment.id} attachment={attachment} />
      ))}
    </div>
  );
}
