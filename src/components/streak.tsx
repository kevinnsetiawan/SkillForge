import { FlameIcon } from "./icons";
import type { Streak } from "@/lib/progress";
import { appTimeZone, cn, dayKey } from "@/lib/utils";

/** Big streak number plus the longest streak and total active days. */
export function StreakCard({ streak }: { streak: Streak }) {
  const atRisk = streak.atRisk && streak.current > 0;

  return (
    <div className="panel panel-raised accent-top relative overflow-hidden p-5 transition duration-300 hover:border-ember-500/30">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-ink-400 uppercase">Daily streak</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="glow-ember text-4xl font-bold tracking-tight text-ink-100 tabular-nums">
              {streak.current}
            </span>
            <span className="text-sm text-ink-400">{streak.current === 1 ? "day" : "days"}</span>
          </p>
        </div>
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-xl border",
            streak.current > 0
              ? "border-ember-500/40 bg-ember-500/10 text-ember-400 shadow-[0_0_20px_-6px_var(--color-ember-500)]"
              : "border-ink-700 bg-ink-800 text-ink-500",
          )}
        >
          <FlameIcon className="size-5" />
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-ink-400">
        {streak.current === 0
          ? "Log one journal entry today to start a new streak."
          : atRisk
            ? "Your streak is alive but today is not logged yet. One entry keeps it going."
            : streak.activeToday
              ? "Today is logged. Nice work keeping the chain intact."
              : `${streak.totalDays} active day${streak.totalDays === 1 ? "" : "s"} recorded.`}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-ink-700 pt-3">
        <div>
          <dt className="text-[11px] text-ink-500">Longest</dt>
          <dd className="text-sm font-semibold text-ink-200 tabular-nums">{streak.longest} days</dd>
        </div>
        <div>
          <dt className="text-[11px] text-ink-500">Total active</dt>
          <dd className="text-sm font-semibold text-ink-200 tabular-nums">{streak.totalDays} days</dd>
        </div>
      </dl>
    </div>
  );
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const LEVELS = ["bg-ink-800 border-ink-700", "bg-ember-500/25 border-ember-500/30", "bg-ember-500/50 border-ember-500/50", "bg-ember-400 border-ember-400"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Month of a `YYYY-MM-DD` key. Uses a fixed table so labels are always 3 letters. */
function monthOf(key: string) {
  return MONTHS[new Date(`${key}T00:00:00.000Z`).getUTCMonth()];
}

/**
 * Contribution-style grid of the last few months of learning activity.
 * Columns are whole Monday-anchored weeks, so a month label goes above the
 * first column where that month actually starts.
 */
export function ActivityHeatmap({
  days,
  className,
}: {
  days: Array<{ day: string; count: number }>;
  className?: string;
}) {
  if (days.length === 0) {
    return <p className={cn("text-xs text-ink-500", className)}>No activity recorded yet.</p>;
  }

  const weeks: Array<Array<{ day: string; count: number }>> = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const today = dayKey(new Date(), appTimeZone());
  const shade = (count: number) => LEVELS[Math.min(count, LEVELS.length - 1)];

  // A month can start in the middle of a week, so scan the column for the first
  // day whose month differs from the last day of the column before it.
  const monthLabels = weeks.map((week, index) => {
    if (index === 0) return monthOf(week[0].day);

    const previous = weeks[index - 1];
    const previousMonth = monthOf(previous[previous.length - 1].day);
    const rollover = week.find((cell) => monthOf(cell.day) !== previousMonth);

    return rollover ? monthOf(rollover.day) : "";
  });

  return (
    <div className={className}>
      <div className="flex gap-2">
        <div className="flex flex-col gap-1 text-[9px] text-ink-500">
          {/* Keeps the weekday row aligned with the cells below the month labels. */}
          <span className="h-3 shrink-0" />
          {WEEKDAYS.map((label) => (
            <span key={label} className="flex h-3.5 items-center">
              {label[0]}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mask-fade-x overflow-x-auto pb-1">
            <div className="flex w-max gap-1">
              {weeks.map((week, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <span className="h-3 text-[9px] leading-none text-ink-500">{monthLabels[index]}</span>
                  {week.map((cell) => (
                    <div
                      key={cell.day}
                      title={`${cell.day}: ${cell.count} ${cell.count === 1 ? "entry" : "entries"}`}
                      className={cn(
                        "size-3.5 rounded-[4px] border transition-transform duration-150 hover:scale-125",
                        shade(cell.count),
                        cell.day === today && "ring-1 ring-ember-300 ring-offset-1 ring-offset-ink-900",
                      )}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-1.5 text-[9px] text-ink-500">
        <span>Less</span>
        {LEVELS.map((level) => (
          <span key={level} className={cn("size-2.5 rounded-[3px] border", level)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
