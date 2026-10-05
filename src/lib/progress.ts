import { addDays, daysBetween, dayKey, parseDayKey } from "./utils";

export type StatusCounts = {
  LOCKED: number;
  IN_PROGRESS: number;
  COMPLETED: number;
};

export type Progress = StatusCounts & {
  total: number;
  /** Integer 0-100. A roadmap with no topics yet reads as 0. */
  percent: number;
  isComplete: boolean;
};

export const EMPTY_PROGRESS: Progress = {
  LOCKED: 0,
  IN_PROGRESS: 0,
  COMPLETED: 0,
  total: 0,
  percent: 0,
  isComplete: false,
};

/**
 * Total completion of a set of topics, expressed as a whole percentage.
 * Deliberately counts only COMPLETED so "in progress" never inflates the bar.
 */
export function computeProgress(statuses: readonly string[]): Progress {
  let locked = 0;
  let inProgress = 0;
  let completed = 0;

  for (const status of statuses) {
    if (status === "COMPLETED") completed++;
    else if (status === "IN_PROGRESS") inProgress++;
    else locked++;
  }

  const total = statuses.length;

  return {
    LOCKED: locked,
    IN_PROGRESS: inProgress,
    COMPLETED: completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    isComplete: total > 0 && completed === total,
  };
}

/** Add per-module breakdowns up into a single roadmap-level summary. */
export function mergeProgress(groups: readonly Progress[]): Progress {
  const totals: StatusCounts = { LOCKED: 0, IN_PROGRESS: 0, COMPLETED: 0 };

  for (const group of groups) {
    totals.LOCKED += group.LOCKED;
    totals.IN_PROGRESS += group.IN_PROGRESS;
    totals.COMPLETED += group.COMPLETED;
  }

  const total = totals.LOCKED + totals.IN_PROGRESS + totals.COMPLETED;

  return {
    ...totals,
    total,
    percent: total === 0 ? 0 : Math.round((totals.COMPLETED / total) * 100),
    isComplete: total > 0 && totals.COMPLETED === total,
  };
}

export type Streak = {
  /** Consecutive active days ending today or yesterday. 0 means the streak broke. */
  current: number;
  /** Longest run of consecutive active days ever recorded. */
  longest: number;
  /** How many distinct days have activity at all. */
  totalDays: number;
  /** True when today already has activity, so the streak is safe today. */
  activeToday: boolean;
  /** True when the current streak is alive but today's work is not done yet. */
  atRisk: boolean;
  lastActiveDay: Date | null;
};

/**
 * Derive current and longest streaks from the learner's active days.
 *
 * A streak survives if the learner was active yesterday but not yet today, so
 * "current" anchors on today when present and otherwise on yesterday. Anything
 * older than yesterday means the chain is broken and the streak reads 0.
 */
export function computeStreak(activeDays: readonly Date[], now: Date, timeZone: string): Streak {
  if (activeDays.length === 0) {
    return { current: 0, longest: 0, totalDays: 0, activeToday: false, atRisk: true, lastActiveDay: null };
  }

  const today = parseDayKey(dayKey(now, timeZone));
  const unique = Array.from(new Set(activeDays.map((day) => day.getTime())))
    .sort((a, b) => a - b)
    .map((time) => new Date(time));

  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    run = daysBetween(unique[i - 1], unique[i]) === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  const last = unique[unique.length - 1];
  const gapToToday = daysBetween(last, today);
  const activeToday = gapToToday === 0;
  const atRisk = gapToToday === 1;

  let current = 0;
  if (activeToday || atRisk) {
    current = 1;
    for (let i = unique.length - 1; i > 0; i--) {
      if (daysBetween(unique[i - 1], unique[i]) !== 1) break;
      current++;
    }
  }

  return { current, longest, totalDays: unique.length, activeToday, atRisk, lastActiveDay: last };
}

export type HeatmapDay = { day: string; count: number };

/** Last `weeks` of activity, oldest first, for the contribution-style grid. */
export function buildHeatmap(activeDays: readonly Date[], now: Date, timeZone: string, weeks = 17): HeatmapDay[] {
  const counts = new Map<string, number>();
  for (const day of activeDays) {
    const key = dayKey(day, timeZone);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const today = parseDayKey(dayKey(now, timeZone));
  const start = addDays(today, -(weeks * 7 - 1));
  // Align the start to a Monday so columns read as whole weeks.
  const startAligned = addDays(start, -(((start.getUTCDay() + 6) % 7)));

  const cells: HeatmapDay[] = [];
  for (let cursor = startAligned; cursor <= today; cursor = addDays(cursor, 1)) {
    const key = dayKey(cursor, timeZone);
    cells.push({ day: key, count: counts.get(key) ?? 0 });
  }

  return cells;
}

export const STATUS_META = {
  LOCKED: { label: "Locked", tone: "neutral" },
  IN_PROGRESS: { label: "In Progress", tone: "active" },
  COMPLETED: { label: "Completed", tone: "done" },
} as const;

export type TopicStatus = keyof typeof STATUS_META;
