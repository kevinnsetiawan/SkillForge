import type { Metadata } from "next";

import { getAiConfig } from "@/lib/ai/roadmap-generator";
import { NewRoadmapTabs } from "./new-roadmap-tabs";

export const metadata: Metadata = { title: "New roadmap" };

export default function NewRoadmapPage() {
  // Read server-side so the form can explain how to enable the generator
  // instead of only failing after a submit.
  const aiEnabled = Boolean(getAiConfig());

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="eyebrow mb-2">New roadmap</p>
      <h1 className="text-2xl font-semibold tracking-tight text-ink-100">
        What do you want to learn?
      </h1>
      <p className="mt-1.5 max-w-2xl text-sm text-ink-400">
        Describe your goal and the AI will draft a complete learning path — modules, topics, and
        resources you can start working through right away. Prefer to build it yourself? Switch to
        the manual tab.
      </p>

      <NewRoadmapTabs aiEnabled={aiEnabled} />
    </div>
  );
}
