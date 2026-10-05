import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { db } from "./db";
import { authConfig } from "./auth.config";
import { isValidUsername, slugify } from "./utils";

/** GitHub is only offered when the developer actually configured an OAuth app. */
const githubEnabled = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);

const providers = [
  Credentials({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
      const password = typeof credentials?.password === "string" ? credentials.password : "";

      if (!email || !password) return null;

      const user = await db.user.findUnique({ where: { email } });

      // Always run a comparison so a missing account and a wrong password take
      // roughly the same time, which avoids leaking which emails are registered.
      const hash = user?.passwordHash ?? DUMMY_HASH;
      const ok = await bcrypt.compare(password, hash);

      if (!user || !user.passwordHash || !ok) return null;

      return { id: user.id, email: user.email, name: user.name, image: user.image };
    },
  }),
  ...(githubEnabled
    ? [
        GitHub({
          // Lets someone who signed up with email log in with GitHub using the
          // same address instead of ending up with a duplicate account. GitHub
          // verifies the address on their side, so we trust it for linking.
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers,
  events: {
    /**
     * Every account needs a username for its public portfolio URL, and OAuth
     * sign-ups do not send one, so mint a free one from whatever we do know.
     */
    async createUser({ user }) {
      // The adapter types this as optional, but a user row always has an id by
      // the time this event fires.
      if (!user.id) return;

      const base = slugify(user.name ?? user.email?.split("@")[0] ?? "learner");
      const username = await reserveUsername(base, user.id);
      await db.user.update({ where: { id: user.id }, data: { username } });
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user, trigger }) {
      if (user?.id) token.id = user.id;
      // Keep the session display name in sync when a user edits their profile.
      if (trigger === "update" && token.id) token.name = user?.name ?? token.name;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});

/** A bcrypt hash of a value nobody can guess, used only to equalise timing. */
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

/**
 * Find a free username based on `preferred`, appending a counter or random
 * suffix when the base is taken. The user id disambiguates self-chosen handles.
 */
export async function reserveUsername(preferred: string, userId: string) {
  const suggested = slugify(preferred);
  // A non-latin name slugifies to nothing useful, so fall back to the user id.
  const base = isValidUsername(suggested) ? suggested : `learner-${slugify(userId).slice(0, 6)}`;

  const attempt = async (candidate: string) => {
    const taken = await db.user.findUnique({ where: { username: candidate }, select: { id: true } });
    return !taken || taken.id === userId;
  };

  if (await attempt(base)) return base;
  if (await attempt(`${base}-${slugify(userId).slice(0, 4)}`)) return `${base}-${slugify(userId).slice(0, 4)}`;

  for (let i = 2; i < 40; i++) {
    const candidate = `${base}-${i}`;
    if (await attempt(candidate)) return candidate;
  }

  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}
