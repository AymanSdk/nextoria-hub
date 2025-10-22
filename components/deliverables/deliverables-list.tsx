"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Eye,
  Trash2,
  FileImage,
  FileVideo,
  File as FileIcon,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatFileSize } from "@/src/lib/storage/s3";

interface Deliverable {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  description: string | null;
  tags: string | null;
  createdAt: string | Date;
  uploadedBy: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface DeliverablesListProps {
  clientId: string;
  canDelete?: boolean;
  canUpload?: boolean;
}

export function DeliverablesList({ clientId, canDelete = false }: DeliverablesListProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliverables = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/deliverables?clientId=${clientId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch deliverables");
      }
      const data = await response.json();
      setDeliverables(data.deliverables);
    } catch (error) {
      console.error("Error fetching deliverables:", error);
      toast.error("Failed to load deliverables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliverables();
  }, [clientId]);

  const handleDownload = async (deliverable: Deliverable) => {
    try {
      const response = await fetch(`/api/deliverables/${deliverable.id}/download`);
      if (!response.ok) {
        throw new Error("Failed to get download URL");
      }
      const data = await response.json();

      // Open download URL in new tab
      window.open(data.downloadUrl, "_blank");
      toast.success(`Downloading ${deliverable.name}`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const handleDelete = async (deliverable: Deliverable) => {
    try {
      const response = await fetch(`/api/deliverables/${deliverable.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      toast.success(`${deliverable.name} deleted`);
      // Refresh list
      fetchDeliverables();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete file");
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className='space-y-3'>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className='p-4'>
              <div className='animate-pulse flex items-center gap-4'>
                <div className='h-10 w-10 bg-neutral-200 dark:bg-neutral-800 rounded'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4'></div>
                  <div className='h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2'></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (deliverables.length === 0) {
    return (
      <div className='text-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-lg border-2 border-dashed'>
        <FileText className='mx-auto h-12 w-12 text-neutral-400 mb-4' />
        <h3 className='text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2'>
          No deliverables yet
        </h3>
        <p className='text-sm text-neutral-500'>
          Files uploaded for this client will appear here
        </p>
      </div>
    );
  }

  return (
    <div className='max-h-96 overflow-y-auto pr-2 space-y-3'>
      {deliverables.map((deliverable) => (
        <Card key={deliverable.id} className='hover:shadow-md transition-shadow'>
          <CardContent className='p-4'>
            <div className='flex items-start gap-4'>
              {/* File Icon */}
              <div className='h-10 w-10 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0'>
                {getFileIcon(deliverable.mimeType)}
              </div>

              {/* File Info */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between gap-2 mb-1'>
                  <div className='flex-1 min-w-0'>
                    <h4 className='font-medium truncate'>{deliverable.name}</h4>
                    <div className='flex items-center gap-2 text-xs text-neutral-500 mt-1'>
                      <span>{formatFileSize(deliverable.size)}</span>
                      <span>•</span>
                      <span className='flex items-center gap-1'>
                        <Calendar className='h-3 w-3' />
                        {formatDate(deliverable.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex items-center gap-1 flex-shrink-0'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleDownload(deliverable)}
                      title='Download'
                    >
                      <Download className='h-4 w-4' />
                    </Button>
                    {canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            title='Delete'
                            className='text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete file?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete{" "}
                              <strong>{deliverable.name}</strong>? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(deliverable)}
                              className='bg-red-500 hover:bg-red-600'
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>

                {/* Description */}
                {deliverable.description && (
                  <p className='text-sm text-neutral-600 dark:text-neutral-400 mt-2'>
                    {deliverable.description}
                  </p>
                )}

                {/* Tags */}
                {deliverable.tags && (
                  <div className='flex flex-wrap gap-1 mt-2'>
                    {deliverable.tags.split(",").map((tag, index) => (
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
                    Uploaded by{" "}
                    {deliverable.uploadedBy.name || deliverable.uploadedBy.email}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
