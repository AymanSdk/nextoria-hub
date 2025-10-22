"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskCard } from "./task-card";

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

interface TaskKanbanBoardProps {
  tasks: Task[];
  members?: TeamMember[];
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "BACKLOG", title: "Backlog", color: "#6b7280" },
  { id: "TODO", title: "To Do", color: "#3b82f6" },
  { id: "IN_PROGRESS", title: "In Progress", color: "#f59e0b" },
  { id: "IN_REVIEW", title: "In Review", color: "#8b5cf6" },
  { id: "DONE", title: "Done", color: "#10b981" },
];

export function TaskKanbanBoard({ tasks, members = [] }: TaskKanbanBoardProps) {
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4'>
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);

        return (
          <div key={column.id} className='flex flex-col'>
            {/* Column Header */}
            <div className='flex items-center gap-2 mb-3 px-1'>
              <div
                className='h-2 w-2 rounded-full'
                style={{ backgroundColor: column.color }}
              />
              <h3 className='font-semibold text-sm'>{column.title}</h3>
              <span className='ml-auto text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full'>
                {columnTasks.length}
              </span>
            </div>

            {/* Task Cards */}
            <ScrollArea className='flex-1 pr-4'>
              <div className='space-y-3'>
                {columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} members={members} />
                ))}

                {/* Add New Task Card */}
                {columnTasks.length === 0 && (
                  <div className='text-center py-8 text-sm text-neutral-400'>
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
