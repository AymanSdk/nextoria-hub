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

interface Channel {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  isArchived: boolean;
  projectId: string | null;
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
    <div className='flex flex-col h-full'>
      <div className='h-14 px-4 border-b flex items-center justify-between bg-muted/50'>
        <h2 className='font-semibold text-sm uppercase tracking-wide text-muted-foreground'>
          Channels
        </h2>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant='ghost' size='icon' className='h-7 w-7'>
              <Plus className='h-4 w-4' />
            </Button>
          </DialogTrigger>
          <DialogContent>
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
                  onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
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
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='private'>Private Channel</Label>
                  <p className='text-sm text-neutral-500'>
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
              <Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateChannel} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Channel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className='flex-1'>
        <div className='p-3 space-y-0.5'>
          {channels.length === 0 ? (
            <div className='p-6 text-center text-sm text-muted-foreground'>
              <div className='h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3'>
                <Hash className='h-6 w-6' />
              </div>
              <p className='font-medium text-foreground mb-1'>No channels yet</p>
              <p className='text-xs'>Create one to get started!</p>
            </div>
          ) : (
            channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onChannelSelect(channel.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all",
                  "hover:bg-muted",
                  currentChannelId === channel.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                {channel.isPrivate ? (
                  <Lock className='h-4 w-4 shrink-0' />
                ) : (
                  <Hash className='h-4 w-4 shrink-0' />
                )}
                <span className='truncate'>{channel.name}</span>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
