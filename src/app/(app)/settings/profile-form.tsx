"use client";

import { useActionState } from "react";

import type { ActionState } from "@/lib/validation";
import { Button, Card, SectionTitle } from "@/components/ui/button";
import { Field, FormBanner, Input, Textarea } from "@/components/ui/field";

type User = {
  name: string | null;
  username: string;
  email: string | null;
  bio: string | null;
};

export function ProfileForm({
  action,
  user,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  user: User;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <Card className="space-y-4 p-5">
        <SectionTitle>Public profile</SectionTitle>

        <Field label="Display name" htmlFor="name" errors={state?.errors?.name}>
          <Input id="name" name="name" defaultValue={user.name ?? ""} placeholder="Your name" />
        </Field>

        <Field
          label="Username"
          htmlFor="username"
          hint="Appears in the public URL for every roadmap you publish."
          errors={state?.errors?.username}
        >
          <div className="flex items-center gap-1">
            <span className="text-xs text-ink-500">/p/</span>
            <Input id="username" name="username" required defaultValue={user.username} pattern="[a-z0-9][-a-z0-9_]{1,28}[a-z0-9]" />
          </div>
        </Field>

        <Field label="Bio" htmlFor="bio" errors={state?.errors?.bio}>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={user.bio ?? ""}
            rows={3}
            placeholder="What are you learning, and why?"
          />
        </Field>

        {user.email ? (
          <p className="text-xs text-ink-500">
            Signed in as <span className="text-ink-300">{user.email}</span>
          </p>
        ) : null}
      </Card>

      <FormBanner state={state} />

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

export function PortfolioVisibility({
  action,
  isPublic,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  isPublic: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <Card className="p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="public"
            defaultChecked={isPublic}
            className="mt-0.5 size-4 shrink-0 accent-ember-500"
          />
          <span className="text-sm text-ink-100">
            Make my portfolio public
            <span className="mt-0.5 block text-xs text-ink-500">
              When off, /p/your-username still resolves but hides your roadmaps. Individual published
              roadmaps stay private too.
            </span>
          </span>
        </label>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Saving…" : "Update visibility"}
        </Button>
        {state?.ok ? <span className="text-xs text-mint-400">Saved.</span> : null}
      </div>
    </form>
  );
}
