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
        "group flex gap-3 px-4 py-3 transition-colors hover:bg-accent/50",
        !notification.isRead && "bg-accent/20"
      )}
      onClick={() => {
        if (!notification.isRead && onMarkAsRead) {
          onMarkAsRead(notification.id);
        }
      }}
    >
      {/* Icon/Avatar */}
      <div className='shrink-0'>
        {notification.sender?.avatarUrl ? (
          <Avatar className='h-8 w-8'>
            <AvatarImage src={notification.sender.avatarUrl} />
            <AvatarFallback className='text-xs'>
              {notification.sender.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted'>
            <div className='scale-75'>{getNotificationIcon(notification.type)}</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='flex-1 space-y-1'>
        <p className={cn("text-sm", !notification.isRead && "font-medium")}>
          {notification.title}
        </p>
        <p className='text-xs text-muted-foreground line-clamp-2'>{notification.message}</p>
        <p className='text-xs text-muted-foreground'>
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className='flex items-start pt-1'>
          <div className='h-2 w-2 rounded-full bg-primary' />
        </div>
      )}

      {/* Actions (only for non-compact) */}
      {!compact && (
        <div className='flex items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
          {!notification.isRead && onMarkAsRead && (
            <Button
              size='icon'
              variant='ghost'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className='h-8 w-8'
            >
              <Eye className='h-4 w-4' />
            </Button>
          )}
          {notification.isRead && onMarkAsUnread && (
            <Button
              size='icon'
              variant='ghost'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMarkAsUnread(notification.id);
              }}
              className='h-8 w-8'
            >
              <EyeOff className='h-4 w-4' />
            </Button>
          )}
          {onDelete && (
            <Button
              size='icon'
              variant='ghost'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className='h-8 w-8 text-destructive'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} className='block'>
        {content}
      </Link>
    );
  }

  return content;
}
