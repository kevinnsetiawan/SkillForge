/**
 * One-off backfill for topics saved before resource links were required.
 *
 * Gives every topic without a usable http(s) link a search URL for its title,
 * so the roadmap manager and topic pages never show a dead end.
 *
 *   npm run db:backfill-resources
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

function isUsableResource(value: string | null): boolean {
  if (!value) return false;

  const raw = value.trim();
  if (!raw || raw.length > 300) return false;

  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function searchUrl(title: string): string {
  const query = title.slice(0, 90).trim() || "learning resources";
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

async function main() {
  const topics = await db.topic.findMany({
    select: { id: true, title: true, resource: true },
  });
  const missing = topics.filter((topic) => !isUsableResource(topic.resource));

  if (missing.length === 0) {
    console.log("All topics already have a resource link.");
    return;
  }

  for (const topic of missing) {
    await db.topic.update({
      where: { id: topic.id },
      data: { resource: searchUrl(topic.title) },
    });
  }

  console.log(`Backfilled ${missing.length} topic(s) with a resource link.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
