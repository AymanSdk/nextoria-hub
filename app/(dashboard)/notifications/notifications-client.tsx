"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  Loader2,
  CheckCheck,
  Filter,
  Search,
  Inbox,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationItem } from "@/components/notifications/notification-item";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
  } | null;
}

export function NotificationsClient() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [filter, typeFilter, search]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
      });

      if (filter !== "all") {
        params.append("filter", filter);
      }
      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }
      if (search) {
        params.append("search", search);
      }

      const res = await fetch(`/api/notifications?${params}`);
      if (res.ok) {
        const data = await res.json();
        console.log("Notifications page data:", data);
        console.log("Notifications count:", data.notifications?.length);
        setNotifications(data.notifications || []);
        setHasMore(data.pagination.page < data.pagination.totalPages);
      } else {
        console.error("Failed to fetch notifications:", res.status);
        toast.error("Failed to load notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });

      if (res.ok) {
        toast.success("All notifications marked as read");
        fetchNotifications();
      } else {
        toast.error("Failed to mark all as read");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        toast.success("Marked as read");
      }
    } catch (error) {
      console.error("Error marking as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAsUnread = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: false }),
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
        );
        toast.success("Marked as unread");
      }
    } catch (error) {
      console.error("Error marking as unread:", error);
      toast.error("Failed to mark as unread");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast.success("Notification deleted");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;
  const allNotifications = notifications;
  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  const getEmptyState = (type: string) => {
    const states = {
      all: {
        icon: Inbox,
        title: "No notifications yet",
        description:
          "You'll see notifications here when there's activity in your workspace",
      },
      unread: {
        icon: CheckCircle2,
        title: "All caught up!",
        description:
          "You've read all your notifications. Great job staying on top of things!",
      },
      read: {
        icon: Circle,
        title: "No read notifications",
        description: "Notifications you've read will appear here",
      },
    };
    return states[type as keyof typeof states];
  };

  const renderNotificationList = (
    notificationList: Notification[],
    emptyType: string
  ) => {
    if (loading) {
      return (
        <div className='divide-y divide-border/50'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='flex gap-3 p-3'>
              <Skeleton className='h-9 w-9 rounded-full shrink-0' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-2/3' />
                <Skeleton className='h-3 w-full' />
                <Skeleton className='h-2.5 w-24' />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (notificationList.length === 0) {
      const emptyState = getEmptyState(emptyType);
      const EmptyIcon = emptyState.icon;
      return (
        <div className='flex flex-col items-center justify-center py-20 px-4'>
          <div className='h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
            <EmptyIcon className='h-10 w-10 text-primary/60' />
          </div>
          <h3 className='text-lg font-semibold mb-2'>{emptyState.title}</h3>
          <p className='text-sm text-muted-foreground text-center max-w-sm'>
            {emptyState.description}
          </p>
        </div>
      );
    }

    return (
      <ScrollArea className='h-[calc(100vh-24rem)]'>
        <div className='divide-y divide-border/50'>
          {notificationList.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onMarkAsUnread={handleMarkAsUnread}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className='max-w-5xl mx-auto space-y-5'>
      {/* Header Section */}
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center'>
            <Bell className='h-5 w-5 text-primary' />
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Notifications</h1>
            <p className='text-sm text-muted-foreground'>
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && !loading && (
          <Button
            variant='outline'
            size='sm'
            onClick={handleMarkAllAsRead}
            className='gap-2'
          >
            <CheckCheck className='h-4 w-4' />
            Mark all read
          </Button>
        )}
      </div>

      {/* Filters Section */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <InputGroup className='flex-1'>
          <InputGroupAddon>
            <Search className='h-4 w-4' />
          </InputGroupAddon>
          <InputGroupInput
            placeholder='Search notifications...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className='w-full sm:w-[180px]'>
            <Filter className='h-4 w-4 mr-2' />
            <SelectValue placeholder='Filter by type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All types</SelectItem>
            <SelectItem value='TASK_ASSIGNED'>📋 Tasks</SelectItem>
            <SelectItem value='PROJECT_INVITATION'>📁 Projects</SelectItem>
            <SelectItem value='INVOICE_SENT'>💰 Invoices</SelectItem>
            <SelectItem value='FILE_UPLOADED'>📎 Files</SelectItem>
            <SelectItem value='APPROVAL_REQUESTED'>✅ Approvals</SelectItem>
            <SelectItem value='EXPENSE_SUBMITTED'>💳 Expenses</SelectItem>
            <SelectItem value='MENTION'>💬 Mentions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs Section */}
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as any)}
        className='space-y-4'
      >
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='all' className='gap-2'>
            <Inbox className='h-4 w-4' />
            All
            {!loading && allNotifications.length > 0 && (
              <Badge variant='secondary' className='ml-1 h-5 px-1.5 text-xs'>
                {allNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value='unread' className='gap-2'>
            <Circle className='h-4 w-4' />
            Unread
            {unreadCount > 0 && (
              <Badge className='ml-1 h-5 px-1.5 text-xs'>{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value='read' className='gap-2'>
            <CheckCircle2 className='h-4 w-4' />
            Read
            {readCount > 0 && (
              <Badge variant='secondary' className='ml-1 h-5 px-1.5 text-xs'>
                {readCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='all' className='mt-4'>
          <Card className='overflow-hidden p-0'>
            {renderNotificationList(allNotifications, "all")}
          </Card>
        </TabsContent>

        <TabsContent value='unread' className='mt-4'>
          <Card className='overflow-hidden p-0'>
            {renderNotificationList(unreadNotifications, "unread")}
          </Card>
        </TabsContent>

        <TabsContent value='read' className='mt-4'>
          <Card className='overflow-hidden p-0'>
            {renderNotificationList(readNotifications, "read")}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
