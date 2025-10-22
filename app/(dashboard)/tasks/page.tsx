"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  User,
  FolderKanban,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
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

export default function TasksPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }

    if (status === "authenticated") {
      fetchTasks();
    }
  }, [status]);

  useEffect(() => {
    applyFilters();
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      BACKLOG: "bg-gray-500",
      TODO: "bg-blue-500",
      IN_PROGRESS: "bg-yellow-500",
      IN_REVIEW: "bg-purple-500",
      BLOCKED: "bg-red-500",
      DONE: "bg-green-500",
      CANCELLED: "bg-gray-400",
    };

    return (
      <Badge className={styles[status] || "bg-gray-500"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      LOW: "bg-gray-500",
      MEDIUM: "bg-blue-500",
      HIGH: "bg-orange-500",
      URGENT: "bg-red-500",
    };

    return (
      <Badge variant='outline' className={`border-2 ${styles[priority]}`}>
        {priority}
      </Badge>
    );
  };

  const tasksByStatus = {
    todo: filteredTasks.filter((t) => t.status === "TODO").length,
    inProgress: filteredTasks.filter((t) => t.status === "IN_PROGRESS").length,
    done: filteredTasks.filter((t) => t.status === "DONE").length,
    overdue: filteredTasks.filter(
      (t) =>
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
    ).length,
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 dark:border-neutral-100 mx-auto mb-4'></div>
          <p className='text-neutral-500'>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 max-w-7xl'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>My Tasks</h1>
          <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
            View and manage all your assigned tasks across projects
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
              To Do
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2'>
              <CheckSquare className='h-5 w-5 text-blue-500' />
              <span className='text-2xl font-bold'>{tasksByStatus.todo}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2'>
              <CheckSquare className='h-5 w-5 text-green-500' />
              <span className='text-2xl font-bold'>{tasksByStatus.done}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
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
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500' />
              <Input
                placeholder='Search tasks...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder='All Statuses' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Statuses</SelectItem>
                <SelectItem value='BACKLOG'>Backlog</SelectItem>
                <SelectItem value='TODO'>To Do</SelectItem>
                <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
                <SelectItem value='IN_REVIEW'>In Review</SelectItem>
                <SelectItem value='BLOCKED'>Blocked</SelectItem>
                <SelectItem value='DONE'>Done</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder='All Priorities' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Priorities</SelectItem>
                <SelectItem value='LOW'>Low</SelectItem>
                <SelectItem value='MEDIUM'>Medium</SelectItem>
                <SelectItem value='HIGH'>High</SelectItem>
                <SelectItem value='URGENT'>Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
          <CardDescription>
            Tasks assigned to you or created by you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className='text-center py-12'>
              <CheckSquare className='mx-auto h-12 w-12 text-neutral-400 mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No tasks found</h3>
              <p className='text-neutral-500 mb-4'>
                {searchQuery ||
                statusFilter !== "all" ||
                priorityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "You don't have any tasks yet. Tasks will appear here when assigned to you or when you create them in projects."}
              </p>
              <Button asChild>
                <Link href='/projects'>View Projects</Link>
              </Button>
            </div>
          ) : (
            <div className='space-y-3'>
              {filteredTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/projects/${task.project?.slug}`}
                  className='block'>
                  <div className='p-4 rounded-lg border bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-2'>
                          <h3 className='font-medium truncate'>{task.title}</h3>
                          {getStatusBadge(task.status)}
                          {getPriorityBadge(task.priority)}
                        </div>

                        {task.description && (
                          <p className='text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2'>
                            {task.description}
                          </p>
                        )}

                        <div className='flex flex-wrap items-center gap-4 text-sm text-neutral-500'>
                          {task.project && (
                            <div className='flex items-center gap-1'>
                              <FolderKanban className='h-4 w-4' />
                              <span>{task.project.name}</span>
                            </div>
                          )}

                          {task.dueDate && (
                            <div className='flex items-center gap-1'>
                              <Calendar className='h-4 w-4' />
                              <span>
                                Due{" "}
                                {new Date(task.dueDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </span>
                              {new Date(task.dueDate) < new Date() &&
                                task.status !== "DONE" && (
                                  <Badge
                                    variant='destructive'
                                    className='text-xs ml-1'>
                                    Overdue
                                  </Badge>
                                )}
                            </div>
                          )}

                          {task.estimatedHours && (
                            <div className='flex items-center gap-1'>
                              <Clock className='h-4 w-4' />
                              <span>{task.estimatedHours}h estimated</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {task.assignee && (
                        <div className='flex items-center gap-2'>
                          <Avatar className='h-8 w-8'>
                            <AvatarImage
                              src={task.assignee.image || undefined}
                            />
                            <AvatarFallback>
                              {task.assignee.name
                                ?.substring(0, 2)
                                .toUpperCase() ||
                                task.assignee.email
                                  .substring(0, 2)
                                  .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
