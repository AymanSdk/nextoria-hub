import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { users, workspaceMembers } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Mail,
  Shield,
  UserCheck,
  UserX,
  MoreHorizontal,
  Users,
  Crown,
} from "lucide-react";
import { redirect } from "next/navigation";
import { isAdmin, canManageUsers } from "@/src/lib/auth/rbac";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function TeamPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Check if user can manage users
  if (!canManageUsers(session.user.role)) {
    redirect("/");
  }

  // Fetch all users
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: users.role,
      isActive: users.isActive,
      phone: users.phone,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);

  // Calculate stats
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter((u) => u.isActive).length;
  const adminCount = allUsers.filter((u) => u.role === "ADMIN").length;
  const clientCount = allUsers.filter((u) => u.role === "CLIENT").length;
  const teamCount = allUsers.filter((u) =>
    ["DEVELOPER", "DESIGNER", "MARKETER"].includes(u.role)
  ).length;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-500";
      case "DEVELOPER":
        return "bg-blue-500";
      case "DESIGNER":
        return "bg-pink-500";
      case "MARKETER":
        return "bg-green-500";
      case "CLIENT":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === "ADMIN") return <Crown className='h-3 w-3' />;
    if (role === "CLIENT") return <Users className='h-3 w-3' />;
    return <Shield className='h-3 w-3' />;
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Team</h1>
          <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
            Manage users, roles, and permissions
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline'>
            <Mail className='mr-2 h-4 w-4' />
            Invite Users
          </Button>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
            <Users className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalUsers}</div>
            <p className='text-xs text-neutral-500 mt-1'>
              {activeUsers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Admins</CardTitle>
            <Crown className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{adminCount}</div>
            <p className='text-xs text-neutral-500 mt-1'>Full access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Team Members</CardTitle>
            <Shield className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{teamCount}</div>
            <p className='text-xs text-neutral-500 mt-1'>
              Developers, Designers, Marketers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Clients</CardTitle>
            <Users className='h-4 w-4 text-neutral-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{clientCount}</div>
            <p className='text-xs text-neutral-500 mt-1'>External users</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar>
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='font-medium'>
                          {user.name || "Unnamed User"}
                        </p>
                        <p className='text-sm text-neutral-500'>{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      <span className='flex items-center gap-1'>
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className='text-sm text-neutral-500'>
                    {user.phone || "—"}
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge variant='outline' className='bg-green-50'>
                        <UserCheck className='mr-1 h-3 w-3' />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant='outline' className='bg-red-50'>
                        <UserX className='mr-1 h-3 w-3' />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className='text-sm text-neutral-500'>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                        <DropdownMenuItem>View Activity</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.isActive ? (
                          <DropdownMenuItem className='text-red-600'>
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className='text-green-600'>
                            Activate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {allUsers.length === 0 && (
            <div className='text-center py-12'>
              <Users className='mx-auto h-12 w-12 text-neutral-400' />
              <h3 className='mt-4 text-lg font-semibold'>No users yet</h3>
              <p className='mt-2 text-neutral-500'>
                Get started by inviting team members
              </p>
              <Button className='mt-4'>
                <Plus className='mr-2 h-4 w-4' />
                Invite Users
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
