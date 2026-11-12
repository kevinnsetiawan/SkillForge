"use client";

import { useActionState } from "react";

import { ExternalIcon, MapIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Field, FormBanner, Input, Select, Textarea } from "@/components/ui/field";
import {
  generateRoadmapAction,
  saveGeneratedRoadmapAction,
  type GenerateRoadmapState,
} from "@/lib/actions/ai-roadmap";
import type { RoadmapPlan } from "@/lib/ai/roadmap-plan";
import type { ActionState } from "@/lib/validation";
import { inferLinkLabel } from "@/lib/utils";

export function AiRoadmapForm({ aiEnabled }: { aiEnabled: boolean }) {
  const [state, generate, generating] = useActionState<GenerateRoadmapState, FormData>(
    generateRoadmapAction,
    undefined,
  );
  const [saveState, save, saving] = useActionState<ActionState, FormData>(
    saveGeneratedRoadmapAction,
    undefined,
  );

  const plan = state?.ok ? state.plan : null;
  const errors = state?.ok ? undefined : state?.errors;

  return (
    <div className="space-y-4">
      {!aiEnabled ? <AiSetupHint /> : null}

      <form action={generate} className="panel panel-raised accent-top space-y-4 p-5">
        {!state?.ok ? <FormBanner state={state} /> : null}

        <Field
          label="What do you want to learn?"
          htmlFor="topic"
          hint="Be specific about the skill and the outcome you want. The AI writes the roadmap in the same language you use."
          errors={errors?.topic}
        >
          <Textarea
            id="topic"
            name="topic"
            required
            minLength={3}
            maxLength={160}
            placeholder="e.g. Belajar React dari nol sampai bisa membuat portfolio yang deploy online"
            className="min-h-20"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your level" htmlFor="level" errors={errors?.level}>
            <Select id="level" name="level" defaultValue="beginner">
              <option value="beginner">Beginner — start from zero</option>
              <option value="intermediate">Intermediate — know the basics</option>
              <option value="advanced">Advanced — go deep</option>
            </Select>
          </Field>

          <Field
            label="Target goal (optional)"
            htmlFor="goal"
            hint="A job, project, or milestone."
            errors={errors?.goal}
          >
            <Input id="goal" name="goal" maxLength={160} placeholder="e.g. Frontend Engineer" />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button type="submit" disabled={generating || !aiEnabled} className="sheen btn-glow">
            {generating ? "Designing your roadmap…" : plan ? "Generate again" : "Generate roadmap"}
          </Button>
          <span className="text-xs leading-relaxed text-ink-500">
            AI drafts modules, topics, and a resource link for every topic. You can edit everything after saving.
          </span>
        </div>

        {generating ? <GeneratingSkeleton /> : null}
      </form>

      {plan ? (
        <PlanPreview plan={plan} saveState={saveState} save={save} saving={saving} />
      ) : null}
    </div>
  );
}

function AiSetupHint() {
  return (
    <div className="rounded-xl border border-ember-500/30 bg-ember-500/10 px-4 py-3 text-xs leading-relaxed">
      <p className="font-semibold text-ember-200">AI generator is not configured yet.</p>
      <p className="mt-1 text-ink-300">
        Add <code className="rounded bg-ink-900/70 px-1 py-0.5 font-mono text-[11px] text-ember-200">AI_API_KEY</code>{" "}
        (plus <code className="rounded bg-ink-900/70 px-1 py-0.5 font-mono text-[11px] text-ember-200">AI_BASE_URL</code>{" "}
        and <code className="rounded bg-ink-900/70 px-1 py-0.5 font-mono text-[11px] text-ember-200">AI_MODEL</code>{" "}
        for non-OpenAI providers) to your <code className="rounded bg-ink-900/70 px-1 py-0.5 font-mono text-[11px] text-ember-200">.env</code>{" "}
        file, then restart the dev server. You can still use the manual tab.
      </p>
    </div>
  );
}

function GeneratingSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-ink-700 bg-ink-900/40 p-4" aria-live="polite">
      <p className="text-xs text-ink-400">AI is drafting your modules and topics…</p>
      <div className="space-y-2">
        <div className="shimmer h-3 w-1/3 rounded-full" />
        <div className="shimmer h-2.5 w-3/4 rounded-full" />
        <div className="shimmer h-2.5 w-2/3 rounded-full" />
      </div>
      <div className="space-y-2 pt-2">
        <div className="shimmer h-3 w-1/4 rounded-full" />
        <div className="shimmer h-2.5 w-4/5 rounded-full" />
      </div>
    </div>
  );
}

function PlanPreview({
  plan,
  saveState,
  save,
  saving,
}: {
  plan: RoadmapPlan;
  saveState: ActionState;
  save: (payload: FormData) => void;
  saving: boolean;
}) {
  const totalTopics = plan.modules.reduce((total, module) => total + module.topics.length, 0);

  return (
    <section className="panel panel-raised animate-rise overflow-hidden">
      <header className="border-b border-ink-700/70 bg-ink-900/40 p-5">
        <p className="eyebrow">
          <MapIcon className="size-3.5" />
          AI roadmap preview
        </p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink-100">{plan.title}</h2>
        {plan.goal ? <p className="mt-1 text-sm text-ember-300/90">{plan.goal}</p> : null}
        {plan.description ? <p className="mt-2 text-sm text-ink-400">{plan.description}</p> : null}
        <p className="mt-3 text-xs text-ink-500 tabular-nums">
          {plan.modules.length} module{plan.modules.length === 1 ? "" : "s"} · {totalTopics} topic
          {totalTopics === 1 ? "" : "s"}
        </p>
      </header>

      <ol className="divide-y divide-ink-800/80">
        {plan.modules.map((module, moduleIndex) => (
          <li key={`${module.title}-${moduleIndex}`} className="p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-ember-500/40 bg-ember-500/10 text-[11px] font-semibold text-ember-300 tabular-nums">
                {moduleIndex + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-ink-100">{module.title}</h3>
                <ul className="mt-2 space-y-1.5">
                  {module.topics.map((topic, topicIndex) => (
                    <li
                      key={`${topic.title}-${topicIndex}`}
                      className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-ink-300"
                    >
                      <span aria-hidden className="text-ink-600">
                        •
                      </span>
                      <span>{topic.title}</span>
                      {topic.resource ? (
                        <a
                          href={topic.resource}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-ember-400/90 transition hover:text-ember-300"
                        >
                          {inferLinkLabel(topic.resource) ?? "Resource"}
                          <ExternalIcon className="size-2.5" />
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <footer className="border-t border-ink-700/70 bg-ink-900/40 p-5">
        {saveState && !saveState.ok ? <FormBanner state={saveState} /> : null}

        <form action={save} className="mt-3 flex flex-wrap items-center gap-3">
          <input type="hidden" name="plan" value={JSON.stringify(plan)} />
          <Button type="submit" disabled={saving} className="btn-glow">
            {saving ? "Creating roadmap…" : "Create this roadmap"}
          </Button>
          <span className="text-xs leading-relaxed text-ink-500">
            Saves {totalTopics} locked topics. Rename, reorder, or delete them anytime.
          </span>
        </form>
      </footer>
    </section>
  );
}
