import "server-only";

import { db } from "./db";
import { dayKey, appTimeZone } from "./utils";

/**
 * Note that the learner did something today, which is what the streak counts.
 * Idempotent: the unique (userId, day) index means repeat calls on the same day
 * update the existing row instead of inflating anything.
 */
export async function recordActivity(userId: string, at: Date = new Date()) {
  const day = new Date(`${dayKey(at, appTimeZone())}T00:00:00.000Z`);

  await db.activityDay.upsert({
    where: { userId_day: { userId, day } },
    create: { userId, day },
    update: {},
  });
}

/** Every active day for a user, newest first, capped for the heatmap grid. */
export async function getActiveDays(userId: string, sinceDays = 400) {
  const since = new Date(Date.now() - sinceDays * 86_400_000);
  return db.activityDay.findMany({
    where: { userId, day: { gte: since } },
    select: { day: true },
    orderBy: { day: "desc" },
  });
}
