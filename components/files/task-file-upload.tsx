"use client";

import { useState, useEffect } from "react";
import { FileUpload } from "@/components/upload/file-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  project: {
    name: string;
  } | null;
}

interface TaskFileUploadProps {
  onUploadComplete?: (file: any) => void;
}

export function TaskFileUpload({ onUploadComplete }: TaskFileUploadProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tasks");
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (file: any) => {
    toast.success("File uploaded to task successfully!");
    if (onUploadComplete) {
      onUploadComplete(file);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upload Task File</CardTitle>
          <CardDescription>Loading tasks...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upload Task File</CardTitle>
          <CardDescription>
            No tasks available. Create a task first to upload files.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Task File</CardTitle>
        <CardDescription>Select a task and upload files to attach to it</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <label className='text-sm font-medium mb-2 block'>Select Task</label>
          <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
            <SelectTrigger>
              <SelectValue placeholder='Choose a task...' />
            </SelectTrigger>
            <SelectContent>
              {tasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.title}
                  {task.project && ` (${task.project.name})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTaskId && (
          <FileUpload
            taskId={selectedTaskId}
            onUploadComplete={handleUploadComplete}
            maxSize={50 * 1024 * 1024}
          />
        )}

        {!selectedTaskId && (
          <p className='text-sm text-neutral-500 text-center py-4'>
            Please select a task to upload files
          </p>
        )}
      </CardContent>
    </Card>
  );
}
