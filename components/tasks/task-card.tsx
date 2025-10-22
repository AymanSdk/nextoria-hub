"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MoreHorizontal, Pencil, MoveRight } from "lucide-react";
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

const getPriorityColor = (priority: TaskPriority) => {
  const colors: Record<TaskPriority, string> = {
    LOW: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
    MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    URGENT: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return colors[priority];
};

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

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

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

  return (
    <Card
      className={`transition-all hover:shadow-md ${
        updating ? "opacity-50" : ""
      }`}>
      <CardContent className='p-4'>
        <div className='space-y-3'>
          {/* Title */}
          <div className='flex items-start justify-between gap-2'>
            <h4 className='font-medium text-sm line-clamp-2'>{task.title}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='text-neutral-400 hover:text-neutral-600'>
                  <MoreHorizontal className='h-4 w-4' />
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

          {/* Description */}
          {task.description && (
            <p className='text-xs text-neutral-500 line-clamp-2'>
              {task.description}
            </p>
          )}

          {/* Labels */}
          {task.labels && (
            <div className='flex flex-wrap gap-1'>
              {task.labels.split(",").map((label) => (
                <Badge
                  key={label}
                  variant='secondary'
                  className='text-[10px] px-1.5 py-0'>
                  {label.trim()}
                </Badge>
              ))}
            </div>
          )}

          {/* Priority */}
          <div className='flex items-center gap-2'>
            <Badge
              variant='secondary'
              className={`text-[10px] px-1.5 py-0 ${getPriorityColor(
                task.priority
              )}`}>
              {task.priority}
            </Badge>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between pt-2'>
            {/* Assignee */}
            {task.assignee ? (
              <Avatar className='h-6 w-6'>
                <AvatarImage src={task.assignee.image || undefined} />
                <AvatarFallback className='text-[10px]'>
                  {getInitials(task.assignee.name)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className='h-6 w-6 rounded-full bg-neutral-100 dark:bg-neutral-800' />
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div className='flex items-center gap-1 text-[10px] text-neutral-500'>
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
      </CardContent>
    </Card>
  );
}
