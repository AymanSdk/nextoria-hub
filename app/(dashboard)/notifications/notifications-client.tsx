"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { NotificationItem } from "@/components/notifications/notification-item";
import { toast } from "sonner";
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

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Notifications</h1>
          <p className='text-muted-foreground mt-2'>
            Stay updated with the latest activities
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant='outline' onClick={handleMarkAllAsRead}>
            Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      <div className='flex gap-4 flex-wrap'>
        <Input
          placeholder='Search notifications...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='max-w-sm'
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filter by type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All types</SelectItem>
            <SelectItem value='TASK_ASSIGNED'>Tasks</SelectItem>
            <SelectItem value='PROJECT_INVITATION'>Projects</SelectItem>
            <SelectItem value='INVOICE_SENT'>Invoices</SelectItem>
            <SelectItem value='FILE_UPLOADED'>Files</SelectItem>
            <SelectItem value='APPROVAL_REQUESTED'>Approvals</SelectItem>
            <SelectItem value='EXPENSE_SUBMITTED'>Expenses</SelectItem>
            <SelectItem value='MENTION'>Mentions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value='all'>All</TabsTrigger>
          <TabsTrigger value='unread'>Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value='read'>Read</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className='mt-6'>
          <Card>
            <CardContent className='p-0'>
              {loading ? (
                <div className='flex items-center justify-center py-12'>
                  <p className='text-muted-foreground'>Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-12 text-muted-foreground'>
                  <Bell className='h-12 w-12 mb-4 text-muted-foreground/50' />
                  <p className='text-center'>
                    {filter === "unread" && "No unread notifications"}
                    {filter === "read" && "No read notifications"}
                    {filter === "all" && "No notifications yet"}
                  </p>
                  <p className='text-sm text-center mt-2'>
                    {filter === "all" &&
                      "You'll see notifications here when there's activity"}
                    {filter === "unread" && "All caught up!"}
                  </p>
                </div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onMarkAsUnread={handleMarkAsUnread}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
