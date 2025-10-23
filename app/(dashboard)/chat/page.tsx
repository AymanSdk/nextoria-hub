"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { ChatRoomProvider } from "@/components/chat/chat-room-provider";
import { ChannelList } from "@/components/chat/channel-list";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatPresence } from "@/components/chat/chat-presence";
import { ChatSync } from "@/components/chat/chat-sync";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ChatMessage, ChatChannel } from "@/types/chat";

type Message = ChatMessage;
type Channel = ChatChannel;

export default function ChatPage() {
  const { data: session } = useSession();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState<
    ((message: ChatMessage) => void) | null
  >(null);

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
      // Reset broadcast function when channel changes
      setBroadcastMessage(null);
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

      // Mark messages as read after viewing
      if (data.length > 0) {
        const lastMessage = data[data.length - 1];
        markAsRead(channelId, lastMessage.id);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const markAsRead = async (channelId: string, lastMessageId: string) => {
    try {
      await fetch(`/api/chat/channels/${channelId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastReadMessageId: lastMessageId }),
      });
      // Refresh channels to update unread counts
      fetchChannels();
    } catch (error) {
      console.error("Error marking as read:", error);
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

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    if (!currentChannel || !session?.user) return;

    try {
      // Save to database
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: currentChannel.id,
          content,
          attachments: attachments ? JSON.stringify(attachments) : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const newMessage = await response.json();

      // Validate message structure
      if (!newMessage || !newMessage.id) {
        console.error("Invalid message received from API:", newMessage);
        throw new Error("Invalid message format received");
      }

      // Add to local state immediately for optimistic UI
      setMessages((prev) => [...prev, newMessage]);

      // Broadcast to other users in real-time (only if broadcast is ready)
      if (broadcastMessage && newMessage) {
        try {
          broadcastMessage(newMessage);
        } catch (broadcastError) {
          console.error("Error broadcasting message:", broadcastError);
          // Don't fail the message send if broadcast fails
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  // Handle incoming real-time messages from other users
  const handleNewMessage = (newMessage: ChatMessage) => {
    setMessages((prev) => {
      // Check if message already exists (avoid duplicates)
      if (prev.some((msg) => msg.id === newMessage.id)) {
        return prev;
      }
      const updated = [...prev, newMessage];

      // Mark as read if we're viewing this channel
      if (currentChannel?.id === newMessage.channelId) {
        markAsRead(newMessage.channelId, newMessage.id);
      } else {
        // Refresh channels to update unread counts
        fetchChannels();
      }

      return updated;
    });
  };

  if (!session?.user) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)] lg:h-[calc(100vh-8rem)]'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-neutral-400' />
          <p className='text-neutral-500'>Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading || !workspaceId) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)] lg:h-[calc(100vh-8rem)]'>
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
    <div className='flex gap-0 h-[calc(100vh-6rem)] md:h-[calc(100vh-7rem)] lg:h-[calc(100vh-8rem)] -m-4 md:-m-6 lg:-m-8 rounded-lg overflow-hidden border bg-background shadow-sm'>
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
          "w-64 border-r bg-card shrink-0 flex flex-col h-full",
          "fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto",
          "transition-transform duration-300 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
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
      <div className='flex-1 flex flex-col min-w-0 bg-background overflow-hidden'>
        {currentChannel && workspaceId ? (
          <ChatRoomProvider channelId={currentChannel.id} workspaceId={workspaceId}>
            {/* Real-time message sync */}
            <ChatSync
              channelId={currentChannel.id}
              onNewMessage={handleNewMessage}
              onBroadcastReady={setBroadcastMessage}
            />

            {/* Channel Header */}
            <div className='h-16 px-4 sm:px-6 border-b bg-background flex items-center justify-between shrink-0'>
              <div className='flex items-center gap-3 min-w-0 flex-1'>
                {/* Mobile Menu Button */}
                <Button
                  variant='ghost'
                  size='icon'
                  className='lg:hidden h-9 w-9 shrink-0'
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className='h-5 w-5' />
                </Button>

                <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0'>
                  <MessageSquare className='h-5 w-5 text-primary' />
                </div>
                <div className='min-w-0 flex-1'>
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
              <div className='shrink-0 ml-4'>
                <ChatPresence />
              </div>
            </div>

            {/* Messages Area */}
            <div className='flex-1 overflow-hidden relative'>
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
                    senderRole: msg.senderRole,
                    content: msg.content,
                    createdAt: new Date(msg.createdAt).getTime(),
                    attachments: msg.attachments,
                  }))}
                />
              )}
            </div>

            {/* Message Input - Fixed at bottom */}
            <div className='border-t bg-background shrink-0'>
              <ChatInput
                onSendMessage={handleSendMessage}
                channelId={currentChannel.id}
                workspaceId={workspaceId}
              />
            </div>
          </ChatRoomProvider>
        ) : (
          <div className='flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/20'>
            {/* Mobile Menu Button for Empty State */}
            <div className='absolute top-6 left-6 lg:hidden'>
              <Button
                variant='outline'
                size='icon'
                className='h-10 w-10'
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className='h-5 w-5' />
              </Button>
            </div>

            <div className='text-center max-w-md px-4'>
              <div className='h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6'>
                <MessageSquare className='h-12 w-12 text-primary' />
              </div>
              <h3 className='text-2xl font-semibold mb-3 text-foreground'>
                Welcome to Chat
              </h3>
              <p className='text-sm text-muted-foreground mb-6 leading-relaxed'>
                Select a channel from the sidebar to start chatting with your team, or
                create a new channel to get started.
              </p>
              <Button
                variant='default'
                size='lg'
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
