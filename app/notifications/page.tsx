import { getSession } from "@/src/lib/auth/session";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCheck, Trash2, Settings } from "lucide-react";

// Mock notifications
const mockNotifications = [
  {
    id: "1",
    type: "TASK_ASSIGNED",
    title: "New task assigned",
    message: "John Doe assigned you to 'Design homepage mockup'",
    actionUrl: "/projects/website-redesign/tasks/1",
    isRead: false,
    senderId: "1",
    senderName: "John Doe",
    senderImage: null,
    createdAt: new Date("2025-10-22T10:30:00"),
  },
  {
    id: "2",
    type: "TASK_COMMENTED",
    title: "New comment",
    message: "Jane Smith commented on 'API integration research'",
    actionUrl: "/projects/website-redesign/tasks/4",
    isRead: false,
    senderId: "2",
    senderName: "Jane Smith",
    senderImage: null,
    createdAt: new Date("2025-10-22T09:15:00"),
  },
  {
    id: "3",
    type: "PROJECT_INVITATION",
    title: "Project invitation",
    message: "You've been invited to join 'Mobile App v2.0'",
    actionUrl: "/projects/mobile-app-v2",
    isRead: true,
    senderId: "3",
    senderName: "Bob Johnson",
    senderImage: null,
    createdAt: new Date("2025-10-21T14:20:00"),
  },
  {
    id: "4",
    type: "INVOICE_SENT",
    title: "Invoice sent",
    message: "Invoice INV-2024-002 has been sent to TechStart Inc",
    actionUrl: "/invoices/2",
    isRead: true,
    senderId: null,
    senderName: "System",
    senderImage: null,
    createdAt: new Date("2025-10-20T16:45:00"),
  },
];

const getNotificationIcon = (type: string) => {
  const colors: Record<string, string> = {
    TASK_ASSIGNED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    TASK_COMMENTED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    PROJECT_INVITATION: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    INVOICE_SENT: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    SYSTEM: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  };
  return colors[type] || colors.SYSTEM;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) {
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }
  return date.toLocaleDateString();
};

export default async function NotificationsPage() {
  const session = await getSession();

  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2">
          {mockNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${
                !notification.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={notification.senderImage || undefined} />
                    <AvatarFallback>
                      {notification.senderId ? getInitials(notification.senderName) : <Bell className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-neutral-500">
                        {formatDate(notification.createdAt)}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 ${getNotificationIcon(
                          notification.type
                        )}`}
                      >
                        {notification.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="unread" className="space-y-2">
          {mockNotifications
            .filter((n) => !n.isRead)
            .map((notification) => (
              <Card key={notification.id} className="bg-blue-50/50 dark:bg-blue-950/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={notification.senderImage || undefined} />
                      <AvatarFallback>
                        {getInitials(notification.senderName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {notification.message}
                      </p>
                      <span className="text-xs text-neutral-500 mt-2 inline-block">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="archived">
          <div className="text-center py-12 text-neutral-500">
            No archived notifications
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

