"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  MoreHorizontal,
  Pencil,
  MoveRight,
  GripVertical,
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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

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

  const priorityConfig: Record<TaskPriority, { color: string; border: string; bg: string }> = {
    LOW: { 
      color: "bg-slate-400", 
      border: "hover:border-slate-300",
      bg: "bg-slate-50 dark:bg-slate-900/20"
    },
    MEDIUM: { 
      color: "bg-blue-400", 
      border: "hover:border-blue-300",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    HIGH: { 
      color: "bg-orange-400", 
      border: "hover:border-orange-300",
      bg: "bg-orange-50 dark:bg-orange-900/20"
    },
    URGENT: { 
      color: "bg-red-400", 
      border: "hover:border-red-300",
      bg: "bg-red-50 dark:bg-red-900/20"
    },
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative
        bg-card rounded-lg border-2 border-border
        p-3.5 transition-all duration-200
        hover:shadow-md hover:border-primary/50
        ${priorityConfig[task.priority].border}
        ${updating ? "opacity-50" : ""}
        ${isDragging ? "opacity-0" : "shadow-sm"}
        cursor-pointer
      `}>
      <div className='space-y-2.5'>
        {/* Priority Stripe */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${priorityConfig[task.priority].color}`} />
        
        {/* Header Row */}
        <div className='flex items-start justify-between gap-2'>
          <div className='flex items-center gap-2.5 flex-1 min-w-0'>
            <button
              {...attributes}
              {...listeners}
              className='opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none transition-opacity shrink-0'>
              <GripVertical className='h-4 w-4' />
            </button>

            {/* Project Badge */}
            {task.project && (
              <Link
                href={`/projects/${task.project.slug}`}
                onClick={(e) => e.stopPropagation()}
                className='shrink-0'>
                <span
                  className='inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold text-white hover:opacity-90 transition-opacity'
                  style={{
                    backgroundColor: task.project.color || "#6b7280",
                  }}>
                  {task.project.name}
                </span>
              </Link>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-600 transition-opacity'>
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
                      disabled={task.status === status.value}>
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
        <h4 className='text-sm font-medium text-foreground line-clamp-2 leading-snug pl-0.5'>
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className='text-xs text-muted-foreground line-clamp-2 leading-relaxed pl-0.5'>
            {task.description}
          </p>
        )}

        {/* Labels */}
        {task.labels && (
          <div className='flex flex-wrap gap-1.5 pl-0.5'>
            {task.labels.split(',').map((label, idx) => (
              <span
                key={idx}
                className='inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-secondary text-secondary-foreground'>
                {label.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className='flex items-center justify-between pt-1 pl-0.5'>
          <div className='flex items-center gap-2'>
            {/* Assignee */}
            {task.assignee ? (
              <Avatar className='h-6 w-6 border-2 border-background'>
                <AvatarImage src={task.assignee.image || undefined} />
                <AvatarFallback className='text-[10px] bg-muted text-muted-foreground font-semibold'>
                  {getInitials(task.assignee.name || task.assignee.name)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className='h-6 w-6 rounded-full border-2 border-dashed border-muted flex items-center justify-center'>
                <span className='text-[10px] text-muted-foreground'>?</span>
              </div>
            )}
            
            {/* Priority Badge */}
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].color.replace('bg-', 'text-')}`}>
              {task.priority}
            </span>
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-[10px] font-medium ${
              isOverdue 
                ? 'text-red-500 dark:text-red-400' 
                : 'text-muted-foreground'
            }`}>
              <Calendar className='h-3 w-3' />
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
