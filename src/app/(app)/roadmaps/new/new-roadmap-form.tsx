"use client";

import { useActionState } from "react";

import { createRoadmap } from "@/lib/actions/roadmaps";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, FormBanner, Input, Textarea } from "@/components/ui/field";

export function NewRoadmapForm() {
  const [state, action, pending] = useActionState(createRoadmap, undefined);

  return (
    <form action={action} className="panel panel-raised accent-top space-y-4 p-5">
      <FormBanner state={state} />

      <Field label="Title" htmlFor="title" errors={state?.errors?.title}>
        <Input id="title" name="title" required placeholder="e.g. Frontend Engineer roadmap" />
      </Field>

      <Field
        label="Goal"
        htmlFor="goal"
        hint="The job or capability you are aiming for. Shown on your public page."
        errors={state?.errors?.goal}
      >
        <Input id="goal" name="goal" placeholder="e.g. Frontend Engineer at a product company" />
      </Field>

      <Field label="Description" htmlFor="description" errors={state?.errors?.description}>
        <Textarea
          id="description"
          name="description"
          placeholder="Why this roadmap, and what 'done' looks like for you."
        />
      </Field>

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create roadmap"}
        </Button>
        <ButtonLink href="/roadmaps" variant="ghost" size="md">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
