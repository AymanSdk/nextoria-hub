"use server";

import { getSession } from "@/src/lib/auth/session";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function checkUserInDatabase() {
  const session = await getSession();
  
  if (!session?.user?.id) {
    return { error: "No session found" };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    return { error: "User not found in database" };
  }

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
    sessionUserId: session.user.id,
    sessionName: session.user.name,
    sessionEmail: session.user.email,
    sessionImage: session.user.image,
    sessionRole: session.user.role,
  };
}

