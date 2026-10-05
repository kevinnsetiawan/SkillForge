import type { Metadata } from "next";

import { requireUser } from "@/lib/dal";
import { updateProfile, setPortfolioVisibility } from "@/lib/actions/auth";
import { ProfileForm, PortfolioVisibility } from "./profile-form";
import { getRoadmapSummaries } from "@/lib/queries";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const roadmaps = await getRoadmapSummaries(user.id);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-100">Settings</h1>
        <p className="mt-1 text-sm text-ink-400">
          Your username is the public portfolio URL, so change it before you share a roadmap.
        </p>
      </div>

      <ProfileForm action={updateProfile} user={user} />

      <PortfolioVisibility action={setPortfolioVisibility} isPublic={user.portfolioPublic} />

      <section className="panel p-5">
        <h2 className="text-sm font-semibold text-ink-200">Published roadmaps</h2>
        {roadmaps.filter((r) => r.isPublished).length === 0 ? (
          <p className="mt-2 text-xs text-ink-500">
            Nothing is published. Open a roadmap and enable &ldquo;Publish this roadmap&rdquo; in its
            settings.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {roadmaps
              .filter((r) => r.isPublished)
              .map((roadmap) => (
                <li key={roadmap.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-ink-200">{roadmap.title}</span>
                  <a
                    href={`/p/${user.username}/${roadmap.slug}`}
                    className="text-ember-400 hover:text-ember-300"
                  >
                    /p/{user.username}/{roadmap.slug} →
                  </a>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
