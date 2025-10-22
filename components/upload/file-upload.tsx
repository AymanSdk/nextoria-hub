"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface FileUploadProps {
  projectId?: string;
  taskId?: string;
  onUploadComplete?: (file: any) => void;
  maxSize?: number;
  accept?: Record<string, string[]>;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
}

export function FileUpload({
  projectId,
  taskId,
  onUploadComplete,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  },
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const uploadFile = async (file: File) => {
    try {
      // Add to uploading list
      setUploadingFiles((prev) => [
        ...prev,
        { file, progress: 0, status: "uploading" },
      ]);

      const formData = new FormData();
      formData.append("file", file);
      if (projectId) formData.append("projectId", projectId);
      if (taskId) formData.append("taskId", taskId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      // Update status to success
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? { ...f, progress: 100, status: "success" as const }
            : f
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
    } catch (error) {
      console.error("Upload error:", error);

      // Update status to error
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? {
                ...f,
                status: "error" as const,
                error: "Upload failed",
              }
            : f
        )
      );

      toast.error(`Failed to upload ${file.name}`);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        await uploadFile(file);
      }
    },
    [projectId, taskId]
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
    <div className="space-y-4">
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
        <Upload className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
        {isDragActive ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Drop files here...
          </p>
        ) : (
          <div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-xs text-neutral-500">
              Max file size: {(maxSize / (1024 * 1024)).toFixed(0)}MB
            </p>
          </div>
        )}
      </div>

      {/* Uploading files list */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg"
            >
              <File className="h-8 w-8 text-neutral-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium truncate">
                    {uploadingFile.file.name}
                  </p>
                  {uploadingFile.status === "success" && (
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  )}
                  {uploadingFile.status === "error" && (
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  )}
                  {uploadingFile.status === "uploading" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => removeFile(uploadingFile.file)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {uploadingFile.status === "uploading" && (
                  <Progress value={uploadingFile.progress} className="h-1" />
                )}
                {uploadingFile.status === "error" && (
                  <p className="text-xs text-red-500">{uploadingFile.error}</p>
                )}
                <p className="text-xs text-neutral-500 mt-1">
                  {(uploadingFile.file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

