"use client";

import { useFormStatus } from "react-dom";

import { signOutAction } from "@/lib/actions/session";

function Trigger({ name }: { name: string }) {
  const { pending } = useFormStatus();

  return (
    <form action={signOutAction}>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg px-2.5 py-1.5 text-xs text-ink-400 transition hover:bg-ink-850 hover:text-ink-200 disabled:opacity-50"
        title={`Sign out ${name}`}
      >
        Sign out
      </button>
    </form>
  );
}

export function SignOutButton({ name }: { name: string }) {
  return <Trigger name={name} />;
}
