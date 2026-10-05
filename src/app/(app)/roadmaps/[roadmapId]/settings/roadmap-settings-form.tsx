"use client";

import { useActionState, useState } from "react";

import type { ActionState } from "@/lib/validation";
import { slugify } from "@/lib/utils";
import { Button, Card, SectionTitle } from "@/components/ui/button";
import { Field, FormBanner, Input, Textarea } from "@/components/ui/field";

type RoadmapRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  goal: string | null;
  isPublished: boolean;
};

export function RoadmapSettingsForm({
  action,
  roadmap,
  username,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  roadmap: RoadmapRow;
  username: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [title, setTitle] = useState(roadmap.title);
  const [slug, setSlug] = useState(roadmap.slug);
  // Only auto-fill the slug while the user has not edited it themselves.
  const [slugTouched, setSlugTouched] = useState(false);

  const publicUrl = `/p/${username}/${slug}`;

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="roadmapId" value={roadmap.id} />

      <Card className="space-y-4 p-5">
        <SectionTitle>Details</SectionTitle>

        <Field label="Title" htmlFor="title" errors={state?.errors?.title}>
          <Input
            id="title"
            name="title"
            required
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
          />
        </Field>

        <Field label="Goal" htmlFor="goal" errors={state?.errors?.goal}>
          <Input id="goal" name="goal" defaultValue={roadmap.goal ?? ""} />
        </Field>

        <Field label="Description" htmlFor="description" errors={state?.errors?.description}>
          <Textarea id="description" name="description" defaultValue={roadmap.description ?? ""} />
        </Field>
      </Card>

      <Card className="space-y-4 p-5">
        <SectionTitle hint={publicUrl}>Public URL</SectionTitle>

        <Field label="Slug" htmlFor="slug" errors={state?.errors?.slug}>
          <div className="flex items-center gap-1">
            <span className="text-xs whitespace-nowrap text-ink-500">/p/{username}/</span>
            <Input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value.toLowerCase());
              }}
            />
          </div>
        </Field>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink-700 bg-ink-900/50 p-3">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={roadmap.isPublished}
            className="mt-0.5 size-4 shrink-0 accent-ember-500"
          />
          <span className="text-sm text-ink-100">
            Publish this roadmap
            <span className="mt-0.5 block text-xs text-ink-500">
              Anyone with the link can view your module tree, journal notes and proof links. Leave this off to
              keep the roadmap private.
            </span>
          </span>
        </label>

        {roadmap.isPublished ? (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-ember-400 hover:text-ember-300"
          >
            Open public page →
          </a>
        ) : null}
      </Card>

      <FormBanner state={state} />

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
