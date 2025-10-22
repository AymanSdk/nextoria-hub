"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  FolderKanban,
  Users,
  Building2,
  HardDrive,
  Cloud,
  Download,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { formatFileSize } from "@/src/lib/storage/s3";
import { FileUpload } from "@/components/upload/file-upload";

interface FileItem {
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
  project?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  task?: {
    id: string;
    title: string;
  } | null;
  client?: {
    id: string;
    name: string;
    companyName: string | null;
  } | null;
}

interface FilesStats {
  total: number;
  byType: {
    projects: number;
    clients: number;
    tasks: number;
    general: number;
  };
  totalSize: number;
}

export function FilesBrowser() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [stats, setStats] = useState<FilesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/files");
      if (!response.ok) throw new Error("Failed to fetch files");
      const data = await response.json();
      setFiles(data.files);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (file: any) => {
    console.log("File uploaded:", file);
    toast.success("File uploaded successfully!");
    // Refresh file list
    fetchFiles();
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

  const getFileCategories = (file: FileItem) => {
    const categories = [];
    if (file.project) {
      categories.push({
        icon: FolderKanban,
        label: file.project.name,
        color: "text-green-600",
      });
    }
    if (file.client) {
      categories.push({
        icon: Building2,
        label: file.client.companyName || file.client.name,
        color: "text-blue-600",
      });
    }
    if (file.task) {
      categories.push({
        icon: FileText,
        label: file.task.title,
        color: "text-purple-600",
      });
    }
    if (categories.length === 0) {
      categories.push({
        icon: FileIcon,
        label: "General",
        color: "text-neutral-600",
      });
    }
    return categories;
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

  const filterFiles = (category: string) => {
    switch (category) {
      case "projects":
        return files.filter((f) => f.project);
      case "clients":
        // Only show files directly uploaded to clients (not through projects)
        return files.filter((f) => f.client && !f.project);
      case "tasks":
        return files.filter((f) => f.task);
      case "general":
        return files.filter((f) => !f.project && !f.client && !f.task);
      default:
        return files;
    }
  };

  const renderFileList = (filteredFiles: FileItem[]) => {
    if (loading) {
      return (
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
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
      );
    }

    if (filteredFiles.length === 0) {
      return (
        <div className='space-y-6'>
          <div className='text-center py-8'>
            <FileText className='mx-auto h-12 w-12 text-neutral-400 mb-4' />
            <h3 className='text-lg font-medium mb-2'>No files yet</h3>
            <p className='text-neutral-500 text-sm mb-4'>Upload files to get started</p>
          </div>

          {/* Upload Area */}
          <FileUpload
            onUploadComplete={handleUploadComplete}
            maxSize={50 * 1024 * 1024}
          />
        </div>
      );
    }

    return (
      <div className='space-y-3'>
        {filteredFiles.map((file) => {
          const categories = getFileCategories(file);

          return (
            <Card key={file.id} className='hover:shadow-md transition-shadow'>
              <CardContent className='p-4'>
                <div className='flex items-start gap-4'>
                  {/* File Icon */}
                  <div className='h-10 w-10 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0'>
                    {getFileIcon(file.mimeType)}
                  </div>

                  {/* File Info */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-2 mb-1'>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-medium truncate'>{file.name}</h4>
                        <div className='flex items-center gap-2 text-xs text-neutral-500 mt-1 flex-wrap'>
                          {categories.map((category, index) => {
                            const CategoryIcon = category.icon;
                            return (
                              <span key={index} className='flex items-center gap-1'>
                                <CategoryIcon className={`h-3 w-3 ${category.color}`} />
                                {category.label}
                              </span>
                            );
                          })}
                          <span>•</span>
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span className='flex items-center gap-1'>
                            <Calendar className='h-3 w-3' />
                            {formatDate(file.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className='flex items-center gap-1 shrink-0'>
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
          );
        })}
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      {stats && (
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-neutral-500'>Total Files</p>
                  <p className='text-2xl font-bold'>{stats.total}</p>
                </div>
                <FileText className='h-8 w-8 text-neutral-400' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-neutral-500'>Storage Used</p>
                  <p className='text-2xl font-bold'>{formatFileSize(stats.totalSize)}</p>
                </div>
                <HardDrive className='h-8 w-8 text-neutral-400' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-neutral-500'>Client Files</p>
                  <p className='text-2xl font-bold'>{stats.byType.clients}</p>
                </div>
                <Building2 className='h-8 w-8 text-neutral-400' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-neutral-500'>Project Files</p>
                  <p className='text-2xl font-bold'>{stats.byType.projects}</p>
                </div>
                <FolderKanban className='h-8 w-8 text-neutral-400' />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* File Browser Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
        <TabsList>
          <TabsTrigger value='all'>
            <FileText className='mr-2 h-4 w-4' />
            All Files {stats && `(${stats.total})`}
          </TabsTrigger>
          <TabsTrigger value='projects'>
            <FolderKanban className='mr-2 h-4 w-4' />
            Projects {stats && `(${stats.byType.projects})`}
          </TabsTrigger>
          <TabsTrigger value='clients'>
            <Building2 className='mr-2 h-4 w-4' />
            Clients {stats && `(${stats.byType.clients})`}
          </TabsTrigger>
          <TabsTrigger value='tasks'>
            <FileText className='mr-2 h-4 w-4' />
            Tasks {stats && `(${stats.byType.tasks})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='all' className='space-y-4'>
          {renderFileList(filterFiles("all"))}
          {filterFiles("all").length > 0 && (
            <div className='pt-4 border-t'>
              <FileUpload
                onUploadComplete={handleUploadComplete}
                maxSize={50 * 1024 * 1024}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value='projects' className='space-y-4'>
          {renderFileList(filterFiles("projects"))}
          {filterFiles("projects").length > 0 && (
            <div className='pt-4 border-t'>
              <FileUpload
                onUploadComplete={handleUploadComplete}
                maxSize={50 * 1024 * 1024}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value='clients' className='space-y-4'>
          {renderFileList(filterFiles("clients"))}
          <div className='pt-4'>
            <p className='text-sm text-neutral-500 text-center py-8'>
              Upload client files from the individual client detail pages
            </p>
          </div>
        </TabsContent>

        <TabsContent value='tasks' className='space-y-4'>
          {renderFileList(filterFiles("tasks"))}
          <div className='pt-4'>
            <p className='text-sm text-neutral-500 text-center py-8'>
              Attach files to tasks from the task edit dialog
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
