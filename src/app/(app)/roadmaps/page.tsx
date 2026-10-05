import Link from "next/link";

import { requireUser } from "@/lib/dal";
import { getRoadmapSummaries } from "@/lib/queries";
import { ProgressBar, ProgressRing } from "@/components/progress";
import { PlusIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/field";

export const metadata = { title: "Roadmaps" };
export const dynamic = "force-dynamic";

export default async function RoadmapsPage() {
  const user = await requireUser();
  const roadmaps = await getRoadmapSummaries(user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Roadmaps</p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-100">Your learning plans</h1>
          <p className="mt-1.5 text-sm text-ink-400">
            Structure your learning plan as modules and topics, then work through it one node at a time.
          </p>
        </div>
        <ButtonLink href="/roadmaps/new" className="sheen btn-glow">
          <PlusIcon className="size-4" />
          New roadmap
        </ButtonLink>
      </section>

      {/* Content */}
      {roadmaps.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="Pick a curriculum you are following and turn it into modules and topics. You can reorder, rename and delete nodes at any time."
          action={
            <ButtonLink href="/roadmaps/new" className="mt-1 btn-glow">
              Create a roadmap
            </ButtonLink>
          }
        />
      ) : (
        <ul className="space-y-3">
          {roadmaps.map((roadmap) => (
            <li key={roadmap.id}>
              <div className="panel panel-raised panel-hover group flex flex-wrap items-center gap-5 p-5">
                <div className="shrink-0">
                  <ProgressRing
                    percent={roadmap.progress.percent}
                    size={64}
                    tone={roadmap.progress.isComplete ? "mint" : "ember"}
                  />
                </div>

                <div className="min-w-48 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/roadmaps/${roadmap.id}`}
                      className="text-sm font-semibold text-ink-100 transition hover:text-ember-300"
                    >
                      {roadmap.title}
                    </Link>
                    <span
                      className={
                        roadmap.isPublished
                          ? "rounded-full border border-mint-500/40 bg-mint-500/10 px-2 py-0.5 text-[10px] font-medium text-mint-400"
                          : "rounded-full border border-ink-600 bg-ink-800 px-2 py-0.5 text-[10px] text-ink-400"
                      }
                    >
                      {roadmap.isPublished ? "Public" : "Private"}
                    </span>
                  </div>

                  {roadmap.goal ? (
                    <p className="mt-0.5 text-xs text-ember-300/80">{roadmap.goal}</p>
                  ) : null}

                  {roadmap.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-ink-500">{roadmap.description}</p>
                  ) : null}

                  <div className="mt-2.5 flex items-center gap-2">
                    <ProgressBar
                      percent={roadmap.progress.percent}
                      tone={roadmap.progress.isComplete ? "mint" : "ember"}
                      className="max-w-56"
                      label={`${roadmap.title} progress`}
                    />
                    <span className="text-[11px] text-ink-500 tabular-nums">
                      {roadmap.progress.COMPLETED}/{roadmap.progress.total} topics
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {roadmap.isPublished ? (
                    <Link
                      href={`/p/${user.username}/${roadmap.slug}`}
                      className="rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-xs text-ink-200 transition hover:border-ink-500 hover:bg-ink-700"
                    >
                      View public page
                    </Link>
                  ) : null}
                  <ButtonLink href={`/roadmaps/${roadmap.id}`} variant="secondary" size="sm">
                    Open →
                  </ButtonLink>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
