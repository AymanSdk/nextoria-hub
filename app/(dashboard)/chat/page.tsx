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
import { MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
      <div className='flex items-center justify-center h-[calc(100vh-8rem)]'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-neutral-400' />
          <p className='text-neutral-500'>Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading || !workspaceId) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-8rem)]'>
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
    <div className='fixed inset-0 top-14 left-0 right-0 bottom-0 flex bg-background'>
      {/* Channel List Sidebar */}
      <div className='w-64 border-r bg-muted/10 shrink-0'>
        <ChannelList
          channels={channels}
          currentChannelId={currentChannel?.id}
          onChannelSelect={(id) => {
            const channel = channels.find((c) => c.id === id);
            if (channel) setCurrentChannel(channel);
          }}
          onCreateChannel={handleCreateChannel}
          workspaceId={workspaceId || ""}
        />
      </div>

      {/* Chat Area */}
      <div className='flex-1 flex flex-col min-w-0'>
        {currentChannel && workspaceId ? (
          <ChatRoomProvider channelId={currentChannel.id} workspaceId={workspaceId}>
            {/* Channel Header */}
            <div className='h-14 px-4 border-b bg-background flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center'>
                  <MessageSquare className='h-4 w-4 text-primary' />
                </div>
                <div>
                  <h2 className='font-semibold text-base'>#{currentChannel.name}</h2>
                  {currentChannel.description && (
                    <p className='text-xs text-muted-foreground'>
                      {currentChannel.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Presence Indicator - Right side of header */}
              <ChatPresence />
            </div>

            {/* Messages Area */}
            <div className='flex-1 overflow-hidden bg-background'>
              {isLoadingMessages ? (
                <div className='h-full flex items-center justify-center'>
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
            <div className='border-t bg-background'>
              <ChatInput onSendMessage={handleSendMessage} />
            </div>
          </ChatRoomProvider>
        ) : (
          <div className='flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5'>
            <div className='text-center max-w-md px-4'>
              <div className='h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4'>
                <MessageSquare className='h-10 w-10 text-primary' />
              </div>
              <h3 className='text-xl font-semibold mb-2 text-foreground'>
                Welcome to Chat
              </h3>
              <p className='text-sm text-muted-foreground'>
                Select a channel from the sidebar to start chatting with your team, or
                create a new channel to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
