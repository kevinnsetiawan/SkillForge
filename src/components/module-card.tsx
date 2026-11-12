"use client";

import { useActionState, useState } from "react";

import { createTopic, deleteModule, renameModule } from "@/lib/actions/structure";
import type { ActionState } from "@/lib/validation";
import { computeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { ProgressBar } from "./progress";
import { ReorderControls } from "./reorder-controls";
import { PlusIcon, TrashIcon } from "./icons";
import { Button, IconButton } from "./ui/button";
import { FormBanner, Input } from "./ui/field";
import { TopicRow } from "./topic-row";

export type ModuleCardData = {
  id: string;
  title: string;
  topics: Array<{
    id: string;
    title: string;
    resource: string | null;
    status: "LOCKED" | "IN_PROGRESS" | "COMPLETED";
    entries: Array<{ id: string; proofUrl: string | null; proofLabel: string | null; authoredOn: Date; note: string }>;
  }>;
};

export function ModuleCard({
  module,
  index,
  total,
  roadmapId,
  moduleIds,
}: {
  module: ModuleCardData;
  index: number;
  total: number;
  roadmapId: string;
  moduleIds: string[];
}) {
  const [adding, setAdding] = useState(false);
  const [renaming, setRenaming] = useState(false);

  const progress = computeProgress(module.topics.map((t) => t.status));
  const topicIds = module.topics.map((t) => t.id);

  // Left rail colour tells you the state of the module at a glance.
  const rail = progress.isComplete
    ? "bg-linear-to-b from-mint-400 to-mint-500/40"
    : progress.IN_PROGRESS > 0
      ? "bg-linear-to-b from-ember-400 to-ember-600/30"
      : "bg-linear-to-b from-ink-500 to-ink-700";

  const [topicState, topicAction, topicPending] = useActionState<ActionState, FormData>(createTopic, undefined);
  const [renameState, renameAction, renamePending] = useActionState<ActionState, FormData>(renameModule, undefined);

  return (
    <section className="panel panel-raised animate-rise relative overflow-hidden">
      <span className={cn("absolute inset-y-0 left-0 w-0.5", rail)} aria-hidden />

      <header className="flex flex-wrap items-center gap-3 border-b border-ink-700 bg-ink-850/60 py-3 pl-5 pr-4">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-ink-600 bg-ink-800 text-xs font-semibold text-ink-300">
          {index + 1}
        </span>

        <div className="min-w-40 flex-1">
          {renaming ? (
            <form action={renameAction} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="moduleId" value={module.id} />
              <Input
                name="title"
                defaultValue={module.title}
                autoFocus
                aria-label="Module title"
                className="h-8 max-w-xs py-0 text-sm"
              />
              <Button type="submit" size="sm" disabled={renamePending}>
                Save
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setRenaming(false)}>
                Cancel
              </Button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setRenaming(true)}
              title="Rename module"
              className="truncate text-left text-sm font-semibold text-ink-100 hover:text-ember-300"
            >
              {module.title}
            </button>
          )}

          <div className="mt-1.5 flex items-center gap-2">
            <ProgressBar
              percent={progress.percent}
              tone={progress.isComplete ? "mint" : "ember"}
              className="max-w-48"
              label={`${module.title} progress`}
            />
            <span className="text-[11px] whitespace-nowrap text-ink-400 tabular-nums">
              {progress.COMPLETED}/{progress.total} · {progress.percent}%
            </span>
          </div>
        </div>

        <ReorderControls
          ids={moduleIds}
          parentId={roadmapId}
          scope="module"
          index={index}
          total={total}
          labels={{ up: "Move module up", down: "Move module down" }}
        />

        <div className="flex items-center gap-1">
          <IconButton label="Rename module" onClick={() => setRenaming(true)}>
            <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden>
              <path
                d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </IconButton>

          <form action={deleteModule}>
            <input type="hidden" name="moduleId" value={module.id} />
            <button
              type="submit"
              title="Delete module"
              aria-label="Delete module"
              className="inline-flex size-7 items-center justify-center rounded-md border border-ink-700 bg-ink-800/80 text-ink-300 transition hover:border-red-500/50 hover:text-red-300"
            >
              <TrashIcon className="size-3.5" />
            </button>
          </form>

          <Button type="button" size="sm" variant="secondary" onClick={() => setAdding((open) => !open)}>
            <PlusIcon className="size-3.5" />
            Topic
          </Button>
        </div>
      </header>

      {renaming ? (
        <div className="border-b border-ink-700 px-4 pt-3">
          <FormBanner
            state={
              renameState?.errors?.title
                ? { ok: false, message: renameState.errors.title[0] }
                : renameState?.message
                  ? { ok: renameState.ok, message: renameState.message }
                  : undefined
            }
          />
        </div>
      ) : null}

      {adding ? (
        <form
          action={topicAction}
          className="flex flex-wrap items-end gap-2 border-b border-ink-700 bg-ink-900/40 px-4 py-3"
        >
          <input type="hidden" name="moduleId" value={module.id} />

          <div className="min-w-52 flex-1">
            <label htmlFor={`topic-title-${module.id}`} className="mb-1 block text-[11px] text-ink-400">
              Topic title
            </label>
            <Input id={`topic-title-${module.id}`} name="title" placeholder="e.g. React Server Components" required />
          </div>

          <div className="min-w-52 flex-1">
            <label htmlFor={`topic-resource-${module.id}`} className="mb-1 block text-[11px] text-ink-400">
              Resource link
            </label>
            <Input
              id={`topic-resource-${module.id}`}
              name="resource"
              type="url"
              required
              placeholder="https://..."
            />
          </div>

          <Button type="submit" size="sm" disabled={topicPending}>
            Add topic
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>
            Cancel
          </Button>

          {topicState?.errors?.title ? (
            <p className="w-full text-xs text-red-300">{topicState.errors.title[0]}</p>
          ) : null}
          {topicState?.errors?.resource ? (
            <p className="w-full text-xs text-red-300">{topicState.errors.resource[0]}</p>
          ) : null}
        </form>
      ) : null}

      {module.topics.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-ink-500">
          No topics yet. Add the first step of this module.
        </p>
      ) : (
        <ul className="divide-y divide-ink-800">
          {module.topics.map((topic, topicIndex) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              index={topicIndex}
              total={module.topics.length}
              topicIds={topicIds}
              moduleId={module.id}
              roadmapId={roadmapId}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
