"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Users, FolderKanban, Calendar, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface WorkspaceInfoCardProps {
  workspace: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: Date;
  };
  owner:
    | {
        id: string;
        name: string;
        email: string;
        image: string | null;
      }
    | undefined;
  memberCount: number;
  projectCount: number;
}

export function WorkspaceInfoCard({
  workspace,
  owner,
  memberCount,
  projectCount,
}: WorkspaceInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div className='h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center'>
              <Building2 className='h-6 w-6 text-primary' />
            </div>
            <div>
              <CardTitle className='text-2xl'>{workspace.name}</CardTitle>
              <CardDescription className='mt-1'>
                {workspace.description || "No description"}
              </CardDescription>
            </div>
          </div>
          <Badge variant='secondary' className='font-mono text-xs'>
            {workspace.slug}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {/* Owner */}
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-full bg-muted flex items-center justify-center'>
              <User className='h-5 w-5 text-muted-foreground' />
            </div>
            <div>
              <p className='text-sm font-medium'>Owner</p>
              <p className='text-xs text-muted-foreground truncate'>
                {owner?.name || "Unknown"}
              </p>
            </div>
          </div>

          {/* Members */}
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-full bg-muted flex items-center justify-center'>
              <Users className='h-5 w-5 text-muted-foreground' />
            </div>
            <div>
              <p className='text-sm font-medium'>Members</p>
              <p className='text-xs text-muted-foreground'>{memberCount} active</p>
            </div>
          </div>

          {/* Projects */}
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-full bg-muted flex items-center justify-center'>
              <FolderKanban className='h-5 w-5 text-muted-foreground' />
            </div>
            <div>
              <p className='text-sm font-medium'>Projects</p>
              <p className='text-xs text-muted-foreground'>{projectCount} total</p>
            </div>
          </div>

          {/* Created */}
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-full bg-muted flex items-center justify-center'>
              <Calendar className='h-5 w-5 text-muted-foreground' />
            </div>
            <div>
              <p className='text-sm font-medium'>Created</p>
              <p className='text-xs text-muted-foreground'>
                {formatDate(workspace.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
