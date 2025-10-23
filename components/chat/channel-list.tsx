"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Hash, Plus, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnreadBadge } from "./unread-badge";

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

interface ChannelListProps {
  channels: Channel[];
  currentChannelId?: string;
  onChannelSelect: (channelId: string) => void;
  onCreateChannel: (data: {
    name: string;
    description: string;
    isPrivate: boolean;
  }) => Promise<void>;
  workspaceId: string;
}

export function ChannelList({
  channels,
  currentChannelId,
  onChannelSelect,
  onCreateChannel,
}: ChannelListProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: "",
    description: "",
    isPrivate: false,
  });

  const handleCreateChannel = async () => {
    if (!newChannel.name.trim()) return;

    setIsCreating(true);
    try {
      await onCreateChannel(newChannel);
      setNewChannel({ name: "", description: "", isPrivate: false });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating channel:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className='flex flex-col h-full bg-card'>
      {/* Header */}
      <div className='h-16 px-4 border-b flex items-center justify-between shrink-0 bg-muted/20'>
        <h2 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground'>
          Channels
        </h2>

        <div className='flex items-center gap-1'>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors'
              >
                <Plus className='h-4 w-4' />
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[500px]'>
              <DialogHeader>
                <DialogTitle>Create Channel</DialogTitle>
                <DialogDescription>
                  Create a new channel for team communication
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Channel Name</Label>
                  <Input
                    id='name'
                    placeholder='e.g., general, design, dev'
                    value={newChannel.name}
                    onChange={(e) =>
                      setNewChannel({ ...newChannel, name: e.target.value })
                    }
                    className='focus-visible:ring-primary'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>Description</Label>
                  <Textarea
                    id='description'
                    placeholder="What's this channel about?"
                    value={newChannel.description}
                    onChange={(e) =>
                      setNewChannel({
                        ...newChannel,
                        description: e.target.value,
                      })
                    }
                    className='focus-visible:ring-primary resize-none'
                    rows={3}
                  />
                </div>

                <div className='flex items-center justify-between p-3 rounded-lg border bg-muted/30'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='private' className='text-sm font-medium'>
                      Private Channel
                    </Label>
                    <p className='text-xs text-muted-foreground'>
                      Only invited members can access
                    </p>
                  </div>
                  <Switch
                    id='private'
                    checked={newChannel.isPrivate}
                    onCheckedChange={(checked) =>
                      setNewChannel({ ...newChannel, isPrivate: checked })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateChannel}
                  disabled={isCreating || !newChannel.name.trim()}
                >
                  {isCreating ? "Creating..." : "Create Channel"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Channel List */}
      <ScrollArea className='flex-1'>
        <div className='p-3 space-y-1'>
          {channels.length === 0 ? (
            <div className='p-8 text-center text-sm text-muted-foreground'>
              <div className='h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4'>
                <Hash className='h-7 w-7 text-muted-foreground' />
              </div>
              <p className='font-medium text-foreground mb-1.5'>No channels yet</p>
              <p className='text-xs'>Create one to get started!</p>
            </div>
          ) : (
            channels
              .sort((a, b) => {
                // Sort by unread count (descending), then by name
                const aUnread = a.unreadCount || 0;
                const bUnread = b.unreadCount || 0;
                if (aUnread !== bUnread) return bUnread - aUnread;
                return a.name.localeCompare(b.name);
              })
              .map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => onChannelSelect(channel.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                    "hover:bg-muted/80",
                    currentChannelId === channel.id
                      ? "bg-primary/10 text-primary font-medium shadow-sm ring-1 ring-primary/20"
                      : channel.unreadCount && channel.unreadCount > 0
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "h-6 w-6 rounded flex items-center justify-center shrink-0",
                      currentChannelId === channel.id ? "bg-primary/20" : "bg-muted"
                    )}
                  >
                    {channel.isPrivate ? (
                      <Lock className='h-3.5 w-3.5' />
                    ) : (
                      <Hash className='h-3.5 w-3.5' />
                    )}
                  </div>
                  <span className='truncate flex-1 text-left'>{channel.name}</span>
                  {channel.unreadCount && channel.unreadCount > 0 && (
                    <UnreadBadge count={channel.unreadCount} />
                  )}
                </button>
              ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
