import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

/**
 * Main Dashboard Layout
 * Wraps all dashboard pages with sidebar and header
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-screen'>
      <AppSidebar />
      <div className='flex-1'>
        <AppHeader />
        <main className='p-6 lg:p-8'>{children}</main>
      </div>
    </div>
  );
}
