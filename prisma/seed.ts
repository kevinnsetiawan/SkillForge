/**
 * Development seed.
 *
 * Creates a couple of demo accounts with a realistic roadmap so the dashboard,
 * streak heatmap and public portfolio have something to render. Safe to re-run:
 * every write is an upsert keyed on a natural unique column.
 *
 *   npm run db:seed
 */
import { PrismaClient, TopicStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

/** Demo password for every seeded account. Never use this outside dev. */
const DEMO_PASSWORD = "skillforge123";

type SeedTopic = {
  title: string;
  resource?: string;
  status: TopicStatus;
  note?: string;
  proofUrl?: string;
  proofLabel?: string;
};

type SeedModule = {
  title: string;
  topics: SeedTopic[];
};

type SeedRoadmap = {
  slug: string;
  title: string;
  description: string;
  goal: string;
  isPublished: boolean;
  modules: SeedModule[];
};

type SeedLearner = {
  username: string;
  name: string;
  email: string;
  bio: string;
  portfolioPublic: boolean;
  roadmaps: SeedRoadmap[];
};

/** Calendar days (UTC midnight) for the `back` most recent days, oldest first. */
function recentDays(back: number): Date[] {
  const today = new Date();
  return Array.from({ length: back }, (_, index) => {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    date.setUTCDate(date.getUTCDate() - (back - 1 - index));
    return date;
  });
}

const learners: SeedLearner[] = [
  {
    username: "arunabudi",
    name: "Arun Budi",
    email: "demo@skillforge.dev",
    bio: "Frontend engineer in progress. Tracking everything I build in public.",
    portfolioPublic: true,
    roadmaps: [
      {
        slug: "frontend-engineer",
        title: "Frontend Engineer",
        description:
          "Roadmap to become a job-ready frontend engineer: fundamentals, framework depth, testing, and shipping.",
        goal: "Frontend Engineer @ Tokopedia",
        isPublished: true,
        modules: [
          {
            title: "Web Fundamentals",
            topics: [
              {
                title: "How the browser parses HTML",
                resource: "https://developer.mozilla.org/en-US/docs/Web/HTML",
                status: TopicStatus.COMPLETED,
                note: "Blocking vs deferred scripts finally clicked once I drew the parse timeline.",
                proofUrl: "https://github.com/arunabudi/browser-notes",
                proofLabel: "GitHub",
              },
              {
                title: "CSS layout: flexbox vs grid",
                resource: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
                status: TopicStatus.COMPLETED,
                note: "Grid for two-dimensional layouts, flex for one. Stopped guessing and started measuring.",
                proofUrl: "https://codepen.io/arunabudi/pen/layout-lab",
                proofLabel: "CodePen",
              },
              {
                title: "HTTP caching headers",
                status: TopicStatus.IN_PROGRESS,
                note: "Still confusing about max-age vs s-maxage. Need a real experiment.",
              },
              { title: "Accessibility semantics", status: TopicStatus.LOCKED },
            ],
          },
          {
            title: "TypeScript",
            topics: [
              {
                title: "Generics and conditional types",
                status: TopicStatus.COMPLETED,
                note: "Wrote a typed `fetch` wrapper to internalise inference.",
                proofUrl: "https://github.com/arunabudi/typed-fetch",
                proofLabel: "GitHub",
              },
              {
                title: "Discriminated unions for state machines",
                status: TopicStatus.IN_PROGRESS,
                note: "Modelling topic status as a union instead of a string enum.",
              },
              { title: "Type-level tests", status: TopicStatus.LOCKED },
            ],
          },
          {
            title: "React Internals",
            topics: [
              { title: "Reconciliation and keys", status: TopicStatus.LOCKED },
              { title: "Server components vs client components", status: TopicStatus.LOCKED },
              { title: "Concurrent rendering", status: TopicStatus.LOCKED },
            ],
          },
          {
            title: "Testing & Shipping",
            topics: [
              { title: "Playwright end-to-end tests", status: TopicStatus.LOCKED },
              { title: "CI with GitHub Actions", status: TopicStatus.LOCKED },
            ],
          },
        ],
      },
      {
        slug: "design-systems",
        title: "Design Systems",
        description: "Tokens, components, and documentation for reusable UI libraries.",
        goal: "Contribute to an open source design system",
        isPublished: false,
        modules: [
          {
            title: "Foundations",
            topics: [
              { title: "Colour scales and contrast", status: TopicStatus.IN_PROGRESS },
              { title: "Spacing and type scales", status: TopicStatus.LOCKED },
            ],
          },
        ],
      },
    ],
  },
  {
    username: "siti",
    name: "Siti Nurhaliza",
    email: "siti@skillforge.dev",
    bio: "Backend learner. Sharing my Go and PostgreSQL notes.",
    portfolioPublic: true,
    roadmaps: [
      {
        slug: "backend-engineer",
        title: "Backend Engineer",
        description: "Databases, APIs, and reliability, from SQL up to distributed systems.",
        goal: "Backend Engineer @ Gojek",
        isPublished: true,
        modules: [
          {
            title: "Relational Modelling",
            topics: [
              {
                title: "Normalisation up to 3NF",
                status: TopicStatus.COMPLETED,
                note: "Modelled a booking system and deliberately left one denormalised counter.",
                proofUrl: "https://github.com/siti/booking-schema",
                proofLabel: "GitHub",
              },
              { title: "Indexing and query plans", status: TopicStatus.COMPLETED, note: "EXPLAIN ANALYZE changed my mind about composite index order." },
              { title: "Transactions and isolation levels", status: TopicStatus.IN_PROGRESS },
            ],
          },
          {
            title: "API Design",
            topics: [
              { title: "REST pagination strategies", status: TopicStatus.COMPLETED },
              { title: "Idempotency keys", status: TopicStatus.LOCKED },
            ],
          },
        ],
      },
    ],
  },
];

async function seedLearner(learner: SeedLearner, days: Date[]) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const user = await db.user.upsert({
    where: { email: learner.email },
    update: {
      name: learner.name,
      username: learner.username,
      bio: learner.bio,
      portfolioPublic: learner.portfolioPublic,
      passwordHash,
    },
    create: {
      email: learner.email,
      name: learner.name,
      username: learner.username,
      bio: learner.bio,
      portfolioPublic: learner.portfolioPublic,
      passwordHash,
    },
  });

  // Clearing only the seed user's content keeps re-runs idempotent. Cascades
  // take care of modules, topics, journals and statuses.
  await db.roadmap.deleteMany({ where: { ownerId: user.id } });
  await db.activityDay.deleteMany({ where: { userId: user.id } });

  for (const roadmap of learner.roadmaps) {
    await db.roadmap.create({
      data: {
        slug: roadmap.slug,
        title: roadmap.title,
        description: roadmap.description,
        goal: roadmap.goal,
        isPublished: roadmap.isPublished,
        ownerId: user.id,
        modules: {
          create: roadmap.modules.map((seedModule, moduleIndex) => ({
            title: seedModule.title,
            position: moduleIndex,
            topics: {
              create: seedModule.topics.map((seedTopic, topicIndex) => ({
                title: seedTopic.title,
                resource: seedTopic.resource ?? null,
                position: topicIndex,
                status: seedTopic.status,
                entries:
                  seedTopic.note === undefined
                    ? undefined
                    : {
                        create: {
                          note: seedTopic.note,
                          proofUrl: seedTopic.proofUrl ?? null,
                          proofLabel: seedTopic.proofLabel ?? null,
                          authoredOn: days[(moduleIndex + topicIndex) % days.length],
                        },
                      },
              })),
            },
          })),
        },
      },
    });
  }

  for (const day of days) {
    await db.activityDay.create({ data: { day, userId: user.id } });
  }

  return user;
}

async function main() {
  // A believable activity pattern: a recent streak plus a gap, so the heatmap
  // and streak counters have something non-trivial to render.
  const allDays = recentDays(120);

  for (const learner of learners) {
    const activity = allDays.filter((day) => {
      const index = allDays.indexOf(day);
      const inRecentStreak = index >= allDays.length - 6;
      const scattered = index % 5 === 0;
      return inRecentStreak || scattered;
    });

    const user = await seedLearner(learner, activity);
    const roadmaps = learner.roadmaps.length;

    console.log(
      `  seeded @${user.username} (${learner.email}) - ${roadmaps} roadmap(s), ${activity.length} active days`,
    );
  }

  console.log(`\nDemo accounts ready. Password for all: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });