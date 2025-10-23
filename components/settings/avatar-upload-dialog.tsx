"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/ui/user-avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AvatarUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentImage?: string | null;
  userName: string;
  onUploadSuccess?: (imageUrl: string) => void;
}

export function AvatarUploadDialog({
  open,
  onOpenChange,
  currentImage,
  userName,
  onUploadSuccess,
}: AvatarUploadDialogProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload avatar");
      }

      const data = await response.json();
      console.log("Avatar upload response:", data);

      // Call success callback first
      if (onUploadSuccess) {
        console.log("Calling onUploadSuccess with imageUrl:", data.imageUrl);
        onUploadSuccess(data.imageUrl);
      }

      // Update session - this triggers JWT callback to fetch fresh user data
      console.log("Calling updateSession...");
      // Force trigger by passing an empty object
      const updatedSession = await updateSession({});
      console.log("Session updated:", updatedSession);

      toast.success("Profile picture updated successfully");

      // Close dialog
      onOpenChange(false);

      // Reset state
      setSelectedFile(null);
      setPreview(null);
      setUploadProgress(0);

      // Force a hard refresh to ensure all components re-render with new avatar
      // This is necessary because NextAuth session updates don't always trigger re-renders
      setTimeout(() => {
        console.log("Refreshing router...");
        router.refresh();
        // Reload after a longer delay to ensure session update completes
        setTimeout(() => {
          console.log("Reloading page...");
          window.location.reload();
        }, 300);
      }, 700);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload profile picture"
      );
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(currentImage || null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Upload Profile Picture</DialogTitle>
          <DialogDescription>
            Choose a photo that represents you. JPG, PNG, GIF or WebP. Max 5MB.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Preview */}
          <div className='flex justify-center'>
            <UserAvatar
              src={preview}
              alt={userName}
              fallback={userName.substring(0, 2).toUpperCase()}
              size={128}
              className='border-4 border-border'
            />
          </div>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <input
              type='file'
              accept='image/jpeg,image/png,image/gif,image/webp'
              onChange={handleChange}
              className='hidden'
              id='avatar-upload'
              disabled={isUploading}
            />
            <label
              htmlFor='avatar-upload'
              className='cursor-pointer flex flex-col items-center gap-2'
            >
              {selectedFile ? (
                <>
                  <Camera className='h-8 w-8 text-primary' />
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>{selectedFile.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className='h-8 w-8 text-muted-foreground' />
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Drop your image here</p>
                    <p className='text-xs text-muted-foreground'>or click to browse</p>
                  </div>
                </>
              )}
            </label>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Uploading...</span>
                <span className='font-medium'>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className='h-2' />
            </div>
          )}
        </div>

        <DialogFooter className='gap-2 sm:gap-0'>
          {selectedFile && !isUploading && (
            <Button type='button' variant='outline' onClick={handleRemove}>
              <X className='h-4 w-4 mr-2' />
              Remove
            </Button>
          )}
          <Button
            type='button'
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Uploading...
              </>
            ) : (
              <>
                <Upload className='h-4 w-4 mr-2' />
                Upload Photo
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
