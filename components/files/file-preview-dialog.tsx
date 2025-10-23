"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  ExternalLink,
  FileText,
  FileImage,
  FileVideo,
  File as FileIcon,
  Loader2,
} from "lucide-react";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink?: string;
  size?: string;
}

interface FilePreviewDialogProps {
  file: DriveFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilePreviewDialog({ file, open, onOpenChange }: FilePreviewDialogProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  if (!file) return null;

  const isImage = file.mimeType.startsWith("image/");
  const isPDF = file.mimeType === "application/pdf";
  const isVideo = file.mimeType.startsWith("video/");
  const isGoogleDoc =
    file.mimeType === "application/vnd.google-apps.document" ||
    file.mimeType === "application/vnd.google-apps.spreadsheet" ||
    file.mimeType === "application/vnd.google-apps.presentation";
  const isTextFile =
    file.mimeType.startsWith("text/") ||
    file.mimeType === "application/json" ||
    file.mimeType === "application/javascript";

  const canPreview = isImage || isPDF || isGoogleDoc || isVideo;

  // For images and videos, use Lightbox for better UX and proper dynamic sizing
  if (isImage || isVideo) {
    const slides = [
      {
        src: `/api/integrations/google-drive/preview?fileId=${file.id}`,
        alt: file.name,
        width: 3840,
        height: 2560,
      },
    ];

    return (
      <Lightbox
        open={open}
        close={() => onOpenChange(false)}
        slides={slides}
        carousel={{ finite: true }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
        toolbar={{
          buttons: [
            <div
              key='filename'
              className='flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10'
            >
              <FileImage className='h-4 w-4 text-white/70' />
              <span className='text-sm text-white/90 font-medium max-w-xs truncate'>
                {file.name}
              </span>
            </div>,
            <div key='divider' className='h-8 w-px bg-white/20 mx-2' />,
            <button
              key='download'
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://drive.google.com/uc?id=${file.id}&export=download`,
                  "_blank"
                );
              }}
              className='flex items-center gap-2 px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-all duration-200 border border-white/10 hover:border-white/20 backdrop-blur-sm'
              title='Download file'
            >
              <Download className='h-4 w-4' />
              <span className='text-sm font-medium'>Download</span>
            </button>,
            <button
              key='open'
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                window.open(file.webViewLink, "_blank");
              }}
              className='flex items-center gap-2 px-4 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/15 transition-all duration-200 border border-white/10 hover:border-white/20 backdrop-blur-sm'
              title='Open in Google Drive'
            >
              <ExternalLink className='h-4 w-4' />
              <span className='text-sm font-medium'>Open in Drive</span>
            </button>,
            "close",
          ],
        }}
      />
    );
  }

  const getPreviewUrl = () => {
    // For images, use our proxy API for authenticated access
    if (isImage) {
      return `/api/integrations/google-drive/preview?fileId=${file.id}`;
    }

    // For PDFs and Google Docs, use embedded viewer with webViewLink
    if (isPDF || isGoogleDoc) {
      // Use Google's embedded viewer
      return `https://drive.google.com/file/d/${file.id}/preview`;
    }

    if (isVideo) {
      return `/api/integrations/google-drive/preview?fileId=${file.id}`;
    }

    // Fallback to web view link
    return file.webViewLink;
  };

  const getFileIcon = () => {
    if (isImage) return <FileImage className='h-5 w-5 text-blue-500' />;
    if (isVideo) return <FileVideo className='h-5 w-5 text-purple-500' />;
    if (isPDF || isGoogleDoc) return <FileText className='h-5 w-5 text-red-500' />;
    return <FileIcon className='h-5 w-5 text-neutral-500' />;
  };

  const formatFileSize = (size?: string) => {
    if (!size) return "Unknown size";
    const bytes = parseInt(size);
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  const handleDownload = () => {
    window.open(`https://drive.google.com/uc?id=${file.id}&export=download`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-fit max-h-[95vh] p-0 gap-0 flex flex-col overflow-hidden'>
        {/* Compact Header */}
        <DialogHeader className='shrink-0 px-4 py-3 border-b bg-white dark:bg-neutral-950'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-3 flex-1 min-w-0'>
              <div className='shrink-0'>{getFileIcon()}</div>
              <div className='flex-1 min-w-0'>
                <DialogTitle className='text-sm font-semibold truncate'>
                  {file.name}
                </DialogTitle>
                <div className='flex items-center gap-2 mt-0.5'>
                  <Badge variant='secondary' className='text-xs h-5'>
                    {file.mimeType.split("/")[1]?.toUpperCase() || "File"}
                  </Badge>
                  <span className='text-xs text-neutral-500'>
                    {formatFileSize(file.size)}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-1 shrink-0'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleDownload}
                title='Download'
                className='h-8'
              >
                <Download className='h-3.5 w-3.5' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => window.open(file.webViewLink, "_blank")}
                title='Open in Google Drive'
                className='h-8'
              >
                <ExternalLink className='h-3.5 w-3.5' />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Preview Area - Takes up remaining space */}
        <div
          className={`${
            isPDF || isGoogleDoc ? "flex-1 min-h-0" : ""
          } overflow-auto bg-neutral-50 dark:bg-neutral-900`}
        >
          {canPreview ? (
            <div className={`relative w-full ${isPDF || isGoogleDoc ? "h-full" : ""}`}>
              {loading && (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='text-center space-y-3'>
                    <Loader2 className='h-8 w-8 animate-spin mx-auto text-neutral-400' />
                    <p className='text-sm text-neutral-500'>Loading preview...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='text-center space-y-3 p-6'>
                    <FileIcon className='h-12 w-12 mx-auto text-neutral-400' />
                    <div>
                      <p className='text-sm font-medium'>Preview not available</p>
                      <p className='text-xs text-neutral-500 mt-1'>
                        Try downloading the file or opening it in Google Drive
                      </p>
                    </div>
                    <div className='flex gap-2 justify-center mt-4'>
                      <Button size='sm' onClick={handleDownload}>
                        <Download className='h-4 w-4 mr-2' />
                        Download
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => window.open(file.webViewLink, "_blank")}
                      >
                        <ExternalLink className='h-4 w-4 mr-2' />
                        Open in Drive
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {isImage ? (
                <div className='flex items-center justify-center p-4'>
                  <img
                    src={getPreviewUrl()}
                    alt={file.name}
                    className='max-w-[90vw] max-h-[85vh] w-auto h-auto object-contain'
                    onLoad={() => setLoading(false)}
                    onError={() => {
                      setLoading(false);
                      setError(true);
                    }}
                  />
                </div>
              ) : isVideo ? (
                <div className='flex items-center justify-center p-4'>
                  <video
                    src={getPreviewUrl()}
                    controls
                    className='max-w-[90vw] max-h-[85vh] w-auto h-auto'
                    onLoadedData={() => setLoading(false)}
                    onError={() => {
                      setLoading(false);
                      setError(true);
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <>
                  {!iframeError ? (
                    <div className='w-full h-full min-h-[600px]'>
                      <iframe
                        src={getPreviewUrl()}
                        className='w-full h-full border-0 block'
                        title={file.name}
                        onLoad={() => {
                          setLoading(false);
                          // Give iframe time to load, then check if it's accessible
                          setTimeout(() => {
                            try {
                              const iframe = document.querySelector("iframe");
                              if (!iframe || !iframe.contentWindow) {
                                setIframeError(true);
                              }
                            } catch (e) {
                              // Cross-origin error is expected, but if we get here, iframe loaded
                            }
                          }, 1000);
                        }}
                        onError={() => {
                          setLoading(false);
                          setIframeError(true);
                        }}
                        sandbox='allow-scripts allow-same-origin allow-popups allow-forms'
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                      />
                    </div>
                  ) : (
                    <div className='flex items-center justify-center h-full'>
                      <div className='text-center space-y-4 p-6'>
                        {getFileIcon()}
                        <div>
                          <p className='text-sm font-medium'>
                            Embedded preview not available
                          </p>
                          <p className='text-xs text-neutral-500 mt-1'>
                            This file needs to be opened in Google Drive
                          </p>
                        </div>
                        <div className='flex gap-2 justify-center mt-4'>
                          <Button onClick={() => window.open(file.webViewLink, "_blank")}>
                            <ExternalLink className='h-4 w-4 mr-2' />
                            Open in Google Drive
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className='flex items-center justify-center h-full'>
              <div className='text-center space-y-4 p-6'>
                {getFileIcon()}
                <div>
                  <p className='text-sm font-medium'>
                    Preview not available for this file type
                  </p>
                  <p className='text-xs text-neutral-500 mt-1'>{file.mimeType}</p>
                </div>
                <div className='flex gap-2 justify-center mt-4'>
                  <Button size='sm' onClick={handleDownload}>
                    <Download className='h-4 w-4 mr-2' />
                    Download File
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => window.open(file.webViewLink, "_blank")}
                  >
                    <ExternalLink className='h-4 w-4 mr-2' />
                    Open in Google Drive
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
