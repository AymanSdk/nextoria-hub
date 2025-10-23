"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { MentionUser } from "./mention-list";

interface MentionSuggestionProps {
  items: MentionUser[];
  command: (item: MentionUser) => void;
}

export const MentionSuggestion = forwardRef<any, MentionSuggestionProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [props.items]);

    const selectItem = (index: number) => {
      const item = props.items[index];
      if (item) {
        props.command(item);
      }
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex(
            (selectedIndex + props.items.length - 1) % props.items.length
          );
          return true;
        }

        if (event.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % props.items.length);
          return true;
        }

        if (event.key === "Enter") {
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
    }));

    if (props.items.length === 0) {
      return null;
    }

    return (
      <div className='bg-popover border rounded-md shadow-md overflow-hidden'>
        {props.items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => selectItem(index)}
            className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-center gap-2 ${
              index === selectedIndex ? "bg-accent" : ""
            }`}
          >
            <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium'>
              {item.name.charAt(0).toUpperCase()}
            </div>
            <div className='flex-1 min-w-0'>
              <div className='text-sm font-medium truncate'>{item.name}</div>
              <div className='text-xs text-muted-foreground truncate'>
                {item.email}
              </div>
            </div>
            {item.role && (
              <span className='text-xs text-muted-foreground capitalize'>
                {item.role}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }
);

MentionSuggestion.displayName = "MentionSuggestion";

