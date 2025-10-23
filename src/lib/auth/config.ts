import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/src/db";
import { users, workspaceMembers } from "@/src/db/schema";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { Role } from "@/src/lib/constants/roles";
import { setCurrentWorkspaceId } from "@/src/lib/workspace/context";

/**
 * Extend NextAuth types to include our custom fields
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      workspaceId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    name?: string | null;
    image?: string | null;
  }
}

/**
 * NextAuth Configuration
 */
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    // Email/Password Authentication Only
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        // Find user by email
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error("Account is deactivated");
        }

        // Verify password
        const isValidPassword = await compare(
          credentials.password as string,
          user.password
        );

        if (!isValidPassword) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
    newUser: "/onboarding",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.image = user.image;
      }

      // Handle session updates (e.g., when profile is updated)
      if (trigger === "update" && session) {
        // Fetch fresh user data from database
        const [freshUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, token.id as string))
          .limit(1);

        if (freshUser) {
          token.name = freshUser.name;
          token.image = freshUser.image;
          token.role = freshUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.name = token.name as string;
        session.user.image = token.image as string | null;
      }

      return session;
    },

    async signIn({ user }) {
      // Check if user is active
      if (!user.id) return false;

      // Set the user's workspace cookie on sign in
      try {
        const [membership] = await db
          .select({
            workspaceId: workspaceMembers.workspaceId,
          })
          .from(workspaceMembers)
          .where(eq(workspaceMembers.userId, user.id))
          .limit(1);

        if (membership) {
          await setCurrentWorkspaceId(membership.workspaceId);
        }
      } catch (error) {
        console.error("Error setting workspace cookie on sign in:", error);
        // Continue with sign in even if cookie setting fails
      }

      return true;
    },
  },

  events: {
    async createUser({ user }) {
      console.log("New user created:", user.email);
    },
  },

  // Disable debug mode to prevent bloated session cookies
  debug: false,
});
