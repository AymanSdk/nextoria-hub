import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { SecuritySection } from "@/components/settings/security-section";

export default async function SecuritySettingsPage() {
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
    <SecuritySection
      hasPassword={hasPassword}
      user={{
        id: userData.id,
        email: userData.email,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      }}
    />
  );
}
