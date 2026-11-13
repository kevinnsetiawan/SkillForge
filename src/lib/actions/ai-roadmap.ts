"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  aiRoadmapRequestSchema,
  parseRoadmapPlan,
  RoadmapPlanError,
  type RoadmapPlan,
} from "@/lib/ai/roadmap-plan";
import { generateRoadmapWithAI, RoadmapGenerationError } from "@/lib/ai/roadmap-generator";
import { consumeGeneration } from "@/lib/ai/rate-limit";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/dal";
import { freeRoadmapSlug } from "@/lib/roadmap-slug";
import type { ActionState } from "@/lib/validation";

export type GenerateRoadmapState =
  | { ok: true; plan: RoadmapPlan }
  | { ok: false; message: string; errors?: Record<string, string[]> }
  | undefined;

/** Ask the model for a roadmap and return it as a preview. Nothing is saved yet. */
export async function generateRoadmapAction(
  _prev: GenerateRoadmapState,
  formData: FormData,
): Promise<GenerateRoadmapState> {
  const user = await requireUser();

  const parsed = aiRoadmapRequestSchema.safeParse({
    topic: formData.get("topic"),
    level: formData.get("level") || "beginner",
    language: formData.get("language") || "auto",
    goal: formData.get("goal") ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the form and try again.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const limit = consumeGeneration(user.id);
  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
    return {
      ok: false,
      message: `You have generated a lot of roadmaps. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  try {
    const plan = await generateRoadmapWithAI(parsed.data);
    return { ok: true, plan };
  } catch (error) {
    if (error instanceof RoadmapGenerationError) {
      return { ok: false, message: error.message };
    }

    console.error("[ai-roadmap] generation failed", error);
    return {
      ok: false,
      message: "Something went wrong while generating the roadmap. Please try again.",
    };
  }
}

/** Persist a previewed plan as a normal roadmap tree owned by the caller. */
export async function saveGeneratedRoadmapAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const rawPlan = String(formData.get("plan") ?? "");

  let plan: RoadmapPlan;
  try {
    plan = parseRoadmapPlan(rawPlan, { topic: "My learning roadmap" });
  } catch (error) {
    if (error instanceof RoadmapPlanError) {
      return {
        ok: false,
        message: "That generated roadmap is no longer valid. Please generate it again.",
      };
    }
    throw error;
  }

  const slug = await freeRoadmapSlug(user.id, plan.title);

  const roadmap = await db.roadmap.create({
    data: {
      title: plan.title,
      slug,
      description: plan.description || null,
      goal: plan.goal || null,
      ownerId: user.id,
      modules: {
        create: plan.modules.map((module, moduleIndex) => ({
          title: module.title,
          position: moduleIndex,
          topics: {
            create: module.topics.map((topic, topicIndex) => ({
              title: topic.title,
              resource: topic.resource,
              position: topicIndex,
              status: "LOCKED",
            })),
          },
        })),
      },
    },
    select: { id: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/roadmaps");
  redirect(`/roadmaps/${roadmap.id}`);
}
