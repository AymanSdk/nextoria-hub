"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeliverableUploadProps {
  clientId: string;
  onUploadComplete?: (file: any) => void;
  triggerButton?: React.ReactNode;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

export function DeliverableUpload({
  clientId,
  onUploadComplete,
  triggerButton,
}: DeliverableUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const maxSize = 50 * 1024 * 1024; // 50MB
  const accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    "application/vnd.ms-powerpoint": [".ppt"],
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
      ".pptx",
    ],
    "text/*": [".txt", ".csv", ".md"],
    "video/*": [".mp4", ".mov", ".avi", ".mkv"],
    "application/zip": [".zip"],
    "application/x-rar-compressed": [".rar"],
  };

  const uploadFile = async (file: File) => {
    try {
      // Add to uploading list
      setUploadingFiles((prev) => [...prev, { file, progress: 0, status: "uploading" }]);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("clientId", clientId);
      if (description) formData.append("description", description);
      if (tags) formData.append("tags", tags);

      const response = await fetch("/api/deliverables", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();

      // Update status to success
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.file === file ? { ...f, progress: 100, status: "success" as const } : f
        )
      );

      toast.success(`${file.name} uploaded successfully`);

      if (onUploadComplete) {
        onUploadComplete(data.file);
      }

      // Remove from list after 2 seconds
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
      }, 2000);

      // Reset form
      setDescription("");
      setTags("");
    } catch (error) {
      console.error("Upload error:", error);

      // Update status to error
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? {
                ...f,
                status: "error" as const,
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f
        )
      );

      toast.error(
        `Failed to upload ${file.name}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        await uploadFile(file);
      }
    },
    [clientId, description, tags]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept,
  });

  const removeFile = (file: File) => {
    setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>
            <Upload className='mr-2 h-4 w-4' />
            Upload Deliverable
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Upload Deliverable</DialogTitle>
          <DialogDescription>
            Upload files for your client. Maximum file size: 50MB
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* File metadata */}
          <div className='space-y-3'>
            <div>
              <Label htmlFor='description'>Description (Optional)</Label>
              <Textarea
                id='description'
                placeholder='Brief description of this deliverable...'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className='mt-1'
              />
            </div>

            <div>
              <Label htmlFor='tags'>Tags (Optional)</Label>
              <Input
                id='tags'
                placeholder='design, mockup, final (comma-separated)'
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className='mt-1'
              />
            </div>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors
              ${
                isDragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                  : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600"
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className='mx-auto h-12 w-12 text-neutral-400 mb-4' />
            {isDragActive ? (
              <p className='text-sm text-neutral-600 dark:text-neutral-400'>
                Drop files here...
              </p>
            ) : (
              <div>
                <p className='text-sm text-neutral-600 dark:text-neutral-400 mb-2'>
                  Drag & drop files here, or click to select
                </p>
                <p className='text-xs text-neutral-500'>
                  Max file size: 50MB • All common formats supported
                </p>
              </div>
            )}
          </div>

          {/* Uploading files list */}
          {uploadingFiles.length > 0 && (
            <div className='space-y-2'>
              {uploadingFiles.map((uploadingFile, index) => (
                <div
                  key={index}
                  className='flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg'
                >
                  <File className='h-8 w-8 text-neutral-400 shrink-0' />
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between mb-1'>
                      <p className='text-sm font-medium truncate'>
                        {uploadingFile.file.name}
                      </p>
                      {uploadingFile.status === "success" && (
                        <CheckCircle2 className='h-4 w-4 text-green-500 shrink-0' />
                      )}
                      {uploadingFile.status === "error" && (
                        <AlertCircle className='h-4 w-4 text-red-500 shrink-0' />
                      )}
                      {uploadingFile.status === "uploading" && (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 w-6 p-0'
                          onClick={() => removeFile(uploadingFile.file)}
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                    {uploadingFile.status === "uploading" && (
                      <Progress value={uploadingFile.progress} className='h-1' />
                    )}
                    {uploadingFile.status === "error" && (
                      <p className='text-xs text-red-500'>{uploadingFile.error}</p>
                    )}
                    <p className='text-xs text-neutral-500 mt-1'>
                      {(uploadingFile.file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
