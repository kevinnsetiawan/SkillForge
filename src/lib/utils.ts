/** Merge conditional class names. Keeps Tailwind usage readable. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Turn a title into a URL-safe slug. Non-latin characters are stripped, so a
 * fully non-latin title falls back to a random suffix instead of an empty slug.
 */
export function slugify(input: string): string {
  const base = input
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  if (base.length >= 2) return base;
  return `item-${Math.random().toString(36).slice(2, 8)}`;
}

/** Reserved public URLs that a username or roadmap slug may not take. */
const RESERVED = new Set([
  "api",
  "p",
  "dashboard",
  "roadmaps",
  "login",
  "register",
  "settings",
  "signin",
  "signup",
  "signout",
  "about",
  "admin",
  "static",
  "_next",
  "help",
  "support",
  "terms",
  "privacy",
]);

export function isReserved(value: string) {
  return RESERVED.has(value.toLowerCase());
}

/**
 * Usernames appear in a public URL, so keep them short and unambiguous:
 * 3-30 characters, no leading or trailing dash/underscore.
 */
export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_-]{1,28}[a-z0-9]$/;
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;

export function isValidUsername(value: string) {
  return USERNAME_PATTERN.test(value) && !isReserved(value);
}

const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

/**
 * Resolve a Date to a `YYYY-MM-DD` string in the given IANA timezone.
 * Using `en-CA` gives ISO-like ordering which is exactly what we want for keys.
 */
export function dayKey(date: Date, timeZone: string): string {
  let formatter = dateFormatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    dateFormatterCache.set(timeZone, formatter);
  }
  return formatter.format(date);
}

/** Parse a stored `YYYY-MM-DD` day key into a UTC-midnight Date. */
export function parseDayKey(key: string | Date): Date {
  if (key instanceof Date) return key;
  return new Date(`${key}T00:00:00.000Z`);
}

const DAY_MS = 86_400_000;

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getTime() + amount * DAY_MS);
}

/** Whole-day difference between two day keys, ignoring time of day. */
export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

const longDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function formatDate(date: Date | string): string {
  return longDateFormatter.format(new Date(date));
}

export function formatDayKey(day: Date): string {
  return shortDateFormatter.format(day);
}

export function formatRelativeDay(day: Date, now: Date): string {
  const diff = daysBetween(day, now);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} week${diff < 14 ? "" : "s"} ago`;
  return formatDate(day);
}

/** Only allow http(s) so a journal entry cannot inject `javascript:` links. */
export function isSafeExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** A guaranteed-working search link for a topic that has no usable resource. */
export function topicSearchUrl(title: string): string {
  const query = title.slice(0, 90).trim() || "learning resources";
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/**
 * Resolve a topic's study link. Topics saved before resources were required (or
 * with an invalid URL) fall back to a search link so every topic stays clickable.
 */
export function topicResourceUrl(title: string, resource: string | null | undefined): string {
  const raw = resource?.trim();
  if (raw && raw.length <= 300 && isSafeExternalUrl(raw)) return raw;
  return topicSearchUrl(title);
}

/** Guess a friendly label for a proof-of-work link from its host. */
export function inferLinkLabel(value: string): string | null {
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    const known: Record<string, string> = {
      "github.com": "GitHub",
      "gitlab.com": "GitLab",
      "figma.com": "Figma",
      "drive.google.com": "Google Drive",
      "docs.google.com": "Google Docs",
      "notion.so": "Notion",
      "vercel.com": "Vercel",
      "netlify.app": "Netlify",
      "youtube.com": "YouTube",
      "youtu.be": "YouTube",
      "medium.com": "Medium",
      "codepen.io": "CodePen",
      "stackoverflow.com": "Stack Overflow",
      "leetcode.com": "LeetCode",
      "excalidraw.com": "Excalidraw",
    };
    if (known[host]) return known[host];
    const parts = host.split(".");
    const root = parts[parts.length - 2];
    if (!root || parts.length < 2) return host;
    return root.charAt(0).toUpperCase() + root.slice(1);
  } catch {
    return null;
  }
}

export function appTimeZone(): string {
  return process.env.APP_TIMEZONE || "Asia/Jakarta";
}
