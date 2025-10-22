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

type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
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
  { value: "BACKLOG", label: "Backlog", color: "#6b7280" },
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

  const priorityDot: Record<TaskPriority, string> = {
    LOW: "bg-neutral-300",
    MEDIUM: "bg-blue-400",
    HIGH: "bg-orange-400",
    URGENT: "bg-red-400",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 transition-all hover:border-neutral-300 dark:hover:border-neutral-700 ${
        updating ? "opacity-50" : ""
      } ${isDragging ? "opacity-40 shadow-lg" : ""}`}>
      <div className='space-y-2.5'>
        {/* Header Row */}
        <div className='flex items-start justify-between gap-2'>
          <div className='flex items-center gap-2 flex-1 min-w-0'>
            <button
              {...attributes}
              {...listeners}
              className='opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-600 cursor-grab active:cursor-grabbing touch-none transition-opacity'>
              <GripVertical className='h-3.5 w-3.5' />
            </button>

            {/* Priority Indicator */}
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                priorityDot[task.priority]
              }`}
            />

            {/* Project Badge */}
            {task.project && (
              <Link
                href={`/projects/${task.project.slug}`}
                onClick={(e) => e.stopPropagation()}
                className='flex-1 min-w-0'>
                <span
                  className='inline-block px-1.5 py-0.5 rounded text-[10px] font-medium text-white truncate max-w-full hover:opacity-80 transition-opacity'
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
        <h4 className='text-sm text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-snug'>
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className='text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed'>
            {task.description}
          </p>
        )}

        {/* Footer */}
        <div className='flex items-center justify-between pt-1'>
          {/* Assignee */}
          {task.assignee ? (
            <Avatar className='h-5 w-5'>
              <AvatarImage src={task.assignee.image || undefined} />
              <AvatarFallback className='text-[9px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'>
                {getInitials(task.assignee.name || task.assignee.name)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className='w-5 h-5' />
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className='flex items-center gap-1 text-[10px] text-neutral-400'>
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
