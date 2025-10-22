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
  useDroppable,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskCard } from "./task-card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  title: string;
  color: string;
  bgColor: string;
  lightBg: string;
  icon?: string;
}[] = [
  {
    id: "TODO",
    title: "To Do",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    lightBg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "◷",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    lightBg: "bg-amber-50 dark:bg-amber-900/20",
    icon: "◐",
  },
  {
    id: "IN_REVIEW",
    title: "In Review",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/10",
    lightBg: "bg-purple-50 dark:bg-purple-900/20",
    icon: "◎",
  },
  {
    id: "DONE",
    title: "Done",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10",
    lightBg: "bg-green-50 dark:bg-green-900/20",
    icon: "✓",
  },
];

// Droppable column wrapper component
function DroppableColumn({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className='h-full'>
      {children}
    </div>
  );
}

export function TaskKanbanBoard({ tasks, members = [] }: TaskKanbanBoardProps) {
  const router = useRouter();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [overId, setOverId] = useState<string | null>(null);

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

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? (over.id as string) : null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverId(null);

    if (!over) return;

    const taskId = active.id as string;
    let newStatus: TaskStatus | undefined;

    // Check if over.id is a valid status (column ID)
    const validStatuses: TaskStatus[] = [
      "TODO",
      "IN_PROGRESS",
      "IN_REVIEW",
      "DONE",
    ];
    if (validStatuses.includes(over.id as TaskStatus)) {
      newStatus = over.id as TaskStatus;
    } else {
      // over.id might be another task, find which column that task belongs to
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (!newStatus) return;

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
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}>
      <div className='grid grid-cols-4 gap-4 h-[calc(100vh-200px)]'>
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          const isOver = overId === column.id;

          return (
            <DroppableColumn key={column.id} id={column.id}>
              <div
                className={`
                  flex flex-col h-full rounded-xl border-2 transition-all duration-200
                  ${
                    isOver
                      ? `border-primary/50 ${column.bgColor}`
                      : "border-border bg-card/50 backdrop-blur-sm"
                  }
                `}>
                {/* Column Header */}
                <div className='shrink-0 px-4 py-3 border-b border-border/50'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span className={`text-lg ${column.color}`}>
                        {column.icon}
                      </span>
                      <h3 className={`text-sm font-semibold ${column.color}`}>
                        {column.title}
                      </h3>
                      <Badge
                        variant='secondary'
                        className={`ml-1 ${column.bgColor} ${column.color} border-0`}>
                        {columnTasks.length}
                      </Badge>
                    </div>

                    <div className='flex items-center gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className={`h-7 w-7 p-0 ${column.color} hover:${column.bgColor}`}
                        onClick={() => {
                          // TODO: Add quick create task
                          toast.info("Quick create task coming soon!");
                        }}>
                        <Plus className='h-4 w-4' />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className={`h-7 w-7 p-0 ${column.color} hover:${column.bgColor}`}>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem>Clear completed</DropdownMenuItem>
                          <DropdownMenuItem>Set WIP limit</DropdownMenuItem>
                          <DropdownMenuItem>Sort by...</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                {/* Column Content */}
                <SortableContext
                  items={columnTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}>
                  <ScrollArea className='flex-1'>
                    <div className='p-3 space-y-2 min-h-[200px]'>
                      {columnTasks.map((task) => (
                        <TaskCard key={task.id} task={task} members={members} />
                      ))}

                      {columnTasks.length === 0 && (
                        <div className='flex flex-col items-center justify-center py-12 text-center'>
                          <div
                            className={`
                              w-16 h-16 rounded-full flex items-center justify-center mb-3
                              ${column.bgColor} ${column.color} text-2xl
                            `}>
                            {column.icon}
                          </div>
                          <p className='text-sm text-muted-foreground font-medium'>
                            No tasks yet
                          </p>
                          <p className='text-xs text-muted-foreground mt-1'>
                            Drop tasks here or click + to add
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </SortableContext>

                {/* Column Footer - Quick Add */}
                <div className='shrink-0 px-3 py-2 border-t border-border/50'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className={`w-full justify-start h-8 ${column.color} hover:${column.bgColor}`}
                    onClick={() => {
                      toast.info("Quick create task coming soon!");
                    }}>
                    <Plus className='h-3.5 w-3.5 mr-2' />
                    <span className='text-xs'>Add task</span>
                  </Button>
                </div>
              </div>
            </DroppableColumn>
          );
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className='shadow-2xl opacity-70'>
            <TaskCard task={activeTask} members={members} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
