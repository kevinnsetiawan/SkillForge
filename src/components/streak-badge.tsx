import { FlameIcon } from "./icons";
import type { Streak } from "@/lib/progress";
import { cn } from "@/lib/utils";

/** Compact streak indicator for page headers. */
export function StreakBadge({ streak }: { streak: Streak }) {
  const active = streak.current > 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        active
          ? "border-ember-500/40 bg-ember-500/10 text-ember-300"
          : "border-ink-700 bg-ink-800 text-ink-500",
      )}
      title={
        active
          ? `${streak.current}-day streak · longest ${streak.longest} days`
          : "No active streak. Log an entry to start one."
      }
    >
      <FlameIcon className="size-3.5" />
      <span className="tabular-nums">{streak.current}</span>
      <span className="text-[10px] opacity-80">day streak</span>
    </span>
  );
}
