"use client";

import { useTransition } from "react";

import { reorderNodes } from "@/lib/actions/structure";
import { ArrowDownIcon, ArrowUpIcon } from "./icons";
import { IconButton } from "./ui/button";

/**
 * Up / down reorder for modules or topics.
 *
 * The client sends the complete post-move id list rather than a delta, so the
 * server applies one idempotent write instead of trying to shift rows itself.
 * Moving a node updates every sibling's position, which keeps `position` dense
 * and avoids ties when two items are swapped.
 */
export function ReorderControls({
  ids,
  parentId,
  scope,
  index,
  total,
  labels = {},
}: {
  ids: string[];
  parentId: string;
  scope: "module" | "topic";
  index: number;
  total: number;
  labels?: { up?: string; down?: string };
}) {
  const [pending, startTransition] = useTransition();

  const move = (direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= total) return;

    const next = [...ids];
    [next[index], next[target]] = [next[target], next[index]];

    const formData = new FormData();
    formData.set("parentId", parentId);
    formData.set("scope", scope);
    for (const id of next) formData.append("ids", id);

    startTransition(async () => {
      await reorderNodes(undefined, formData);
    });
  };

  const canMoveUp = index > 0;
  const canMoveDown = index < total - 1;

  if (!canMoveUp && !canMoveDown) return <span className="inline-block w-14" aria-hidden />;

  return (
    <span className="inline-flex w-14 justify-end gap-1" aria-busy={pending}>
      <IconButton
        label={labels.up ?? "Move up"}
        disabled={!canMoveUp || pending}
        onClick={() => move(-1)}
      >
        <ArrowUpIcon />
      </IconButton>
      <IconButton
        label={labels.down ?? "Move down"}
        disabled={!canMoveDown || pending}
        onClick={() => move(1)}
      >
        <ArrowDownIcon />
      </IconButton>
    </span>
  );
}
