/**
 * Small in-memory rate limiter for AI generations.
 *
 * This is intentionally dependency-free and per-instance. It stops one signed-in
 * user from hammering the AI endpoint during normal use; a multi-instance
 * deployment should back this with Redis or the platform's rate-limit service.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_GENERATIONS = 8;
const MAX_TRACKED_USERS = 1_000;

const buckets = new Map<string, number[]>();

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export function consumeGeneration(userId: string, now = Date.now()): RateLimitResult {
  const recent = (buckets.get(userId) ?? []).filter((time) => now - time < WINDOW_MS);

  if (recent.length >= MAX_GENERATIONS) {
    buckets.set(userId, recent);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((WINDOW_MS - (now - recent[0])) / 1000)),
    };
  }

  recent.push(now);
  buckets.set(userId, recent);

  // Keep the map bounded on long-running servers.
  if (buckets.size > MAX_TRACKED_USERS) {
    for (const [key, times] of buckets) {
      if (times.every((time) => now - time >= WINDOW_MS)) buckets.delete(key);
    }
  }

  return { allowed: true };
}
