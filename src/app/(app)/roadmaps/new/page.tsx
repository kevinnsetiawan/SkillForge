import type { Metadata } from "next";

import { NewRoadmapForm } from "./new-roadmap-form";

export const metadata: Metadata = { title: "New roadmap" };

export default function NewRoadmapPage() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="text-2xl font-semibold tracking-tight text-ink-100">New roadmap</h1>
      <p className="mt-1 text-sm text-ink-400">
        Give it a name and an optional goal. You will add modules and topics next.
      </p>

      <NewRoadmapForm />
    </div>
  );
}
