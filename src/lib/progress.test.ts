import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildHeatmap,
  computeProgress,
  computeStreak,
  mergeProgress,
} from "@/lib/progress";
import { isSafeExternalUrl, isValidUsername, slugify } from "@/lib/utils";

const TZ = "UTC";
const NOW = new Date("2026-03-15T12:00:00.000Z");

/** UTC midnight `offset` days before NOW, as the DB stores activity days. */
function day(offset: number) {
  const date = new Date(Date.UTC(2026, 2, 15));
  date.setUTCDate(date.getUTCDate() - offset);
  return date;
}

describe("computeProgress", () => {
  it("reports zeros for an empty roadmap", () => {
    assert.deepEqual(computeProgress([]), {
      LOCKED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      total: 0,
      percent: 0,
      isComplete: false,
    });
  });

  it("counts only COMPLETED toward the percentage", () => {
    const progress = computeProgress(["COMPLETED", "COMPLETED", "IN_PROGRESS", "LOCKED"]);

    assert.equal(progress.COMPLETED, 2);
    assert.equal(progress.IN_PROGRESS, 1);
    assert.equal(progress.LOCKED, 1);
    assert.equal(progress.total, 4);
    assert.equal(progress.percent, 50);
    assert.equal(progress.isComplete, false);
  });

  it("marks a roadmap complete only when every topic is done", () => {
    const progress = computeProgress(["COMPLETED", "COMPLETED"]);

    assert.equal(progress.percent, 100);
    assert.equal(progress.isComplete, true);
  });

  it("treats an unknown status as locked rather than dropping it", () => {
    const progress = computeProgress(["SOMETHING_ELSE", "COMPLETED"]);

    assert.equal(progress.LOCKED, 1);
    assert.equal(progress.total, 2);
  });

  it("rounds to a whole percent", () => {
    assert.equal(computeProgress(["COMPLETED", "LOCKED", "LOCKED"]).percent, 33);
  });
});

describe("mergeProgress", () => {
  it("returns an empty summary when there are no modules", () => {
    assert.deepEqual(mergeProgress([]), {
      LOCKED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      total: 0,
      percent: 0,
      isComplete: false,
    });
  });

  it("aggregates counts across modules and recomputes the percentage", () => {
    const merged = mergeProgress([
      computeProgress(["COMPLETED", "LOCKED"]),
      computeProgress(["COMPLETED", "COMPLETED", "IN_PROGRESS"]),
    ]);

    assert.equal(merged.total, 5);
    assert.equal(merged.COMPLETED, 3);
    assert.equal(merged.IN_PROGRESS, 1);
    assert.equal(merged.LOCKED, 1);
    assert.equal(merged.percent, 60);
    assert.equal(merged.isComplete, false);
  });

  it("can complete a roadmap by merging partial modules", () => {
    const merged = mergeProgress([
      computeProgress(["COMPLETED", "COMPLETED"]),
      computeProgress(["COMPLETED"]),
    ]);

    assert.equal(merged.isComplete, true);
    assert.equal(merged.percent, 100);
  });
});

describe("computeStreak", () => {
  it("reports nothing for a learner with no activity", () => {
    const streak = computeStreak([], NOW, TZ);

    assert.equal(streak.current, 0);
    assert.equal(streak.longest, 0);
    assert.equal(streak.totalDays, 0);
    assert.equal(streak.activeToday, false);
    assert.equal(streak.lastActiveDay, null);
  });

  it("counts a streak that includes today", () => {
    const streak = computeStreak([day(2), day(1), day(0)], NOW, TZ);

    assert.equal(streak.current, 3);
    assert.equal(streak.longest, 3);
    assert.equal(streak.activeToday, true);
    assert.equal(streak.atRisk, false);
  });

  it("keeps the streak alive when only yesterday was active", () => {
    const streak = computeStreak([day(2), day(1)], NOW, TZ);

    assert.equal(streak.current, 2);
    assert.equal(streak.activeToday, false);
    assert.equal(streak.atRisk, true);
  });

  it("breaks the current streak when the last activity is two days old", () => {
    const streak = computeStreak([day(4), day(3), day(2)], NOW, TZ);

    assert.equal(streak.current, 0);
    assert.equal(streak.activeToday, false);
    assert.equal(streak.atRisk, false);
    assert.equal(streak.longest, 3);
  });

  it("remembers the longest run even when it is not the current one", () => {
    const streak = computeStreak([day(10), day(9), day(8), day(7), day(6), day(1), day(0)], NOW, TZ);

    assert.equal(streak.current, 2);
    assert.equal(streak.longest, 5);
  });

  it("ignores duplicate rows for the same day", () => {
    const streak = computeStreak([day(0), day(0), day(1), day(1)], NOW, TZ);

    assert.equal(streak.current, 2);
    assert.equal(streak.totalDays, 2);
  });

  it("is order independent", () => {
    const ascending = computeStreak([day(3), day(2), day(1), day(0)], NOW, TZ);
    const shuffled = computeStreak([day(2), day(0), day(3), day(1)], NOW, TZ);

    assert.equal(shuffled.current, ascending.current);
    assert.equal(shuffled.longest, ascending.longest);
  });

  it("respects the learner's timezone around midnight", () => {
    // 22:00 UTC on the 14th is already the 15th in Jakarta, so the learner is
    // "behind" and their streak must not be counted as broken.
    const evening = new Date("2026-03-14T22:00:00.000Z");
    const streak = computeStreak([day(1), day(0)], evening, "Asia/Jakarta");

    assert.equal(streak.current, 2);
    assert.equal(streak.activeToday, true);
  });
});

describe("buildHeatmap", () => {
  it("returns one cell per day in the requested window, oldest first", () => {
    const cells = buildHeatmap([day(0)], NOW, TZ, 2);

    assert.ok(cells.length >= 14, `expected at least 14 cells, got ${cells.length}`);
    assert.equal(cells.at(-1)?.count, 1);
    assert.equal(cells[0].count, 0);
    for (let i = 1; i < cells.length; i++) {
      assert.ok(cells[i].day > cells[i - 1].day, "cells must be ordered oldest first");
    }
  });

  it("counts multiple entries on the same day", () => {
    const cells = buildHeatmap([day(0), day(0), day(0)], NOW, TZ, 2);
    const today = cells.at(-1);

    assert.equal(today?.count, 3);
  });

  it("starts each column on a Monday", () => {
    const cells = buildHeatmap([], NOW, TZ, 4);

    for (let i = 0; i < cells.length; i += 7) {
      const weekday = new Date(`${cells[i].day}T00:00:00.000Z`).getUTCDay();
      assert.equal(weekday, 1, `cell ${i} should be a Monday`);
    }
  });
});

describe("slugify", () => {
  it("lowercases and joins words with single dashes", () => {
    assert.equal(slugify("Frontend Engineer"), "frontend-engineer");
  });

  it("strips accents and punctuation", () => {
    assert.equal(slugify("Belajar  Back-End! (2026)"), "belajar-back-end-2026");
  });

  it("falls back to a random id when nothing usable is left", () => {
    // Non-latin or punctuation-only input must still yield a non-empty slug.
    assert.match(slugify("!!!"), /^item-[a-z0-9]{6}$/);
    assert.match(slugify("日本語"), /^item-[a-z0-9]{6}$/);
  });

  it("keeps the latin part when only some characters are stripped", () => {
    assert.equal(slugify("Belajar 日本語"), "belajar");
  });

  it("falls back when only a single character survives", () => {
    assert.match(slugify("a"), /^item-[a-z0-9]{6}$/);
  });
});

describe("isValidUsername", () => {
  it("accepts normal handles", () => {
    assert.equal(isValidUsername("arunabudi"), true);
    assert.equal(isValidUsername("arun-budi_2"), true);
    assert.equal(isValidUsername("abc"), true);
    assert.equal(isValidUsername("a".repeat(30)), true);
  });

  it("enforces the documented 3-30 character range", () => {
    assert.equal(isValidUsername("a"), false);
    assert.equal(isValidUsername("ab"), false);
    assert.equal(isValidUsername("a".repeat(31)), false);
  });

  it("rejects reserved names and bad shapes", () => {
    assert.equal(isValidUsername("admin"), false);
    assert.equal(isValidUsername("dashboard"), false);
    assert.equal(isValidUsername("-nope"), false);
    assert.equal(isValidUsername("nope-"), false);
    assert.equal(isValidUsername("UPPER"), false);
    assert.equal(isValidUsername("has space"), false);
  });
});

describe("isSafeExternalUrl", () => {
  it("accepts ordinary web links", () => {
    assert.equal(isSafeExternalUrl("https://example.com/path?q=1"), true);
    assert.equal(isSafeExternalUrl("http://localhost:3000/p/demo"), true);
  });

  it("rejects script and data payloads", () => {
    assert.equal(isSafeExternalUrl("javascript:alert(1)"), false);
    assert.equal(isSafeExternalUrl("JavaScript:alert(1)"), false);
    assert.equal(isSafeExternalUrl("data:text/html,<script>alert(1)</script>"), false);
    assert.equal(isSafeExternalUrl("vbscript:msgbox(1)"), false);
    assert.equal(isSafeExternalUrl("not a url"), false);
    assert.equal(isSafeExternalUrl(""), false);
  });
});