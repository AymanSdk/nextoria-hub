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
        "group relative flex items-center gap-3 p-3 hover:bg-accent/50 transition-all duration-200 cursor-pointer",
        "first:rounded-t-[calc(var(--radius)-2px)] last:rounded-b-[calc(var(--radius)-2px)]",
        !notification.isRead && "bg-primary/5 border-l-[3px] border-l-primary",
        notification.isRead && "hover:border-l-2 hover:border-l-muted",
        compact && "p-2 gap-2"
      )}
    >
      {/* Unread indicator dot */}
      {!notification.isRead && !compact && (
        <div className='absolute left-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse' />
      )}

      <div className='shrink-0'>
        {notification.sender?.avatarUrl ? (
          <Avatar
            className={cn(
              "border",
              compact ? "h-7 w-7" : "h-9 w-9",
              !notification.isRead && "border-primary/30"
            )}
          >
            <AvatarImage src={notification.sender.avatarUrl} />
            <AvatarFallback className='bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xs font-semibold'>
              {notification.sender.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div
            className={cn(
              "rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center",
              compact ? "h-7 w-7" : "h-9 w-9"
            )}
          >
            {getNotificationIcon(notification.type)}
          </div>
        )}
      </div>

      <div className='flex-1 min-w-0 flex items-center justify-center'>
        <div className='flex-1'>
          <div className='flex items-start justify-between gap-2'>
            <div className='flex-1 min-w-0'>
              <p
                className={cn(
                  "text-sm mb-1 leading-snug",
                  !notification.isRead
                    ? "font-semibold text-foreground"
                    : "font-medium text-foreground/90"
                )}
              >
                {notification.title}
              </p>
              <p
                className={cn(
                  "text-xs line-clamp-2 leading-relaxed",
                  !notification.isRead
                    ? "text-muted-foreground"
                    : "text-muted-foreground/70"
                )}
              >
                {notification.message}
              </p>
            </div>
            {!notification.isRead && !compact && (
              <Badge
                variant='secondary'
                className='shrink-0 text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-primary/20'
              >
                New
              </Badge>
            )}
          </div>

          <div className='flex items-center gap-1.5 mt-2'>
            <time className='text-[11px] text-muted-foreground/60'>
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </time>
            {notification.sender && (
              <>
                <span className='text-[11px] text-muted-foreground/30'>•</span>
                <span className='text-[11px] text-muted-foreground/60'>
                  {notification.sender.name}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {!compact && (
        <div className='flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0'>
          {!notification.isRead && onMarkAsRead && (
            <Button
              variant='ghost'
              size='sm'
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className='h-7 px-2 text-xs hover:bg-primary/10 hover:text-primary transition-colors'
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
              className='h-7 px-2 text-xs hover:bg-accent transition-colors'
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
              className='h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors'
            >
              <Trash2 className='h-3 w-3 mr-1' />
              Delete
            </Button>
          )}
        </div>
      )}
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
