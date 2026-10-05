import { notFound } from "next/navigation";

import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { updateRoadmapSettings } from "@/lib/actions/roadmaps";
import { RoadmapSettingsForm } from "./roadmap-settings-form";

export const metadata = { title: "Roadmap settings" };
export const dynamic = "force-dynamic";

export default async function RoadmapSettingsPage({
  params,
}: PageProps<"/roadmaps/[roadmapId]/settings">) {
  const { roadmapId } = await params;
  const user = await requireUser();

  const roadmap = await db.roadmap.findFirst({
    where: { id: roadmapId, ownerId: user.id },
    select: { id: true, title: true, slug: true, description: true, goal: true, isPublished: true },
  });

  if (!roadmap) notFound();

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight text-ink-100">Roadmap settings</h1>
      <p className="mt-1 text-sm text-ink-400">{roadmap.title}</p>

      <RoadmapSettingsForm action={updateRoadmapSettings} roadmap={roadmap} username={user.username} />
    </div>
  );
}
