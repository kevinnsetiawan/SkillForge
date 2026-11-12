import Link from "next/link";

import { requireUser } from "@/lib/dal";
import { getDashboardStats, getRoadmapSummaries } from "@/lib/queries";
import { cn, formatRelativeDay } from "@/lib/utils";
import { ProgressBar, ProgressRing } from "@/components/progress";
import { ActivityHeatmap, StreakCard } from "@/components/streak";
import { ExternalIcon, GlobeIcon, JournalIcon, LinkIcon, MapIcon, PlusIcon } from "@/components/icons";
import { ButtonLink, Card, SectionTitle } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/field";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const [stats, roadmaps] = await Promise.all([getDashboardStats(user.id), getRoadmapSummaries(user.id)]);

  const published = roadmaps.filter((r) => r.isPublished).length;
  const hasRoadmaps = roadmaps.length > 0;
  const firstName = user.name?.split(" ")[0];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Dashboard</p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-100">
            {firstName ? (
              <>
                Keep going,{" "}
                <span className="text-gradient-warm glow-ember">{firstName}</span>
              </>
            ) : (
              "Keep going"
            )}
          </h1>
          <p className="mt-1.5 text-sm text-ink-400">
            {hasRoadmaps
              ? `${stats.overall.COMPLETED} of ${stats.overall.total} topics completed across ${roadmaps.length} roadmap${roadmaps.length === 1 ? "" : "s"}.`
              : "Create your first roadmap to start tracking progress."}
          </p>
        </div>

        <ButtonLink href="/roadmaps/new" className="sheen btn-glow">
          <PlusIcon className="size-4" />
          New roadmap
        </ButtonLink>
      </section>

      {/* Stat cards row */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StreakCard streak={stats.streak} />

        <Card className="flex items-center gap-4 p-5">
          <ProgressRing percent={stats.overall.percent} size={72} strokeWidth={7} />
          <div>
            <p className="text-xs font-medium tracking-wide text-ink-400 uppercase">Overall</p>
            <p className="mt-0.5 text-sm font-semibold text-ink-100">Roadmap progress</p>
            <p className="mt-1 text-xs text-ink-500 tabular-nums">
              {stats.overall.IN_PROGRESS} in progress · {stats.overall.LOCKED} locked
            </p>
          </div>
        </Card>

        <MetricCard
          label="Proof of work"
          value={String(stats.proofCount)}
          footnote={`${stats.journalCount} journal ${stats.journalCount === 1 ? "entry" : "entries"} written`}
          icon={<LinkIcon className="size-4" />}
          tone="mint"
        />

        <MetricCard
          label="Published"
          value={String(published)}
          suffix={`/ ${roadmaps.length}`}
          footnote={
            <Link href="/settings" className="text-ember-400 transition hover:text-ember-300">
              Manage portfolio →
            </Link>
          }
          icon={<GlobeIcon className="size-4" />}
          tone="sky"
        />
      </section>

      {/* Activity + Continue learning */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <SectionTitle hint="last ~4 months">Activity</SectionTitle>
          <div className="mt-3">
            <ActivityHeatmap days={stats.heatmap} />
          </div>
          <p className="mt-3 text-xs text-ink-500">
            Each square is a day you wrote a journal entry or completed a topic. Gaps break the streak.
          </p>
        </Card>

        <Card className="p-5">
          <SectionTitle>Continue learning</SectionTitle>
          {stats.continueLearning.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl border border-ink-700 bg-ink-800 text-ink-500">
                <MapIcon className="size-5" />
              </div>
              <p className="text-xs text-ink-500">
                Nothing in progress. Open a roadmap and mark a topic as started.
              </p>
            </div>
          ) : (
            <ul className="mt-1 space-y-2">
              {stats.continueLearning.map((item) => (
                <li key={item.topicId}>
                  <Link
                    href={`/roadmaps/${item.roadmapId}/topics/${item.topicId}`}
                    className="group flex items-start gap-3 rounded-xl border border-ink-700 bg-ink-900/50 px-3 py-2.5 transition hover:border-ember-500/40 hover:bg-ink-850"
                  >
                    <span className="mt-0.5 size-2 shrink-0 rounded-full bg-ember-400/70 ring-2 ring-ember-400/20" />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink-100 group-hover:text-ember-300 transition">{item.title}</p>
                      <p className="truncate text-[11px] text-ink-500">{item.roadmapTitle}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* Roadmaps grid */}
      <section>
        <SectionTitle hint={`${roadmaps.length} total`}>Your roadmaps</SectionTitle>

        {!hasRoadmaps ? (
          <EmptyState
            title="No roadmaps yet"
            description="A roadmap is a Module → Topic tree. Describe what you want to learn and let AI draft it, or build one from the curriculum you are following, then work through it topic by topic."
            action={
              <ButtonLink href="/roadmaps/new" className="mt-1 btn-glow">
                <MapIcon className="size-4" />
                Create your first roadmap
              </ButtonLink>
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {roadmaps.map((roadmap) => (
              <li key={roadmap.id}>
                <Link
                  href={`/roadmaps/${roadmap.id}`}
                  className="panel panel-raised panel-hover group block p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="truncate text-sm font-semibold text-ink-100 group-hover:text-ember-300 transition">
                      {roadmap.title}
                    </h3>
                    <span
                      className={
                        roadmap.isPublished
                          ? "shrink-0 rounded-full border border-mint-500/40 bg-mint-500/10 px-2 py-0.5 text-[10px] font-medium text-mint-400"
                          : "shrink-0 rounded-full border border-ink-600 bg-ink-800 px-2 py-0.5 text-[10px] text-ink-400"
                      }
                    >
                      {roadmap.isPublished ? "Public" : "Private"}
                    </span>
                  </div>

                  {roadmap.goal ? (
                    <p className="mt-1 truncate text-xs text-ember-300/80">{roadmap.goal}</p>
                  ) : null}

                  {roadmap.description ? (
                    <p className="mt-1.5 line-clamp-2 text-xs text-ink-500">{roadmap.description}</p>
                  ) : null}

                  <div className="mt-4 flex items-center gap-2">
                    <ProgressBar
                      percent={roadmap.progress.percent}
                      tone={roadmap.progress.isComplete ? "mint" : "ember"}
                      className="flex-1"
                      label={`${roadmap.title} progress`}
                    />
                    <span className="text-[11px] font-medium text-ink-400 tabular-nums">
                      {roadmap.progress.percent}%
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] text-ink-500 tabular-nums">
                    {roadmap.progress.COMPLETED}/{roadmap.progress.total} topics ·{" "}
                    <span className="text-ember-400/70">{roadmap.progress.IN_PROGRESS} in progress</span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent proof of work */}
      {stats.recentProof.length > 0 ? (
        <section>
          <SectionTitle>Recent proof of work</SectionTitle>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {stats.recentProof.map((proof) => (
              <li key={proof.url}>
                <a
                  href={proof.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="panel panel-hover group flex h-full flex-col gap-1.5 p-3.5"
                >
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ember-400">
                    <LinkIcon className="size-3" />
                    {proof.label ?? "Link"}
                    <ExternalIcon className="size-2.5 opacity-60 group-hover:opacity-100 transition" />
                  </span>
                  <span className="text-xs font-medium text-ink-200">{proof.topicTitle}</span>
                  <span className="mt-auto text-[10px] text-ink-500">
                    {proof.roadmapTitle} · {formatRelativeDay(proof.authoredOn, new Date())}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="panel flex items-center gap-3 p-4">
          <JournalIcon className="size-4 shrink-0 text-ink-500" />
          <p className="text-xs text-ink-400">
            No proof of work yet. Open a topic, write what you learned, and link a repo, design, or document.
          </p>
        </section>
      )}
    </div>
  );
}

const METRIC_TONES = {
  mint: "border-mint-500/30 bg-mint-500/10 text-mint-400",
  sky: "border-sky-ember/30 bg-sky-ember/10 text-sky-ember",
} as const;

/** Compact labelled metric with an accent icon, used for the dashboard stat row. */
function MetricCard({
  label,
  value,
  suffix,
  footnote,
  icon,
  tone,
}: {
  label: string;
  value: string;
  suffix?: string;
  footnote: React.ReactNode;
  icon: React.ReactNode;
  tone: keyof typeof METRIC_TONES;
}) {
  return (
    <Card className="accent-top p-5 transition duration-300 hover:border-ink-600">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-ink-400 uppercase">{label}</p>
        <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg border", METRIC_TONES[tone])}>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-ink-100 tabular-nums">
        {value}
        {suffix ? <span className="text-base font-normal text-ink-500"> {suffix}</span> : null}
      </p>
      <div className="mt-1 text-xs text-ink-500">{footnote}</div>
    </Card>
  );
}
