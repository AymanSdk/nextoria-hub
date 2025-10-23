"use client";

import { ChannelList } from "./channel-list";
import { cn } from "@/lib/utils";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  isArchived: boolean;
  projectId: string | null;
  channelType?: string;
  unreadCount?: number;
}

interface ChannelPanelProps {
  channels: Channel[];
  currentChannelId?: string;
  onChannelSelect: (channelId: string) => void;
  onCreateChannel: (data: {
    name: string;
    description: string;
    isPrivate: boolean;
  }) => Promise<void>;
  workspaceId: string;
  isOpen: boolean;
  className?: string;
}

export function ChannelPanel({
  channels,
  currentChannelId,
  onChannelSelect,
  onCreateChannel,
  workspaceId,
  isOpen,
  className,
}: ChannelPanelProps) {
  return (
    <div
      className={cn(
        "border-r bg-card shrink-0 flex flex-col h-full transition-all duration-300 ease-in-out",
        isOpen ? "w-72" : "w-0 overflow-hidden",
        className
      )}
    >
      <ChannelList
        channels={channels}
        currentChannelId={currentChannelId}
        onChannelSelect={onChannelSelect}
        onCreateChannel={onCreateChannel}
        workspaceId={workspaceId}
      />
    </div>
  );
}
