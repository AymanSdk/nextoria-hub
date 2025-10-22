"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  User,
  Building,
  DollarSign,
  Calendar,
  Target,
  Users,
  Package,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusConfig = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    icon: Eye,
  },
  APPROVED: {
    label: "Approved",
    color: "bg-green-500/10 text-green-700 dark:text-green-400",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-500/10 text-red-700 dark:text-red-400",
    icon: XCircle,
  },
};

const priorityConfig = {
  LOW: {
    label: "Low",
    color: "bg-neutral-500/10 text-neutral-700 dark:text-neutral-400",
  },
  MEDIUM: {
    label: "Medium",
    color: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  HIGH: {
    label: "High",
    color: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  },
  URGENT: {
    label: "Urgent",
    color: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
};

interface ProjectRequestDetailProps {
  request: any;
  client: any;
  requestedByUser: any;
  currentUserRole: string;
}

export function ProjectRequestDetail({
  request,
  client,
  requestedByUser,
  currentUserRole,
}: ProjectRequestDetailProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reviewStatus, setReviewStatus] = useState(request.status);
  const [reviewNotes, setReviewNotes] = useState(request.reviewNotes || "");

  const isClient = currentUserRole === "CLIENT";
  const StatusIcon = statusConfig[request.status as keyof typeof statusConfig].icon;

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/project-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviewStatus,
          reviewNotes: reviewNotes || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update request");
      }

      toast.success("Request updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update request");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/project-requests/${request.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete request");
      }

      toast.success("Request deleted successfully");
      router.push("/project-requests");
      router.refresh();
    } catch (error) {
      console.error("Error deleting request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete request");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Status & Priority */}
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <CardTitle className='text-2xl'>{request.title}</CardTitle>
              <div className='flex items-center gap-2 mt-3'>
                <Badge
                  className={
                    statusConfig[request.status as keyof typeof statusConfig].color
                  }
                >
                  <StatusIcon className='mr-1 h-3 w-3' />
                  {statusConfig[request.status as keyof typeof statusConfig].label}
                </Badge>
                <Badge
                  className={
                    priorityConfig[request.priority as keyof typeof priorityConfig].color
                  }
                >
                  {priorityConfig[request.priority as keyof typeof priorityConfig].label}{" "}
                  Priority
                </Badge>
              </div>
            </div>
            {isClient && request.status === "PENDING" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant='destructive' size='sm' disabled={isDeleting}>
                    {isDeleting ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <Trash2 className='mr-2 h-4 w-4' />
                    )}
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Project Request</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this project request? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div>
              <h4 className='font-semibold mb-2'>Description</h4>
              <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                {request.description}
              </p>
            </div>

            <div className='grid md:grid-cols-2 gap-4 pt-4 border-t'>
              <div className='flex items-center gap-2 text-sm'>
                <User className='h-4 w-4 text-muted-foreground' />
                <span className='text-muted-foreground'>Requested by:</span>
                <span className='font-medium'>{requestedByUser?.name || "Unknown"}</span>
              </div>
              {client && (
                <div className='flex items-center gap-2 text-sm'>
                  <Building className='h-4 w-4 text-muted-foreground' />
                  <span className='text-muted-foreground'>Company:</span>
                  <span className='font-medium'>{client.name}</span>
                </div>
              )}
              <div className='flex items-center gap-2 text-sm'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <span className='text-muted-foreground'>Submitted:</span>
                <span className='font-medium'>
                  {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>
              {request.estimatedBudget && (
                <div className='flex items-center gap-2 text-sm'>
                  <DollarSign className='h-4 w-4 text-muted-foreground' />
                  <span className='text-muted-foreground'>Budget:</span>
                  <span className='font-medium'>
                    {(request.estimatedBudget / 100).toLocaleString()}{" "}
                    {request.budgetCurrency}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {(request.desiredStartDate || request.desiredDeadline) && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 gap-4'>
              {request.desiredStartDate && (
                <div>
                  <Label className='text-muted-foreground'>Desired Start</Label>
                  <p className='font-medium mt-1'>
                    {new Date(request.desiredStartDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              {request.desiredDeadline && (
                <div>
                  <Label className='text-muted-foreground'>Desired Deadline</Label>
                  <p className='font-medium mt-1'>
                    {new Date(request.desiredDeadline).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Details */}
      {(request.objectives ||
        request.targetAudience ||
        request.deliverables ||
        request.additionalNotes) && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Package className='h-5 w-5' />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {request.objectives && (
              <div>
                <Label className='flex items-center gap-2 mb-2'>
                  <Target className='h-4 w-4' />
                  Objectives & Goals
                </Label>
                <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                  {request.objectives}
                </p>
              </div>
            )}
            {request.targetAudience && (
              <div>
                <Label className='flex items-center gap-2 mb-2'>
                  <Users className='h-4 w-4' />
                  Target Audience
                </Label>
                <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                  {request.targetAudience}
                </p>
              </div>
            )}
            {request.deliverables && (
              <div>
                <Label className='flex items-center gap-2 mb-2'>
                  <Package className='h-4 w-4' />
                  Expected Deliverables
                </Label>
                <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                  {request.deliverables}
                </p>
              </div>
            )}
            {request.additionalNotes && (
              <div>
                <Label className='flex items-center gap-2 mb-2'>
                  <FileText className='h-4 w-4' />
                  Additional Notes
                </Label>
                <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                  {request.additionalNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review Section (Admin/Team Only) */}
      {!isClient && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Response</CardTitle>
            <CardDescription>
              Update the status and provide feedback to the client
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Select value={reviewStatus} onValueChange={setReviewStatus}>
                <SelectTrigger className='h-11'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='PENDING'>Pending</SelectItem>
                  <SelectItem value='UNDER_REVIEW'>Under Review</SelectItem>
                  <SelectItem value='APPROVED'>Approved</SelectItem>
                  <SelectItem value='REJECTED'>Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='reviewNotes'>Review Notes (Optional)</Label>
              <Textarea
                id='reviewNotes'
                placeholder='Provide feedback or next steps...'
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
                className='resize-none'
              />
            </div>

            <Button
              onClick={handleUpdateStatus}
              disabled={isUpdating || reviewStatus === request.status}
              className='w-full sm:w-auto'
            >
              {isUpdating ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <CheckCircle2 className='mr-2 h-4 w-4' />
              )}
              Update Request
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Review Notes (Client View) */}
      {isClient && request.reviewNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback from Team</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
              {request.reviewNotes}
            </p>
            {request.reviewedAt && (
              <p className='text-xs text-muted-foreground mt-2'>
                Reviewed on {new Date(request.reviewedAt).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
