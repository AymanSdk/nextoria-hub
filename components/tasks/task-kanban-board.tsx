"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskCard } from "./task-card";
import { toast } from "sonner";

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

interface TaskKanbanBoardProps {
  tasks: Task[];
  members?: TeamMember[];
}

const columns: {
  id: TaskStatus;
  title: string;
  dotColor: string;
}[] = [
  {
    id: "BACKLOG",
    title: "Backlog",
    dotColor: "bg-neutral-400",
  },
  {
    id: "TODO",
    title: "To Do",
    dotColor: "bg-slate-400",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    dotColor: "bg-amber-400",
  },
  {
    id: "IN_REVIEW",
    title: "In Review",
    dotColor: "bg-violet-400",
  },
  {
    id: "DONE",
    title: "Done",
    dotColor: "bg-emerald-400",
  },
];

export function TaskKanbanBoard({ tasks, members = [] }: TaskKanbanBoardProps) {
  const router = useRouter();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistically update UI
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update task status");
      }

      toast.success("Task status updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update task status"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 min-h-[600px]'>
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);

          return (
            <SortableContext
              key={column.id}
              items={columnTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
              id={column.id}
            >
              <div className='flex flex-col h-full rounded-lg bg-neutral-50/50 dark:bg-neutral-900/20'>
                {/* Column Header */}
                <div className='px-4 py-3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <div className={`w-2 h-2 rounded-full ${column.dotColor}`} />
                    <h3 className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>
                      {column.title}
                    </h3>
                    <span className='ml-auto text-xs text-neutral-400'>
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                {/* Droppable Area */}
                <ScrollArea className='flex-1 px-3 pb-3'>
                  <div
                    className='space-y-2 min-h-[400px]'
                    style={{
                      opacity: isUpdating ? 0.6 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    {columnTasks.map((task) => (
                      <TaskCard key={task.id} task={task} members={members} />
                    ))}

                    {columnTasks.length === 0 && (
                      <div className='flex flex-col items-center justify-center py-16 text-center'>
                        <div
                          className={`w-10 h-10 rounded-full mb-2 ${column.dotColor} opacity-20`}
                        />
                        <p className='text-xs text-neutral-400'>Drop tasks here</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </SortableContext>
          );
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className='rotate-3 scale-105 shadow-2xl opacity-90'>
            <TaskCard task={activeTask} members={members} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
