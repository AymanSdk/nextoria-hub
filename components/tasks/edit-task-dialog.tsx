"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { Separator } from "@/components/ui/separator";
import {
  Pencil,
  Loader2,
  Trash2,
  Upload,
  FileText,
  Download,
  Save,
  Type,
  AlignLeft,
  Flag,
  User,
  Calendar,
  Clock,
  Tag,
  ListTodo,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditTaskDialog({
  task,
  members,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: EditTaskDialogProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
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
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-semibold'>Edit Task</DialogTitle>
            <DialogDescription className='text-base'>
              Update task details, timeline, and attachments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='space-y-6'>
            {error && (
              <div className='p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800'>
                {error}
              </div>
            )}

            {/* Task Details Section */}
            <div className='space-y-4'>
              <div className='space-y-3'>
                <Label
                  htmlFor='title'
                  className='text-sm font-medium flex items-center gap-2'
                >
                  <Type className='h-4 w-4' />
                  Task Title <span className='text-red-500'>*</span>
                </Label>
                <InputGroup>
                  <InputGroupInput
                    id='title'
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder='Enter a descriptive task title'
                    required
                  />
                </InputGroup>
              </div>

              <div className='space-y-3'>
                <Label
                  htmlFor='description'
                  className='text-sm font-medium flex items-center gap-2'
                >
                  <AlignLeft className='h-4 w-4' />
                  Description
                </Label>
                <InputGroup>
                  <InputGroupTextarea
                    id='description'
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder='Provide detailed information about the task'
                    rows={4}
                  />
                </InputGroup>
              </div>
            </div>

            <Separator />

            {/* Status & Priority Section */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                Task Configuration
              </h3>
              <ButtonGroup className='w-full gap-4'>
                <div className='flex-1 space-y-2'>
                  <Label
                    htmlFor='status'
                    className='text-xs font-medium flex items-center gap-2'
                  >
                    <ListTodo className='h-3.5 w-3.5' />
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id='status' className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='TODO'>📋 To Do</SelectItem>
                      <SelectItem value='IN_PROGRESS'>🚀 In Progress</SelectItem>
                      <SelectItem value='IN_REVIEW'>👀 In Review</SelectItem>
                      <SelectItem value='DONE'>✅ Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex-1 space-y-2'>
                  <Label
                    htmlFor='priority'
                    className='text-xs font-medium flex items-center gap-2'
                  >
                    <Flag className='h-3.5 w-3.5' />
                    Priority
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger id='priority' className='w-full'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='LOW'>🟢 Low</SelectItem>
                      <SelectItem value='MEDIUM'>🟡 Medium</SelectItem>
                      <SelectItem value='HIGH'>🟠 High</SelectItem>
                      <SelectItem value='URGENT'>🔴 Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </ButtonGroup>
            </div>

            <Separator />

            {/* Assignment Section */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                Assignment
              </h3>
              <div className='space-y-2'>
                <Label
                  htmlFor='assigneeId'
                  className='text-xs font-medium flex items-center gap-2'
                >
                  <User className='h-3.5 w-3.5' />
                  Assign To
                </Label>
                <Select
                  value={formData.assigneeId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, assigneeId: value })
                  }
                >
                  <SelectTrigger id='assigneeId' className='w-full'>
                    <SelectValue placeholder='Select team member' />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.id === session?.user?.id
                          ? "👤 me"
                          : member.name || member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Timeline Section */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                Timeline
              </h3>
              <ButtonGroup className='w-full gap-4'>
                <div className='flex-1 space-y-2'>
                  <Label
                    htmlFor='startDate'
                    className='text-xs font-medium flex items-center gap-2'
                  >
                    <Calendar className='h-3.5 w-3.5' />
                    Start Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full justify-start text-left font-normal'
                      >
                        <Calendar className='mr-2 h-4 w-4' />
                        {formData.startDate
                          ? format(new Date(formData.startDate), "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <CalendarComponent
                        mode='single'
                        selected={
                          formData.startDate ? new Date(formData.startDate) : undefined
                        }
                        onSelect={(date) =>
                          setFormData({
                            ...formData,
                            startDate: date ? format(date, "yyyy-MM-dd") : "",
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className='flex-1 space-y-2'>
                  <Label
                    htmlFor='dueDate'
                    className='text-xs font-medium flex items-center gap-2'
                  >
                    <Calendar className='h-3.5 w-3.5' />
                    Due Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-full justify-start text-left font-normal'
                      >
                        <Calendar className='mr-2 h-4 w-4' />
                        {formData.dueDate
                          ? format(new Date(formData.dueDate), "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <CalendarComponent
                        mode='single'
                        selected={
                          formData.dueDate ? new Date(formData.dueDate) : undefined
                        }
                        onSelect={(date) =>
                          setFormData({
                            ...formData,
                            dueDate: date ? format(date, "yyyy-MM-dd") : "",
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </ButtonGroup>
            </div>

            <Separator />

            {/* Effort Tracking Section */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                Effort Tracking
              </h3>
              <ButtonGroup className='w-full gap-4'>
                <div className='flex-1 space-y-2'>
                  <Label
                    htmlFor='estimatedHours'
                    className='text-xs font-medium flex items-center gap-2'
                  >
                    <Clock className='h-3.5 w-3.5' />
                    Estimated Hours
                  </Label>
                  <InputGroup>
                    <InputGroupAddon>
                      <Clock className='h-4 w-4' />
                    </InputGroupAddon>
                    <InputGroupInput
                      id='estimatedHours'
                      type='number'
                      min='0'
                      step='0.5'
                      value={formData.estimatedHours}
                      onChange={(e) =>
                        setFormData({ ...formData, estimatedHours: e.target.value })
                      }
                      placeholder='8'
                    />
                    <InputGroupAddon align='inline-end'>
                      <InputGroupText>hrs</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </div>

                <div className='flex-1 space-y-2'>
                  <Label
                    htmlFor='actualHours'
                    className='text-xs font-medium flex items-center gap-2'
                  >
                    <Clock className='h-3.5 w-3.5' />
                    Actual Hours
                  </Label>
                  <InputGroup>
                    <InputGroupAddon>
                      <Clock className='h-4 w-4' />
                    </InputGroupAddon>
                    <InputGroupInput
                      id='actualHours'
                      type='number'
                      min='0'
                      step='0.5'
                      value={formData.actualHours}
                      onChange={(e) =>
                        setFormData({ ...formData, actualHours: e.target.value })
                      }
                      placeholder='6'
                    />
                    <InputGroupAddon align='inline-end'>
                      <InputGroupText>hrs</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </ButtonGroup>
            </div>

            <Separator />

            {/* Labels Section */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
                Organization
              </h3>
              <div className='space-y-2'>
                <Label
                  htmlFor='labels'
                  className='text-xs font-medium flex items-center gap-2'
                >
                  <Tag className='h-3.5 w-3.5' />
                  Labels
                </Label>
                <InputGroup>
                  <InputGroupAddon>
                    <Tag className='h-4 w-4' />
                  </InputGroupAddon>
                  <InputGroupInput
                    id='labels'
                    value={formData.labels}
                    onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
                    placeholder='bug, feature, design'
                  />
                </InputGroup>
                <p className='text-xs text-muted-foreground'>
                  Separate multiple labels with commas
                </p>
              </div>
            </div>

            <Separator />

            {/* Attachments Section */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2'>
                  <Paperclip className='h-4 w-4' />
                  Attachments ({taskFiles.length})
                </h3>
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
                    className='inline-flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-md cursor-pointer transition-colors'
                  >
                    <Upload className='h-4 w-4' />
                    Upload Files
                  </label>
                </div>
              </div>

              {loadingFiles ? (
                <div className='flex items-center justify-center p-8'>
                  <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                </div>
              ) : taskFiles.length > 0 ? (
                <div className='space-y-2 max-h-48 overflow-y-auto rounded-lg border p-2'>
                  {taskFiles.map((file) => (
                    <div
                      key={file.id}
                      className='flex items-center justify-between p-3 bg-muted/50 hover:bg-muted rounded-md text-sm transition-colors group'
                    >
                      <div className='flex items-center gap-3 flex-1 min-w-0'>
                        <div className='p-2 rounded-md bg-background'>
                          <FileText className='h-4 w-4 text-muted-foreground' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='font-medium truncate'>{file.name}</p>
                          <p className='text-xs text-muted-foreground'>
                            {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ""}
                          </p>
                        </div>
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDownload(file)}
                        className='opacity-0 group-hover:opacity-100 transition-opacity'
                      >
                        <Download className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg'>
                  <Paperclip className='h-8 w-8 text-muted-foreground/50 mb-2' />
                  <p className='text-sm text-muted-foreground'>No files attached yet</p>
                  <p className='text-xs text-muted-foreground'>
                    Click "Upload Files" to add attachments
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className='flex items-center justify-between gap-3'>
              <Button
                type='button'
                variant='destructive'
                onClick={() => setShowDeleteDialog(true)}
                disabled={loading}
                className='min-w-[120px]'
              >
                <Trash2 className='h-4 w-4 mr-2' />
                Delete Task
              </Button>

              <ButtonGroup>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className='min-w-[100px]'
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={loading} className='min-w-[140px]'>
                  {loading ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className='h-4 w-4 mr-2' />
                      Save Changes
                    </>
                  )}
                </Button>
              </ButtonGroup>
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
