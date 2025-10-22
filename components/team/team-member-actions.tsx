"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface TeamMemberActionsProps {
  memberId: string;
  memberName: string;
  isActive: boolean;
  currentUserId: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function TeamMemberActions({
  memberId,
  memberName,
  isActive,
  currentUserId,
  onClick,
}: TeamMemberActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Can't deactivate yourself
  if (memberId === currentUserId) {
    return null;
  }

  const handleToggleActive = async () => {
    const action = isActive ? "deactivate" : "activate";
    if (!confirm(`Are you sure you want to ${action} ${memberName}?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/users/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!res.ok) {
        throw new Error(`Failed to ${action} user`);
      }

      toast.success(`${memberName} ${action}d successfully`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' disabled={loading} onClick={onClick}>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {isActive ? (
          <DropdownMenuItem onClick={handleToggleActive}>
            <UserX className='h-4 w-4 mr-2' />
            Deactivate
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleToggleActive}>
            <UserCheck className='h-4 w-4 mr-2' />
            Activate
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
