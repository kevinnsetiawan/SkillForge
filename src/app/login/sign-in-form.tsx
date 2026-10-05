"use client";

import { useActionState } from "react";

import { authenticateUser, startGithubSignIn } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, FormBanner, Input } from "@/components/ui/field";

export function SignInForm({ githubEnabled }: { githubEnabled: boolean }) {
  const [state, action, pending] = useActionState(authenticateUser, undefined);

  return (
    <form action={action} className="mt-6 space-y-4">
      <FormBanner state={state} />

      <Field label="Email" htmlFor="email" errors={state?.errors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </Field>

      <Field label="Password" htmlFor="password" errors={state?.errors?.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>

      {githubEnabled ? (
        <>
          <div className="flex items-center gap-3 text-[11px] text-ink-500">
            <span className="h-px flex-1 bg-ink-700" />
            or
            <span className="h-px flex-1 bg-ink-700" />
          </div>
          <form action={startGithubSignIn}>
            <Button type="submit" variant="secondary" className="w-full">
              Continue with GitHub
            </Button>
          </form>
        </>
      ) : null}
    </form>
  );
}
