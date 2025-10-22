import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { users, workspaceMembers, workspaces } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Mail, Shield, UserCheck, Users } from "lucide-react";
import { redirect } from "next/navigation";

const getRoleBadgeVariant = (
  role: string
): "default" | "secondary" | "destructive" | "outline" => {
  if (role === "ADMIN") return "destructive";
  if (role === "DEVELOPER") return "default";
  if (role === "DESIGNER") return "secondary";
  return "outline";
};

const getRoleIcon = (role: string) => {
  if (role === "ADMIN") return Shield;
  return UserCheck;
};

export default async function TeamPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch all team members (users in workspaces)
  const allMembers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      image: users.image,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.isActive, true));

  // Calculate statistics
  const totalMembers = allMembers.length;
  const adminCount = allMembers.filter((m) => m.role === "ADMIN").length;
  const developerCount = allMembers.filter(
    (m) => m.role === "DEVELOPER"
  ).length;
  const designerCount = allMembers.filter((m) => m.role === "DESIGNER").length;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Team</h1>
          <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
            Manage your team members and their roles
          </p>
        </div>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Invite Member
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Members</CardTitle>
            <Users className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalMembers}</div>
            <p className='text-xs text-neutral-500 mt-1'>Active team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Admins</CardTitle>
            <Shield className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{adminCount}</div>
            <p className='text-xs text-neutral-500 mt-1'>With full access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Developers</CardTitle>
            <UserCheck className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{developerCount}</div>
            <p className='text-xs text-neutral-500 mt-1'>Technical team</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Designers</CardTitle>
            <UserCheck className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{designerCount}</div>
            <p className='text-xs text-neutral-500 mt-1'>Creative team</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>View and manage all team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {allMembers.map((member) => {
              const RoleIcon = getRoleIcon(member.role);

              return (
                <Card
                  key={member.id}
                  className='hover:shadow-md transition-shadow'>
                  <CardContent className='pt-6'>
                    <div className='flex items-start gap-4'>
                      <Avatar className='h-12 w-12'>
                        <AvatarFallback className='bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold'>
                          {member.name?.substring(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='flex-1 min-w-0'>
                            <h3 className='font-semibold truncate'>
                              {member.name}
                            </h3>
                            <p className='text-sm text-neutral-500 truncate'>
                              {member.email}
                            </p>
                          </div>
                          <Badge
                            variant={getRoleBadgeVariant(member.role)}
                            className='text-xs flex-shrink-0'>
                            {member.role}
                          </Badge>
                        </div>
                        <div className='flex items-center gap-2 mt-3'>
                          <Button
                            variant='outline'
                            size='sm'
                            className='flex-1'>
                            <Mail className='h-3 w-3 mr-1' />
                            Email
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            className='flex-1'>
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
