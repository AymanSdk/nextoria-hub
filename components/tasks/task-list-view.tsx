"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  Flag,
  Tag,
  MoreHorizontal,
  Pencil,
  MoveRight,
  Clock,
  FolderKanban,
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

const priorityColors: Record<TaskPriority, string> = {
  LOW: "text-neutral-500",
  MEDIUM: "text-blue-500",
  HIGH: "text-orange-500",
  URGENT: "text-red-500",
};

const statusColors: Record<TaskStatus, string> = {
  BACKLOG: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800",
  TODO: "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30",
  IN_REVIEW: "bg-purple-100 text-purple-700 dark:bg-purple-900/30",
  BLOCKED: "bg-red-100 text-red-700 dark:bg-red-900/30",
  DONE: "bg-green-100 text-green-700 dark:bg-green-900/30",
  CANCELLED: "bg-gray-100 text-gray-700 dark:bg-gray-900/30",
};

export function TaskListView({ tasks, members = [] }: TaskListViewProps) {
  const router = useRouter();
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
    <div className='space-y-4'>
      {/* Filters and Sort */}
      <div className='flex items-center gap-3'>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className='w-[180px]'>
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
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='priority'>Priority</SelectItem>
            <SelectItem value='dueDate'>Due Date</SelectItem>
            <SelectItem value='status'>Status</SelectItem>
          </SelectContent>
        </Select>

        <div className='text-sm text-neutral-500 ml-auto'>
          {sortedTasks.length} {sortedTasks.length === 1 ? "task" : "tasks"}
        </div>
      </div>

      {/* Task List */}
      <div className='space-y-2'>
        {sortedTasks.map((task) => (
          <Card key={task.id} className='hover:shadow-md transition-shadow'>
            <CardContent className='p-4'>
              <div className='flex items-center gap-4'>
                {/* Priority Flag */}
                <Flag
                  className={`h-5 w-5 ${
                    priorityColors[task.priority]
                  } flex-shrink-0`}
                  fill='currentColor'
                />

                {/* Task Info */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-start gap-3'>
                    <div className='flex-1 min-w-0'>
                      {/* Project Badge */}
                      {task.project && (
                        <Link
                          href={`/projects/${task.project.slug}`}
                          className='inline-block mb-2'
                          onClick={(e) => e.stopPropagation()}>
                          <div
                            className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium text-white hover:opacity-80 transition-opacity'
                            style={{
                              backgroundColor: task.project.color || "#6b7280",
                            }}>
                            <FolderKanban className='h-3 w-3' />
                            {task.project.name}
                          </div>
                        </Link>
                      )}
                      <h3 className='font-medium text-sm truncate'>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className='text-xs text-neutral-500 mt-1 line-clamp-1'>
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className='flex items-center gap-3 flex-shrink-0'>
                      {/* Status */}
                      <Badge className={`text-xs ${statusColors[task.status]}`}>
                        {task.status.replace("_", " ")}
                      </Badge>

                      {/* Due Date */}
                      {task.dueDate && (
                        <div
                          className={`flex items-center gap-1 text-xs ${
                            isOverdue(task.dueDate)
                              ? "text-red-500"
                              : "text-neutral-500"
                          }`}>
                          <Calendar className='h-3 w-3' />
                          <span>
                            {new Date(task.dueDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      )}

                      {/* Assignee */}
                      {task.assignee ? (
                        <Avatar className='h-7 w-7'>
                          <AvatarImage src={task.assignee.image || undefined} />
                          <AvatarFallback className='text-xs'>
                            {task.assignee.name
                              ?.substring(0, 2)
                              .toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className='h-7 w-7 rounded-full bg-neutral-100 dark:bg-neutral-800' />
                      )}

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
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
                                  onClick={() =>
                                    handleStatusChange(task.id, status.value)
                                  }
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
                            task={getTaskForEdit(task)}
                            members={members}
                            trigger={
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}>
                                <Pencil className='h-4 w-4 mr-2' />
                                Edit Task
                              </DropdownMenuItem>
                            }
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Labels */}
                  {task.labels && (
                    <div className='flex items-center gap-1 mt-2'>
                      <Tag className='h-3 w-3 text-neutral-400' />
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
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {sortedTasks.length === 0 && (
          <div className='text-center py-12 text-neutral-500'>
            No tasks found
          </div>
        )}
      </div>
    </div>
  );
}
