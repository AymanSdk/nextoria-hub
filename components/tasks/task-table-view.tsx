"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  MoveRight,
  Flag,
} from "lucide-react";
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

interface TaskTableViewProps {
  tasks: Task[];
  members?: TeamMember[];
}

const statusOptions = [
  { value: "BACKLOG", label: "Backlog", color: "#6b7280" },
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
  DONE: "bg-green-100 text-green-700 dark:bg-green-900/30",
};

export function TaskTableView({ tasks, members = [] }: TaskTableViewProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);

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

  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className='h-8 px-2'>
          <Flag className='h-4 w-4' />
          <ArrowUpDown className='ml-2 h-3 w-3' />
        </Button>
      ),
      cell: ({ row }) => (
        <Flag
          className={`h-4 w-4 ${priorityColors[row.original.priority]}`}
          fill='currentColor'
        />
      ),
      size: 60,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className='h-8 px-2'>
          Task
          <ArrowUpDown className='ml-2 h-3 w-3' />
        </Button>
      ),
      cell: ({ row }) => (
        <div className='min-w-[200px]'>
          <div className='font-medium'>{row.original.title}</div>
          {row.original.description && (
            <div className='text-xs text-neutral-500 line-clamp-1 mt-1'>
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className='h-8 px-2'>
          Status
          <ArrowUpDown className='ml-2 h-3 w-3' />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge className={`${statusColors[row.original.status]}`}>
          {row.original.status.replace("_", " ")}
        </Badge>
      ),
      size: 150,
    },
    {
      accessorKey: "assignee",
      header: "Assignee",
      cell: ({ row }) =>
        row.original.assignee ? (
          <div className='flex items-center gap-2'>
            <Avatar className='h-7 w-7'>
              <AvatarImage src={row.original.assignee.image || undefined} />
              <AvatarFallback className='text-xs'>
                {row.original.assignee.name?.substring(0, 2).toUpperCase() ||
                  "??"}
              </AvatarFallback>
            </Avatar>
            <span className='text-sm truncate max-w-[120px]'>
              {row.original.assignee.name || row.original.assignee.name}
            </span>
          </div>
        ) : (
          <span className='text-xs text-neutral-400'>Unassigned</span>
        ),
      size: 180,
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className='h-8 px-2'>
          Due Date
          <ArrowUpDown className='ml-2 h-3 w-3' />
        </Button>
      ),
      cell: ({ row }) =>
        row.original.dueDate ? (
          <span
            className={`text-sm ${
              new Date(row.original.dueDate) < new Date()
                ? "text-red-500 font-medium"
                : "text-neutral-600 dark:text-neutral-400"
            }`}>
            {new Date(row.original.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ) : (
          <span className='text-xs text-neutral-400'>No date</span>
        ),
      size: 120,
    },
    {
      accessorKey: "labels",
      header: "Labels",
      cell: ({ row }) =>
        row.original.labels ? (
          <div className='flex flex-wrap gap-1'>
            {row.original.labels.split(",").map((label) => (
              <Badge
                key={label}
                variant='secondary'
                className='text-[10px] px-1.5 py-0'>
                {label.trim()}
              </Badge>
            ))}
          </div>
        ) : null,
      size: 150,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
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
                      handleStatusChange(row.original.id, status.value)
                    }
                    disabled={row.original.status === status.value}>
                    <div
                      className='h-2 w-2 rounded-full mr-2'
                      style={{ backgroundColor: status.color }}
                    />
                    {status.label}
                    {row.original.status === status.value && " (current)"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <EditTaskDialog
              task={getTaskForEdit(row.original)}
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
      ),
      size: 60,
    },
  ];

  const table = useReactTable({
    data: tasks,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className='space-y-4'>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'>
                  No tasks found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='text-sm text-neutral-500'>
        {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
      </div>
    </div>
  );
}
