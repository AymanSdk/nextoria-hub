import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { users, workspaceMembers, workspaces } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { isAdmin } from "@/src/lib/auth/rbac";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Mail, Shield } from "lucide-react";
import { InviteTeamMemberDialog } from "@/components/team/invite-team-member-dialog";
import { PendingInvitations } from "@/components/team/pending-invitations";
import { TeamMemberActions } from "@/components/team/team-member-actions";

export default async function TeamManagementPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Only admins can access team management
  if (!isAdmin(session.user.role)) {
    redirect("/");
  }

  // Get the Nextoria Agency workspace
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, "nextoria-agency"))
    .limit(1);

  if (!workspace) {
    return <div>Workspace not found</div>;
  }

  // Get all team members
  const teamMembers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      memberRole: workspaceMembers.role,
      joinedAt: workspaceMembers.joinedAt,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, workspace.id));

  const getRoleBadgeVariant = (role: string) => {
    if (role === "ADMIN") return "default";
    if (role === "DEVELOPER") return "secondary";
    if (role === "DESIGNER") return "outline";
    if (role === "MARKETER") return "outline";
    return "outline";
  };

  return (
    <div className='space-y-6 max-w-6xl'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Team Management</h1>
          <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
            Invite and manage team members for your workspace
          </p>
        </div>
        <InviteTeamMemberDialog />
      </div>

      {/* Stats */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2'>
              <Users className='h-5 w-5 text-neutral-500' />
              <span className='text-2xl font-bold'>{teamMembers.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
              Active Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2'>
              <Shield className='h-5 w-5 text-green-500' />
              <span className='text-2xl font-bold'>
                {teamMembers.filter((m) => m.isActive).length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-2'>
              <Shield className='h-5 w-5 text-blue-500' />
              <span className='text-2xl font-bold'>
                {teamMembers.filter((m) => m.role === "ADMIN").length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invitations */}
      <PendingInvitations />

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            All members of the Nextoria Agency workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className='flex items-center justify-between p-4 rounded-lg border bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors'>
                <div className='flex items-center gap-4 flex-1'>
                  <Avatar className='h-12 w-12'>
                    <AvatarImage src={member.image || undefined} />
                    <AvatarFallback>
                      {member.name?.substring(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <p className='font-medium'>{member.name || "Unknown"}</p>
                      {!member.isActive && (
                        <Badge variant='destructive' className='text-xs'>
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className='flex items-center gap-2 mt-1'>
                      <Mail className='h-3 w-3 text-neutral-500' />
                      <p className='text-sm text-neutral-500'>{member.email}</p>
                    </div>
                    <p className='text-xs text-neutral-400 mt-1'>
                      Joined{" "}
                      {member.joinedAt?.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant={getRoleBadgeVariant(member.role)}>
                    {member.role}
                  </Badge>
                </div>
                <TeamMemberActions
                  memberId={member.id}
                  memberName={member.name || member.email}
                  isActive={member.isActive}
                  currentUserId={session.user.id}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
