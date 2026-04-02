import NextAuth from "next-auth";
import { prisma } from "@/lib/prisma";
import authConfig from "@/lib/auth.config";

declare module "next-auth" {
  interface User {
    role?: string;
    status?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
    status?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ user, account }) {
      // Admin credentials always allowed
      if (account?.provider === "admin-credentials") return true;

      // Google sign-in: register or check approval
      if (account?.provider === "google" && user.email) {
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || null,
              image: user.image || null,
              status: "pending",
              role: "user",
            },
          });
        } else {
          await prisma.user.update({
            where: { email: user.email },
            data: {
              name: user.name || dbUser.name,
              image: user.image || dbUser.image,
            },
          });
        }

        if (dbUser.status === "restricted") {
          return "/login?error=restricted";
        }

        if (dbUser.status === "pending") {
          return "/login?error=pending";
        }

        return true;
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user && account) {
        if (account.provider === "admin-credentials") {
          token.role = "admin";
          token.status = "approved";
        } else if (account.provider === "google" && token.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
          });
          token.role = dbUser?.role || "user";
          token.status = dbUser?.status || "pending";
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as Record<string, unknown>).role = token.role;
        (session.user as unknown as Record<string, unknown>).status = token.status;
      }
      return session;
    },
  },
});
