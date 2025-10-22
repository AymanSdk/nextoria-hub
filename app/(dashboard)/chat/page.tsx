"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { ChatRoomProvider } from "@/components/chat/chat-room-provider";
import { ChannelList } from "@/components/chat/channel-list";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatPresence } from "@/components/chat/chat-presence";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  isArchived: boolean;
  projectId: string | null;
}

interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderImage?: string;
  content: string;
  createdAt: Date;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch user's workspace on mount
  useEffect(() => {
    if (!session?.user) return;

    const fetchWorkspace = async () => {
      try {
        const response = await fetch("/api/user/workspace");
        if (response.ok) {
          const data = await response.json();
          setWorkspaceId(data.workspaceId);
        }
      } catch (error) {
        console.error("Error fetching workspace:", error);
        toast.error("Failed to load workspace");
      }
    };

    fetchWorkspace();
  }, [session]);

  // Fetch channels when workspace is loaded
  useEffect(() => {
    if (!session?.user || !workspaceId) return;

    fetchChannels();
  }, [session, workspaceId]);

  // Fetch messages when channel changes
  useEffect(() => {
    if (currentChannel) {
      fetchMessages(currentChannel.id);
    }
  }, [currentChannel]);

  const fetchChannels = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/chat/channels?workspaceId=${workspaceId}`);

      if (!response.ok) throw new Error("Failed to fetch channels");

      const data = await response.json();
      setChannels(data);

      // Auto-select first channel if available
      if (data.length > 0 && !currentChannel) {
        setCurrentChannel(data[0]);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      toast.error("Failed to load channels");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      setIsLoadingMessages(true);
      const response = await fetch(`/api/chat/messages?channelId=${channelId}`);

      if (!response.ok) throw new Error("Failed to fetch messages");

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleCreateChannel = async (data: {
    name: string;
    description: string;
    isPrivate: boolean;
  }) => {
    if (!workspaceId) {
      toast.error("Workspace not loaded");
      throw new Error("No workspace ID");
    }

    try {
      const response = await fetch("/api/chat/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create channel");
      }

      const newChannel = await response.json();
      setChannels([...channels, newChannel]);
      setCurrentChannel(newChannel);
      toast.success("Channel created successfully");
    } catch (error) {
      console.error("Error creating channel:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create channel");
      throw error;
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentChannel || !session?.user) return;

    try {
      // Save to database
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: currentChannel.id,
          content,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const newMessage = await response.json();

      // Add to local state immediately for optimistic UI
      setMessages([...messages, newMessage]);

      toast.success("Message sent");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  if (!session?.user) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-4rem)] min-h-[calc(100vh-4rem)] -m-4 md:-m-6 lg:-m-8'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-neutral-400' />
          <p className='text-neutral-500'>Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading || !workspaceId) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-4rem)] min-h-[calc(100vh-4rem)] -m-4 md:-m-6 lg:-m-8'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-neutral-400' />
          <p className='text-neutral-500'>
            {!workspaceId ? "Loading workspace..." : "Loading channels..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex gap-0 h-[calc(100vh-4rem)] min-h-[calc(100vh-4rem)] -m-4 md:-m-6 lg:-m-8 relative overflow-hidden'>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-40 lg:hidden'
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Channel List Sidebar */}
      <div
        className={cn(
          "w-64 border-r bg-card/50 backdrop-blur-sm shrink-0 flex flex-col",
          "fixed lg:static inset-y-0 left-0 z-50 lg:z-auto h-full",
          "transition-transform duration-300 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <ChannelList
          channels={channels}
          currentChannelId={currentChannel?.id}
          onChannelSelect={(id) => {
            const channel = channels.find((c) => c.id === id);
            if (channel) {
              setCurrentChannel(channel);
              setIsSidebarOpen(false); // Close sidebar on mobile after selection
            }
          }}
          onCreateChannel={handleCreateChannel}
          onClose={() => setIsSidebarOpen(false)}
          workspaceId={workspaceId || ""}
        />
      </div>

      {/* Chat Area */}
      <div className='flex-1 flex flex-col min-w-0 bg-background'>
        {currentChannel && workspaceId ? (
          <ChatRoomProvider channelId={currentChannel.id} workspaceId={workspaceId}>
            {/* Channel Header */}
            <div className='h-14 px-4 sm:px-6 border-b bg-background/95 backdrop-blur-sm flex items-center justify-between shrink-0'>
              <div className='flex items-center gap-3 min-w-0'>
                {/* Mobile Menu Button */}
                <Button
                  variant='ghost'
                  size='icon'
                  className='lg:hidden h-8 w-8 shrink-0'
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className='h-5 w-5' />
                </Button>

                <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0'>
                  <MessageSquare className='h-4 w-4 text-primary' />
                </div>
                <div className='min-w-0'>
                  <h2 className='font-semibold text-base truncate'>
                    #{currentChannel.name}
                  </h2>
                  {currentChannel.description && (
                    <p className='text-xs text-muted-foreground truncate'>
                      {currentChannel.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Presence Indicator - Right side of header */}
              <div className='shrink-0'>
                <ChatPresence />
              </div>
            </div>

            {/* Messages Area */}
            <div className='flex-1 overflow-hidden bg-background relative'>
              {isLoadingMessages ? (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='text-center'>
                    <Loader2 className='h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2' />
                    <p className='text-sm text-muted-foreground'>Loading messages...</p>
                  </div>
                </div>
              ) : (
                <ChatMessageList
                  channelId={currentChannel.id}
                  messages={messages.map((msg) => ({
                    id: msg.id,
                    senderId: msg.senderId,
                    senderName: msg.senderName || msg.senderEmail,
                    senderAvatar: msg.senderImage,
                    content: msg.content,
                    createdAt: new Date(msg.createdAt).getTime(),
                  }))}
                />
              )}
            </div>

            {/* Message Input - Fixed at bottom */}
            <div className='border-t bg-background/95 backdrop-blur-sm shrink-0'>
              <ChatInput onSendMessage={handleSendMessage} />
            </div>
          </ChatRoomProvider>
        ) : (
          <div className='flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5'>
            {/* Mobile Menu Button for Empty State */}
            <div className='absolute top-4 left-4 lg:hidden'>
              <Button
                variant='outline'
                size='icon'
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className='h-5 w-5' />
              </Button>
            </div>

            <div className='text-center max-w-md px-4'>
              <div className='h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4'>
                <MessageSquare className='h-10 w-10 text-primary' />
              </div>
              <h3 className='text-xl font-semibold mb-2 text-foreground'>
                Welcome to Chat
              </h3>
              <p className='text-sm text-muted-foreground mb-4'>
                Select a channel from the sidebar to start chatting with your team, or
                create a new channel to get started.
              </p>
              <Button
                variant='default'
                className='lg:hidden'
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className='h-4 w-4 mr-2' />
                Open Channels
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
