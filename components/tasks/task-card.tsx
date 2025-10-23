"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  MoreHorizontal,
  Pencil,
  MoveRight,
  GripVertical,
  Clock,
  User,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditTaskDialog } from "./edit-task-dialog";
import { cn } from "@/lib/utils";

type TaskStatus =
  | "BACKLOG"
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "BLOCKED"
  | "DONE"
  | "CANCELLED";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: { id: string; name: string; image: string | null } | null;
  dueDate?: Date;
  labels?: string;
  project?: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  } | null;
}

interface TaskCardProps {
  task: Task;
  members?: TeamMember[];
}

const statusOptions = [
  { value: "TODO", label: "To Do", color: "#3b82f6" },
  { value: "IN_PROGRESS", label: "In Progress", color: "#f59e0b" },
  { value: "IN_REVIEW", label: "In Review", color: "#8b5cf6" },
  { value: "DONE", label: "Done", color: "#10b981" },
];

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function TaskCard({ task, members = [] }: TaskCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [updating, setUpdating] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      router.refresh();
    } catch (error) {
      console.error("Error updating task status:", error);
    } finally {
      setUpdating(false);
    }
  };

  // Transform task for EditTaskDialog
  const taskForEdit = {
    id: task.id,
    title: task.title,
    description: task.description || null,
    status: task.status,
    priority: task.priority,
    assigneeId: task.assignee?.id || null,
    labels: task.labels || null,
    dueDate: task.dueDate || null,
    startDate: null,
    estimatedHours: null,
    actualHours: null,
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityConfig: Record<
    TaskPriority,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
      color: string;
      bgColor: string;
    }
  > = {
    LOW: {
      variant: "secondary",
      label: "Low",
      color: "text-slate-600 dark:text-slate-400",
      bgColor: "bg-slate-100/50 dark:bg-slate-900/50",
    },
    MEDIUM: {
      variant: "default",
      label: "Medium",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100/50 dark:bg-blue-900/50",
    },
    HIGH: {
      variant: "outline",
      label: "High",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100/50 dark:bg-orange-900/50",
    },
    URGENT: {
      variant: "destructive",
      label: "Urgent",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100/50 dark:bg-red-900/50",
    },
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative p-2.5 transition-all duration-200 cursor-pointer",
        "hover:shadow-lg hover:scale-[1.02] hover:border-primary/20",
        "bg-linear-to-br from-card to-card/95",
        "h-[200px] flex flex-col",
        updating && "opacity-50 pointer-events-none",
        isDragging && "opacity-30 scale-95"
      )}
    >
      {/* Priority Accent Bar */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-1 rounded-l-lg",
          priorityConfig[task.priority].bgColor
        )}
      />

      <div className='flex flex-col flex-1 min-h-0 space-y-2 pl-1.5'>
        {/* Header: Priority + Actions */}
        <div className='flex items-center justify-between gap-2'>
          <div className='flex items-center gap-1.5'>
            <button
              {...attributes}
              {...listeners}
              className='opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none transition-opacity'
            >
              <GripVertical className='h-3.5 w-3.5' />
            </button>

            <Badge
              variant={priorityConfig[task.priority].variant}
              className='text-[9px] px-1.5 py-0 h-5 font-semibold'
            >
              {priorityConfig[task.priority].label}
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "opacity-0 group-hover:opacity-100 text-muted-foreground/40",
                  "hover:text-foreground hover:bg-accent rounded-md p-1",
                  "transition-all"
                )}
              >
                <MoreHorizontal className='h-3.5 w-3.5' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <MoveRight className='h-4 w-4 mr-2' />
                  Move to
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {statusOptions.map((status) => (
                    <DropdownMenuItem
                      key={status.value}
                      onClick={() => handleStatusChange(status.value)}
                      disabled={task.status === status.value}
                    >
                      <div
                        className='h-2 w-2 rounded-full mr-2'
                        style={{ backgroundColor: status.color }}
                      />
                      {status.label}
                      {task.status === status.value && " (current)"}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className='h-4 w-4 mr-2' />
                Edit Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Project Badge */}
        {task.project && (
          <Link
            href={`/projects/${task.project.slug}`}
            onClick={(e) => e.stopPropagation()}
            className='inline-block'
          >
            <Badge
              variant='outline'
              className='text-[10px] px-2 py-0.5 h-5 font-medium hover:bg-accent transition-colors'
              style={{
                borderColor: task.project.color || "#6b7280",
                color: task.project.color || "#6b7280",
              }}
            >
              {task.project.name}
            </Badge>
          </Link>
        )}

        {/* Title */}
        <h4 className='text-xs font-semibold text-foreground line-clamp-2 leading-tight'>
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className='text-[10px] text-muted-foreground/70 line-clamp-1 leading-tight'>
            {task.description}
          </p>
        )}

        {/* Labels */}
        {task.labels && (
          <div className='flex flex-wrap gap-0.5'>
            {task.labels
              .split(",")
              .slice(0, 2)
              .map((label, idx) => (
                <Badge
                  key={idx}
                  variant='secondary'
                  className='text-[8px] px-1 py-0 h-3.5 font-medium'
                >
                  #{label.trim()}
                </Badge>
              ))}
          </div>
        )}

        {/* Divider */}
        {(task.assignee || task.dueDate) && (
          <div className='border-t border-border/50 mt-auto' />
        )}

        {/* Footer: Assignee + Due Date */}
        <div className='flex items-center justify-between mt-auto'>
          {/* Assignee */}
          {task.assignee ? (
            <div className='flex items-center gap-1.5 group/assignee'>
              <Avatar className='h-5 w-5 border border-background shadow-sm'>
                <AvatarImage src={task.assignee.image || undefined} />
                <AvatarFallback className='text-[8px] bg-primary/10 text-primary font-bold'>
                  {getInitials(task.assignee.name || task.assignee.name)}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col'>
                <span className='text-[8px] text-muted-foreground uppercase tracking-wide font-medium'>
                  Assignee
                </span>
                <span className='text-[9px] text-foreground font-medium truncate max-w-[70px]'>
                  {task.assignee.id === session?.user?.id ? "You" : task.assignee.name}
                </span>
              </div>
            </div>
          ) : (
            <div className='flex items-center gap-1.5'>
              <div className='h-5 w-5 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center'>
                <User className='h-2.5 w-2.5 text-muted-foreground/40' />
              </div>
              <span className='text-[9px] text-muted-foreground/60'>Unassigned</span>
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className='flex flex-col items-end'>
              <span className='text-[8px] text-muted-foreground uppercase tracking-wide font-medium'>
                Due
              </span>
              <div
                className={cn(
                  "flex items-center gap-0.5 text-[9px] font-medium",
                  isOverdue ? "text-destructive" : "text-foreground"
                )}
              >
                {isOverdue && <AlertCircle className='h-2.5 w-2.5' />}
                {!isOverdue && <Calendar className='h-2.5 w-2.5' />}
                <span>
                  {new Date(task.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Task Dialog - Controlled state */}
      <EditTaskDialog
        task={taskForEdit}
        members={members}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </Card>
  );
}
