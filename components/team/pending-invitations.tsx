"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Clock, X } from "lucide-react";
import { toast } from "sonner";

interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expires: Date;
  createdAt: Date;
}

export function PendingInvitations() {
  const router = useRouter();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const res = await fetch("/api/invitations");
      const data = await res.json();
      setInvitations(data.invitations || []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (invitationId: string, email: string) => {
    if (
      !confirm(`Are you sure you want to revoke the invitation for ${email}?`)
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to revoke invitation");
      }

      toast.success("Invitation revoked");
      fetchInvitations();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>
          {invitations.length} invitation{invitations.length !== 1 ? "s" : ""}{" "}
          waiting to be accepted
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {invitations.map((invitation) => {
            const expiresDate = new Date(invitation.expires);
            const isExpired = expiresDate < new Date();

            return (
              <div
                key={invitation.id}
                className='flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-neutral-950'>
                <div className='flex items-center gap-3 flex-1'>
                  <Mail className='h-5 w-5 text-neutral-500' />
                  <div className='flex-1 min-w-0'>
                    <p className='font-medium text-sm'>{invitation.email}</p>
                    <div className='flex items-center gap-2 mt-1'>
                      <Badge variant='outline' className='text-xs'>
                        {invitation.role}
                      </Badge>
                      <div className='flex items-center gap-1 text-xs text-neutral-500'>
                        <Clock className='h-3 w-3' />
                        {isExpired ? (
                          <span className='text-red-500'>Expired</span>
                        ) : (
                          <span>
                            Expires {expiresDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => handleRevoke(invitation.id, invitation.email)}>
                  <X className='h-4 w-4' />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
