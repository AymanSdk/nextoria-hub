"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs'
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0' align='end'>
        <div className='flex items-center justify-between p-4 border-b'>
          <h3 className='font-semibold'>Notifications</h3>
          {unreadCount > 0 && <Badge variant='secondary'>{unreadCount} new</Badge>}
        </div>
        <ScrollArea className='h-[400px]'>
          {loading ? (
            <div className='flex items-center justify-center h-32'>
              <p className='text-sm text-muted-foreground'>Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-32 text-center p-4'>
              <Bell className='h-8 w-8 text-muted-foreground mb-2' />
              <p className='text-sm text-muted-foreground'>No notifications</p>
            </div>
          ) : (
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
          )}
        </ScrollArea>
        <div className='p-2 border-t'>
          <Link href='/notifications'>
            <Button variant='ghost' className='w-full' size='sm'>
              View All Notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
