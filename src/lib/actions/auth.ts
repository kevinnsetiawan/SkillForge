"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { requireUser } from "@/lib/dal";
import { profileSchema, signInSchema, signUpSchema, type ActionState } from "@/lib/validation";

/** Turn a Zod failure into the flat `{ field: [messages] }` shape forms expect. */
function fieldErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[]> };
}): Record<string, string[]> {
  return error.flatten().fieldErrors;
}

export async function registerUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const { name, username, email, password } = parsed.data;

  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });

  if (existing) {
    if (existing.email === email) {
      return { ok: false, errors: { email: ["An account with that email already exists."] } };
    }
    return { ok: false, errors: { username: ["That username is already taken."] } };
  }

  await db.user.create({
    data: {
      name,
      username,
      email,
      passwordHash: await bcrypt.hash(password, 12),
    },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    // Next.js encodes redirects as thrown errors — re-throw so navigation works.
    if (isRedirectError(error)) throw error;
    return { ok: false, errors: { password: ["Could not sign in after registration."] } };
  }
  return { ok: true };
}

export async function authenticateUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    // Next.js encodes redirects as thrown errors — re-throw so navigation works.
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return { ok: false, errors: { password: ["Email or password is incorrect."] } };
    }
    return { ok: false, errors: { password: ["Something went wrong. Please try again."] } };
  }
  return { ok: true };
}

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    bio: formData.get("bio"),
  });

  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const { name, username, bio } = parsed.data;

  if (username !== user.username) {
    const taken = await db.user.findUnique({ where: { username }, select: { id: true } });
    if (taken && taken.id !== user.id) {
      return { ok: false, errors: { username: ["That username is already taken."] } };
    }
  }

  await db.user.update({
    where: { id: user.id },
    data: { name: name || null, username, bio: bio || null },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath(`/p/${user.username}`);
  revalidatePath(`/p/${user.username}/[slug]`, "page");

  return { ok: true, message: "Profile updated." };
}

export async function setPortfolioVisibility(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  await db.user.update({
    where: { id: user.id },
    data: { portfolioPublic: formData.get("public") === "on" },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath(`/p/${user.username}`);
  revalidatePath(`/p/${user.username}/[slug]`, "page");

  return { ok: true };
}

/** Kick off the GitHub OAuth handshake from a plain form button. */
export async function startGithubSignIn() {
  await signIn("github", { redirectTo: "/dashboard" });
}
