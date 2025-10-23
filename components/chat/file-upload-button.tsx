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

      {selectedFiles.length > 0 && (
        <div className='fixed bottom-20 right-4 z-50 w-full max-w-sm'>
          <div className='bg-background border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200'>
            {/* Header */}
            <div className='flex items-center justify-between p-3 border-b bg-muted/30'>
              <div className='flex items-center gap-2'>
                <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0'>
                  <Upload className='h-4 w-4 text-primary' />
                </div>
                <div className='min-w-0'>
                  <h4 className='text-sm font-semibold'>Upload Files</h4>
                  <p className='text-xs text-muted-foreground'>
                    {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""}{" "}
                    selected
                  </p>
                </div>
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 shrink-0'
                onClick={() => setSelectedFiles([])}
                disabled={isUploading}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>

            {/* File List */}
            <div className='p-3 space-y-2 max-h-60 overflow-y-auto'>
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className='flex items-center gap-2 p-2 bg-muted/50 hover:bg-muted rounded-lg transition-colors group'
                >
                  <div className='h-9 w-9 rounded-lg bg-background flex items-center justify-center text-lg shrink-0'>
                    {getFileIcon(file.type)}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs font-medium truncate'>{file.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity'
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    <X className='h-3 w-3' />
                  </Button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className='p-3 border-t bg-muted/30 flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='flex-1'
                onClick={() => setSelectedFiles([])}
                disabled={isUploading || uploadThingLoading}
              >
                Cancel
              </Button>
              <Button
                size='sm'
                className='flex-1'
                onClick={handleUpload}
                disabled={isUploading || uploadThingLoading}
              >
                {isUploading || uploadThingLoading ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-1.5 animate-spin' />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className='h-4 w-4 mr-1.5' />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='h-7 w-7 sm:h-8 sm:w-8 hover:bg-muted rounded-lg'
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isUploading}
        title='Attach files'
      >
        <Paperclip
          className={cn(
            "h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground transition-all",
            (isUploading || uploadThingLoading) && "animate-pulse text-primary"
          )}
        />
      </Button>
    </div>
  );
}
