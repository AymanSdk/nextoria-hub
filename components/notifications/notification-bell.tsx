"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "./notification-item";
import Link from "next/link";

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

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Poll for unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/notifications/unread-count");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Poll every 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch recent notifications when popover opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=5");
      if (res.ok) {
        const data = await res.json();
        console.log("Notifications data:", data);
        console.log("Notifications array:", data.notifications);
        setNotifications(data.notifications || []);
      } else {
        console.error("Failed to fetch notifications:", res.status);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
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
        setUnreadCount((prev) => Math.max(0, prev - 1));

        // Refresh unread count to ensure accuracy
        const countRes = await fetch("/api/notifications/unread-count");
        if (countRes.ok) {
          const data = await countRes.json();
          setUnreadCount(data.count);
        }
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size='icon' variant='ghost' className='relative'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <span className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground'>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0' align='end'>
        {/* Header */}
        <div className='flex items-center justify-between border-b px-4 py-3'>
          <p className='text-sm font-medium'>Notifications</p>
          <Button
            size='sm'
            variant='ghost'
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className='h-auto p-0 text-xs font-normal hover:underline disabled:opacity-50'
          >
            Mark all read
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className='flex h-32 items-center justify-center'>
            <p className='text-sm text-muted-foreground'>Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className='flex h-32 flex-col items-center justify-center gap-1 text-center'>
            <Bell className='h-6 w-6 text-muted-foreground/50' />
            <p className='text-sm text-muted-foreground'>No notifications</p>
          </div>
        ) : (
          <ScrollArea className='h-[320px]'>
            <div className='divide-y'>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  compact
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <div className='border-t p-2'>
            <Link href='/notifications' className='block'>
              <Button variant='ghost' size='sm' className='w-full justify-center text-xs'>
                View all
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
