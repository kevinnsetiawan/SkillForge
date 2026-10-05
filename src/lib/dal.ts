import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { db } from "./db";
import { auth } from "./auth";

/** Only the columns the UI needs, so the password hash can never leak out. */
const currentUserSelect = {
  id: true,
  username: true,
  name: true,
  email: true,
  image: true,
  bio: true,
  portfolioPublic: true,
} as const;

export type CurrentUser = {
  id: string;
  username: string;
  name: string | null;
  email: string | null;
  image: string | null;
  bio: string | null;
  portfolioPublic: boolean;
};

/**
 * Resolve the signed-in user, or redirect to the login screen.
 *
 * The result is memoised per request so a page that calls it several times only
 * hits the session and database once.
 */
export const requireUser = cache(async (): Promise<CurrentUser> => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  const user = await db.user.findUnique({ where: { id: userId }, select: currentUserSelect });

  if (!user) {
    // The session outlived the account (e.g. deleted while signed in).
    redirect("/login");
  }

  return user;
});

/** Same as `requireUser` but for contexts that must handle a missing user. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return db.user.findUnique({ where: { id: session.user.id }, select: currentUserSelect });
});

export { currentUserSelect };
