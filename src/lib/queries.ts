import "server-only";

import { db } from "./db";
import { getActiveDays } from "./activity";
import { appTimeZone, topicResourceUrl } from "./utils";
import { buildHeatmap, computeProgress, computeStreak, mergeProgress, type Progress, type Streak } from "./progress";

const topicOrder = [{ position: "asc" as const }, { createdAt: "asc" as const }];
const moduleOrder = [{ position: "asc" as const }, { createdAt: "asc" as const }];

export type RoadmapSummary = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  goal: string | null;
  isPublished: boolean;
  updatedAt: Date;
  progress: Progress;
};

/** Every roadmap the learner owns, with its live completion percentage. */
export async function getRoadmapSummaries(userId: string): Promise<RoadmapSummary[]> {
  const roadmaps = await db.roadmap.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    include: {
      modules: {
        orderBy: moduleOrder,
        include: { topics: { orderBy: topicOrder, select: { id: true, status: true, entries: { select: { id: true } } } } },
      },
    },
  });

  return roadmaps.map((roadmap) => ({
    id: roadmap.id,
    title: roadmap.title,
    slug: roadmap.slug,
    description: roadmap.description,
    goal: roadmap.goal,
    isPublished: roadmap.isPublished,
    updatedAt: roadmap.updatedAt,
    progress: mergeProgress(roadmap.modules.map((m) => computeProgress(m.topics.map((t) => t.status)))),
  }));
}

export type RoadmapTree = Awaited<ReturnType<typeof getRoadmap>>;

/** Full module/topic tree for the roadmap manager, scoped to the owner. */
export async function getRoadmap(roadmapId: string, userId: string) {
  const roadmap = await db.roadmap.findFirst({
    where: { id: roadmapId, ownerId: userId },
    include: {
      modules: {
        orderBy: moduleOrder,
        include: {
          topics: {
            orderBy: topicOrder,
            include: { entries: { select: { id: true, proofUrl: true, proofLabel: true, authoredOn: true, note: true } } },
          },
        },
      },
    },
  });

  if (!roadmap) return null;

  return {
    ...roadmap,
    modules: roadmap.modules.map((module) => ({
      ...module,
      topics: module.topics.map((topic) => ({
        ...topic,
        // Older topics may have been saved before resources were required.
        resource: topicResourceUrl(topic.title, topic.resource),
      })),
    })),
  };
}

export type TopicDetail = NonNullable<Awaited<ReturnType<typeof getTopicForUser>>>;

/** A single topic with its module/roadmap context, for the journal screen. */
export async function getTopicForUser(topicId: string, userId: string) {
  const topic = await db.topic.findFirst({
    where: { id: topicId, module: { roadmap: { ownerId: userId } } },
    include: {
      entries: true,
      module: {
        include: {
          roadmap: { select: { id: true, title: true, slug: true } },
          topics: { orderBy: topicOrder, select: { id: true, title: true, status: true } },
        },
      },
    },
  });

  if (!topic) return null;

  return { ...topic, resource: topicResourceUrl(topic.title, topic.resource) };
}

export type DashboardStats = {
  streak: Streak;
  heatmap: ReturnType<typeof buildHeatmap>;
  /** Progress across every roadmap combined. */
  overall: Progress;
  topicCounts: { total: number; completed: number; inProgress: number };
  proofCount: number;
  journalCount: number;
  /** Topics the learner left mid-flight, newest activity first. */
  continueLearning: Array<{
    topicId: string;
    title: string;
    roadmapTitle: string;
    roadmapId: string;
    status: string;
  }>;
  recentProof: Array<{ label: string | null; url: string; topicTitle: string; roadmapTitle: string; authoredOn: Date }>;
};

/** Everything the dashboard needs, gathered in one pass. */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [summaries, activeDays, proof, inFlight] = await Promise.all([
    getRoadmapSummaries(userId),
    getActiveDays(userId),
    db.journalEntry.findMany({
      where: { topic: { module: { roadmap: { ownerId: userId } } } },
      orderBy: { authoredOn: "desc" },
      take: 40,
      select: {
        proofUrl: true,
        proofLabel: true,
        note: true,
        authoredOn: true,
        topic: { select: { title: true, status: true, module: { select: { roadmap: { select: { id: true, title: true } } } } } },
      },
    }),
    db.topic.findMany({
      where: {
        module: { roadmap: { ownerId: userId } },
        status: "IN_PROGRESS",
        entries: { some: {} },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        module: { select: { roadmap: { select: { id: true, title: true } } } },
      },
    }),
  ]);

  const timeZone = appTimeZone();
  const now = new Date();

  // Loaded separately rather than inside the Promise.all above because it is a
  // cheap follow-up query that depends on the roadmap ids we just fetched.
  const perModule = summaries.length
    ? await db.module.findMany({
        where: { roadmapId: { in: summaries.map((s) => s.id) } },
        select: { topics: { select: { status: true } } },
      })
    : [];

  const overall = mergeProgress(perModule.map((m) => computeProgress(m.topics.map((t) => t.status))));

  const topicCounts = {
    total: overall.total,
    completed: overall.COMPLETED,
    inProgress: overall.IN_PROGRESS,
  };

  const links = proof.filter((entry) => entry.proofUrl);

  return {
    streak: computeStreak(
      activeDays.map((d) => d.day),
      now,
      timeZone,
    ),
    heatmap: buildHeatmap(
      activeDays.map((d) => d.day),
      now,
      timeZone,
    ),
    overall,
    topicCounts,
    proofCount: links.length,
    journalCount: proof.length,
    continueLearning: inFlight.map((topic) => ({
      topicId: topic.id,
      title: topic.title,
      status: topic.status,
      roadmapId: topic.module.roadmap.id,
      roadmapTitle: topic.module.roadmap.title,
    })),
    recentProof: links.slice(0, 5).map((entry) => ({
      url: entry.proofUrl as string,
      label: entry.proofLabel,
      topicTitle: entry.topic.title,
      roadmapTitle: entry.topic.module.roadmap.title,
      authoredOn: entry.authoredOn,
    })),
  };
}

// ---------------------------------------------------------------------------
// Public portfolio (no owner scoping: these pages are intentionally public)
// ---------------------------------------------------------------------------

export type PublicProfile = {
  username: string;
  name: string | null;
  bio: string | null;
  image: string | null;
  portfolioPublic: boolean;
  roadmaps: Array<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    goal: string | null;
    isPublished: boolean;
    progress: Progress;
    /** Completed topics that carry an external proof link. */
    proofCount: number;
    /** Completed topics that have a written journal note. */
    journalled: number;
  }>;
  /** Aggregated across every published roadmap. */
  totals: {
    topics: number;
    completed: number;
    proofCount: number;
  };
};

export async function getPublicProfile(username: string): Promise<PublicProfile | null> {
  const user = await db.user.findUnique({
    where: { username },
    select: {
      username: true,
      name: true,
      bio: true,
      image: true,
      portfolioPublic: true,
      roadmaps: {
        where: { isPublished: true },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          goal: true,
          isPublished: true,
          modules: {
            orderBy: moduleOrder,
            select: {
              topics: {
                orderBy: topicOrder,
                select: { status: true, entries: { select: { note: true, proofUrl: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  const roadmaps = user.roadmaps.map((roadmap) => ({
    id: roadmap.id,
    slug: roadmap.slug,
    title: roadmap.title,
    description: roadmap.description,
    goal: roadmap.goal,
    isPublished: roadmap.isPublished,
    progress: mergeProgress(roadmap.modules.map((m) => computeProgress(m.topics.map((t) => t.status)))),
    proofCount: roadmap.modules.reduce(
      (total, m) => total + m.topics.filter((t) => t.status === "COMPLETED" && t.entries[0]?.proofUrl).length,
      0,
    ),
    journalled: roadmap.modules.reduce(
      (total, m) => total + m.topics.filter((t) => t.entries[0]?.note).length,
      0,
    ),
  }));

  return {
    username: user.username,
    name: user.name,
    bio: user.bio,
    image: user.image,
    portfolioPublic: user.portfolioPublic,
    roadmaps,
    totals: {
      topics: roadmaps.reduce((total, r) => total + r.progress.total, 0),
      completed: roadmaps.reduce((total, r) => total + r.progress.COMPLETED, 0),
      proofCount: roadmaps.reduce((total, r) => total + r.proofCount, 0),
    },
  };
}

/** A published roadmap as shown on the public portfolio page. */
export async function getPublicRoadmap(username: string, slug: string) {
  const roadmap = await db.roadmap.findFirst({
    where: { slug, isPublished: true, owner: { username, portfolioPublic: true } },
    include: {
      owner: { select: { username: true, name: true, bio: true, image: true } },
      modules: {
        orderBy: moduleOrder,
        include: {
          topics: {
            orderBy: topicOrder,
            include: { entries: { select: { note: true, proofUrl: true, proofLabel: true, authoredOn: true } } },
          },
        },
      },
    },
  });

  if (!roadmap) return null;

  return {
    ...roadmap,
    modules: roadmap.modules.map((module) => ({
      ...module,
      topics: module.topics.map((topic) => ({
        ...topic,
        resource: topicResourceUrl(topic.title, topic.resource),
      })),
    })),
    progress: mergeProgress(roadmap.modules.map((m) => computeProgress(m.topics.map((t) => t.status)))),
  };
}
