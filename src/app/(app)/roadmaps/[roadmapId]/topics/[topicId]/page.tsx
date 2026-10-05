import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/dal";
import { getTopicForUser } from "@/lib/queries";
import { saveJournal } from "@/lib/actions/journal";
import { StatusDot } from "@/components/progress";
import { JournalForm } from "./journal-form";

export const metadata = { title: "Topic journal" };
export const dynamic = "force-dynamic";

export default async function TopicPage({
  params,
}: PageProps<"/roadmaps/[roadmapId]/topics/[topicId]">) {
  const { roadmapId, topicId } = await params;
  const user = await requireUser();

  const topic = await getTopicForUser(topicId, user.id);
  // Guard against a topic id from a different roadmap in the same account.
  if (!topic || topic.module.roadmapId !== roadmapId) notFound();

  const entry = topic.entries[0];
  const siblings = topic.module.topics;
  const currentIndex = siblings.findIndex((t) => t.id === topic.id);
  const previous = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const next = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
        <Link href="/roadmaps" className="hover:text-ember-300">
          Roadmaps
        </Link>
        <span>/</span>
        <Link href={`/roadmaps/${roadmapId}`} className="hover:text-ember-300">
          {topic.module.roadmap.title}
        </Link>
        <span>/</span>
        <span className="text-ink-300">{topic.module.title}</span>
      </nav>

      <header className="panel panel-raised p-6">
        <div className="flex items-start gap-3">
          <StatusDot status={topic.status} className="mt-1 size-6" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-ink-100">{topic.title}</h1>
            <p className="mt-1 text-xs text-ink-500">
              Topic {currentIndex + 1} of {siblings.length} in {topic.module.title}
            </p>
          </div>
        </div>

        {topic.resource ? (
          <a
            href={topic.resource}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink-300 hover:text-ember-300"
          >
            {topic.resource}
          </a>
        ) : null}
      </header>

      <JournalForm
        action={saveJournal}
        topicId={topic.id}
        defaultNote={entry?.note ?? ""}
        defaultProofUrl={entry?.proofUrl ?? ""}
        defaultProofLabel={entry?.proofLabel ?? ""}
        completed={topic.status === "COMPLETED"}
        authoredOn={entry?.authoredOn ?? null}
      />

      <nav className="flex items-center justify-between border-t border-ink-800 pt-4 text-xs">
        {previous ? (
          <Link
            href={`/roadmaps/${roadmapId}/topics/${previous.id}`}
            className="text-ink-400 hover:text-ember-300"
          >
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}

        {next ? (
          <Link href={`/roadmaps/${roadmapId}/topics/${next.id}`} className="text-ink-400 hover:text-ember-300">
            {next.title} →
          </Link>
        ) : (
          <Link href={`/roadmaps/${roadmapId}`} className="text-ink-400 hover:text-ember-300">
            Back to roadmap →
          </Link>
        )}
      </nav>
    </div>
  );
}
