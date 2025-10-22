import { getSession } from "@/src/lib/auth/session";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Hash, Plus, Send, Paperclip, Smile } from "lucide-react";

// Mock channels
const mockChannels = [
  { id: "1", name: "general", unreadCount: 3 },
  { id: "2", name: "design", unreadCount: 0 },
  { id: "3", name: "development", unreadCount: 5 },
  { id: "4", name: "marketing", unreadCount: 1 },
];

// Mock messages
const mockMessages = [
  {
    id: "1",
    senderId: "1",
    senderName: "John Doe",
    senderImage: null,
    content: "Hey team, just pushed the new design mockups to Figma",
    createdAt: new Date("2025-10-22T09:30:00"),
  },
  {
    id: "2",
    senderId: "2",
    senderName: "Jane Smith",
    senderImage: null,
    content: "Great! I'll review them this afternoon",
    createdAt: new Date("2025-10-22T09:32:00"),
  },
  {
    id: "3",
    senderId: "3",
    senderName: "Bob Johnson",
    senderImage: null,
    content: "Can someone help me with the API integration?",
    createdAt: new Date("2025-10-22T10:15:00"),
  },
  {
    id: "4",
    senderId: "1",
    senderName: "John Doe",
    senderImage: null,
    content: "Sure, what do you need?",
    createdAt: new Date("2025-10-22T10:16:00"),
  },
];

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default async function ChatPage() {
  const session = await getSession();

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Channels Sidebar */}
      <Card className="w-64 flex-shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Channels</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              placeholder="Search channels..."
              className="pl-8 h-9"
            />
          </div>
        </CardHeader>
        <ScrollArea className="h-[calc(100%-5rem)]">
          <CardContent className="space-y-1 pb-4">
            {mockChannels.map((channel) => (
              <Button
                key={channel.id}
                variant="ghost"
                className="w-full justify-start gap-2 px-2"
              >
                <Hash className="h-4 w-4 text-neutral-500" />
                <span className="flex-1 text-left">{channel.name}</span>
                {channel.unreadCount > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {channel.unreadCount}
                  </Badge>
                )}
              </Button>
            ))}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {/* Chat Header */}
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-neutral-500" />
              <h2 className="font-semibold">general</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {mockChannels[0].unreadCount} members
              </Badge>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {mockMessages.map((message) => (
              <div key={message.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.senderImage || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(message.senderName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {message.senderName}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <CardContent className="border-t pt-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Type a message..."
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

