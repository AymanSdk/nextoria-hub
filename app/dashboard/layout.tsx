import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <AppSidebar userRole={session.user.role} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <AppHeader user={session.user} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

