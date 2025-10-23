"use client";

import { useState } from "react";
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
  Plus,
  Loader2,
  Type,
  AlignLeft,
  Flag,
  User,
  Calendar,
  Clock,
  Tag,
  ListTodo,
} from "lucide-react";
import { format } from "date-fns";

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface CreateTaskDialogProps {
  projectId: string;
  members: TeamMember[];
}

export function CreateTaskDialog({ projectId, members }: CreateTaskDialogProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: "",
    labels: "",
    dueDate: "",
    estimatedHours: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          projectId,
          estimatedHours: formData.estimatedHours
            ? parseFloat(formData.estimatedHours)
            : undefined,
          assigneeId: formData.assigneeId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create task");
      }

      // Reset form and close dialog
      setFormData({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: "",
        labels: "",
        dueDate: "",
        estimatedHours: "",
      });
      setOpen(false);
      router.refresh(); // Refresh the page to show the new task
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='h-4 w-4 mr-2' />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold'>Create New Task</DialogTitle>
          <DialogDescription className='text-base'>
            Add a new task to your project with all the necessary details.
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
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
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
                onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
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
              Timeline & Effort
            </h3>
            <ButtonGroup className='w-full gap-4'>
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
                      selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
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

          {/* Actions */}
          <ButtonGroup className='w-full justify-end'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={loading}
              className='min-w-[100px]'
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading} className='min-w-[120px]'>
              {loading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className='h-4 w-4 mr-2' />
                  Create Task
                </>
              )}
            </Button>
          </ButtonGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
