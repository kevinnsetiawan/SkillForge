"use client";

import { useState } from "react";

import { deleteRoadmap, duplicateRoadmap } from "@/lib/actions/roadmaps";
import { Button } from "@/components/ui/button";

/** Duplicates the whole module/topic tree, but resets all progress. */
export function DuplicateRoadmapButton({ roadmapId }: { roadmapId: string }) {
  return (
    <form action={duplicateRoadmap}>
      <input type="hidden" name="roadmapId" value={roadmapId} />
      <Button type="submit" variant="secondary" size="sm">
        Duplicate
      </Button>
    </form>
  );
}

/**
 * Deleting a roadmap cascades to its modules, topics and journal entries, so it
 * requires a typed confirmation rather than a single click.
 */
export function DeleteRoadmapButton({ roadmapId, title }: { roadmapId: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [phrase, setPhrase] = useState("");

  if (!confirming) {
    return (
      <Button type="button" variant="danger" size="sm" onClick={() => setConfirming(true)}>
        Delete roadmap
      </Button>
    );
  }

  return (
    <div className="w-full space-y-3 rounded-xl border border-red-500/40 bg-red-500/5 p-4">
      <p className="text-xs leading-relaxed text-red-200">
        This permanently deletes <strong>{title}</strong> along with every module, topic and journal entry
        inside it. Type the roadmap title to confirm.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={phrase}
          onChange={(event) => setPhrase(event.target.value)}
          placeholder={title}
          aria-label="Roadmap title to confirm deletion"
          className="h-9 min-w-56 flex-1 rounded-lg border border-ink-600 bg-ink-900 px-3 text-sm text-ink-100 placeholder:text-ink-500 focus:border-red-500 focus:outline-none"
        />
        <Button type="button" size="sm" variant="ghost" onClick={() => setConfirming(false)}>
          Cancel
        </Button>

        {phrase === title ? (
          <form action={deleteRoadmap}>
            <input type="hidden" name="roadmapId" value={roadmapId} />
            <Button type="submit" variant="danger" size="sm">
              Delete permanently
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
