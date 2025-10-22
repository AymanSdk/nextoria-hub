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
  List,
  Grid3x3,
  Rows3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

const ITEMS_PER_PAGE = 15;

type ViewMode = "list" | "grid" | "compact";

export function FilesBrowser() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [stats, setStats] = useState<FilesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({
    all: 1,
    projects: 1,
    clients: 1,
    tasks: 1,
  });

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
    // Refresh file list and reset to page 1
    fetchFiles();
    setCurrentPage((prev) => ({ ...prev, [activeTab]: 1 }));
  };

  const handlePageChange = (category: string, page: number) => {
    setCurrentPage((prev) => ({ ...prev, [category]: page }));
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    let filtered;
    switch (category) {
      case "projects":
        filtered = files.filter((f) => f.project);
        break;
      case "clients":
        // Only show files directly uploaded to clients (not through projects)
        filtered = files.filter((f) => f.client && !f.project);
        break;
      case "tasks":
        filtered = files.filter((f) => f.task);
        break;
      case "general":
        filtered = files.filter((f) => !f.project && !f.client && !f.task);
        break;
      default:
        filtered = files;
    }
    return filtered;
  };

  const getPaginatedFiles = (category: string) => {
    const filtered = filterFiles(category);
    const page = currentPage[category] || 1;
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = (category: string) => {
    const filtered = filterFiles(category);
    return Math.ceil(filtered.length / ITEMS_PER_PAGE);
  };

  const renderPagination = (category: string) => {
    const totalPages = getTotalPages(category);
    const page = currentPage[category] || 1;

    if (totalPages <= 1) return null;

    const pages = [];
    const showEllipsisStart = page > 3;
    const showEllipsisEnd = page < totalPages - 2;

    // Always show first page
    pages.push(1);

    // Show ellipsis or pages before current
    if (showEllipsisStart) {
      pages.push(-1); // -1 represents ellipsis
    } else {
      for (let i = 2; i < Math.min(page, 4); i++) {
        pages.push(i);
      }
    }

    // Show current page and neighbors
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // Show ellipsis or pages after current
    if (showEllipsisEnd) {
      pages.push(-2); // -2 represents ellipsis
    } else {
      for (let i = Math.max(page + 2, totalPages - 2); i < totalPages; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
    }

    // Always show last page
    if (!pages.includes(totalPages) && totalPages > 1) {
      pages.push(totalPages);
    }

    return (
      <Pagination className='mt-6'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href='#'
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) handlePageChange(category, page - 1);
              }}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {pages.map((pageNum, index) => {
            if (pageNum < 0) {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href='#'
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(category, pageNum);
                  }}
                  isActive={page === pageNum}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          <PaginationItem>
            <PaginationNext
              href='#'
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) handlePageChange(category, page + 1);
              }}
              className={page === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const renderListView = (filteredFiles: FileItem[]) => (
    <div className='space-y-2'>
      {filteredFiles.map((file) => {
        const categories = getFileCategories(file);

        return (
          <div
            key={file.id}
            className='group flex items-center gap-3 p-3 border rounded-lg bg-white dark:bg-neutral-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer'
            onClick={() => handleDownload(file)}
          >
            <div className='h-9 w-9 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0'>
              {getFileIcon(file.mimeType)}
            </div>

            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-0.5'>
                <h4 className='font-medium text-sm truncate'>{file.name}</h4>
                {file.tags && (
                  <div className='hidden md:flex gap-1'>
                    {file.tags
                      .split(",")
                      .slice(0, 2)
                      .map((tag, index) => (
                        <Badge
                          key={index}
                          variant='secondary'
                          className='text-xs px-1.5 py-0'
                        >
                          {tag.trim()}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>

              <div className='flex items-center gap-2 text-xs text-neutral-500 flex-wrap'>
                {categories.map((category, index) => {
                  const CategoryIcon = category.icon;
                  return (
                    <span key={index} className='flex items-center gap-1'>
                      <CategoryIcon className={`h-3 w-3 ${category.color}`} />
                      <span className='hidden sm:inline'>{category.label}</span>
                    </span>
                  );
                })}
                <span className='hidden sm:inline'>•</span>
                <span>{formatFileSize(file.size)}</span>
                <span className='hidden sm:inline'>•</span>
                <span className='hidden md:flex items-center gap-1'>
                  <User className='h-3 w-3' />
                  {file.uploadedBy.name?.split(" ")[0] ||
                    file.uploadedBy.email.split("@")[0]}
                </span>
                <span className='hidden lg:inline'>•</span>
                <span className='hidden lg:inline'>{formatDate(file.createdAt)}</span>
              </div>

              {file.description && (
                <p className='text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-1'>
                  {file.description}
                </p>
              )}
            </div>

            <div className='flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity'>
              <Button
                variant='ghost'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(file);
                }}
                className='h-8 w-8 p-0'
                title='Download'
              >
                <Download className='h-4 w-4' />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderGridView = (filteredFiles: FileItem[]) => (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'>
      {filteredFiles.map((file) => {
        const categories = getFileCategories(file);

        return (
          <div
            key={file.id}
            className='group flex flex-col p-4 border rounded-lg bg-white dark:bg-neutral-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer'
            onClick={() => handleDownload(file)}
          >
            <div className='flex flex-col items-center mb-3'>
              <div className='h-16 w-16 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-2'>
                {getFileIcon(file.mimeType)}
              </div>
              <h4 className='font-medium text-sm text-center line-clamp-2 w-full'>
                {file.name}
              </h4>
            </div>

            <div className='flex flex-col gap-1 text-xs text-neutral-500 mt-auto'>
              <div className='flex items-center justify-center gap-1'>
                {categories.slice(0, 1).map((category, index) => {
                  const CategoryIcon = category.icon;
                  return (
                    <CategoryIcon key={index} className={`h-3 w-3 ${category.color}`} />
                  );
                })}
              </div>
              <span className='text-center'>{formatFileSize(file.size)}</span>
            </div>

            <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
              <Button
                variant='secondary'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(file);
                }}
                className='h-7 w-7 p-0'
                title='Download'
              >
                <Download className='h-3.5 w-3.5' />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderCompactView = (filteredFiles: FileItem[]) => (
    <div className='border rounded-lg overflow-hidden bg-white dark:bg-neutral-900'>
      {/* Table Header */}
      <div className='grid grid-cols-12 gap-4 px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border-b text-xs font-medium text-neutral-600 dark:text-neutral-400'>
        <div className='col-span-5'>Name</div>
        <div className='col-span-2 hidden md:block'>Type</div>
        <div className='col-span-2 hidden lg:block'>Size</div>
        <div className='col-span-2 hidden lg:block'>Uploaded</div>
        <div className='col-span-1'>Actions</div>
      </div>

      {/* Table Rows */}
      <div className='divide-y dark:divide-neutral-800'>
        {filteredFiles.map((file) => {
          const categories = getFileCategories(file);

          return (
            <div
              key={file.id}
              className='group grid grid-cols-12 gap-4 px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer'
              onClick={() => handleDownload(file)}
            >
              <div className='col-span-5 flex items-center gap-2 min-w-0'>
                <div className='h-7 w-7 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0'>
                  {getFileIcon(file.mimeType)}
                </div>
                <span className='text-sm truncate'>{file.name}</span>
              </div>

              <div className='col-span-2 hidden md:flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400'>
                {categories.slice(0, 1).map((category, index) => {
                  const CategoryIcon = category.icon;
                  return (
                    <span key={index} className='flex items-center gap-1'>
                      <CategoryIcon className={`h-3 w-3 ${category.color}`} />
                      {category.label}
                    </span>
                  );
                })}
              </div>

              <div className='col-span-2 hidden lg:flex items-center text-xs text-neutral-600 dark:text-neutral-400'>
                {formatFileSize(file.size)}
              </div>

              <div className='col-span-2 hidden lg:flex items-center text-xs text-neutral-600 dark:text-neutral-400'>
                {new Date(file.createdAt).toLocaleDateString()}
              </div>

              <div className='col-span-1 flex items-center justify-end'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(file);
                  }}
                  className='h-7 w-7 p-0 opacity-0 group-hover:opacity-100'
                  title='Download'
                >
                  <Download className='h-3.5 w-3.5' />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderFileList = (filteredFiles: FileItem[], totalCount: number) => {
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

    if (totalCount === 0) {
      return (
        <div className='space-y-6'>
          <div className='text-center py-8'>
            <FileText className='mx-auto h-12 w-12 text-neutral-400 mb-4' />
            <h3 className='text-lg font-medium mb-2'>No files yet</h3>
            <p className='text-neutral-500 text-sm mb-4'>Upload files to get started</p>
          </div>

          <FileUpload
            onUploadComplete={handleUploadComplete}
            maxSize={50 * 1024 * 1024}
          />
        </div>
      );
    }

    if (viewMode === "grid") {
      return renderGridView(filteredFiles);
    } else if (viewMode === "compact") {
      return renderCompactView(filteredFiles);
    } else {
      return renderListView(filteredFiles);
    }
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
        <div className='flex items-center justify-between gap-4'>
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

          {/* View Mode Switcher & Upload Button */}
          <div className='flex items-center gap-2'>
            {/* View Switcher */}
            <div className='flex items-center border rounded-lg bg-white dark:bg-neutral-900'>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size='sm'
                onClick={() => setViewMode("list")}
                className='rounded-r-none'
                title='List View'
              >
                <List className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size='sm'
                onClick={() => setViewMode("grid")}
                className='rounded-none border-x'
                title='Grid View'
              >
                <Grid3x3 className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === "compact" ? "secondary" : "ghost"}
                size='sm'
                onClick={() => setViewMode("compact")}
                className='rounded-l-none'
                title='Compact View'
              >
                <Rows3 className='h-4 w-4' />
              </Button>
            </div>

            {/* Upload Button */}
            {(activeTab === "all" || activeTab === "projects") && (
              <div>
                <input
                  type='file'
                  id='quick-file-upload'
                  className='hidden'
                  multiple
                  accept='.png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv'
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    for (const file of files) {
                      try {
                        const formData = new FormData();
                        formData.append("file", file);
                        if (activeTab === "projects") {
                          // For projects tab, we could add project selection logic here
                          // For now, upload as general file
                        }

                        const response = await fetch("/api/upload", {
                          method: "POST",
                          body: formData,
                        });

                        if (!response.ok) {
                          throw new Error("Upload failed");
                        }

                        toast.success(`${file.name} uploaded successfully`);
                      } catch (error) {
                        console.error("Upload error:", error);
                        toast.error(`Failed to upload ${file.name}`);
                      }
                    }
                    e.target.value = "";
                    handleUploadComplete({});
                  }}
                />
                <label
                  htmlFor='quick-file-upload'
                  className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors'
                >
                  <Upload className='h-4 w-4' />
                  <span className='hidden sm:inline'>Upload Files</span>
                </label>
              </div>
            )}
          </div>
        </div>

        <TabsContent value='all' className='space-y-4'>
          {renderFileList(getPaginatedFiles("all"), filterFiles("all").length)}
          {renderPagination("all")}
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
          {renderFileList(getPaginatedFiles("projects"), filterFiles("projects").length)}
          {renderPagination("projects")}
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
          {renderFileList(getPaginatedFiles("clients"), filterFiles("clients").length)}
          {renderPagination("clients")}
          <div className='pt-4'>
            <p className='text-sm text-neutral-500 text-center py-8'>
              Upload client files from the individual client detail pages
            </p>
          </div>
        </TabsContent>

        <TabsContent value='tasks' className='space-y-4'>
          {renderFileList(getPaginatedFiles("tasks"), filterFiles("tasks").length)}
          {renderPagination("tasks")}
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
