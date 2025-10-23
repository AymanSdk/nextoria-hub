"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X, Upload, Loader2 } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";
import { formatFileSize, getFileIcon } from "@/lib/chat-utils";
import { cn } from "@/lib/utils";

interface FileUploadButtonProps {
  onFilesUploaded: (
    files: Array<{
      id: string;
      name: string;
      url: string;
      size: number;
      type: string;
      uploadedAt: string;
    }>
  ) => void;
  disabled?: boolean;
}

export function FileUploadButton({ onFilesUploaded, disabled }: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload, isUploading: uploadThingLoading } = useUploadThing(
    "chatAttachment",
    {
      onClientUploadComplete: (res) => {
        const uploadedFiles = res.map((file) => ({
          id: file.key,
          name: file.name,
          url: file.url,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        }));

        onFilesUploaded(uploadedFiles);
        setSelectedFiles([]);
        setIsUploading(false);
        toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
      },
      onUploadError: (error) => {
        console.error("Upload error:", error);
        toast.error("Failed to upload files");
        setIsUploading(false);
      },
    }
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      await startUpload(selectedFiles);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload files");
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index));
  };

  return (
    <div className='relative'>
      <input
        ref={fileInputRef}
        type='file'
        multiple
        className='hidden'
        onChange={handleFileSelect}
        accept='image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx'
        disabled={disabled || isUploading}
      />

      {selectedFiles.length > 0 ? (
        <div className='absolute bottom-full left-0 mb-2 w-80 max-w-full bg-card border rounded-lg shadow-lg p-3 z-10'>
          <div className='flex items-center justify-between mb-2'>
            <h4 className='text-sm font-semibold'>
              {selectedFiles.length} file(s) selected
            </h4>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setSelectedFiles([])}
              disabled={isUploading}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>

          <div className='space-y-2 max-h-60 overflow-y-auto'>
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className='flex items-center gap-2 p-2 bg-muted rounded-md'
              >
                <span className='text-lg'>{getFileIcon(file.type)}</span>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm truncate'>{file.name}</p>
                  <p className='text-xs text-muted-foreground'>
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <X className='h-3 w-3' />
                </Button>
              </div>
            ))}
          </div>

          <Button
            className='w-full mt-3'
            onClick={handleUpload}
            disabled={isUploading || uploadThingLoading}
          >
            {isUploading || uploadThingLoading ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Uploading...
              </>
            ) : (
              <>
                <Upload className='h-4 w-4 mr-2' />
                Upload {selectedFiles.length} file(s)
              </>
            )}
          </Button>
        </div>
      ) : null}

      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-7 w-7 sm:h-8 sm:w-8 hover:bg-muted'
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        title='Attach files'
      >
        <Paperclip
          className={cn(
            "h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground",
            (isUploading || uploadThingLoading) && "animate-pulse"
          )}
        />
      </Button>
    </div>
  );
}
