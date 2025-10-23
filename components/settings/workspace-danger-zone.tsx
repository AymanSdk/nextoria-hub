"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertTriangle, Trash2, UserCog, Loader2 } from "lucide-react";

interface WorkspaceDangerZoneProps {
  workspace: {
    id: string;
    name: string;
  };
  isOwner: boolean;
  memberCount: number;
}

export function WorkspaceDangerZone({
  workspace,
  isOwner,
  memberCount,
}: WorkspaceDangerZoneProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handleDeleteWorkspace = async () => {
    if (deleteConfirmation !== workspace.name) {
      toast.error("Workspace name does not match");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/workspaces/${workspace.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete workspace");
      }

      toast.success("Workspace deleted successfully");
      router.push("/auth/signup");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete workspace");
      setIsDeleting(false);
    }
  };

  if (!isOwner) {
    return null;
  }

  return (
    <Card className='border-destructive'>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <AlertTriangle className='h-5 w-5 text-destructive' />
          <CardTitle className='text-destructive'>Danger Zone</CardTitle>
        </div>
        <CardDescription>
          Irreversible and destructive actions for this workspace
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>
            Warning: These actions are permanent and cannot be undone. Please proceed with
            caution.
          </AlertDescription>
        </Alert>

        {/* Delete Workspace */}
        <div className='flex items-start justify-between p-4 rounded-lg border border-destructive/50 bg-destructive/5'>
          <div className='flex-1'>
            <h4 className='font-semibold text-destructive flex items-center gap-2'>
              <Trash2 className='h-4 w-4' />
              Delete Workspace
            </h4>
            <p className='text-sm text-muted-foreground mt-1'>
              Permanently delete this workspace and all associated data. This will remove
              all projects, tasks, files, and member access.
            </p>
            {memberCount > 1 && (
              <p className='text-sm font-medium text-destructive mt-2'>
                ⚠️ This workspace has {memberCount} members who will lose access.
              </p>
            )}
          </div>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant='destructive' className='ml-4'>
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Workspace</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the workspace{" "}
                  <strong>{workspace.name}</strong> and all associated data.
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4 py-4'>
                <Alert variant='destructive'>
                  <AlertTriangle className='h-4 w-4' />
                  <AlertDescription>
                    All projects, tasks, files, invoices, and chat messages will be
                    permanently deleted.{" "}
                    {memberCount > 1 && `All ${memberCount} members will lose access.`}
                  </AlertDescription>
                </Alert>
                <div className='space-y-2'>
                  <Label htmlFor='delete-confirmation'>
                    Type <strong>{workspace.name}</strong> to confirm
                  </Label>
                  <Input
                    id='delete-confirmation'
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder={workspace.name}
                    disabled={isDeleting}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setDeleteConfirmation("");
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant='destructive'
                  onClick={handleDeleteWorkspace}
                  disabled={deleteConfirmation !== workspace.name || isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className='mr-2 h-4 w-4' />
                      Delete Workspace
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
