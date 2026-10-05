import type { NextAuthConfig } from "next-auth";

/**
 * Config that is safe to import from `proxy.ts` (edge runtime) and the login
 * page: no database, no Node-only APIs. The full adapter-backed config lives in
 * `auth.ts` and spreads this.
 */
export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  callbacks: {
    /** Gate protected paths before any page or Server Action runs. */
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const { pathname } = request.nextUrl;

      const isProtected =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/roadmaps") ||
        pathname.startsWith("/settings");

      if (isProtected && !isLoggedIn) {
        const url = new URL("/login", request.nextUrl);
        if (pathname !== "/dashboard") url.searchParams.set("from", pathname);
        return Response.redirect(url);
      }

      // Signed-in visitors have no reason to see the login/register screens.
      if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
