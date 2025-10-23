"use client";

import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface MentionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

interface MentionListProps {
  items: MentionUser[];
  command: (item: MentionUser) => void;
}

export interface MentionListRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

export const MentionList = forwardRef<MentionListRef, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length);
          return true;
        }

        if (event.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % items.length);
          return true;
        }

        if (event.key === "Enter") {
          if (items[selectedIndex]) {
            command(items[selectedIndex]);
          }
          return true;
        }

        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className='px-3 py-2 text-sm text-muted-foreground'>No users found</div>
      );
    }

    return (
      <div className='max-h-80 overflow-y-auto'>
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => command(item)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted transition-colors",
              index === selectedIndex && "bg-muted"
            )}
          >
            <Avatar className='h-8 w-8'>
              <AvatarImage src={item.image} />
              <AvatarFallback className='text-xs'>
                {item.name?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium truncate'>{item.name}</p>
              <p className='text-xs text-muted-foreground truncate'>{item.email}</p>
            </div>
            {item.role && (
              <span className='text-xs text-muted-foreground'>{item.role}</span>
            )}
          </button>
        ))}
      </div>
    );
  }
);

MentionList.displayName = "MentionList";
