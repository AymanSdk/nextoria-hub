"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  ChevronDown,
  Users,
  Hash,
  Lock,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { ChatPresence } from "./chat-presence";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  channelName: string;
  channelDescription?: string | null;
  isPrivate?: boolean;
  memberCount?: number;
  onTogglePanel?: () => void;
  isPanelOpen?: boolean;
}

export function ChatHeader({
  channelName,
  channelDescription,
  isPrivate = false,
  memberCount = 0,
  onTogglePanel,
  isPanelOpen = true,
}: ChatHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className='sticky top-0 z-10 border-b bg-background'
    >
      <div className='flex items-center justify-between px-4 sm:px-6 h-14'>
        <div className='flex items-center gap-3 min-w-0 flex-1'>
          {/* Panel Toggle (Desktop) */}
          {onTogglePanel && (
            <Button
              variant='ghost'
              size='icon'
              className='hidden lg:flex h-9 w-9 shrink-0'
              onClick={onTogglePanel}
              title={isPanelOpen ? "Close panel" : "Open panel"}
            >
              {isPanelOpen ? (
                <PanelLeftClose className='h-5 w-5' />
              ) : (
                <PanelLeft className='h-5 w-5' />
              )}
            </Button>
          )}

          {/* Channel Icon */}
          <div className='h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0'>
            {isPrivate ? (
              <Lock className='h-4 w-4 text-primary' />
            ) : (
              <Hash className='h-4 w-4 text-primary' />
            )}
          </div>

          {/* Channel Info */}
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <h2 className='font-semibold text-base truncate'>
                {isPrivate ? "" : "#"}
                {channelName}
              </h2>
              {memberCount > 0 && (
                <Badge variant='secondary' className='text-xs'>
                  <Users className='h-3 w-3 mr-1' />
                  {memberCount}
                </Badge>
              )}
            </div>
          </div>

          {/* Expand/Collapse Trigger */}
          <CollapsibleTrigger asChild>
            <Button variant='ghost' size='icon' className='h-9 w-9 shrink-0'>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Presence Indicator */}
        <div className='shrink-0 ml-4'>
          <ChatPresence />
        </div>
      </div>

      {/* Expanded Content */}
      <CollapsibleContent>
        <div className='px-4 sm:px-6 pb-4 space-y-3 border-t bg-muted/30'>
          {/* Channel Description */}
          {channelDescription && (
            <div className='pt-4'>
              <p className='text-sm text-muted-foreground'>{channelDescription}</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className='flex items-center gap-2 pt-2'>
            <Button variant='outline' size='sm'>
              <Users className='h-4 w-4 mr-2' />
              Members
            </Button>
            <Button variant='outline' size='sm'>
              Search
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
