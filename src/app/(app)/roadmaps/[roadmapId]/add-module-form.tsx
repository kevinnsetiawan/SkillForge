"use client";

import { useActionState } from "react";

import type { ActionState } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { FormBanner, Input } from "@/components/ui/field";

/**
 * Appends a new module to the end of the roadmap. Positions are assigned
 * server-side so a new module never disturbs the existing order.
 */
export function AddModuleForm({
  action,
  roadmapId,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  roadmapId: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="roadmapId" value={roadmapId} />

      <div className="min-w-56 flex-1">
        <label htmlFor="new-module-title" className="mb-1.5 block text-xs font-medium text-ink-300">
          Add a module
        </label>
        <Input id="new-module-title" name="title" required placeholder="e.g. Week 1–2: JavaScript fundamentals" />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add module"}
      </Button>

      {state?.errors?.title ? <p className="w-full text-xs text-red-300">{state.errors.title[0]}</p> : null}
      {state?.message ? (
        <div className="w-full">
          <FormBanner state={state} />
        </div>
      ) : null}
    </form>
  );
}
