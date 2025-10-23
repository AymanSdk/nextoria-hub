"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Hash, MessageSquare } from "lucide-react";
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

interface MobileChatTabsProps {
  channels: Channel[];
  currentChannelId?: string;
  onChannelSelect: (channelId: string) => void;
  onCreateChannel: (data: {
    name: string;
    description: string;
    isPrivate: boolean;
  }) => Promise<void>;
  workspaceId: string;
  chatContent: React.ReactNode;
  totalUnreadCount?: number;
}

export function MobileChatTabs({
  channels,
  currentChannelId,
  onChannelSelect,
  onCreateChannel,
  workspaceId,
  chatContent,
  totalUnreadCount = 0,
}: MobileChatTabsProps) {
  return (
    <Tabs defaultValue='chat' className='flex flex-col h-full'>
      {/* Tab Content */}
      <div className='flex-1 overflow-hidden'>
        {/* Channels Tab */}
        <TabsContent value='channels' className='h-full m-0 p-0'>
          <div className='h-full overflow-hidden'>
            <ChannelList
              channels={channels}
              currentChannelId={currentChannelId}
              onChannelSelect={(id) => {
                onChannelSelect(id);
                // Auto-switch to chat tab when channel is selected
                const chatTab = document.querySelector('[value="chat"]') as HTMLElement;
                chatTab?.click();
              }}
              onCreateChannel={onCreateChannel}
              workspaceId={workspaceId}
            />
          </div>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value='chat' className='h-full m-0 p-0'>
          {chatContent}
        </TabsContent>
      </div>

      {/* Bottom Tab Bar */}
      <TabsList className='w-full h-16 rounded-none border-t grid grid-cols-2 bg-background'>
        <TabsTrigger
          value='channels'
          className='flex-col gap-1 h-full data-[state=active]:bg-primary/10'
        >
          <Hash className='h-5 w-5' />
          <span className='text-xs'>Channels</span>
        </TabsTrigger>
        <TabsTrigger
          value='chat'
          className='flex-col gap-1 h-full data-[state=active]:bg-primary/10 relative'
        >
          <MessageSquare className='h-5 w-5' />
          <span className='text-xs'>Chat</span>
          {totalUnreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute top-2 right-4 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-[10px]'
            >
              {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
