import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/dal";
import { getRoadmap } from "@/lib/queries";
import { mergeProgress, computeProgress, computeStreak } from "@/lib/progress";
import { getActiveDays } from "@/lib/activity";
import { appTimeZone } from "@/lib/utils";
import { createModule } from "@/lib/actions/structure";
import { ProgressRing } from "@/components/progress";
import { StreakBadge } from "@/components/streak-badge";
import { ModuleCard } from "@/components/module-card";
import { AddModuleForm } from "./add-module-form";
import { DeleteRoadmapButton, DuplicateRoadmapButton } from "./roadmap-actions";
import { ButtonLink, Card, SectionTitle } from "@/components/ui/button";

export default async function RoadmapPage({ params }: PageProps<"/roadmaps/[roadmapId]">) {
  const { roadmapId } = await params;
  const user = await requireUser();

  const roadmap = await getRoadmap(roadmapId, user.id);
  if (!roadmap) notFound();

  const modules = roadmap.modules.map((module) => ({
    id: module.id,
    title: module.title,
    topics: module.topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      resource: topic.resource,
      status: topic.status,
      entries: topic.entries.map((entry) => ({
        id: entry.id,
        proofUrl: entry.proofUrl,
        proofLabel: entry.proofLabel,
        authoredOn: entry.authoredOn,
        note: entry.note,
      })),
    })),
  }));

  const moduleIds = modules.map((m) => m.id);
  const overall = mergeProgress(modules.map((m) => computeProgress(m.topics.map((t) => t.status))));

  const activeDays = await getActiveDays(user.id);
  const streak = computeStreak(
    activeDays.map((d) => d.day),
    new Date(),
    appTimeZone(),
  );

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-ink-500">
        <Link href="/roadmaps" className="hover:text-ember-300">
          Roadmaps
        </Link>
        <span>/</span>
        <span className="text-ink-300">{roadmap.title}</span>
      </nav>

      <header className="panel panel-raised accent-top relative flex flex-wrap items-start gap-6 overflow-hidden p-6">
        <div
          className="pointer-events-none absolute -top-24 -left-16 size-64 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-ember-500), transparent 70%)" }}
        />

        <div className="relative">
          <ProgressRing
            percent={overall.percent}
            size={96}
            strokeWidth={9}
            tone={overall.isComplete ? "mint" : "ember"}
          />
        </div>

        <div className="relative min-w-56 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-ink-100">{roadmap.title}</h1>
            <span
              className={
                roadmap.isPublished
                  ? "rounded-full border border-mint-500/40 bg-mint-500/10 px-2 py-0.5 text-[10px] text-mint-400"
                  : "rounded-full border border-ink-600 bg-ink-800 px-2 py-0.5 text-[10px] text-ink-400"
              }
            >
              {roadmap.isPublished ? "Published" : "Draft"}
            </span>
          </div>

          {roadmap.goal ? <p className="mt-1 text-sm text-ember-300/90">{roadmap.goal}</p> : null}
          {roadmap.description ? <p className="mt-2 text-sm text-ink-400">{roadmap.description}</p> : null}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-400 tabular-nums">
            <span>
              {overall.COMPLETED}/{overall.total} topics done
            </span>
            <span className="text-ember-300">{overall.IN_PROGRESS} in progress</span>
            <span>{overall.LOCKED} locked</span>
            <StreakBadge streak={streak} />
          </div>
        </div>

        <div className="relative flex flex-wrap items-center gap-2">
          {roadmap.isPublished ? (
            <ButtonLink href={`/p/${user.username}/${roadmap.slug}`} variant="secondary" size="sm">
              View public page
            </ButtonLink>
          ) : null}
          <ButtonLink href={`/roadmaps/${roadmap.id}/settings`} variant="secondary" size="sm">
            Settings
          </ButtonLink>
          <DuplicateRoadmapButton roadmapId={roadmap.id} />
        </div>
      </header>

      <section>
        <SectionTitle hint={`${modules.length} module${modules.length === 1 ? "" : "s"}`}>
          Roadmap structure
        </SectionTitle>

        {modules.length === 0 ? (
          <Card className="px-6 py-10 text-center">
            <p className="text-sm text-ink-200">This roadmap is empty.</p>
            <p className="mx-auto mt-1 max-w-md text-xs text-ink-400">
              Add a module for each stage of your curriculum, then fill it with the topics you need to work
              through. Order matters: use the arrows to move a module or topic up or down.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {modules.map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                index={index}
                total={modules.length}
                roadmapId={roadmap.id}
                moduleIds={moduleIds}
              />
            ))}
          </div>
        )}
      </section>

      <section className="panel p-4">
        <AddModuleForm action={createModule} roadmapId={roadmap.id} />
      </section>

      <section className="flex justify-end border-t border-ink-800 pt-6">
        <DeleteRoadmapButton roadmapId={roadmap.id} title={roadmap.title} />
      </section>
    </div>
  );
}
