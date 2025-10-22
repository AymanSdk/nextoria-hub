"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckSquare, Clock, AlertCircle, Search, Loader2 } from "lucide-react";
import { TaskViewSwitcher } from "@/components/tasks/task-view-switcher";

type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  labels: string | null;
  dueDate: Date | null;
  estimatedHours: number | null;
  actualHours: number | null;
  createdAt: Date;
  project: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  } | null;
  assignee: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export default function TasksPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }

    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  useEffect(() => {
    applySearch();
  }, [tasks, searchQuery]);

  const fetchData = async () => {
    try {
      // Fetch tasks
      const tasksRes = await fetch("/api/tasks");
      const tasksData = await tasksRes.json();
      const fetchedTasks = tasksData.tasks || [];
      setTasks(fetchedTasks);

      // Fetch workspace members
      const workspaceRes = await fetch("/api/workspaces");
      const workspaceData = await workspaceRes.json();
      const workspaceId = workspaceData.workspaces[0]?.id;

      if (workspaceId) {
        const membersRes = await fetch(
          `/api/workspaces/${workspaceId}/members`
        );
        if (membersRes.ok) {
          const membersData = await membersRes.json();
          setMembers(membersData.members || []);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    if (!searchQuery) {
      setFilteredTasks(tasks);
      return;
    }

    const filtered = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.project?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredTasks(filtered);
  };

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    done: tasks.filter((t) => t.status === "DONE").length,
    overdue: tasks.filter(
      (t) =>
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
    ).length,
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center'>
          <Loader2 className='h-12 w-12 animate-spin text-neutral-400 mx-auto mb-4' />
          <p className='text-neutral-500'>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 w-full'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>My Tasks</h1>
          <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
            All your tasks across all projects in one place
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
              To Do
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2'>
              <CheckSquare className='h-5 w-5 text-blue-500' />
              <span className='text-2xl font-bold'>{tasksByStatus.todo}</span>
            </div>
            <p className='text-xs text-neutral-500 mt-2'>
              Tasks waiting to start
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2'>
              <Clock className='h-5 w-5 text-yellow-500' />
              <span className='text-2xl font-bold'>
                {tasksByStatus.inProgress}
              </span>
            </div>
            <p className='text-xs text-neutral-500 mt-2'>
              Currently working on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2'>
              <CheckSquare className='h-5 w-5 text-green-500' />
              <span className='text-2xl font-bold'>{tasksByStatus.done}</span>
            </div>
            <p className='text-xs text-neutral-500 mt-2'>Finished tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-red-500' />
              <span className='text-2xl font-bold'>
                {tasksByStatus.overdue}
              </span>
            </div>
            <p className='text-xs text-neutral-500 mt-2'>Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500' />
        <Input
          placeholder='Search tasks across all projects...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='pl-10'
        />
      </div>

      {/* Tasks View Switcher */}
      {filteredTasks.length > 0 ? (
        <TaskViewSwitcher tasks={filteredTasks} members={members} />
      ) : (
        <Card className='p-12'>
          <div className='text-center'>
            <CheckSquare className='mx-auto h-12 w-12 text-neutral-400 mb-4' />
            <h3 className='text-lg font-semibold mb-2'>No tasks found</h3>
            <p className='text-neutral-500 mb-4'>
              {searchQuery
                ? "Try a different search term"
                : "You don't have any tasks yet. Tasks will appear here when assigned to you or when you create them in projects."}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
