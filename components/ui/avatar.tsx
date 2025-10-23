"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot='avatar'
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  // Debug logging
  React.useEffect(() => {
    if (props.src) {
      console.log("AvatarImage: Rendering with src:", props.src);
    }
  }, [props.src]);

  return (
    <AvatarPrimitive.Image
      data-slot='avatar-image'
      className={cn("aspect-square size-full object-cover", className)}
      referrerPolicy='no-referrer'
      onLoadingStatusChange={(status) => {
        console.log("AvatarImage: Loading status:", status, "src:", props.src);
      }}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot='avatar-fallback'
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
