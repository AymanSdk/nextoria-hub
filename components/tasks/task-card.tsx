"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MoreHorizontal, Pencil, MoveRight, GripVertical } from "lucide-react";
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
  const [updating, setUpdating] = useState(false);

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
      stripe: string;
      badge: string;
      text: string;
      icon: string;
      dotColor: string;
    }
  > = {
    LOW: {
      stripe: "bg-slate-400/60",
      badge:
        "bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800",
      text: "text-slate-600 dark:text-slate-400",
      icon: "◯",
      dotColor: "bg-slate-400",
    },
    MEDIUM: {
      stripe: "bg-blue-500/70",
      badge:
        "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800",
      text: "text-blue-600 dark:text-blue-400",
      icon: "◐",
      dotColor: "bg-blue-500",
    },
    HIGH: {
      stripe: "bg-orange-500/70",
      badge:
        "bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800",
      text: "text-orange-600 dark:text-orange-400",
      icon: "●",
      dotColor: "bg-orange-500",
    },
    URGENT: {
      stripe: "bg-red-500/80",
      badge:
        "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800",
      text: "text-red-600 dark:text-red-400",
      icon: "◉",
      dotColor: "bg-red-500",
    },
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative
        bg-card rounded-lg border border-border/30
        p-3 transition-all duration-200 ease-out
        hover:shadow-md hover:border-border/60 hover:-translate-y-0.5
        ${updating ? "opacity-50" : ""}
        ${isDragging ? "opacity-0" : ""}
        cursor-pointer
      `}
    >
      <div className='space-y-2.5'>
        {/* Priority Indicator Dot */}
        <div
          className={`absolute left-2 top-2 w-1 h-1 rounded-full ${
            priorityConfig[task.priority].dotColor
          }`}
        />

        {/* Header Row */}
        <div className='flex items-start gap-2 min-h-[24px]'>
          <button
            {...attributes}
            {...listeners}
            className='opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none transition-opacity shrink-0 mt-0.5'
          >
            <GripVertical className='h-3.5 w-3.5' />
          </button>

          <div className='flex-1 flex items-center gap-1.5 flex-wrap min-w-0'>
            {/* Priority Badge - Subtle */}
            <div
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide ${
                priorityConfig[task.priority].badge
              }`}
            >
              <span className='text-[7px]'>{priorityConfig[task.priority].icon}</span>
              {task.priority.slice(0, 1)}
            </div>

            {/* Project Badge */}
            {task.project && (
              <Link
                href={`/projects/${task.project.slug}`}
                onClick={(e) => e.stopPropagation()}
                className='shrink-0'
              >
                <span
                  className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-white/95 hover:text-white transition-all'
                  style={{
                    backgroundColor: task.project.color || "#6b7280",
                  }}
                >
                  {task.project.name}
                </span>
              </Link>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-foreground transition-all hover:bg-muted/50 rounded-md p-1 shrink-0'>
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
              <EditTaskDialog
                task={taskForEdit}
                members={members}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Pencil className='h-4 w-4 mr-2' />
                    Edit Task
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <h4 className='text-sm font-medium text-foreground line-clamp-2 leading-tight pl-4'>
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className='text-xs text-muted-foreground/70 line-clamp-1 leading-relaxed pl-4'>
            {task.description}
          </p>
        )}

        {/* Labels */}
        {task.labels && (
          <div className='flex flex-wrap gap-1 pl-4'>
            {task.labels.split(",").map((label, idx) => (
              <span
                key={idx}
                className='inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-muted/50 text-muted-foreground hover:bg-muted transition-colors'
              >
                #{label.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Footer - Clean Spacing */}
        <div className='flex items-center justify-between pt-2 pl-4'>
          {/* Assignee */}
          {task.assignee ? (
            <div className='flex items-center gap-1.5 group/assignee'>
              <Avatar className='h-5 w-5 border border-border/50'>
                <AvatarImage src={task.assignee.image || undefined} />
                <AvatarFallback className='text-[8px] bg-muted text-muted-foreground font-semibold'>
                  {getInitials(task.assignee.name || task.assignee.name)}
                </AvatarFallback>
              </Avatar>
              <span className='text-[10px] text-muted-foreground/80 truncate max-w-[70px] group-hover/assignee:text-foreground transition-colors'>
                {task.assignee.name}
              </span>
            </div>
          ) : (
            <div className='flex items-center gap-1.5'>
              <div className='h-5 w-5 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center'>
                <span className='text-[8px] text-muted-foreground/50'>?</span>
              </div>
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                isOverdue
                  ? "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400"
                  : "text-muted-foreground/70 hover:text-muted-foreground"
              }`}
            >
              <Calendar className='h-2.5 w-2.5' />
              <span>
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
