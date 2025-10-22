"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MoreHorizontal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

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

interface TaskKanbanBoardProps {
  tasks: Task[];
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "BACKLOG", title: "Backlog", color: "#6b7280" },
  { id: "TODO", title: "To Do", color: "#3b82f6" },
  { id: "IN_PROGRESS", title: "In Progress", color: "#f59e0b" },
  { id: "IN_REVIEW", title: "In Review", color: "#8b5cf6" },
  { id: "DONE", title: "Done", color: "#10b981" },
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

export function TaskKanbanBoard({ tasks }: TaskKanbanBoardProps) {
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);

        return (
          <div key={column.id} className="flex flex-col">
            {/* Column Header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <h3 className="font-semibold text-sm">{column.title}</h3>
              <span className="ml-auto text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                {columnTasks.length}
              </span>
            </div>

            {/* Task Cards */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-3">
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="cursor-pointer transition-all hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Title */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {task.title}
                          </h4>
                          <button className="text-neutral-400 hover:text-neutral-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p className="text-xs text-neutral-500 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Labels */}
                        {task.labels && (
                          <div className="flex flex-wrap gap-1">
                            {task.labels.split(",").map((label) => (
                              <Badge
                                key={label}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                              >
                                {label.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Priority */}
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-1.5 py-0 ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </Badge>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2">
                          {/* Assignee */}
                          {task.assignee ? (
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={task.assignee.image || undefined} />
                              <AvatarFallback className="text-[10px]">
                                {getInitials(task.assignee.name)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-neutral-100 dark:bg-neutral-800" />
                          )}

                          {/* Due Date */}
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                              <Calendar className="h-3 w-3" />
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add New Task Card */}
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-sm text-neutral-400">
                    No tasks
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}

