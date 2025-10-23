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
  ArrowUpRight,
  Clock,
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
  const iconConfig = {
    icon: Activity,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
  };

  if (activityType.includes("TASK") || entityType === "task") {
    return { icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-500/10" };
  }
  if (activityType.includes("PROJECT") || entityType === "project") {
    return { icon: FolderKanban, color: "text-purple-500", bg: "bg-purple-500/10" };
  }
  if (activityType.includes("INVOICE") || entityType === "invoice") {
    return { icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" };
  }
  if (activityType.includes("FILE") || entityType === "file") {
    return { icon: Upload, color: "text-orange-500", bg: "bg-orange-500/10" };
  }
  if (activityType.includes("MEMBER") || activityType.includes("TEAM")) {
    return { icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" };
  }
  if (activityType.includes("EXPENSE") || entityType === "expense") {
    return { icon: Receipt, color: "text-pink-500", bg: "bg-pink-500/10" };
  }
  if (activityType.includes("CAMPAIGN") || entityType === "campaign") {
    return { icon: Target, color: "text-cyan-500", bg: "bg-cyan-500/10" };
  }
  return iconConfig;
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
        <div className='relative'>
          <div className='h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 ring-4 ring-primary/5'>
            <Sparkles className='h-10 w-10 text-primary/60' />
          </div>
          <div className='absolute -top-1 -right-1 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center animate-pulse'>
            <Activity className='h-3 w-3 text-primary' />
          </div>
        </div>
        <h3 className='font-semibold text-lg mb-2'>No recent activity</h3>
        <p className='text-sm text-muted-foreground max-w-sm leading-relaxed'>
          Activity will appear here as your team works on projects, tasks, and more.
          Start creating to see updates!
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className='h-[420px] pr-4'>
      <div className='space-y-0'>
        {activities.map((activity, index) => {
          const url = getActivityUrl(activity.entityType, activity.entityId);
          const ActivityWrapper = url ? Link : "div";
          const wrapperProps = url ? { href: url } : {};
          const badge = getActivityBadge(activity.activityType);
          const iconConfig = getActivityIcon(activity.activityType, activity.entityType);
          const Icon = iconConfig.icon;

          return (
            <div key={activity.id}>
              <ActivityWrapper
                {...wrapperProps}
                className={cn(
                  "flex gap-3 p-3.5 rounded-xl transition-all duration-200 relative group",
                  url && "hover:bg-accent/60 cursor-pointer",
                  url && "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-0 before:w-0.5 before:bg-primary before:transition-all before:duration-200 hover:before:h-3/4"
                )}
              >
                {/* Avatar or Icon */}
                <div className='shrink-0 relative'>
                  {activity.user ? (
                    <div className='relative'>
                      <Avatar className='h-10 w-10 border-2 border-background shadow-sm'>
                        <AvatarImage src={activity.user.avatarUrl || undefined} />
                        <AvatarFallback className='text-xs bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold'>
                          {activity.user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Activity type indicator */}
                      <div
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full flex items-center justify-center ring-2 ring-background",
                          iconConfig.bg
                        )}
                      >
                        <Icon className={cn("h-2.5 w-2.5", iconConfig.color)} />
                      </div>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center ring-2 ring-background shadow-sm",
                        iconConfig.bg
                      )}
                    >
                      <Icon className={cn("h-5 w-5", iconConfig.color)} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between gap-2 mb-1.5'>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm leading-snug'>
                        {activity.user && (
                          <span className='font-semibold text-foreground'>
                            {activity.user.name}{" "}
                          </span>
                        )}
                        <span className='text-muted-foreground'>{activity.title}</span>
                      </p>
                    </div>
                    {badge && (
                      <Badge
                        variant={badge.variant}
                        className='text-[10px] px-2 h-5 shrink-0'
                      >
                        {badge.label}
                      </Badge>
                    )}
                  </div>

                  {activity.description && (
                    <p className='text-xs text-muted-foreground/80 line-clamp-2 mb-2 leading-relaxed'>
                      {activity.description}
                    </p>
                  )}

                  <div className='flex items-center gap-2 text-[11px] text-muted-foreground/60'>
                    <Clock className='h-3 w-3' />
                    <time>
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                      })}
                    </time>
                    {url && (
                      <div className='ml-auto opacity-0 group-hover:opacity-100 transition-opacity'>
                        <ArrowUpRight className='h-3.5 w-3.5 text-primary' />
                      </div>
                    )}
                  </div>
                </div>
              </ActivityWrapper>
              {index < activities.length - 1 && (
                <Separator className='my-0.5 bg-border/40' />
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
