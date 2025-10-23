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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Users, MoreVertical, UserCog, UserMinus, LogOut, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  isActive: boolean;
  joinedAt: Date;
}

interface WorkspaceMembersSectionProps {
  members: WorkspaceMember[];
  workspaceId: string;
  currentUserId: string;
}

export function WorkspaceMembersSection({
  members,
  workspaceId,
  currentUserId,
}: WorkspaceMembersSectionProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const getRoleBadgeVariant = (role: string) => {
    if (role === "ADMIN") return "default";
    if (role === "DEVELOPER") return "secondary";
    if (role === "DESIGNER") return "outline";
    if (role === "MARKETER") return "outline";
    return "outline";
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change role");
      }

      toast.success("Member role updated successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to change role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove member");
      }

      toast.success("Member removed successfully!");
      setShowRemoveDialog(false);
      setMemberToRemove(null);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveWorkspace = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${currentUserId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to leave workspace");
      }

      toast.success("Left workspace successfully!");
      setShowLeaveDialog(false);
      router.push("/");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to leave workspace");
    } finally {
      setIsLoading(false);
    }
  };

  const roles = ["ADMIN", "DEVELOPER", "DESIGNER", "MARKETER", "CLIENT"];

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              Workspace Members
            </CardTitle>
            <CardDescription>
              {members.length} {members.length === 1 ? "member" : "members"} in this
              workspace
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {members.map((member) => (
            <div
              key={member.id}
              className='flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors'
            >
              <div className='flex items-center gap-4 flex-1'>
                <Avatar className='h-10 w-10'>
                  <AvatarImage src={member.image || undefined} alt={member.name} />
                  <AvatarFallback>
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <p className='font-medium'>{member.name}</p>
                    {member.id === currentUserId && (
                      <Badge variant='secondary' className='text-xs'>
                        You
                      </Badge>
                    )}
                    {!member.isActive && (
                      <Badge variant='destructive' className='text-xs'>
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <p className='text-sm text-muted-foreground'>{member.email}</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Joined {formatDate(member.joinedAt)}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant={getRoleBadgeVariant(member.role)}>{member.role}</Badge>

                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        disabled={isLoading}
                        className='h-8 w-8'
                      >
                        <MoreVertical className='h-4 w-4' />
                        <span className='sr-only'>Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {/* Change Role - Only for admins, not for self or owner */}
                      {member.id !== currentUserId && !member.isOwner && (
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <UserCog className='mr-2 h-4 w-4' />
                            Change Role
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {roles.map((role) => (
                              <DropdownMenuItem
                                key={role}
                                onClick={() => handleChangeRole(member.id, role)}
                                disabled={role === member.role}
                              >
                                {role === member.role && (
                                  <Shield className='mr-2 h-4 w-4' />
                                )}
                                {role}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      )}

                      {/* Remove Member - Only for admins, not for self or owner */}
                      {member.id !== currentUserId && !member.isOwner && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setMemberToRemove(member);
                              setShowRemoveDialog(true);
                            }}
                            className='text-destructive focus:text-destructive'
                          >
                            <UserMinus className='mr-2 h-4 w-4' />
                            Remove Member
                          </DropdownMenuItem>
                        </>
                      )}

                      {/* Leave Workspace - Only for self and not owner */}
                      {member.id === currentUserId && !member.isOwner && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setShowLeaveDialog(true)}
                            className='text-destructive focus:text-destructive'
                          >
                            <LogOut className='mr-2 h-4 w-4' />
                            Leave Workspace
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>

        {members.length === 0 && (
          <div className='text-center py-8 text-muted-foreground'>
            <Users className='h-12 w-12 mx-auto mb-3 opacity-50' />
            <p>No members in this workspace yet</p>
          </div>
        )}
      </CardContent>

      {/* Remove Member Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className='font-semibold'>{memberToRemove?.name}</span> from this
              workspace? They will lose access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToRemove && handleRemoveMember(memberToRemove.id)}
              disabled={isLoading}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isLoading ? "Removing..." : "Remove Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Workspace Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave this workspace? You will need to be
              re-invited to regain access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveWorkspace}
              disabled={isLoading}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isLoading ? "Leaving..." : "Leave Workspace"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
