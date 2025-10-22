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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function InviteTeamMemberDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invitationLink, setInvitationLink] = useState("");
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    role: "DEVELOPER",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create invitation");
      }

      toast.success(`Invitation sent to ${formData.email}`);
      setInvitationLink(data.invitationLink);

      // Reset form after short delay to show the link
      setTimeout(() => {
        setFormData({ email: "", role: "DEVELOPER" });
        router.refresh();
      }, 5000);
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
    setFormData({ email: "", role: "DEVELOPER" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className='h-4 w-4 mr-2' />
          Invite Team Member
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join the Nextoria Agency workspace
          </DialogDescription>
        </DialogHeader>

        {invitationLink ? (
          <div className='space-y-4'>
            <div className='p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800'>
              <p className='text-sm font-medium text-green-900 dark:text-green-100 mb-2'>
                ✅ Invitation Created!
              </p>
              <p className='text-xs text-green-700 dark:text-green-300'>
                Share this link with {formData.email}:
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

            <p className='text-xs text-neutral-500'>
              💡 In production, this link would be sent automatically via email.
              For now, copy and share it manually.
            </p>

            <Button onClick={handleClose} className='w-full'>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>
                Email Address <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='email'
                type='email'
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder='colleague@example.com'
                required
                disabled={loading}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='role'>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
                disabled={loading}>
                <SelectTrigger id='role'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ADMIN'>Admin</SelectItem>
                  <SelectItem value='DEVELOPER'>Developer</SelectItem>
                  <SelectItem value='DESIGNER'>Designer</SelectItem>
                  <SelectItem value='MARKETER'>Marketer</SelectItem>
                  <SelectItem value='CLIENT'>Client</SelectItem>
                </SelectContent>
              </Select>
              <p className='text-xs text-neutral-500'>
                The role determines their access level in the workspace
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
              <Button type='submit' disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Creating...
                  </>
                ) : (
                  "Send Invitation"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
