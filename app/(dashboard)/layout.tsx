import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

/**
 * Main Dashboard Layout
 * Wraps all dashboard pages with sidebar and header
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className='flex flex-1 flex-col p-4 md:p-6 lg:p-8 overflow-hidden'>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
