"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  FileText,
  Users,
  DollarSign,
  FolderKanban,
  AlertCircle,
  MessageSquare,
  Upload,
  Calendar,
  Receipt,
  Target,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: {
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
  };
  onMarkAsRead?: (id: string) => void;
  onMarkAsUnread?: (id: string) => void;
  onDelete?: (id: string) => void;
  compact?: boolean;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "TASK_ASSIGNED":
    case "TASK_COMMENTED":
    case "TASK_STATUS_CHANGED":
    case "TASK_DUE_SOON":
    case "TASK_COMPLETED":
      return <CheckCircle2 className='h-5 w-5 text-blue-500' />;
    case "PROJECT_INVITATION":
    case "PROJECT_STATUS_CHANGED":
    case "PROJECT_MEMBER_ADDED":
      return <FolderKanban className='h-5 w-5 text-purple-500' />;
    case "INVOICE_SENT":
    case "INVOICE_PAID":
    case "PAYMENT_RECEIVED":
      return <DollarSign className='h-5 w-5 text-green-500' />;
    case "FILE_UPLOADED":
    case "FILE_SHARED":
      return <Upload className='h-5 w-5 text-orange-500' />;
    case "TEAM_MEMBER_JOINED":
    case "WORKSPACE_INVITATION":
      return <Users className='h-5 w-5 text-indigo-500' />;
    case "APPROVAL_REQUESTED":
    case "APPROVAL_APPROVED":
    case "APPROVAL_REJECTED":
      return <AlertCircle className='h-5 w-5 text-yellow-500' />;
    case "EXPENSE_SUBMITTED":
    case "EXPENSE_APPROVED":
    case "EXPENSE_REJECTED":
      return <Receipt className='h-5 w-5 text-pink-500' />;
    case "CAMPAIGN_LAUNCHED":
    case "CAMPAIGN_COMPLETED":
      return <Target className='h-5 w-5 text-cyan-500' />;
    case "MENTION":
    case "CHAT_MESSAGE":
      return <MessageSquare className='h-5 w-5 text-blue-500' />;
    case "CLIENT_REQUEST_SUBMITTED":
      return <FileText className='h-5 w-5 text-violet-500' />;
    default:
      return <AlertCircle className='h-5 w-5 text-gray-500' />;
  }
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  compact = false,
}: NotificationItemProps) {
  const content = (
    <div
      className={cn(
        "flex gap-3 p-4 hover:bg-accent/50 transition-colors",
        !notification.isRead && "bg-accent/30",
        compact && "p-3"
      )}
    >
      <div className='flex-shrink-0 mt-1'>
        {notification.sender?.avatarUrl ? (
          <Avatar className='h-8 w-8'>
            <AvatarImage src={notification.sender.avatarUrl} />
            <AvatarFallback>
              {notification.sender.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          getNotificationIcon(notification.type)
        )}
      </div>

      <div className='flex-1 min-w-0'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex-1 min-w-0'>
            <p
              className={cn(
                "font-medium text-sm",
                !notification.isRead && "font-semibold"
              )}
            >
              {notification.title}
            </p>
            <p className='text-sm text-muted-foreground line-clamp-2 mt-0.5'>
              {notification.message}
            </p>
          </div>
          {!notification.isRead && (
            <div className='flex-shrink-0'>
              <div className='h-2 w-2 rounded-full bg-blue-500' />
            </div>
          )}
        </div>

        <div className='flex items-center gap-2 mt-2'>
          <time className='text-xs text-muted-foreground'>
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </time>
          {notification.sender && (
            <>
              <span className='text-xs text-muted-foreground'>•</span>
              <span className='text-xs text-muted-foreground'>
                {notification.sender.name}
              </span>
            </>
          )}
        </div>

        {!compact && (
          <div className='flex items-center gap-1 mt-2'>
            {!notification.isRead && onMarkAsRead && (
              <Button
                variant='ghost'
                size='sm'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                className='h-7 text-xs'
              >
                <Eye className='h-3 w-3 mr-1' />
                Mark read
              </Button>
            )}
            {notification.isRead && onMarkAsUnread && (
              <Button
                variant='ghost'
                size='sm'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMarkAsUnread(notification.id);
                }}
                className='h-7 text-xs'
              >
                <EyeOff className='h-3 w-3 mr-1' />
                Mark unread
              </Button>
            )}
            {onDelete && (
              <Button
                variant='ghost'
                size='sm'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className='h-7 text-xs text-destructive hover:text-destructive'
              >
                <Trash2 className='h-3 w-3 mr-1' />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (notification.actionUrl) {
    return (
      <Link
        href={notification.actionUrl}
        className='block border-b last:border-b-0 hover:no-underline'
        onClick={() => {
          if (!notification.isRead && onMarkAsRead) {
            onMarkAsRead(notification.id);
          }
        }}
      >
        {content}
      </Link>
    );
  }

  return <div className='border-b last:border-b-0'>{content}</div>;
}
