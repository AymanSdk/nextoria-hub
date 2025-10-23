import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { isAdmin } from "@/src/lib/auth/rbac";
import { SettingsNav } from "@/components/settings/settings-nav";

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

  return (
    <div className='w-full min-h-[calc(100vh-4rem)] flex items-start justify-center py-8 px-4'>
      <div className='w-full max-w-6xl space-y-8'>
        {/* Header */}
        <div className='text-center space-y-2'>
          <h1 className='text-4xl font-bold tracking-tight'>Settings</h1>
          <p className='text-muted-foreground text-lg'>
            Manage your account and workspace preferences
          </p>
        </div>

        {/* Navigation Tabs */}
        <SettingsNav isAdmin={userIsAdmin} />

        {/* Content */}
        {children}
      </div>
    </div>
  );
}
