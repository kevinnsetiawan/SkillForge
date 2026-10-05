import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth.config";

// The proxy only performs optimistic cookie-based checks. Every Server Action
// and data query re-verifies the session against the database.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
