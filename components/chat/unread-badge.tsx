"use client";

import { cn } from "@/lib/utils";

interface UnreadBadgeProps {
  count: number;
  className?: string;
}

export function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (count === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold",
        count > 99 && "px-2",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </div>
  );
}
