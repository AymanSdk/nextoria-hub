import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { users, workspaceMembers, workspaces } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { isAdmin } from "@/src/lib/auth/rbac";
import { TeamBrowser } from "@/components/team/team-browser";

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
      <TeamBrowser initialTeamMembers={teamMembers} currentUserId={session.user.id} />
    </div>
  );
}
