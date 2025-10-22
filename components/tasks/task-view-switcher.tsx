"use client";

import { useState } from "react";
import { LayoutGrid, List, Table2, Kanban } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskKanbanBoard } from "./task-kanban-board";
import { TaskListView } from "./task-list-view";
import { TaskTableView } from "./task-table-view";

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
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: { id: string; name: string | null; image: string | null } | null;
  dueDate: Date | null;
  labels: string | null;
}

interface TaskViewSwitcherProps {
  tasks: Task[];
  members?: TeamMember[];
}

export function TaskViewSwitcher({
  tasks,
  members = [],
}: TaskViewSwitcherProps) {
  const [view, setView] = useState<string>("board");

  return (
    <div className='space-y-4'>
      {/* View Switcher */}
      <div className='flex items-center justify-between'>
        <Tabs value={view} onValueChange={setView} className='w-auto'>
          <TabsList>
            <TabsTrigger value='board' className='gap-2'>
              <LayoutGrid className='h-4 w-4' />
              <span className='hidden sm:inline'>Board</span>
            </TabsTrigger>
            <TabsTrigger value='list' className='gap-2'>
              <List className='h-4 w-4' />
              <span className='hidden sm:inline'>List</span>
            </TabsTrigger>
            <TabsTrigger value='table' className='gap-2'>
              <Table2 className='h-4 w-4' />
              <span className='hidden sm:inline'>Table</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className='text-sm text-neutral-500'>
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </div>
      </div>

      {/* View Content */}
      <div className='w-full'>
        {view === "board" && (
          <div className='overflow-x-auto -mx-6 px-6'>
            <TaskKanbanBoard tasks={tasks} members={members} />
          </div>
        )}
        {view === "list" && <TaskListView tasks={tasks} members={members} />}
        {view === "table" && <TaskTableView tasks={tasks} members={members} />}
      </div>
    </div>
  );
}
