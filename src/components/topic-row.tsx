"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";

import { deleteTopic, updateTopic } from "@/lib/actions/structure";
import { setTopicStatus } from "@/lib/actions/journal";
import type { ActionState } from "@/lib/validation";
import { StatusDot } from "./progress";
import { ReorderControls } from "./reorder-controls";
import { ExternalIcon, JournalIcon, LinkIcon, TrashIcon } from "./icons";
import { Button, IconButton } from "./ui/button";
import { Input } from "./ui/field";

type TopicData = {
  id: string;
  title: string;
  resource: string | null;
  status: "LOCKED" | "IN_PROGRESS" | "COMPLETED";
  entries: Array<{ id: string; proofUrl: string | null; proofLabel: string | null; authoredOn: Date; note: string }>;
};

/** Cycles a topic through Locked -> In progress -> Completed -> Locked. */
const NEXT_STATUS = {
  LOCKED: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
  COMPLETED: "LOCKED",
} as const;

const ADVANCE_LABEL = {
  LOCKED: "Start this topic",
  IN_PROGRESS: "Mark completed",
  COMPLETED: "Reset to locked",
} as const;

export function TopicRow({
  topic,
  index,
  total,
  topicIds,
  moduleId,
  roadmapId,
}: {
  topic: TopicData;
  index: number;
  total: number;
  topicIds: string[];
  moduleId: string;
  roadmapId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [statusPending, startStatus] = useTransition();

  const [editState, editAction, editPending] = useActionState<ActionState, FormData>(updateTopic, undefined);

  const entry = topic.entries[0];
  const hasProof = Boolean(entry?.proofUrl);
  const next = NEXT_STATUS[topic.status];
  const journalHref = `/roadmaps/${roadmapId}/topics/${topic.id}`;

  function cycleStatus() {
    const formData = new FormData();
    formData.set("topicId", topic.id);
    formData.set("status", next);
    startStatus(async () => {
      await setTopicStatus(undefined, formData);
    });
  }

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-2.5 transition hover:bg-ink-850/40">
      <StatusDot status={topic.status} />

      <div className="min-w-40 flex-1">
        {editing ? (
          <form action={editAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="topicId" value={topic.id} />
            <Input
              name="title"
              defaultValue={topic.title}
              autoFocus
              aria-label="Topic title"
              className="h-8 max-w-sm py-0 text-sm"
            />
            <Input
              name="resource"
              type="url"
              required
              defaultValue={topic.resource ?? ""}
              placeholder="Resource link"
              aria-label="Resource link"
              className="h-8 max-w-xs py-0 text-sm"
            />
            <Button type="submit" size="sm" disabled={editPending}>
              Save
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            {editState?.errors?.title ? (
              <p className="w-full text-xs text-red-300">{editState.errors.title[0]}</p>
            ) : null}
            {editState?.errors?.resource ? (
              <p className="w-full text-xs text-red-300">{editState.errors.resource[0]}</p>
            ) : null}
          </form>
        ) : (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href={journalHref} className="text-sm text-ink-100 hover:text-ember-300">
              {topic.title}
            </Link>

            {topic.resource ? (
              <a
                href={topic.resource}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-ink-400 hover:text-ember-300"
              >
                <LinkIcon className="size-3" />
                resource
                <ExternalIcon className="size-2.5" />
              </a>
            ) : null}

            {entry ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-ink-500">
                <JournalIcon className="size-3" />
                {hasProof ? "journalled + proof" : "journalled"}
              </span>
            ) : null}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={cycleStatus}
          disabled={statusPending}
          title={ADVANCE_LABEL[topic.status]}
        >
          {next === "IN_PROGRESS" ? "Start" : next === "COMPLETED" ? "Complete" : "Reset"}
        </Button>

        <Link
          href={journalHref}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-600 bg-ink-800 px-3 text-xs font-medium text-ink-100 transition hover:border-ink-500 hover:bg-ink-700"
        >
          <JournalIcon className="size-3.5" />
          Journal
        </Link>

        <ReorderControls
          ids={topicIds}
          parentId={moduleId}
          scope="topic"
          index={index}
          total={total}
          labels={{ up: "Move topic up", down: "Move topic down" }}
        />

        <IconButton label="Edit topic" onClick={() => setEditing((open) => !open)}>
          <svg viewBox="0 0 24 24" fill="none" className="size-3.5" aria-hidden>
            <path
              d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </IconButton>

        <form action={deleteTopic}>
          <input type="hidden" name="topicId" value={topic.id} />
          <button
            type="submit"
            title="Delete topic"
            aria-label="Delete topic"
            className="inline-flex size-7 items-center justify-center rounded-md border border-ink-700 bg-ink-800/80 text-ink-300 transition hover:border-red-500/50 hover:text-red-300"
          >
            <TrashIcon className="size-3.5" />
          </button>
        </form>
      </div>
    </li>
  );
}
