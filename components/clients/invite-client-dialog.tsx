"use client";

import { useState } from "react";
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
import { UserPlus, Loader2, Copy, Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InviteClientDialogProps {
  clientEmail: string;
  clientName: string;
}

export function InviteClientDialog({
  clientEmail,
  clientName,
}: InviteClientDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invitationLink, setInvitationLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: clientEmail,
          role: "CLIENT",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create invitation");
      }

      toast.success(`Invitation sent to ${clientName}`);
      setInvitationLink(data.invitationLink);

      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationLink);
    setCopied(true);
    toast.success("Invitation link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setOpen(false);
    setInvitationLink("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          <UserPlus className='h-4 w-4 mr-2' />
          Invite to Portal
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Invite Client to Portal</DialogTitle>
          <DialogDescription>
            Give {clientName} access to the client portal where they can view
            their projects and invoices
          </DialogDescription>
        </DialogHeader>

        {invitationLink ? (
          <div className='space-y-4'>
            <div className='p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800'>
              <p className='text-sm font-medium text-green-900 dark:text-green-100 mb-2'>
                ✅ Invitation Created!
              </p>
              <p className='text-xs text-green-700 dark:text-green-300'>
                Share this link with {clientName}:
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <Input
                value={invitationLink}
                readOnly
                className='font-mono text-xs'
              />
              <Button
                type='button'
                size='icon'
                variant='outline'
                onClick={copyToClipboard}>
                {copied ? (
                  <Check className='h-4 w-4 text-green-500' />
                ) : (
                  <Copy className='h-4 w-4' />
                )}
              </Button>
            </div>

            <div className='space-y-2 text-sm'>
              <p className='font-medium'>What they can do:</p>
              <ul className='list-disc list-inside text-neutral-600 dark:text-neutral-400 space-y-1 text-xs'>
                <li>View their assigned projects</li>
                <li>View project progress and tasks</li>
                <li>View and download invoices</li>
                <li>Limited access (read-only for most features)</li>
              </ul>
            </div>

            <p className='text-xs text-neutral-500'>
              💡 In production, this link would be sent automatically via email.
              For now, copy and share it manually.
            </p>

            <Button onClick={handleClose} className='w-full'>
              Done
            </Button>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>Client Email</Label>
              <div className='flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border'>
                <Mail className='h-4 w-4 text-neutral-500' />
                <span className='text-sm'>{clientEmail}</span>
              </div>
            </div>

            <div className='space-y-2'>
              <Label>Role</Label>
              <div className='flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border'>
                <span className='text-sm font-medium'>CLIENT</span>
                <span className='text-xs text-neutral-500'>
                  (Portal access only)
                </span>
              </div>
            </div>

            <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
              <p className='text-xs text-blue-900 dark:text-blue-100'>
                This will create a login account for {clientName} with limited
                access to view their projects and invoices.
              </p>
            </div>

            <div className='flex items-center justify-end gap-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className='h-4 w-4 mr-2' />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
