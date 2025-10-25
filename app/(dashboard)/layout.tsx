import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { getCurrentWorkspace, getUserWorkspaces } from "@/src/lib/workspace/context";
import { DashboardLayoutContent } from "@/components/layout/dashboard-layout-content";

/**
 * Main Dashboard Layout
 * Wraps all dashboard pages with sidebar and header
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Get workspace data
  const currentWorkspace = await getCurrentWorkspace(session.user.id);
  const allWorkspaces = await getUserWorkspaces(session.user.id);

  return (
    <SidebarProvider>
      <AppSidebar
        currentWorkspace={currentWorkspace}
        allWorkspaces={allWorkspaces}
        currentUserId={session.user.id}
      />
      <SidebarInset className='flex flex-col h-screen overflow-hidden'>
        <AppHeader />
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </SidebarInset>
    </SidebarProvider>
  );
}
