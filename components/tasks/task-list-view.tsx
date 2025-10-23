"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MoreHorizontal, Pencil, MoveRight } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface TaskListViewProps {
  tasks: Task[];
  members?: TeamMember[];
}

const statusOptions = [
  { value: "TODO", label: "To Do", color: "#3b82f6" },
  { value: "IN_PROGRESS", label: "In Progress", color: "#f59e0b" },
  { value: "IN_REVIEW", label: "In Review", color: "#8b5cf6" },
  { value: "DONE", label: "Done", color: "#10b981" },
];

const priorityConfig: Record<TaskPriority, { dot: string; badge: string; icon: string }> =
  {
    LOW: {
      dot: "bg-slate-400",
      badge:
        "bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800",
      icon: "◯",
    },
    MEDIUM: {
      dot: "bg-blue-500",
      badge:
        "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800",
      icon: "◐",
    },
    HIGH: {
      dot: "bg-orange-500",
      badge:
        "bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800",
      icon: "●",
    },
    URGENT: {
      dot: "bg-red-500",
      badge:
        "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800",
      icon: "◉",
    },
  };

const statusColors: Record<TaskStatus, string> = {
  BACKLOG: "bg-muted/50 text-muted-foreground border border-border/50",
  TODO: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800",
  IN_PROGRESS:
    "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800",
  IN_REVIEW:
    "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800",
  BLOCKED:
    "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800",
  DONE: "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 border border-green-200/50 dark:border-green-800",
  CANCELLED: "bg-muted/50 text-muted-foreground border border-border/50",
};

export function TaskListView({ tasks, members = [] }: TaskListViewProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [sortBy, setSortBy] = useState<string>("priority");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      router.refresh();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const getTaskForEdit = (task: Task) => ({
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
  });

  // Sort and filter tasks
  const sortedTasks = [...tasks]
    .filter((task) => filterStatus === "all" || task.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === "status") {
        const statusOrder = {
          TODO: 0,
          IN_PROGRESS: 1,
          IN_REVIEW: 2,
          DONE: 3,
          BACKLOG: 4,
          BLOCKED: 5,
          CANCELLED: 6,
        };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return 0;
    });

  const isOverdue = (dueDate?: Date) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className='space-y-3'>
      {/* Filters and Sort */}
      <div className='flex items-center gap-2'>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className='w-[160px] h-8 text-xs'>
            <SelectValue placeholder='Filter by status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Statuses</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className='w-[140px] h-8 text-xs'>
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='priority'>Priority</SelectItem>
            <SelectItem value='dueDate'>Due Date</SelectItem>
            <SelectItem value='status'>Status</SelectItem>
          </SelectContent>
        </Select>

        <div className='text-xs text-muted-foreground ml-auto'>
          {sortedTasks.length} {sortedTasks.length === 1 ? "task" : "tasks"}
        </div>
      </div>

      {/* Task List */}
      <div className='space-y-1'>
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            className='group relative flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/30 bg-card hover:border-border/60 hover:shadow-sm transition-all cursor-pointer'
          >
            {/* Priority Dot */}
            <div
              className={`w-1 h-1 rounded-full flex-shrink-0 ${
                priorityConfig[task.priority].dot
              }`}
            />

            {/* Main Content */}
            <div className='flex-1 min-w-0 flex items-center gap-3'>
              {/* Priority & Project */}
              <div className='flex items-center gap-1.5 flex-shrink-0'>
                <div
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase ${
                    priorityConfig[task.priority].badge
                  }`}
                >
                  <span className='text-[7px]'>{priorityConfig[task.priority].icon}</span>
                  {task.priority.slice(0, 1)}
                </div>

                {task.project && (
                  <Link
                    href={`/projects/${task.project.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className='flex-shrink-0'
                  >
                    <span
                      className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-white/95 hover:text-white transition-colors'
                      style={{
                        backgroundColor: task.project.color || "#6b7280",
                      }}
                    >
                      {task.project.name}
                    </span>
                  </Link>
                )}
              </div>

              {/* Title & Description */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-baseline gap-2'>
                  <h3 className='font-medium text-sm text-foreground truncate'>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className='text-xs text-muted-foreground/60 truncate max-w-[300px] hidden lg:block'>
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Labels - Inline */}
                {task.labels && (
                  <div className='flex items-center gap-1 mt-0.5'>
                    {task.labels.split(",").map((label) => (
                      <span
                        key={label}
                        className='inline-flex items-center px-1.5 py-0 rounded text-[9px] font-medium bg-muted/50 text-muted-foreground'
                      >
                        #{label.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Meta Info - Compact Inline */}
              <div className='flex items-center gap-2 flex-shrink-0'>
                {/* Status Badge */}
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    statusColors[task.status]
                  }`}
                >
                  {task.status.replace("_", " ")}
                </span>

                {/* Due Date */}
                {task.dueDate && (
                  <div
                    className={`flex items-center gap-1 text-[10px] font-medium ${
                      isOverdue(task.dueDate)
                        ? "text-red-600 dark:text-red-400"
                        : "text-muted-foreground/70"
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

                {/* Assignee */}
                {task.assignee ? (
                  <div className='flex items-center gap-1.5'>
                    <Avatar className='h-5 w-5 border border-border/50'>
                      <AvatarImage src={task.assignee.image || undefined} />
                      <AvatarFallback className='text-[8px] bg-muted text-muted-foreground font-semibold'>
                        {task.assignee.name?.substring(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <span className='text-[10px] text-muted-foreground/80 hidden xl:inline max-w-[80px] truncate'>
                      {task.assignee.id === session?.user?.id ? "me" : task.assignee.name}
                    </span>
                  </div>
                ) : (
                  <div className='h-5 w-5 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center'>
                    <span className='text-[8px] text-muted-foreground/50'>?</span>
                  </div>
                )}

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className='opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 rounded-md p-1 transition-all'>
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
                            onClick={() => handleStatusChange(task.id, status.value)}
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
                      task={getTaskForEdit(task)}
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
            </div>
          </div>
        ))}

        {sortedTasks.length === 0 && (
          <div className='text-center py-8 text-sm text-muted-foreground'>
            No tasks found
          </div>
        )}
      </div>
    </div>
  );
}
