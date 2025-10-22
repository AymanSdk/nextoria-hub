import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth/session";

export default async function Home() {
  const session = await getSession();

  // Redirect authenticated users to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  // Redirect unauthenticated users to sign in
  redirect("/auth/signin");
}
