"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Trash2, Calendar } from "lucide-react";
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
import { formatDistanceToNow } from "date-fns";

interface Whiteboard {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SavedWhiteboardsProps {
  whiteboards: Whiteboard[];
}

export function SavedWhiteboards({
  whiteboards: initialWhiteboards,
}: SavedWhiteboardsProps) {
  const [whiteboards, setWhiteboards] = useState(initialWhiteboards);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/whiteboards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setWhiteboards((prev) => prev.filter((wb) => wb.id !== id));
      toast.success("Whiteboard deleted successfully");
      setDeleteId(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete whiteboard");
    } finally {
      setDeleting(false);
    }
  };

  if (whiteboards.length === 0) {
    return (
      <Card className='border-dashed'>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <FolderOpen className='h-12 w-12 text-muted-foreground mb-4' />
          <p className='text-muted-foreground text-center'>
            No saved whiteboards yet. Create a whiteboard and click "Save" to keep it
            here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {whiteboards.map((whiteboard) => (
          <Card key={whiteboard.id} className='hover:shadow-md transition-shadow'>
            <CardHeader>
              <CardTitle className='text-lg line-clamp-1'>{whiteboard.name}</CardTitle>
              {whiteboard.description && (
                <CardDescription className='line-clamp-2'>
                  {whiteboard.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <Calendar className='h-3 w-3' />
                <span>
                  Updated{" "}
                  {formatDistanceToNow(new Date(whiteboard.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className='flex gap-2'>
                <Link href={`/whiteboard/${whiteboard.id}`} className='flex-1'>
                  <Button variant='default' size='sm' className='w-full gap-2'>
                    <FolderOpen className='h-3 w-3' />
                    Load
                  </Button>
                </Link>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setDeleteId(whiteboard.id)}
                  className='gap-2'
                >
                  <Trash2 className='h-3 w-3' />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Whiteboard?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the whiteboard
              and all its content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
