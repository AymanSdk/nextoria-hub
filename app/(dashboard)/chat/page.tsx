"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ChatRoomProvider } from "@/components/chat/chat-room-provider";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChannelPanel } from "@/components/chat/channel-panel";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatSync } from "@/components/chat/chat-sync";
import { MobileChatTabs } from "@/components/chat/mobile-chat-tabs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
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
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState<
    ((message: ChatMessage) => void) | null
  >(null);

  // Load panel state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("chat-panel-open");
    if (savedState !== null) {
      setIsPanelOpen(savedState === "true");
    }
  }, []);

  // Save panel state to localStorage
  const togglePanel = () => {
    const newState = !isPanelOpen;
    setIsPanelOpen(newState);
    localStorage.setItem("chat-panel-open", String(newState));
  };

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

  // Calculate total unread count for mobile tabs
  const totalUnreadCount = channels.reduce(
    (sum, channel) => sum + (channel.unreadCount || 0),
    0
  );

  if (!session?.user) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-4rem)]'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-neutral-400' />
          <p className='text-neutral-500'>Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading || !workspaceId) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-4rem)]'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-neutral-400' />
          <p className='text-neutral-500'>
            {!workspaceId ? "Loading workspace..." : "Loading channels..."}
          </p>
        </div>
      </div>
    );
  }

  // Chat content component (used in both desktop and mobile)
  const chatContent =
    currentChannel && workspaceId ? (
      <ChatRoomProvider channelId={currentChannel.id} workspaceId={workspaceId}>
        {/* Real-time message sync */}
        <ChatSync
          channelId={currentChannel.id}
          onNewMessage={handleNewMessage}
          onBroadcastReady={setBroadcastMessage}
        />

        <div className='flex flex-col h-full'>
          {/* Sticky Header */}
          <ChatHeader
            channelName={currentChannel.name}
            channelDescription={currentChannel.description}
            isPrivate={currentChannel.isPrivate}
            memberCount={0}
            onTogglePanel={togglePanel}
            isPanelOpen={isPanelOpen}
          />

          {/* Messages Area - Scrollable */}
          <div className='flex-1 overflow-hidden'>
            {isLoadingMessages ? (
              <div className='flex items-center justify-center h-full'>
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
                  senderImage: msg.senderImage,
                  senderRole: msg.senderRole,
                  content: msg.content,
                  createdAt: new Date(msg.createdAt).getTime(),
                  attachments: msg.attachments,
                }))}
              />
            )}
          </div>

          {/* Message Input - Sticky Bottom */}
          <ChatInput
            onSendMessage={handleSendMessage}
            channelId={currentChannel.id}
            workspaceId={workspaceId}
          />
        </div>
      </ChatRoomProvider>
    ) : (
      <div className='flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/20'>
        <div className='text-center max-w-md px-4'>
          <div className='h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6'>
            <MessageSquare className='h-12 w-12 text-primary' />
          </div>
          <h3 className='text-2xl font-semibold mb-3 text-foreground'>Welcome to Chat</h3>
          <p className='text-sm text-muted-foreground mb-6 leading-relaxed'>
            Select a channel to start chatting with your team, or create a new channel to
            get started.
          </p>
        </div>
      </div>
    );

  return (
    <>
      {/* Desktop Layout */}
      <div className='hidden md:flex gap-0 h-[calc(100vh-4rem)] -m-4 md:-m-6 lg:-m-8 overflow-hidden bg-background'>
        {/* Channel Panel - Toggleable */}
        <ChannelPanel
          channels={channels}
          currentChannelId={currentChannel?.id}
          onChannelSelect={(id) => {
            const channel = channels.find((c) => c.id === id);
            if (channel) {
              setCurrentChannel(channel);
            }
          }}
          onCreateChannel={handleCreateChannel}
          workspaceId={workspaceId || ""}
          isOpen={isPanelOpen}
        />

        {/* Chat Area */}
        <div className='flex-1 flex flex-col min-w-0 bg-background overflow-hidden border-l'>
          {chatContent}
        </div>
      </div>

      {/* Mobile Layout - Bottom Tabs */}
      <div className='md:hidden h-[calc(100vh-4rem)] -m-4 overflow-hidden bg-background'>
        <MobileChatTabs
          channels={channels}
          currentChannelId={currentChannel?.id}
          onChannelSelect={(id) => {
            const channel = channels.find((c) => c.id === id);
            if (channel) {
              setCurrentChannel(channel);
            }
          }}
          onCreateChannel={handleCreateChannel}
          workspaceId={workspaceId || ""}
          chatContent={chatContent}
          totalUnreadCount={totalUnreadCount}
        />
      </div>
    </>
  );
}
