import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  FileText,
  Users,
  DollarSign,
  FolderKanban,
  Upload,
  Receipt,
  Target,
  Activity,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  activities: Array<{
    id: string;
    activityType: string;
    entityType: string | null;
    entityId: string | null;
    title: string;
    description: string | null;
    createdAt: Date;
    metadata: string | null;
    userId: string | null;
    workspaceId: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
    } | null;
  }>;
}

function getActivityIcon(activityType: string, entityType: string | null) {
  if (activityType.includes("TASK") || entityType === "task") {
    return <CheckCircle2 className='h-4 w-4 text-blue-500' />;
  }
  if (activityType.includes("PROJECT") || entityType === "project") {
    return <FolderKanban className='h-4 w-4 text-purple-500' />;
  }
  if (activityType.includes("INVOICE") || entityType === "invoice") {
    return <DollarSign className='h-4 w-4 text-green-500' />;
  }
  if (activityType.includes("FILE") || entityType === "file") {
    return <Upload className='h-4 w-4 text-orange-500' />;
  }
  if (activityType.includes("MEMBER") || activityType.includes("TEAM")) {
    return <Users className='h-4 w-4 text-indigo-500' />;
  }
  if (activityType.includes("EXPENSE") || entityType === "expense") {
    return <Receipt className='h-4 w-4 text-pink-500' />;
  }
  if (activityType.includes("CAMPAIGN") || entityType === "campaign") {
    return <Target className='h-4 w-4 text-cyan-500' />;
  }
  return <Activity className='h-4 w-4 text-gray-500' />;
}

function getActivityUrl(
  entityType: string | null,
  entityId: string | null
): string | null {
  if (!entityType || !entityId) return null;

  switch (entityType) {
    case "task":
      return `/tasks/${entityId}`;
    case "project":
      return `/projects/${entityId}`;
    case "invoice":
      return `/invoices/${entityId}`;
    case "expense":
      return `/expenses`;
    case "campaign":
      return `/campaigns`;
    case "workspace":
      return `/team`;
    default:
      return null;
  }
}

function getActivityBadge(
  activityType: string
): { label: string; variant: "default" | "secondary" | "outline" } | null {
  if (activityType.includes("CREATED")) {
    return { label: "New", variant: "default" };
  }
  if (activityType.includes("COMPLETED") || activityType.includes("APPROVED")) {
    return { label: "Done", variant: "secondary" };
  }
  if (activityType.includes("UPDATED")) {
    return { label: "Updated", variant: "outline" };
  }
  return null;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4'>
          <Sparkles className='h-8 w-8 text-primary/60' />
        </div>
        <h3 className='font-semibold text-lg mb-1'>No recent activity</h3>
        <p className='text-sm text-muted-foreground max-w-sm'>
          Activity will appear here as your team works on projects, tasks, and more
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className='h-[400px] pr-4'>
      <div className='space-y-1'>
        {activities.map((activity, index) => {
          const url = getActivityUrl(activity.entityType, activity.entityId);
          const ActivityWrapper = url ? Link : "div";
          const wrapperProps = url ? { href: url } : {};
          const badge = getActivityBadge(activity.activityType);

          return (
            <div key={activity.id}>
              <ActivityWrapper
                {...wrapperProps}
                className={cn(
                  "flex gap-3 p-3 rounded-lg transition-all duration-200",
                  url && "hover:bg-accent/50 cursor-pointer group"
                )}
              >
                <div className='shrink-0'>
                  {activity.user?.avatarUrl ? (
                    <Avatar className='h-9 w-9 border'>
                      <AvatarImage src={activity.user.avatarUrl} />
                      <AvatarFallback className='text-xs bg-primary/10 text-primary font-semibold'>
                        {activity.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : activity.user ? (
                    <Avatar className='h-9 w-9 border'>
                      <AvatarFallback className='text-xs bg-primary/10 text-primary font-semibold'>
                        {activity.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className='h-9 w-9 rounded-full bg-muted/80 flex items-center justify-center'>
                      {getActivityIcon(activity.activityType, activity.entityType)}
                    </div>
                  )}
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between gap-2 mb-1'>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm leading-snug'>
                        {activity.user && (
                          <span className='font-semibold'>{activity.user.name} </span>
                        )}
                        <span className='text-muted-foreground'>{activity.title}</span>
                      </p>
                    </div>
                    <div className='flex items-center gap-1.5 shrink-0'>
                      {badge && (
                        <Badge variant={badge.variant} className='text-[10px] px-1.5 h-5'>
                          {badge.label}
                        </Badge>
                      )}
                      <div className='opacity-70'>
                        {getActivityIcon(activity.activityType, activity.entityType)}
                      </div>
                    </div>
                  </div>

                  {activity.description && (
                    <p className='text-xs text-muted-foreground line-clamp-1 mb-1'>
                      {activity.description}
                    </p>
                  )}

                  <time className='text-[11px] text-muted-foreground/60'>
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </time>
                </div>
              </ActivityWrapper>
              {index < activities.length - 1 && <Separator className='my-1' />}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
