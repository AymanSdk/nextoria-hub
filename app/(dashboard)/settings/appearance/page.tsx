import { getSession } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";
import { AppearanceSection } from "@/components/settings/appearance-section";

export default async function AppearanceSettingsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return <AppearanceSection />;
}
