import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { ProfileSection } from "@/components/settings/profile-section";
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
    <div className='space-y-6'>
      <ProfileSection
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
  );
}
