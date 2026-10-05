"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { recordActivity } from "@/lib/activity";
import { journalSchema, topicStatusSchema, type ActionState } from "@/lib/validation";
import { inferLinkLabel } from "@/lib/utils";

async function ownTopic(topicId: string, userId: string) {
  return db.topic.findFirst({
    where: { id: topicId, module: { roadmap: { ownerId: userId } } },
    select: {
      id: true,
      status: true,
      module: { select: { roadmapId: true } },
      entries: { select: { id: true } },
    },
  });
}

function refresh(roadmapId: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/roadmaps/${roadmapId}`);
  revalidatePath(`/p/[username]`, "page");
  revalidatePath(`/p/[username]/[slug]`, "page");
}

/**
 * Save the micro-journal and proof-of-work for a topic, and optionally flip it
 * to COMPLETED in the same submission so the learner gets one clear "I'm done"
 * step instead of two.
 */
export async function saveJournal(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  const parsed = journalSchema.safeParse({
    topicId: formData.get("topicId"),
    note: formData.get("note"),
    proofUrl: formData.get("proofUrl") ?? "",
    proofLabel: formData.get("proofLabel") ?? "",
    completed: formData.get("completed") === "on",
  });

  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  const { topicId, note, completed } = parsed.data;
  const proofUrl = parsed.data.proofUrl ?? "";
  const proofLabel = parsed.data.proofLabel ?? "";

  const topic = await ownTopic(topicId, user.id);
  if (!topic) return { ok: false, message: "Topic not found." };

  // A topic cannot be "done" without evidence, so the public portfolio always
  // has something to point at. Checked after ownership so we never leak that
  // some other user's topic exists.
  if (completed && !proofUrl.trim()) {
    return {
      ok: false,
      errors: { proofUrl: ["Attach at least one proof-of-work link before completing this topic."] },
    };
  }

  const trimmedUrl = proofUrl.trim();
  const label = proofLabel.trim() || (trimmedUrl ? inferLinkLabel(trimmedUrl) : null);

  await db.$transaction(async (tx) => {
    // A topic has at most one journal entry, so upsert on the unique topicId.
    await tx.journalEntry.upsert({
      where: { topicId },
      create: {
        topicId,
        note,
        proofUrl: trimmedUrl || null,
        proofLabel: label,
        completedAt: completed ? new Date() : null,
      },
      update: {
        note,
        proofUrl: trimmedUrl || null,
        proofLabel: label,
        // Preserve the original completion date when already completed.
        completedAt: completed ? (topic.status === "COMPLETED" ? undefined : new Date()) : null,
      },
    });

    await tx.topic.update({
      where: { id: topicId },
      // Un-ticking "completed" demotes to in-progress so the roadmap reflects
      // that the topic still needs work.
      data: { status: completed ? "COMPLETED" : topic.status === "COMPLETED" ? "IN_PROGRESS" : topic.status },
    });
  });

  await recordActivity(user.id);

  refresh(topic.module.roadmapId);
  return { ok: true, message: completed ? "Topic completed. Streak updated." : "Journal saved." };
}

/** Quick status change from the roadmap grid (locked / in progress / done). */
export async function setTopicStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  const parsed = topicStatusSchema.safeParse({
    topicId: formData.get("topicId"),
    status: formData.get("status"),
  });

  if (!parsed.success) return { ok: false, message: "Invalid status." };

  const { topicId, status } = parsed.data;
  const topic = await ownTopic(topicId, user.id);
  if (!topic) return { ok: false, message: "Topic not found." };

  // Completing a topic is a learning milestone, so it counts toward the streak.
  // Also enforce the PRD rule that a topic cannot be "done" without evidence.
  if (status === "COMPLETED" && topic.entries.length === 0) {
    return {
      ok: false,
      message: "Write a journal note and attach a proof link before completing this topic.",
    };
  }

  await db.topic.update({
    where: { id: topicId },
    data: { status },
  });

  if (status === "COMPLETED") {
    await db.journalEntry.updateMany({ where: { topicId }, data: { completedAt: new Date() } });
    await recordActivity(user.id);
  }

  refresh(topic.module.roadmapId);
  return { ok: true };
}
