"use client";

import { useActionState } from "react";

import { registerUser, startGithubSignIn } from "@/lib/actions/auth";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FormBanner, Input } from "@/components/ui/field";

export function SignUpForm({ githubEnabled }: { githubEnabled: boolean }) {
  const [state, action, pending] = useActionState(registerUser, undefined);

  return (
    <form action={action} className="mt-6 space-y-4">
      <FormBanner state={state} />

      <Field label="Name" htmlFor="name" errors={state?.errors?.name}>
        <Input id="name" name="name" autoComplete="name" required placeholder="Kevin Setiawan" />
      </Field>

      <Field
        label="Username"
        htmlFor="username"
        hint="This becomes your public portfolio URL: /p/your-username"
        errors={state?.errors?.username}
      >
        <div className="flex items-center gap-1">
          <span className="text-xs text-ink-500">/p/</span>
          <Input
            id="username"
            name="username"
            required
            placeholder="kevinsetiawan"
            pattern="[a-z0-9][-a-z0-9_]{1,28}[a-z0-9]"
            onChange={(event) => {
              // Mirror the typed name into an empty username to save a step.
              const nameInput = document.getElementById("name") as HTMLInputElement | null;
              if (nameInput?.value && !event.currentTarget.dataset.touched) {
                event.currentTarget.value = slugify(nameInput.value);
              }
            }}
            onBlur={(event) => {
              event.currentTarget.dataset.touched = "true";
            }}
          />
        </div>
      </Field>

      <Field label="Email" htmlFor="email" errors={state?.errors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        hint="At least 8 characters, including one letter and one number."
        errors={state?.errors?.password}
      >
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </Field>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
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
