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
import { Pencil, Loader2, Trash2 } from "lucide-react";
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

interface Client {
  id: string;
  name: string;
  companyName: string | null;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  priority: number | null;
  color: string | null;
  startDate: Date | null;
  dueDate: Date | null;
  budgetAmount: number | null;
  budgetCurrency: string | null;
  clientId: string | null;
}

interface EditProjectDialogProps {
  project: Project;
  clients?: Client[];
  trigger?: React.ReactNode;
}

export function EditProjectDialog({
  project,
  clients = [],
  trigger,
}: EditProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    status: project.status,
    priority: project.priority?.toString() || "1",
    color: project.color || "#0070f3",
    startDate: project.startDate
      ? new Date(project.startDate).toISOString().split("T")[0]
      : "",
    dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split("T")[0] : "",
    budgetAmount: project.budgetAmount?.toString() || "",
    budgetCurrency: project.budgetCurrency || "USD",
    clientId: project.clientId || "",
  });

  // Update form data when project changes
  useEffect(() => {
    setFormData({
      name: project.name,
      description: project.description || "",
      status: project.status,
      priority: project.priority?.toString() || "1",
      color: project.color || "#0070f3",
      startDate: project.startDate
        ? new Date(project.startDate).toISOString().split("T")[0]
        : "",
      dueDate: project.dueDate
        ? new Date(project.dueDate).toISOString().split("T")[0]
        : "",
      budgetAmount: project.budgetAmount?.toString() || "",
      budgetCurrency: project.budgetCurrency || "USD",
      clientId: project.clientId || "",
    });
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/projects/${project.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          priority: parseInt(formData.priority),
          budgetAmount: formData.budgetAmount ? parseFloat(formData.budgetAmount) : null,
          clientId: formData.clientId || null,
          startDate: formData.startDate || null,
          dueDate: formData.dueDate || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update project");
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
      const res = await fetch(`/api/projects/${project.slug}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete project");
      }

      setShowDeleteDialog(false);
      setOpen(false);
      router.push("/projects");
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
            <Button variant='outline' size='sm'>
              <Pencil className='h-4 w-4 mr-2' />
              Edit Project
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project details and settings</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {error && (
              <div className='p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg'>
                {error}
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='name'>
                Project Name <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder='Enter project name'
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
                placeholder='Enter project description'
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
                    <SelectItem value='DRAFT'>Draft</SelectItem>
                    <SelectItem value='ACTIVE'>Active</SelectItem>
                    <SelectItem value='ON_HOLD'>On Hold</SelectItem>
                    <SelectItem value='COMPLETED'>Completed</SelectItem>
                    <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='priority'>Priority (0-10)</Label>
                <Input
                  id='priority'
                  type='number'
                  min='0'
                  max='10'
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='clientId'>Client</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              >
                <SelectTrigger id='clientId'>
                  <SelectValue placeholder='No client (optional)' />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                      {client.companyName && ` (${client.companyName})`}
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
                <Label htmlFor='budgetAmount'>Budget Amount</Label>
                <Input
                  id='budgetAmount'
                  type='number'
                  min='0'
                  step='0.01'
                  value={formData.budgetAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, budgetAmount: e.target.value })
                  }
                  placeholder='0.00'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='budgetCurrency'>Currency</Label>
                <Select
                  value={formData.budgetCurrency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, budgetCurrency: value })
                  }
                >
                  <SelectTrigger id='budgetCurrency'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='USD'>USD ($)</SelectItem>
                    <SelectItem value='EUR'>EUR (€)</SelectItem>
                    <SelectItem value='GBP'>GBP (£)</SelectItem>
                    <SelectItem value='MAD'>MAD (DH)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='color'>Project Color</Label>
              <div className='flex gap-2'>
                <Input
                  id='color'
                  type='color'
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className='w-20 h-10'
                />
                <Input
                  type='text'
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder='#0070f3'
                  className='flex-1'
                />
              </div>
            </div>

            <div className='flex items-center justify-between gap-3 pt-4'>
              <Button
                type='button'
                variant='destructive'
                onClick={() => setShowDeleteDialog(true)}
                disabled={loading}
              >
                <Trash2 className='h-4 w-4 mr-2' />
                Delete Project
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
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This will also delete all
              tasks, milestones, and related data. This action cannot be undone.
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
                "Delete Project"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
