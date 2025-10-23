import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { isAdmin } from "@/src/lib/auth/rbac";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { SettingsSidebarNav } from "@/components/settings/settings-sidebar-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userIsAdmin = isAdmin(session.user.role);

  // Fetch user data to check if they have a password
  const [userData] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const hasPassword = !!userData?.password;

  return (
    <div className='container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Header */}
      <div className='mb-8 space-y-2'>
        <div className='flex items-center gap-3'>
          <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20'>
            <Settings className='h-6 w-6 text-primary' />
          </div>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
            <p className='text-muted-foreground text-sm'>
              Manage your account and workspace preferences
            </p>
          </div>
        </div>
      </div>

      <Separator className='mb-8' />

      {/* Split Panel Layout */}
      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Sidebar Navigation - Desktop */}
        <aside className='hidden lg:block w-64 shrink-0'>
          <div className='sticky top-8'>
            <ScrollArea className='h-[calc(100vh-12rem)]'>
              <SettingsSidebarNav isAdmin={userIsAdmin} hasPassword={hasPassword} />
            </ScrollArea>
          </div>
        </aside>

        {/* Sidebar Navigation - Mobile */}
        <div className='lg:hidden'>
          <ScrollArea className='w-full'>
            <SettingsSidebarNav isAdmin={userIsAdmin} hasPassword={hasPassword} />
          </ScrollArea>
          <Separator className='my-6' />
        </div>

        {/* Content Area */}
        <div className='flex-1 min-w-0'>
          <div className='space-y-6'>{children}</div>
        </div>
      </div>
    </div>
  );
}
