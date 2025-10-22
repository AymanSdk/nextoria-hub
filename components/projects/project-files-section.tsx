"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FileUpload } from "@/components/upload/file-upload";
import {
  FileText,
  Download,
  FileImage,
  FileVideo,
  File as FileIcon,
  Calendar,
  User,
  FolderKanban,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatFileSize } from "@/src/lib/storage/s3";

interface ProjectFilesSectionProps {
  projectId: string;
  clientId?: string | null;
}

interface FileItem {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  description: string | null;
  tags: string | null;
  createdAt: string | Date;
  uploadedBy: {
    id: string;
    name: string | null;
    email: string;
  };
  client?: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
}

export function ProjectFilesSection({ projectId, clientId }: ProjectFilesSectionProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, [projectId]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/files?category=projects`);
      if (!response.ok) throw new Error("Failed to fetch files");
      const data = await response.json();

      // Filter for this specific project
      const projectFiles = data.files.filter((f: any) => f.projectId === projectId);
      setFiles(projectFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (file: any) => {
    console.log("File uploaded:", file);
    toast.success(
      "File uploaded and linked to project" + (clientId ? " and client" : "")
    );
    fetchFiles();
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const response = await fetch(`/api/deliverables/${file.id}/download`);
      if (!response.ok) throw new Error("Failed to get download URL");
      const data = await response.json();
      window.open(data.downloadUrl, "_blank");
      toast.success(`Downloading ${file.name}`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <FileImage className='h-5 w-5 text-blue-500' />;
    } else if (mimeType.startsWith("video/")) {
      return <FileVideo className='h-5 w-5 text-purple-500' />;
    } else if (mimeType === "application/pdf") {
      return <FileText className='h-5 w-5 text-red-500' />;
    } else {
      return <FileIcon className='h-5 w-5 text-neutral-500' />;
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <FolderKanban className='h-5 w-5' />
          Project Files
        </CardTitle>
        <CardDescription>
          Files uploaded here are linked to this project
          {clientId && " and automatically linked to the client"}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Upload Area */}
        <FileUpload
          projectId={projectId}
          onUploadComplete={handleUploadComplete}
          maxSize={50 * 1024 * 1024}
        />

        {/* Files List */}
        {loading ? (
          <div className='space-y-3'>
            {[1, 2].map((i) => (
              <div
                key={i}
                className='animate-pulse flex items-center gap-4 p-4 border rounded-lg'
              >
                <div className='h-10 w-10 bg-neutral-200 dark:bg-neutral-800 rounded'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4'></div>
                  <div className='h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2'></div>
                </div>
              </div>
            ))}
          </div>
        ) : files.length > 0 ? (
          <div className='max-h-96 overflow-y-auto pr-2 space-y-3 border-t pt-4'>
            {files.map((file) => (
              <Card key={file.id} className='hover:shadow-md transition-shadow'>
                <CardContent className='p-4'>
                  <div className='flex items-start gap-4'>
                    {/* File Icon */}
                    <div className='h-10 w-10 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0'>
                      {getFileIcon(file.mimeType)}
                    </div>

                    {/* File Info */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2 mb-1'>
                        <div className='flex-1 min-w-0'>
                          <h4 className='font-medium truncate'>{file.name}</h4>
                          <div className='flex items-center gap-2 text-xs text-neutral-500 mt-1 flex-wrap'>
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span className='flex items-center gap-1'>
                              <Calendar className='h-3 w-3' />
                              {formatDate(file.createdAt)}
                            </span>
                            {file.client && (
                              <>
                                <span>•</span>
                                <span className='flex items-center gap-1 text-blue-600'>
                                  <Building2 className='h-3 w-3' />
                                  {file.client.companyName || file.client.name}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className='flex items-center gap-1 flex-shrink-0'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDownload(file)}
                            title='Download'
                          >
                            <Download className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>

                      {/* Description */}
                      {file.description && (
                        <p className='text-sm text-neutral-600 dark:text-neutral-400 mt-2'>
                          {file.description}
                        </p>
                      )}

                      {/* Tags */}
                      {file.tags && (
                        <div className='flex flex-wrap gap-1 mt-2'>
                          {file.tags.split(",").map((tag, index) => (
                            <Badge key={index} variant='secondary' className='text-xs'>
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Uploader Info */}
                      <div className='flex items-center gap-1 text-xs text-neutral-500 mt-2'>
                        <User className='h-3 w-3' />
                        <span>
                          Uploaded by {file.uploadedBy.name || file.uploadedBy.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className='text-center py-8 text-neutral-500 border-t'>
            <FileText className='mx-auto h-12 w-12 text-neutral-400 mb-2' />
            <p className='text-sm'>No files uploaded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
