"use server";

import { signOut } from "@/lib/auth";

/**
 * `signOut` from Auth.js performs a redirect, so it cannot be handed to a
 * `<form action>` directly. This thin wrapper gives the form something callable.
 */
export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
