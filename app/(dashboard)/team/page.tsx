import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { users, workspaceMembers, workspaces } from "@/src/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { isAdmin } from "@/src/lib/auth/rbac";
import { TeamBrowser } from "@/components/team/team-browser";
import { getCurrentWorkspace } from "@/src/lib/workspace/context";

export default async function TeamManagementPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Only admins can access team management
  if (!isAdmin(session.user.role)) {
    redirect("/");
  }

  // Get user's current workspace
  const workspace = await getCurrentWorkspace(session.user.id);

  if (!workspace) {
    return <div>Workspace not found</div>;
  }

  // Get all team members (exclude CLIENT role users)
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
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspace.id),
        ne(users.role, "CLIENT")
      )
    );

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Team Management</h1>
          <p className='text-neutral-500 dark:text-neutral-400 mt-2'>
            Manage team members and clients in one place
          </p>
        </div>
      </div>

      {/* Team Browser Component */}
      <TeamBrowser
        initialTeamMembers={teamMembers}
        currentUserId={session.user.id}
        currentUserRole={session.user.role}
      />
    </div>
  );
}
