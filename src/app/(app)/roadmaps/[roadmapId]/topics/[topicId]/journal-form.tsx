"use client";

import { useActionState, useState } from "react";

import type { ActionState } from "@/lib/validation";
import { formatDate, inferLinkLabel } from "@/lib/utils";
import { ExternalIcon, LinkIcon } from "@/components/icons";
import { Button, Card, SectionTitle } from "@/components/ui/button";
import { Field, FormBanner, Input, Textarea } from "@/components/ui/field";

/**
 * The micro-journal + proof-of-work form. A note is meant to be 3-5 sentences
 * about what the learner actually understood, and completing a topic requires
 * at least one proof link so the public portfolio always has evidence.
 */
export function JournalForm({
  action,
  topicId,
  defaultNote,
  defaultProofUrl,
  defaultProofLabel,
  completed,
  authoredOn,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  topicId: string;
  defaultNote: string;
  defaultProofUrl: string;
  defaultProofLabel: string;
  completed: boolean;
  authoredOn: Date | null;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [proofUrl, setProofUrl] = useState(defaultProofUrl);

  const detectedLabel = inferLinkLabel(proofUrl);
  const wordCount = defaultNote.trim() ? defaultNote.trim().split(/\s+/).length : 0;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="topicId" value={topicId} />

      <Card className="space-y-4 p-5">
        <SectionTitle hint={wordCount > 0 ? `${wordCount} words` : "3–5 sentences"}>What did you learn?</SectionTitle>

        <Field
          label="Journal note"
          htmlFor="note"
          hint="Explain the concept in your own words. If you cannot, you have not finished this topic yet."
          errors={state?.errors?.note}
        >
          <Textarea
            id="note"
            name="note"
            defaultValue={defaultNote}
            required
            rows={6}
            placeholder="The core idea is… I got confused by… Next time I will…"
          />
        </Field>
      </Card>

      <Card className="space-y-4 p-5">
        <SectionTitle hint="required to complete">Proof of work</SectionTitle>

        <Field
          label="Link to your work"
          htmlFor="proofUrl"
          hint="Anything public: GitHub repo, Figma file, deployed demo, Google Drive folder, blog post."
          errors={state?.errors?.proofUrl}
        >
          <div className="flex items-center gap-2">
            <span className="text-ink-500">
              <LinkIcon className="size-4" />
            </span>
            <Input
              id="proofUrl"
              name="proofUrl"
              type="url"
              inputMode="url"
              value={proofUrl}
              onChange={(event) => setProofUrl(event.target.value)}
              placeholder="https://github.com/you/project"
            />
          </div>
        </Field>

        <Field
          label="Label"
          htmlFor="proofLabel"
          hint={detectedLabel ? `Detected: ${detectedLabel}` : "How you want it shown on your portfolio."}
          errors={state?.errors?.proofLabel}
        >
          <Input
            id="proofLabel"
            name="proofLabel"
            defaultValue={defaultProofLabel}
            placeholder={detectedLabel ?? "GitHub"}
            maxLength={40}
          />
        </Field>

        {defaultProofUrl ? (
          <a
            href={defaultProofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-ink-400 hover:text-ember-300"
          >
            Open current proof link
            <ExternalIcon className="size-2.5" />
          </a>
        ) : null}
      </Card>

      <Card className="space-y-3 p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="completed"
            defaultChecked={completed}
            className="mt-0.5 size-4 shrink-0 accent-ember-500"
          />
          <span className="text-sm text-ink-100">
            Mark this topic as completed
            <span className="mt-0.5 block text-xs text-ink-500">
              Counting it also logs today&apos;s activity, which keeps your streak alive.
            </span>
          </span>
        </label>

        <FormBanner state={state} />

        {authoredOn ? (
          <p className="text-[11px] text-ink-500">First journalled on {formatDate(authoredOn)}.</p>
        ) : null}

        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save journal"}
        </Button>
      </Card>
    </form>
  );
}
