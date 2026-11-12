import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  aiRoadmapRequestSchema,
  parseRoadmapPlan,
  RoadmapPlanError,
} from "@/lib/ai/roadmap-plan";

const validPlan = {
  title: "Belajar React",
  description: "Dari dasar sampai bisa membangun portfolio.",
  goal: "Bisa membuat aplikasi React",
  modules: [
    {
      title: "Fundamentals",
      topics: [
        { title: "JSX", resource: "https://react.dev/learn" },
        { title: "Components", resource: null },
      ],
    },
  ],
};

describe("aiRoadmapRequestSchema", () => {
  it("trims the topic and defaults the level to beginner", () => {
    const parsed = aiRoadmapRequestSchema.parse({ topic: "  React  " });

    assert.equal(parsed.topic, "React");
    assert.equal(parsed.level, "beginner");
  });

  it("rejects an empty topic", () => {
    assert.equal(aiRoadmapRequestSchema.safeParse({ topic: "   " }).success, false);
  });

  it("rejects an unknown level", () => {
    assert.equal(
      aiRoadmapRequestSchema.safeParse({ topic: "React", level: "expert" }).success,
      false,
    );
  });
});

describe("parseRoadmapPlan", () => {
  it("parses a plain JSON plan", () => {
    const plan = parseRoadmapPlan(JSON.stringify(validPlan));

    assert.equal(plan.title, "Belajar React");
    assert.equal(plan.modules.length, 1);
    assert.equal(plan.modules[0].topics[0].resource, "https://react.dev/learn");
  });

  it("extracts JSON from a markdown fence and surrounding prose", () => {
    const raw = `Here is your roadmap:\n\n\`\`\`json\n${JSON.stringify(validPlan)}\n\`\`\`\nEnjoy!`;

    assert.equal(parseRoadmapPlan(raw).modules.length, 1);
  });

  it("drops unsafe resource URLs but keeps the topic", () => {
    const plan = parseRoadmapPlan(
      JSON.stringify({
        ...validPlan,
        modules: [
          {
            title: "Module",
            topics: [{ title: "Topic", resource: "javascript:alert(1)" }],
          },
        ],
      }),
    );

    assert.equal(plan.modules[0].topics[0].title, "Topic");
    assert.equal(plan.modules[0].topics[0].resource, null);
  });

  it("keeps only the http(s) part of a markdown-style resource", () => {
    const plan = parseRoadmapPlan(
      JSON.stringify({
        ...validPlan,
        modules: [
          {
            title: "Module",
            topics: [{ title: "Docs", resource: "[MDN](https://developer.mozilla.org/)" }],
          },
        ],
      }),
    );

    assert.equal(plan.modules[0].topics[0].resource, "https://developer.mozilla.org/");
  });

  it("caps oversized plans", () => {
    const plan = parseRoadmapPlan(
      JSON.stringify({
        ...validPlan,
        modules: Array.from({ length: 20 }, (_, moduleIndex) => ({
          title: `Module ${moduleIndex}`,
          topics: Array.from({ length: 20 }, (_, topicIndex) => ({
            title: `Topic ${moduleIndex}-${topicIndex}`,
            resource: null,
          })),
        })),
      }),
    );

    assert.ok(plan.modules.length <= 8);
    assert.ok(plan.modules.reduce((total, module) => total + module.topics.length, 0) <= 50);
  });

  it("removes duplicate topics case-insensitively", () => {
    const plan = parseRoadmapPlan(
      JSON.stringify({
        ...validPlan,
        modules: [
          {
            title: "Module",
            topics: [{ title: "React" }, { title: "react" }, { title: "Hooks" }],
          },
        ],
      }),
    );

    assert.deepEqual(
      plan.modules[0].topics.map((topic) => topic.title),
      ["React", "Hooks"],
    );
  });

  it("uses fallback metadata when the model omits it", () => {
    const plan = parseRoadmapPlan(
      JSON.stringify({ modules: validPlan.modules }),
      { topic: "Belajar React", goal: "Frontend" },
    );

    assert.equal(plan.title, "Belajar React");
    assert.equal(plan.goal, "Frontend");
  });

  it("accepts a plan wrapped in a roadmap key", () => {
    const plan = parseRoadmapPlan(JSON.stringify({ roadmap: validPlan }));

    assert.equal(plan.title, "Belajar React");
  });

  it("throws a friendly error for unusable output", () => {
    assert.throws(() => parseRoadmapPlan("not json"), RoadmapPlanError);
    assert.throws(() => parseRoadmapPlan(JSON.stringify({ modules: [] })), RoadmapPlanError);
    assert.throws(() => parseRoadmapPlan(""), RoadmapPlanError);
  });
});
