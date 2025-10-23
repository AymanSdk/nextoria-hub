"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  alt: string;
  fallback: string;
  className?: string;
  size?: number;
}

export function UserAvatar({
  src,
  alt,
  fallback,
  className,
  size = 32,
}: UserAvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    console.log("UserAvatar: Received src:", src);

    if (!src) {
      setImageSrc(null);
      setImageError(false);
      return;
    }

    // Check if URL is private R2 URL (cloudflarestorage.com without pub-)
    const isPrivateR2 = src.includes("r2.cloudflarestorage.com") && !src.includes("pub-");

    if (isPrivateR2) {
      console.log("UserAvatar: Detected private R2 URL, using proxy");
      setImageSrc(`/api/proxy-image?url=${encodeURIComponent(src)}`);
    } else {
      console.log("UserAvatar: Using direct URL");
      setImageSrc(src);
    }

    setImageError(false);
  }, [src]);

  const handleError = () => {
    console.error("UserAvatar: Image failed to load:", imageSrc);
    setImageError(true);
  };

  const handleLoad = () => {
    console.log("UserAvatar: Image loaded successfully:", imageSrc);
  };

  // Show fallback if no src, error, or loading
  if (!imageSrc || imageError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium",
          className
        )}
        style={{ width: size, height: size }}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden rounded-full", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={imageSrc}
        alt={alt}
        width={size}
        height={size}
        className='object-cover'
        onError={handleError}
        onLoad={handleLoad}
        unoptimized // Disable optimization for external images
        priority={size > 64} // Prioritize larger avatars
      />
    </div>
  );
}
