import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { ProfileForm } from "@/components/settings/profile-form";
import { PasswordChangeForm } from "@/components/settings/password-change-form";

export default async function ProfileSettingsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch full user data from database
  const [userData] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!userData) {
    redirect("/auth/signin");
  }

  const hasPassword = !!userData.password;

  return (
    <div className='w-full min-h-[calc(100vh-4rem)] flex items-start justify-center py-8 px-4'>
      <div className='w-full max-w-5xl space-y-8'>
        {/* Header */}
        <div className='text-center space-y-2'>
          <h1 className='text-4xl font-bold tracking-tight'>Profile Settings</h1>
          <p className='text-muted-foreground text-lg'>
            Manage your personal information and preferences
          </p>
        </div>

        {/* Main Content */}
        <div className='space-y-6'>
          <ProfileForm
            user={{
              id: userData.id,
              name: userData.name,
              email: userData.email,
              image: userData.image,
              phone: userData.phone,
              bio: userData.bio,
              timezone: userData.timezone,
            }}
          />

          {hasPassword && <PasswordChangeForm />}
        </div>
      </div>
    </div>
  );
}
