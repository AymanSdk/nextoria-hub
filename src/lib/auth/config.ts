import NextAuth, { DefaultSession } from "next-auth";
// import { DrizzleAdapter } from "@auth/drizzle-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { db } from "@/src/db";
import { users } from "@/src/db/schema";
// import { accounts, sessions, verificationTokens } from "@/src/db/schema";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { Role } from "@/src/lib/constants/roles";

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
  // Note: Cannot use adapter with Credentials provider
  // Adapter is only for OAuth providers
  // adapter: DrizzleAdapter(db, {
  //   usersTable: users,
  //   accountsTable: accounts,
  //   sessionsTable: sessions,
  //   verificationTokensTable: verificationTokens,
  // }),

  providers: [
    // Email/Password
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

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),

    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
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
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }

      return session;
    },

    async signIn({ user, account }) {
      // Allow OAuth sign-ins
      if (account?.provider !== "credentials") {
        return true;
      }

      // For credentials, check if user is active
      return user.id ? true : false;
    },
  },

  events: {
    async createUser({ user }) {
      console.log("New user created:", user.email);
      // You can add logic here to:
      // - Send welcome email
      // - Create default workspace
      // - Set up notification preferences
    },
  },

  debug: process.env.NODE_ENV === "development",
});
