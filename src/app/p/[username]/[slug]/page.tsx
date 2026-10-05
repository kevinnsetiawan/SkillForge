import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicRoadmap } from "@/lib/queries";
import { computeProgress } from "@/lib/progress";
import { formatDate, formatRelativeDay } from "@/lib/utils";
import { CheckIcon, LockIcon, StatusDot } from "@/components/progress";
import { ExternalIcon, LinkIcon } from "@/components/icons";
import { Card } from "@/components/ui/button";

type Params = Promise<{ username: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username, slug } = await params;
  const roadmap = await getPublicRoadmap(decodeURIComponent(username), decodeURIComponent(slug));

  if (!roadmap) return { title: "Roadmap not found" };

  return {
    title: roadmap.title,
    description:
      roadmap.description ?? `A learning roadmap by ${roadmap.owner.name ?? roadmap.owner.username}.`,
  };
}

export default async function PublicRoadmapPage({ params }: { params: Params }) {
  const { username, slug } = await params;
  const decodedUser = decodeURIComponent(username);
  const roadmap = await getPublicRoadmap(decodedUser, decodeURIComponent(slug));

  if (!roadmap) notFound();

  const proofCount = roadmap.modules.reduce(
    (total, module) => total + module.topics.filter((topic) => topic.entries[0]?.proofUrl).length,
    0,
  );
  const journalled = roadmap.modules.reduce(
    (total, module) => total + module.topics.filter((topic) => topic.entries.length > 0).length,
    0,
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-ink-500">
        <Link href={`/p/${roadmap.owner.username}`} className="hover:text-ember-300">
          {roadmap.owner.name ?? roadmap.owner.username}
        </Link>
        <span>/</span>
        <span className="text-ink-300">{roadmap.title}</span>
      </nav>

      <header className="panel panel-raised accent-top relative overflow-hidden p-6">
        <div
          className="pointer-events-none absolute -top-28 -left-12 size-64 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-ember-500), transparent 70%)" }}
        />
        <h1 className="relative text-3xl font-semibold tracking-tight text-ink-100">{roadmap.title}</h1>
        {roadmap.goal ? <p className="relative mt-2 text-sm text-ember-300">{roadmap.goal}</p> : null}
        {roadmap.description ? (
          <p className="relative mt-3 max-w-2xl text-sm leading-relaxed text-ink-300">{roadmap.description}</p>
        ) : null}
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Completion" value={`${roadmap.progress.percent}%`} tone="ember" />
        <Stat label="Topics" value={`${roadmap.progress.COMPLETED}/${roadmap.progress.total}`} />
        <Stat label="Journalled" value={String(journalled)} />
        <Stat label="Proof links" value={String(proofCount)} />
      </dl>

      <div className="mt-10 space-y-6">
        {roadmap.modules.map((module, index) => {
          const moduleProgress = computeProgress(module.topics.map((topic) => topic.status));

          return (
            <Card key={module.id} className="overflow-hidden">
              <div className="flex items-center gap-3 border-b border-ink-700 bg-ink-850/60 px-5 py-3.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-ink-600 bg-ink-800 text-xs font-semibold text-ink-300">
                  {index + 1}
                </span>
                <h2 className="min-w-0 flex-1 text-sm font-semibold text-ink-100">{module.title}</h2>
                <span className="shrink-0 text-[11px] text-ink-400 tabular-nums">
                  {moduleProgress.COMPLETED}/{moduleProgress.total}
                </span>
              </div>

              {module.topics.length === 0 ? (
                <p className="px-5 py-4 text-xs text-ink-500">No topics in this module.</p>
              ) : (
                <ul className="divide-y divide-ink-800">
                  {module.topics.map((topic) => {
                    const entry = topic.entries[0];

                    return (
                      <li key={topic.id} className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <StatusDot status={topic.status} className="mt-0.5" />

                          <div className="min-w-0 flex-1">
                            <p
                              className={
                                topic.status === "LOCKED"
                                  ? "text-sm text-ink-400"
                                  : "text-sm font-medium text-ink-100"
                              }
                            >
                              {topic.title}
                            </p>

                            {entry ? (
                              <div className="mt-2 space-y-2">
                                {entry.proofUrl ? (
                                  <a
                                    href={entry.proofUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-ink-700 bg-ink-900/60 px-2.5 py-1 text-[11px] text-ember-300 transition hover:border-ember-500/50"
                                  >
                                    <LinkIcon className="size-3" />
                                    {entry.proofLabel ?? "Proof of work"}
                                    <ExternalIcon className="size-2.5" />
                                  </a>
                                ) : null}

                                <p className="text-xs leading-relaxed whitespace-pre-wrap text-ink-300">
                                  {entry.note}
                                </p>

                                <p className="text-[10px] text-ink-500">
                                  Journalled {formatRelativeDay(entry.authoredOn, new Date())} ·{" "}
                                  {formatDate(entry.authoredOn)}
                                </p>
                              </div>
                            ) : topic.status === "LOCKED" ? (
                              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-500">
                                <LockIcon className="size-3" />
                                Not started
                              </p>
                            ) : (
                              <p className="mt-1 text-[11px] text-ink-500">In progress — no journal yet</p>
                            )}
                          </div>

                          {topic.status === "COMPLETED" ? (
                            <span className="mt-0.5 shrink-0 text-mint-400" title="Completed">
                              <CheckIcon className="size-3.5" />
                            </span>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          );
        })}
      </div>

      <footer className="mt-12 border-t border-ink-800 pt-6 text-center text-[11px] text-ink-500">
        <SectionTitleHint />
      </footer>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "ember" }) {
  return (
    <div className="panel px-4 py-3">
      <dt className="text-[11px] tracking-wide text-ink-500 uppercase">{label}</dt>
      <dd
        className={
          tone === "ember"
            ? "mt-1 text-lg font-semibold text-ember-300 tabular-nums"
            : "mt-1 text-lg font-semibold text-ink-100 tabular-nums"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function SectionTitleHint() {
  return (
    <p>
      This roadmap was built and tracked with{" "}
      <Link href="/" className="text-ember-400 hover:text-ember-300">
        SkillForge
      </Link>
    </p>
  );
}
