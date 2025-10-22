"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Loader2, Trash2, Upload, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  status: string;
  priority: string;
  assigneeId: string | null;
  labels: string | null;
  dueDate: Date | null;
  startDate?: Date | null;
  estimatedHours: number | null;
  actualHours?: number | null;
}

interface EditTaskDialogProps {
  task: Task;
  members: TeamMember[];
  trigger?: React.ReactNode;
}

export function EditTaskDialog({ task, members, trigger }: EditTaskDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [taskFiles, setTaskFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || "",
    status: task.status,
    priority: task.priority,
    assigneeId: task.assigneeId || "",
    labels: task.labels || "",
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    startDate: task.startDate ? new Date(task.startDate).toISOString().split("T")[0] : "",
    estimatedHours: task.estimatedHours?.toString() || "",
    actualHours: task.actualHours?.toString() || "",
  });

  // Update form data when task changes
  useEffect(() => {
    setFormData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId || "",
      labels: task.labels || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      startDate: task.startDate
        ? new Date(task.startDate).toISOString().split("T")[0]
        : "",
      estimatedHours: task.estimatedHours?.toString() || "",
      actualHours: task.actualHours?.toString() || "",
    });
  }, [task]);

  // Load task files when dialog opens
  useEffect(() => {
    if (open) {
      fetchTaskFiles();
    }
  }, [open]);

  const fetchTaskFiles = async () => {
    try {
      setLoadingFiles(true);
      const response = await fetch(`/api/files?category=tasks`);
      if (response.ok) {
        const data = await response.json();
        const filteredFiles = data.files.filter((f: any) => f.taskId === task.id);
        setTaskFiles(filteredFiles);
      }
    } catch (error) {
      console.error("Error fetching task files:", error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("taskId", task.id);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        toast.success(`${file.name} uploaded successfully`);
        fetchTaskFiles();
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    e.target.value = "";
  };

  const handleDownload = async (file: any) => {
    try {
      const response = await fetch(`/api/deliverables/${file.id}/download`);
      if (!response.ok) throw new Error("Failed to get download URL");
      const data = await response.json();
      window.open(data.downloadUrl, "_blank");
      toast.success(`Downloading ${file.name}`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          estimatedHours: formData.estimatedHours
            ? parseFloat(formData.estimatedHours)
            : null,
          actualHours: formData.actualHours ? parseFloat(formData.actualHours) : null,
          assigneeId: formData.assigneeId || null,
          dueDate: formData.dueDate || null,
          startDate: formData.startDate || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update task");
      }

      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete task");
      }

      setShowDeleteDialog(false);
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant='ghost' size='sm'>
              <Pencil className='h-4 w-4 mr-2' />
              Edit
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details and assignee</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {error && (
              <div className='p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg'>
                {error}
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='title'>
                Task Title <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='title'
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder='Enter task title'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='Enter task description'
                rows={4}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='status'>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id='status'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='TODO'>To Do</SelectItem>
                    <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
                    <SelectItem value='IN_REVIEW'>In Review</SelectItem>
                    <SelectItem value='DONE'>Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='priority'>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger id='priority'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='LOW'>Low</SelectItem>
                    <SelectItem value='MEDIUM'>Medium</SelectItem>
                    <SelectItem value='HIGH'>High</SelectItem>
                    <SelectItem value='URGENT'>Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='assigneeId'>Assign To</Label>
              <Select
                value={formData.assigneeId}
                onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
              >
                <SelectTrigger id='assigneeId'>
                  <SelectValue placeholder='Unassigned' />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name || member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='startDate'>Start Date</Label>
                <Input
                  id='startDate'
                  type='date'
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='dueDate'>Due Date</Label>
                <Input
                  id='dueDate'
                  type='date'
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='estimatedHours'>Estimated Hours</Label>
                <Input
                  id='estimatedHours'
                  type='number'
                  min='0'
                  step='0.5'
                  value={formData.estimatedHours}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedHours: e.target.value })
                  }
                  placeholder='e.g., 8'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='actualHours'>Actual Hours</Label>
                <Input
                  id='actualHours'
                  type='number'
                  min='0'
                  step='0.5'
                  value={formData.actualHours}
                  onChange={(e) =>
                    setFormData({ ...formData, actualHours: e.target.value })
                  }
                  placeholder='e.g., 6'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='labels'>Labels</Label>
              <Input
                id='labels'
                value={formData.labels}
                onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
                placeholder='e.g., bug, feature, design (comma-separated)'
              />
            </div>

            {/* Task Files */}
            <div className='space-y-3 border-t pt-4'>
              <div className='flex items-center justify-between'>
                <Label>Task Files ({taskFiles.length})</Label>
                <div>
                  <input
                    type='file'
                    id='task-file-input'
                    className='hidden'
                    multiple
                    accept='.png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv'
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor='task-file-input'
                    className='inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded cursor-pointer transition-colors'
                  >
                    <Upload className='h-3.5 w-3.5' />
                    Attach Files
                  </label>
                </div>
              </div>

              {loadingFiles ? (
                <p className='text-sm text-neutral-500'>Loading files...</p>
              ) : taskFiles.length > 0 ? (
                <div className='space-y-2 max-h-40 overflow-y-auto'>
                  {taskFiles.map((file) => (
                    <div
                      key={file.id}
                      className='flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-900 rounded text-sm'
                    >
                      <div className='flex items-center gap-2 flex-1 min-w-0'>
                        <FileText className='h-4 w-4 text-neutral-500 shrink-0' />
                        <span className='truncate'>{file.name}</span>
                      </div>
                      <button
                        type='button'
                        onClick={() => handleDownload(file)}
                        className='text-blue-600 hover:text-blue-700 shrink-0'
                      >
                        <Download className='h-4 w-4' />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-neutral-500'>No files attached yet</p>
              )}
            </div>

            <div className='flex items-center justify-between gap-3 pt-4'>
              <Button
                type='button'
                variant='destructive'
                onClick={() => setShowDeleteDialog(true)}
                disabled={loading}
              >
                <Trash2 className='h-4 w-4 mr-2' />
                Delete Task
              </Button>

              <div className='flex gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className='bg-red-600 hover:bg-red-700'
            >
              {deleting ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
