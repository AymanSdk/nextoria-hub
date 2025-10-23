"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  FolderKanban,
  FileImage,
  FileVideo,
  File as FileIcon,
  Calendar,
  User,
  ExternalLink,
  Download,
  Link as LinkIcon,
  Loader2,
  RefreshCw,
  Search,
  Grid3x3,
  List,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { LinkDriveFileDialog } from "./link-drive-file-dialog";
import { FilePreviewDialog } from "./file-preview-dialog";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
  iconLink?: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
  owners?: Array<{ displayName: string; emailAddress: string }>;
  shared?: boolean;
}

type ViewMode = "list" | "grid";

export function GoogleDriveBrowser() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async (pageToken?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        pageSize: "50",
      });

      if (pageToken) {
        params.set("pageToken", pageToken);
      }

      if (searchQuery) {
        params.set("query", searchQuery);
      }

      const response = await fetch(
        `/api/integrations/google-drive/files?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Google Drive files");
      }

      const data = await response.json();

      if (pageToken) {
        setFiles((prev) => [...prev, ...(data.files || [])]);
      } else {
        setFiles(data.files || []);
      }

      setNextPageToken(data.nextPageToken || null);
    } catch (error) {
      console.error("Error fetching Google Drive files:", error);
      toast.error("Failed to load Google Drive files");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchFiles();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === "application/vnd.google-apps.folder") {
      return <FolderKanban className='h-5 w-5 text-yellow-500' />;
    } else if (mimeType.startsWith("image/")) {
      return <FileImage className='h-5 w-5 text-blue-500' />;
    } else if (mimeType.startsWith("video/")) {
      return <FileVideo className='h-5 w-5 text-purple-500' />;
    } else if (
      mimeType === "application/pdf" ||
      mimeType === "application/vnd.google-apps.document"
    ) {
      return <FileText className='h-5 w-5 text-red-500' />;
    } else {
      return <FileIcon className='h-5 w-5 text-neutral-500' />;
    }
  };

  const formatFileSize = (size?: string) => {
    if (!size) return "N/A";
    const bytes = parseInt(size);
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && files.length === 0) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center space-y-3'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto text-neutral-400' />
          <p className='text-sm text-neutral-500'>Loading Google Drive files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Header with search and view options */}
      <div className='flex items-center gap-3'>
        <div className='flex-1 flex gap-2'>
          <Input
            placeholder='Search files in Google Drive...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className='max-w-sm'
          />
          <Button onClick={handleSearch} variant='outline' size='icon'>
            <Search className='h-4 w-4' />
          </Button>
        </div>

        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='icon'
            onClick={() => fetchFiles()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <div className='border rounded-md flex'>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size='icon'
              onClick={() => setViewMode("list")}
              className='rounded-r-none'
            >
              <List className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size='icon'
              onClick={() => setViewMode("grid")}
              className='rounded-l-none'
            >
              <Grid3x3 className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      {/* Files display */}
      {files.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <FolderKanban className='h-8 w-8 text-neutral-400' />
            </EmptyMedia>
            <EmptyTitle>No files found</EmptyTitle>
            <EmptyDescription>
              {searchQuery
                ? "Try a different search query"
                : "Your Google Drive appears to be empty"}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          {viewMode === "list" ? (
            <div className='space-y-2'>
              {files.map((file) => (
                <Card
                  key={file.id}
                  className='hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors'
                >
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-4'>
                      <div className='shrink-0'>
                        {file.thumbnailLink ? (
                          <img
                            src={file.thumbnailLink}
                            alt={file.name}
                            className='h-10 w-10 rounded object-cover'
                          />
                        ) : (
                          <div className='h-10 w-10 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center'>
                            {getFileIcon(file.mimeType)}
                          </div>
                        )}
                      </div>

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2'>
                          <h3 className='font-medium truncate'>{file.name}</h3>
                          {file.shared && (
                            <Badge variant='secondary' className='text-xs'>
                              Shared
                            </Badge>
                          )}
                        </div>
                        <div className='flex items-center gap-4 mt-1 text-sm text-neutral-500'>
                          <span className='flex items-center gap-1'>
                            <Calendar className='h-3 w-3' />
                            {formatDate(file.modifiedTime)}
                          </span>
                          <span>{formatFileSize(file.size)}</span>
                          {file.owners && file.owners[0] && (
                            <span className='flex items-center gap-1 truncate'>
                              <User className='h-3 w-3' />
                              {file.owners[0].displayName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        <Button
                          variant='default'
                          size='sm'
                          onClick={() => {
                            setPreviewFile(file);
                            setPreviewOpen(true);
                          }}
                        >
                          <Eye className='h-4 w-4 mr-2' />
                          Preview
                        </Button>
                        <LinkDriveFileDialog file={file}>
                          <Button variant='outline' size='sm'>
                            <LinkIcon className='h-4 w-4 mr-2' />
                            Link
                          </Button>
                        </LinkDriveFileDialog>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => window.open(file.webViewLink, "_blank")}
                        >
                          <ExternalLink className='h-4 w-4 mr-2' />
                          Open
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            toast.success("File link copied to clipboard");
                            navigator.clipboard.writeText(file.webViewLink);
                          }}
                        >
                          <Download className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
              {files.map((file) => (
                <Card
                  key={file.id}
                  className='hover:shadow-md transition-shadow cursor-pointer group'
                  onClick={() => {
                    setPreviewFile(file);
                    setPreviewOpen(true);
                  }}
                >
                  <CardContent className='p-4'>
                    <div className='space-y-3'>
                      <div className='aspect-square rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden relative'>
                        {file.thumbnailLink ? (
                          <img
                            src={file.thumbnailLink}
                            alt={file.name}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='text-neutral-400'>
                            {getFileIcon(file.mimeType)}
                          </div>
                        )}
                        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100'>
                          <Eye className='h-8 w-8 text-white' />
                        </div>
                      </div>
                      <div>
                        <h3 className='font-medium text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400'>
                          {file.name}
                        </h3>
                        <div className='flex items-center justify-between mt-1'>
                          <span className='text-xs text-neutral-500'>
                            {formatFileSize(file.size)}
                          </span>
                          {file.shared && (
                            <Badge variant='secondary' className='text-xs'>
                              Shared
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load more */}
          {nextPageToken && (
            <div className='flex justify-center pt-4'>
              <Button
                variant='outline'
                onClick={() => fetchFiles(nextPageToken)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* File Preview Dialog */}
      <FilePreviewDialog
        file={previewFile}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
