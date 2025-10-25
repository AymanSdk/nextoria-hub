import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { workspaces, workspaceMembers, users, projects } from "@/src/db/schema";
import { eq, and, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import { isAdmin } from "@/src/lib/auth/rbac";
import { WorkspaceGeneralSettings } from "@/components/settings/workspace-general-settings";
import { WorkspaceMembersSection } from "@/components/settings/workspace-members-section";
import { WorkspaceInfoCard } from "@/components/settings/workspace-info-card";
import { WorkspaceDangerZone } from "@/components/settings/workspace-danger-zone";
import { Separator } from "@/components/ui/separator";
import { getCurrentWorkspace } from "@/src/lib/workspace/context";

export default async function WorkspaceSettingsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Only admins can access workspace settings
  if (!isAdmin(session.user.role)) {
    redirect("/");
  }

  // Get user's current workspace
  const workspace = await getCurrentWorkspace(session.user.id);

  if (!workspace) {
    return (
      <div className='text-center py-12'>
        <h2 className='text-2xl font-bold'>No Workspace Found</h2>
        <p className='text-muted-foreground mt-2'>
          You don't belong to any workspace yet.
        </p>
      </div>
    );
  }

  // Get workspace owner
  const [owner] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(users)
    .where(eq(users.id, workspace.ownerId))
    .limit(1);

  // Get workspace stats
  const [memberCount] = await db
    .select({ count: count() })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspace.id),
        eq(workspaceMembers.isActive, true)
      )
    );

  const [projectCount] = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.workspaceId, workspace.id));

  // Get all workspace members
  const membersData = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: workspaceMembers.role,
      isActive: workspaceMembers.isActive,
      joinedAt: workspaceMembers.joinedAt,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userId, users.id))
    .where(eq(workspaceMembers.workspaceId, workspace.id))
    .orderBy(workspaceMembers.joinedAt);

  // Add isOwner flag to each member
  const members = membersData.map((member) => ({
    ...member,
    name: member.name ?? member.email,
    isOwner: member.id === workspace.ownerId,
  }));

  const isOwner = workspace.ownerId === session.user.id;

  return (
    <div className='space-y-8'>
      {/* Workspace Info Card */}
      <WorkspaceInfoCard
        workspace={workspace}
        owner={{
          ...owner,
          name: owner.name ?? owner.email,
        }}
        memberCount={memberCount.count}
        projectCount={projectCount.count}
      />

      <Separator />

      {/* General Settings */}
      <WorkspaceGeneralSettings workspace={workspace} />

      <Separator />

      {/* Members Section */}
      <WorkspaceMembersSection
        members={members}
        workspaceId={workspace.id}
        currentUserId={session.user.id}
      />

      <Separator />

      {/* Danger Zone - Only for owner */}
      {isOwner && (
        <WorkspaceDangerZone
          workspace={workspace}
          isOwner={isOwner}
          memberCount={memberCount.count}
        />
      )}
    </div>
  );
}
