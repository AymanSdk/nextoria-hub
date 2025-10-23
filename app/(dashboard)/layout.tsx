import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { getCurrentWorkspace, getUserWorkspaces } from "@/src/lib/workspace/context";

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
      <SidebarInset className='h-screen overflow-hidden'>
        <AppHeader />
        <main className='flex flex-1 flex-col p-4 md:p-6 lg:p-8 overflow-hidden h-full'>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
