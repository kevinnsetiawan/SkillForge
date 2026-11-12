"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { AiRoadmapForm } from "./ai-roadmap-form";
import { NewRoadmapForm } from "./new-roadmap-form";

const TABS = [
  { id: "ai", label: "AI generator" },
  { id: "manual", label: "Build manually" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function NewRoadmapTabs({ aiEnabled }: { aiEnabled: boolean }) {
  const [tab, setTab] = useState<TabId>("ai");

  return (
    <div className="mt-6">
      <div
        role="tablist"
        aria-label="How to create your roadmap"
        className="flex gap-1 rounded-xl border border-ink-700 bg-ink-900/60 p-1"
      >
        {TABS.map((item) => {
          const active = tab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`new-roadmap-tab-${item.id}`}
              aria-selected={active}
              aria-controls={`new-roadmap-panel-${item.id}`}
              onClick={() => setTab(item.id)}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200",
                active
                  ? "bg-ink-700 text-ink-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                  : "text-ink-400 hover:bg-ink-800/60 hover:text-ink-200",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="new-roadmap-panel-ai"
        aria-labelledby="new-roadmap-tab-ai"
        hidden={tab !== "ai"}
        className="mt-4"
      >
        <AiRoadmapForm aiEnabled={aiEnabled} />
      </div>

      <div
        role="tabpanel"
        id="new-roadmap-panel-manual"
        aria-labelledby="new-roadmap-tab-manual"
        hidden={tab !== "manual"}
        className="mt-4"
      >
        <NewRoadmapForm />
      </div>
    </div>
  );
}
