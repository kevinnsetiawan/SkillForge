import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { topicSchema } from "@/lib/validation";

const baseTopic = { moduleId: "module-1", title: "React Hooks" };

describe("topicSchema", () => {
  it("requires a resource link", () => {
    assert.equal(topicSchema.safeParse(baseTopic).success, false);
    assert.equal(topicSchema.safeParse({ ...baseTopic, resource: "   " }).success, false);
  });

  it("accepts a safe http(s) resource link", () => {
    assert.equal(
      topicSchema.safeParse({ ...baseTopic, resource: "https://react.dev/learn" }).success,
      true,
    );
  });

  it("rejects unsafe resource protocols", () => {
    assert.equal(
      topicSchema.safeParse({ ...baseTopic, resource: "javascript:alert(1)" }).success,
      false,
    );
  });
});
