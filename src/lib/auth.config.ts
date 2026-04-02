import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

// Edge-safe auth config — no Prisma imports here
// Prisma-dependent callbacks are in auth.ts

export default {
  providers: [
    Credentials({
      id: "admin-credentials",
      name: "Administrator",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string;
        const password = credentials?.password as string;

        if (!username || !password) return null;
        if (username !== process.env.ADMIN_USERNAME) return null;
        if (password !== process.env.ADMIN_PASSWORD) return null;

        return {
          id: "admin",
          name: "Site Administrator",
          email: "admin@housofthedarlingstarling.com",
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPortal = nextUrl.pathname.startsWith("/portal");
      const isProtectedApi =
        nextUrl.pathname.startsWith("/api/") &&
        !nextUrl.pathname.startsWith("/api/auth") &&
        !nextUrl.pathname.startsWith("/api/contact");

      // Portal and protected API: must be logged in
      // Role/status checks happen server-side in auth.ts callbacks and route handlers
      if (isPortal || isProtectedApi) {
        return isLoggedIn;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
