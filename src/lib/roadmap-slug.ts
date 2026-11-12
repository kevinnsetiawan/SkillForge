import "server-only";

import { db } from "./db";
import { slugify } from "./utils";

/**
 * Derive a slug that is free within this user's roadmaps.
 *
 * The unique key is `(ownerId, slug)`, so two users may both own a roadmap
 * called "frontend-engineer"; only collisions within one account get a suffix.
 */
export async function freeRoadmapSlug(userId: string, desired: string) {
  const base = slugify(desired);
  let candidate = base;

  for (let i = 2; i < 50; i++) {
    const taken = await db.roadmap.findUnique({
      where: { ownerId_slug: { ownerId: userId, slug: candidate } },
      select: { id: true },
    });
    if (!taken) return candidate;
    candidate = `${base}-${i}`;
  }

  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}
