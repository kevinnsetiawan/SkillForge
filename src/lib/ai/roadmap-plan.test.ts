import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  aiRoadmapRequestSchema,
  buildRoadmapPrompt,
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

  it("defaults the roadmap language to auto", () => {
    const parsed = aiRoadmapRequestSchema.parse({ topic: "React" });

    assert.equal(parsed.language, "auto");
  });

  it("rejects an unsupported language", () => {
    assert.equal(
      aiRoadmapRequestSchema.safeParse({ topic: "React", language: "klingon" }).success,
      false,
    );
  });
});

describe("buildRoadmapPrompt", () => {
  it("asks for the roadmap in the language the learner picked", () => {
    const prompt = buildRoadmapPrompt({
      topic: "Belajar SEO",
      level: "beginner",
      language: "en",
    });

    assert.match(prompt, /Roadmap language: English\./);
    assert.match(prompt, /Write every title, description, goal, module title and topic title in English\./);
    assert.doesNotMatch(prompt, /same language as the text under/);
  });

  it("follows the language of the question when auto is selected", () => {
    const prompt = buildRoadmapPrompt({
      topic: "Belajar SEO",
      level: "beginner",
      language: "auto",
    });

    assert.match(prompt, /same language as the text under "What they want to learn"/);
  });
});

describe("parseRoadmapPlan", () => {
  it("parses a plain JSON plan", () => {
    const plan = parseRoadmapPlan(JSON.stringify(validPlan));

    assert.equal(plan.title, "Belajar React");
    assert.equal(plan.modules.length, 1);
    assert.equal(plan.modules[0].topics[0].resource, "https://react.dev/learn");
    assert.equal(
      plan.modules[0].topics[1].resource,
      "https://www.google.com/search?q=Components",
    );
  });

  it("extracts JSON from a markdown fence and surrounding prose", () => {
    const raw = `Here is your roadmap:\n\n\`\`\`json\n${JSON.stringify(validPlan)}\n\`\`\`\nEnjoy!`;

    assert.equal(parseRoadmapPlan(raw).modules.length, 1);
  });

  it("replaces unsafe resource URLs with a search link but keeps the topic", () => {
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
    assert.equal(
      plan.modules[0].topics[0].resource,
      "https://www.google.com/search?q=Topic",
    );
  });

  it("gives every topic a link even when the model omits resources", () => {
    const plan = parseRoadmapPlan(
      JSON.stringify({
        modules: [
          {
            title: "Module",
            topics: ["Async JavaScript", { title: "Promises" }, { title: "Fetch", resource: "" }],
          },
        ],
      }),
    );

    assert.deepEqual(
      plan.modules[0].topics.map((topic) => topic.resource),
      [
        "https://www.google.com/search?q=Async%20JavaScript",
        "https://www.google.com/search?q=Promises",
        "https://www.google.com/search?q=Fetch",
      ],
    );
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
