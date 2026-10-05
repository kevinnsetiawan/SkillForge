"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { moduleSchema, reorderSchema, topicSchema, type ActionState } from "@/lib/validation";

/** Confirm the caller owns the roadmap before touching anything inside it. */
async function ownRoadmap(roadmapId: string, userId: string) {
  const roadmap = await db.roadmap.findFirst({
    where: { id: roadmapId, ownerId: userId },
    select: { id: true, slug: true, title: true },
  });
  return roadmap;
}

async function ownModule(moduleId: string, userId: string) {
  return db.module.findFirst({
    where: { id: moduleId, roadmap: { ownerId: userId } },
    select: { id: true, roadmapId: true, roadmap: { select: { slug: true } } },
  });
}

async function ownTopic(topicId: string, userId: string) {
  return db.topic.findFirst({
    where: { id: topicId, module: { roadmap: { ownerId: userId } } },
    select: {
      id: true,
      status: true,
      moduleId: true,
      module: { select: { roadmapId: true, roadmap: { select: { slug: true } } } },
    },
  });
}

/** Revalidate the owner view and the public pages that mirror it. */
function refresh(roadmapId: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/roadmaps/${roadmapId}`);
  revalidatePath(`/p/[username]`, "page");
  revalidatePath(`/p/[username]/[slug]`, "page");
}

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------

export async function createModule(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const roadmapId = String(formData.get("roadmapId") ?? "");

  const roadmap = await ownRoadmap(roadmapId, user.id);
  if (!roadmap) return { ok: false, message: "Roadmap not found." };

  const parsed = moduleSchema.safeParse({ roadmapId, title: formData.get("title") });
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  // Append to the end so a new module never reshuffles existing positions.
  const last = await db.module.findFirst({
    where: { roadmapId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await db.module.create({
    data: { roadmapId, title: parsed.data.title, position: (last?.position ?? -1) + 1 },
  });

  refresh(roadmapId);
  return { ok: true, message: "Module added." };
}

export async function renameModule(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const moduleId = String(formData.get("moduleId") ?? "");

  const parentModule = await ownModule(moduleId, user.id);
  if (!parentModule) return { ok: false, message: "Module not found." };

  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2) return { ok: false, errors: { title: ["Module title must be at least 2 characters."] } };

  await db.module.update({ where: { id: parentModule.id }, data: { title } });

  refresh(parentModule.roadmapId);
  return { ok: true };
}

export async function deleteModule(formData: FormData) {
  const user = await requireUser();
  const moduleId = String(formData.get("moduleId") ?? "");

  const parentModule = await ownModule(moduleId, user.id);
  if (!parentModule) return;

  await db.module.delete({ where: { id: parentModule.id } });

  refresh(parentModule.roadmapId);
}

// ---------------------------------------------------------------------------
// Topics
// ---------------------------------------------------------------------------

export async function createTopic(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const moduleId = String(formData.get("moduleId") ?? "");

  const parentModule = await ownModule(moduleId, user.id);
  if (!parentModule) return { ok: false, message: "Module not found." };

  const parsed = topicSchema.safeParse({
    moduleId,
    title: formData.get("title"),
    resource: formData.get("resource") ?? "",
  });
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  const last = await db.topic.findFirst({
    where: { moduleId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await db.topic.create({
    data: {
      moduleId,
      title: parsed.data.title,
      resource: parsed.data.resource || null,
      position: (last?.position ?? -1) + 1,
    },
  });

  refresh(parentModule.roadmapId);
  return { ok: true, message: "Topic added." };
}

export async function updateTopic(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const topicId = String(formData.get("topicId") ?? "");

  const topic = await ownTopic(topicId, user.id);
  if (!topic) return { ok: false, message: "Topic not found." };

  const parsed = topicSchema.safeParse({ topicId, title: formData.get("title"), resource: formData.get("resource") ?? "" });
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  await db.topic.update({
    where: { id: topic.id },
    data: { title: parsed.data.title, resource: parsed.data.resource || null },
  });

  refresh(topic.module.roadmapId);
  return { ok: true, message: "Topic updated." };
}

export async function deleteTopic(formData: FormData) {
  const user = await requireUser();
  const topicId = String(formData.get("topicId") ?? "");

  const topic = await ownTopic(topicId, user.id);
  if (!topic) return;

  await db.topic.delete({ where: { id: topic.id } });

  refresh(topic.module.roadmapId);
}

// ---------------------------------------------------------------------------
// Reordering (up / down buttons)
// ---------------------------------------------------------------------------

/**
 * Apply a new order for siblings. The client sends the full post-move list so
 * the write is idempotent and there is no read-modify-write race.
 */
export async function reorderNodes(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  const parsed = reorderSchema.safeParse({
    ids: formData.getAll("ids").map(String),
    parentId: formData.get("parentId"),
    scope: formData.get("scope"),
  });

  if (!parsed.success) return { ok: false, message: "Could not read the new order." };

  const { ids, parentId, scope } = parsed.data;

  if (scope === "module") {
    const roadmap = await ownRoadmap(parentId, user.id);
    if (!roadmap) return { ok: false, message: "Roadmap not found." };

    // Only reorder rows that actually belong to this roadmap, so a tampered id
    // list cannot move someone else's modules.
    const existing = await db.module.findMany({
      where: { roadmapId: parentId, id: { in: ids } },
      select: { id: true },
    });
    const allowed = new Set(existing.map((m) => m.id));
    const safeIds = ids.filter((id) => allowed.has(id));

    await db.$transaction(
      safeIds.map((id, index) => db.module.update({ where: { id }, data: { position: index } })),
    );

    refresh(parentId);
    return { ok: true };
  }

  const parentModule = await ownModule(parentId, user.id);
  if (!parentModule) return { ok: false, message: "Module not found." };

  const existing = await db.topic.findMany({
    where: { moduleId: parentId, id: { in: ids } },
    select: { id: true },
  });
  const allowed = new Set(existing.map((t) => t.id));
  const safeIds = ids.filter((id) => allowed.has(id));

  await db.$transaction(
    safeIds.map((id, index) => db.topic.update({ where: { id }, data: { position: index } })),
  );

  refresh(parentModule.roadmapId);
  return { ok: true };
}
