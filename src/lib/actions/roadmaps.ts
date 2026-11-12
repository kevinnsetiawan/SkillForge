"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { freeRoadmapSlug } from "@/lib/roadmap-slug";
import { roadmapSchema, roadmapSettingsSchema, type ActionState } from "@/lib/validation";

export async function createRoadmap(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();

  const parsed = roadmapSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    goal: formData.get("goal"),
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { title, description, goal } = parsed.data;
  const slug = await freeRoadmapSlug(user.id, title);

  const roadmap = await db.roadmap.create({
    data: {
      title,
      slug,
      description: description || null,
      goal: goal || null,
      ownerId: user.id,
    },
    select: { id: true },
  });

  revalidatePath("/dashboard");
  redirect(`/roadmaps/${roadmap.id}`);
}

export async function updateRoadmapSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const roadmapId = String(formData.get("roadmapId") ?? "");

  const owned = await db.roadmap.findFirst({ where: { id: roadmapId, ownerId: user.id }, select: { id: true } });
  if (!owned) return { ok: false, message: "Roadmap not found." };

  const parsed = roadmapSettingsSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    goal: formData.get("goal"),
    slug: formData.get("slug"),
    isPublished: formData.get("isPublished") === "on",
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { title, description, goal, slug, isPublished } = parsed.data;

  const clash = await db.roadmap.findUnique({
    where: { ownerId_slug: { ownerId: user.id, slug } },
    select: { id: true },
  });
  if (clash && clash.id !== owned.id) {
    return { ok: false, errors: { slug: ["You already have a roadmap with that slug."] } };
  }

  await db.roadmap.update({
    where: { id: owned.id },
    data: { title, description: description || null, goal: goal || null, slug, isPublished },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/roadmaps/${owned.id}`);
  revalidatePath(`/roadmaps/${owned.id}/settings`);
  revalidatePath(`/p/${user.username}`);
  revalidatePath(`/p/${user.username}/${slug}`);

  return { ok: true, message: "Roadmap updated." };
}

export async function deleteRoadmap(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("roadmapId") ?? "");

  // Scoped by ownerId so a crafted id cannot delete someone else's roadmap.
  const { count } = await db.roadmap.deleteMany({ where: { id, ownerId: user.id } });
  if (count === 0) return;

  revalidatePath("/dashboard");
  revalidatePath(`/p/${user.username}`);
}

export async function duplicateRoadmap(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("roadmapId") ?? "");

  const source = await db.roadmap.findFirst({
    where: { id, ownerId: user.id },
    include: { modules: { include: { topics: true }, orderBy: { position: "asc" } } },
  });

  if (!source) return;

  const copy = await db.roadmap.create({
    data: {
      title: `${source.title} (copy)`,
      slug: await freeRoadmapSlug(user.id, `${source.title}-copy`),
      description: source.description,
      goal: source.goal,
      // Never publish a copy by accident: it would duplicate a public URL.
      isPublished: false,
      ownerId: user.id,
      modules: {
        create: source.modules.map((module) => ({
          title: module.title,
          position: module.position,
          topics: {
            create: module.topics.map((topic) => ({
              title: topic.title,
              resource: topic.resource,
              position: topic.position,
              // Progress is personal, so a copy starts fresh.
              status: "LOCKED",
            })),
          },
        })),
      },
    },
    select: { id: true },
  });

  revalidatePath("/dashboard");
  redirect(`/roadmaps/${copy.id}`);
}
