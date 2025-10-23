"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
  type DragEndEvent,
} from "@kanban/index";
import { TaskCard } from "./task-card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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

interface TaskKanbanBoardProps {
  tasks: Task[];
  members?: TeamMember[];
}

const columns: {
  id: TaskStatus;
  name: string;
  color: string;
  bgColor: string;
  lightBg: string;
  ringColor: string;
  shadowColor: string;
  icon?: string;
}[] = [
  {
    id: "TODO",
    name: "To Do",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    lightBg: "bg-blue-50 dark:bg-blue-900/20",
    ringColor: "ring-blue-500",
    shadowColor: "shadow-blue-500/30",
    icon: "◷",
  },
  {
    id: "IN_PROGRESS",
    name: "In Progress",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    lightBg: "bg-amber-50 dark:bg-amber-900/20",
    ringColor: "ring-amber-500",
    shadowColor: "shadow-amber-500/30",
    icon: "◐",
  },
  {
    id: "IN_REVIEW",
    name: "In Review",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/10",
    lightBg: "bg-purple-50 dark:bg-purple-900/20",
    ringColor: "ring-purple-500",
    shadowColor: "shadow-purple-500/30",
    icon: "◎",
  },
  {
    id: "DONE",
    name: "Done",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10",
    lightBg: "bg-green-50 dark:bg-green-900/20",
    ringColor: "ring-green-500",
    shadowColor: "shadow-green-500/30",
    icon: "✓",
  },
];

export function TaskKanbanBoard({ tasks, members = [] }: TaskKanbanBoardProps) {
  const router = useRouter();
  const [taskList, setTaskList] = useState(tasks);

  // Map tasks to kanban data format
  const kanbanData = taskList.map((task) => ({
    ...task,
    name: task.title,
    column: task.status,
  }));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const task = taskList.find((t) => t.id === taskId);

    if (!task) return;

    // Find the new status
    const newStatus = columns.find(({ id }) => id === over.id);

    if (!newStatus || task.status === newStatus.id) return;

    // Optimistically update UI
    setTaskList(
      taskList.map((t) => {
        if (t.id === taskId) {
          return { ...t, status: newStatus.id };
        }
        return t;
      })
    );

    // Update on server
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update task status");
      }

      toast.success("Task status updated");
      router.refresh();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update task");
      // Revert on error
      setTaskList(tasks);
    }
  };

  return (
    <KanbanProvider
      columns={columns}
      data={kanbanData}
      onDragEnd={handleDragEnd}
      className='gap-4 h-[600px] p-1'
    >
      {(column) => {
        const columnTasks = taskList.filter((task) => task.status === column.id);

        return (
          <KanbanBoard
            key={column.id}
            id={column.id}
            className='flex flex-col h-full rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-border/60 transition-colors'
            highlightClassName={`ring-2 ${column.ringColor} shadow-lg ${column.shadowColor}`}
          >
            <div className='h-full flex flex-col overflow-hidden'>
              <KanbanHeader className='shrink-0 px-3 py-3 border-b border-border/50'>
                <div className='flex items-center gap-2'>
                  <span className={`text-lg ${column.color}`}>{column.icon}</span>
                  <h3 className={`text-sm font-semibold ${column.color}`}>
                    {column.name}
                  </h3>
                  <Badge
                    variant='secondary'
                    className={`ml-1 ${column.bgColor} ${column.color} border-0`}
                  >
                    {columnTasks.length}
                  </Badge>
                </div>
              </KanbanHeader>

              <KanbanCards id={column.id} className='p-3 flex-1'>
                {(item) => {
                  const task = taskList.find((t) => t.id === item.id);
                  if (!task) return null;

                  return (
                    <KanbanCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      column={item.column}
                    >
                      <TaskCard task={task} members={members} />
                    </KanbanCard>
                  );
                }}
              </KanbanCards>

              {columnTasks.length === 0 && (
                <div className='absolute inset-4 top-20 flex flex-col items-center justify-center text-center'>
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${column.bgColor} ${column.color} text-2xl`}
                  >
                    {column.icon}
                  </div>
                  <p className='text-sm text-muted-foreground font-medium'>No tasks</p>
                  <p className='text-xs text-muted-foreground mt-1'>Drag tasks here</p>
                </div>
              )}
            </div>
          </KanbanBoard>
        );
      }}
    </KanbanProvider>
  );
}
