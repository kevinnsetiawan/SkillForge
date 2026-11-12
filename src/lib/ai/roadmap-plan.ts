import { z } from "zod";

import { isSafeExternalUrl, topicSearchUrl } from "@/lib/utils";

/**
 * The AI generator is deliberately provider-agnostic: the model only has to
 * return this small JSON shape, and everything is re-validated here before it
 * reaches the database.
 */

export const LEARNING_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type LearningLevel = (typeof LEARNING_LEVELS)[number];

export const aiRoadmapRequestSchema = z.object({
  topic: z
    .string()
    .trim()
    .min(3, "Tell us what you want to learn (at least 3 characters).")
    .max(160, "Keep the topic under 160 characters."),
  level: z.enum(LEARNING_LEVELS).default("beginner"),
  goal: z
    .string()
    .trim()
    .max(160, "Goal is limited to 160 characters.")
    .optional()
    .or(z.literal("")),
});

export type AiRoadmapRequest = z.infer<typeof aiRoadmapRequestSchema>;

export const PLAN_LIMITS = {
  modules: 8,
  topicsPerModule: 10,
  totalTopics: 50,
  title: 80,
  description: 500,
  goal: 120,
  moduleTitle: 80,
  topicTitle: 120,
  resource: 300,
} as const;

export type RoadmapPlanTopic = {
  title: string;
  /** Always a safe http(s) URL so no generated topic is left without a link. */
  resource: string;
};

export type RoadmapPlanModule = {
  title: string;
  topics: RoadmapPlanTopic[];
};

export type RoadmapPlan = {
  title: string;
  description: string;
  goal: string;
  modules: RoadmapPlanModule[];
};

export class RoadmapPlanError extends Error {
  constructor(message = "The AI returned a roadmap we could not read. Please try again.") {
    super(message);
    this.name = "RoadmapPlanError";
  }
}

/** Collapse whitespace so model output cannot smuggle in huge blank blocks. */
function text(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

/**
 * Models occasionally wrap the payload (`{ "roadmap": ... }`) or return a bare
 * array of modules. Normalise all of those into one object.
 */
function unwrapPlan(value: unknown): Record<string, unknown> {
  const record = asRecord(value);
  if (!record) {
    if (Array.isArray(value)) return { modules: value };
    throw new RoadmapPlanError();
  }

  for (const key of ["roadmap", "plan", "data"]) {
    const nested = asRecord(record[key]);
    if (nested) return nested;
  }

  return record;
}

/** Accept plain JSON, fenced JSON, or JSON surrounded by a short explanation. */
function extractJson(raw: string): unknown {
  const source = raw.trim();
  if (!source) throw new RoadmapPlanError();

  try {
    return JSON.parse(source);
  } catch {
    // Fall through to the more forgiving extraction below.
  }

  const fenced = source.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      // Fall through again.
    }
  }

  const objectStart = source.indexOf("{");
  const arrayStart = source.indexOf("[");
  const starts = [objectStart, arrayStart].filter((index) => index >= 0);
  if (starts.length === 0) throw new RoadmapPlanError();

  const start = Math.min(...starts);
  const end = Math.max(source.lastIndexOf("}"), source.lastIndexOf("]"));
  if (end <= start) throw new RoadmapPlanError();

  try {
    return JSON.parse(source.slice(start, end + 1));
  } catch {
    throw new RoadmapPlanError();
  }
}

/**
 * Keep only links the app is willing to render as an href. A model that invents
 * a URL falls back to a search link instead of a broken or unsafe one.
 */
function normalizeResource(value: unknown, title: string): string {
  if (typeof value === "string") {
    const raw = value.trim();

    if (raw) {
      const match = raw.match(/https?:\/\/[^\s<>"')\]]+/i);
      const candidate = (match?.[0] ?? raw).replace(/[.,;:]+$/, "");

      if (candidate.length <= PLAN_LIMITS.resource && isSafeExternalUrl(candidate)) {
        return candidate;
      }
    }
  }

  return topicSearchUrl(title);
}

function topicFrom(value: unknown): RoadmapPlanTopic | null {
  if (typeof value === "string") {
    const title = text(value, PLAN_LIMITS.topicTitle);
    return title.length >= 2 ? { title, resource: topicSearchUrl(title) } : null;
  }

  const record = asRecord(value);
  if (!record) return null;

  const title = text(record.title ?? record.name ?? record.topic, PLAN_LIMITS.topicTitle);
  if (title.length < 2) return null;

  return {
    title,
    resource: normalizeResource(record.resource ?? record.link ?? record.url, title),
  };
}

function moduleTopics(module: Record<string, unknown>): unknown[] {
  if (Array.isArray(module.topics)) return module.topics;
  if (Array.isArray(module.items)) return module.items;
  if (Array.isArray(module.lessons)) return module.lessons;
  return [];
}

/**
 * Parse and clean model output. Returns only a plan that is safe to render and
 * to persist: bounded counts, trimmed text, and http(s)-only resources.
 */
export function parseRoadmapPlan(
  raw: string,
  fallback: { topic?: string; goal?: string } = {},
): RoadmapPlan {
  const root = unwrapPlan(extractJson(raw));

  const title =
    text(root.title, PLAN_LIMITS.title) ||
    text(fallback.topic, PLAN_LIMITS.title) ||
    "My learning roadmap";
  const description = text(root.description, PLAN_LIMITS.description);
  const goal = text(root.goal, PLAN_LIMITS.goal) || text(fallback.goal, PLAN_LIMITS.goal);

  const rawModules = Array.isArray(root.modules) ? root.modules : [];
  const seenModules = new Set<string>();
  const seenTopics = new Set<string>();
  const modules: RoadmapPlanModule[] = [];
  let totalTopics = 0;

  for (const rawModule of rawModules) {
    if (modules.length >= PLAN_LIMITS.modules) break;
    if (totalTopics >= PLAN_LIMITS.totalTopics) break;

    const moduleRecord = asRecord(rawModule);
    if (!moduleRecord) continue;

    const moduleTitle = text(moduleRecord.title, PLAN_LIMITS.moduleTitle);
    if (moduleTitle.length < 2) continue;

    const moduleKey = moduleTitle.toLowerCase();
    if (seenModules.has(moduleKey)) continue;
    seenModules.add(moduleKey);

    const topics: RoadmapPlanTopic[] = [];

    for (const rawTopic of moduleTopics(moduleRecord)) {
      if (topics.length >= PLAN_LIMITS.topicsPerModule) break;
      if (totalTopics >= PLAN_LIMITS.totalTopics) break;

      const topic = topicFrom(rawTopic);
      if (!topic) continue;

      const topicKey = topic.title.toLowerCase();
      if (seenTopics.has(topicKey)) continue;
      seenTopics.add(topicKey);
      topics.push(topic);
      totalTopics += 1;
    }

    // A module with no usable topics would render as an empty card, so drop it.
    if (topics.length > 0) {
      modules.push({ title: moduleTitle, topics });
    }
  }

  if (modules.length === 0) {
    throw new RoadmapPlanError("The AI did not produce any usable modules. Please try a more specific topic.");
  }

  return { title, description, goal, modules };
}

const LEVEL_LABELS: Record<LearningLevel, string> = {
  beginner: "Beginner - starting from zero",
  intermediate: "Intermediate - knows the basics",
  advanced: "Advanced - wants depth and specialisation",
};

export const ROADMAP_SYSTEM_PROMPT = [
  "You are SkillForge's curriculum designer.",
  "You turn a learner's goal into a practical, ordered learning roadmap.",
  "You always reply with a single JSON object and nothing else.",
].join(" ");

export function buildRoadmapPrompt(request: AiRoadmapRequest): string {
  const goalLine = request.goal
    ? `Target goal: ${request.goal}`
    : "Target goal: not specified";

  return [
    "Design a learning roadmap for this learner.",
    "",
    `What they want to learn: ${request.topic}`,
    `Current level: ${LEVEL_LABELS[request.level]}`,
    goalLine,
    "",
    "Return JSON with exactly this shape:",
    "{",
    '  "title": "...",',
    '  "description": "...",',
    '  "goal": "...",',
    '  "modules": [',
    '    { "title": "...", "topics": [ { "title": "...", "resource": "https://..." } ] }',
    "  ]",
    "}",
    "",
    "Rules:",
    "- 4-7 modules, each with 3-7 topics (18-40 topics total).",
    "- Order modules as milestones: foundations -> core concepts -> projects -> advanced/specialisation.",
    "- Each topic must be a specific, actionable thing to study or build, not a vague category.",
    "- `resource` is required for every topic. Prefer one stable, well-known URL (official docs, MDN, freeCodeCamp, roadmap.sh, a YouTube playlist).",
    "- Never invent a deep link. If you cannot name a specific page, use a search URL like `https://www.google.com/search?q=<topic>`.",
    "- Never return null, an empty string, or a made-up URL for `resource`.",
    "- `title` max 80 chars, `description` 1-2 sentences max 500 chars, `goal` max 120 chars.",
    "- Write the title, description, goal and every module/topic in the same language as the learner's topic.",
    "- No duplicate topics. No markdown. JSON only.",
  ].join("\n");
}
