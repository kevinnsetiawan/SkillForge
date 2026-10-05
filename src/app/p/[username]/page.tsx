import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicProfile } from "@/lib/queries";
import { ProgressBar, ProgressRing } from "@/components/progress";
import { MapIcon } from "@/components/icons";
import { Card } from "@/components/ui/button";

type Params = Promise<{ username: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(decodeURIComponent(username));

  if (!profile) return { title: "Profile not found" };

  return {
    title: profile.name ? `${profile.name}'s learning portfolio` : `${profile.username}'s learning portfolio`,
    description: profile.bio ?? `Learning roadmaps and proof of work by ${profile.name ?? profile.username}.`,
  };
}

export default async function PublicProfilePage({ params }: { params: Params }) {
  const { username } = await params;
  const profile = await getPublicProfile(decodeURIComponent(username));

  if (!profile) notFound();

  const hidden = !profile.portfolioPublic;
  const initials = (profile.name ?? profile.username).slice(0, 2).toUpperCase();
  const overallPercent =
    profile.totals.topics === 0 ? 0 : Math.round((profile.totals.completed / profile.totals.topics) * 100);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      {/* Hero banner */}
      <header className="panel panel-raised accent-top relative overflow-hidden p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -top-32 -right-16 size-80 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-ember-500), transparent 70%)" }}
        />

        <div className="relative flex flex-wrap items-center gap-5">
          {profile.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.image}
              alt=""
              className="size-16 rounded-2xl border border-ink-600 object-cover"
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-2xl border border-ember-500/40 bg-linear-to-br from-ember-500/20 to-ink-800 text-lg font-bold text-ember-300">
              {initials}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="eyebrow mb-1.5">Learning portfolio</p>
            <h1 className="text-2xl font-semibold tracking-tight text-ink-100 sm:text-3xl">
              {profile.name ?? profile.username}
            </h1>
            <p className="mt-1 text-sm text-ink-500">/p/{profile.username}</p>
          </div>

          {profile.roadmaps.length > 0 ? (
            <div className="shrink-0">
              <ProgressRing percent={overallPercent} size={76} strokeWidth={7} />
            </div>
          ) : null}
        </div>

        {profile.bio ? <p className="relative mt-5 max-w-2xl text-sm leading-relaxed text-ink-300">{profile.bio}</p> : null}
      </header>

      {/* Totals */}
      {!hidden && profile.roadmaps.length > 0 ? (
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Roadmaps" value={String(profile.roadmaps.length)} />
          <Stat label="Topics" value={`${profile.totals.completed}/${profile.totals.topics}`} />
          <Stat label="Proof links" value={String(profile.totals.proofCount)} />
          <Stat label="Completion" value={`${overallPercent}%`} tone="ember" />
        </dl>
      ) : null}

      {hidden ? (
        <Card className="mt-8 p-6 text-center">
          <p className="text-sm text-ink-200">This portfolio is private.</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-ink-400">
            The owner has not made their roadmap pages public. Check back later, or ask them for a direct
            link.
          </p>
        </Card>
      ) : profile.roadmaps.length === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <div className="mx-auto mb-4 flex size-10 items-center justify-center rounded-xl border border-ink-700 bg-ink-800 text-ink-500">
            <MapIcon className="size-5" />
          </div>
          <p className="text-sm text-ink-200">No published roadmaps yet.</p>
          <p className="mt-1 text-xs text-ink-400">When a roadmap is published it will appear here.</p>
        </Card>
      ) : (
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-ink-200 uppercase">
            Published roadmaps
          </h2>

          <ul className="space-y-3">
            {profile.roadmaps.map((roadmap) => (
              <li key={roadmap.id}>
                <Link
                  href={`/p/${profile.username}/${roadmap.slug}`}
                  className="panel panel-raised panel-hover group flex flex-wrap items-center gap-5 p-5"
                >
                  <div className="shrink-0">
                    <ProgressRing
                      percent={roadmap.progress.percent}
                      size={60}
                      tone={roadmap.progress.isComplete ? "mint" : "ember"}
                    />
                  </div>

                  <div className="min-w-48 flex-1">
                    <h3 className="text-sm font-semibold text-ink-100 transition group-hover:text-ember-300">
                      {roadmap.title}
                    </h3>
                    {roadmap.goal ? <p className="mt-0.5 text-xs text-ember-300/90">{roadmap.goal}</p> : null}
                    {roadmap.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-ink-500">{roadmap.description}</p>
                    ) : null}

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <ProgressBar
                        percent={roadmap.progress.percent}
                        tone={roadmap.progress.isComplete ? "mint" : "ember"}
                        className="max-w-52"
                        label={`${roadmap.title} progress`}
                      />
                      <span className="text-[11px] text-ink-500 tabular-nums">
                        {roadmap.progress.COMPLETED}/{roadmap.progress.total} topics
                      </span>
                      {roadmap.proofCount > 0 ? (
                        <span className="text-[11px] text-ink-500 tabular-nums">
                          · {roadmap.proofCount} proof{roadmap.proofCount === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-12 border-t border-ink-800 pt-6 text-center text-[11px] text-ink-500">
        <p>
          Built with{" "}
          <Link href="/" className="text-ember-400 hover:text-ember-300">
            SkillForge
          </Link>
        </p>
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
