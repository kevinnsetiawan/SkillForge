/**
 * Static, purely decorative preview of the roadmap manager used in the landing
 * hero. It is server-rendered with plain markup so the marketing page ships no
 * extra client JavaScript — nothing here is interactive.
 */

const MOCK_TOPICS = [
  { label: "Variables & scope", state: "done" },
  { label: "Closures & scope chain", state: "done" },
  { label: "Promises & async/await", state: "done" },
  { label: "The event loop", state: "active" },
  { label: "Prototypes & delegation", state: "locked" },
  { label: "ES modules", state: "locked" },
] as const;

const MOCK_HEAT = [0, 1, 0, 2, 1, 3, 0, 1, 2, 0, 3, 2, 1, 0, 2, 3, 1, 0, 1, 2, 3, 0, 2, 1, 3, 2, 0, 1, 3, 2, 1, 0, 2, 3];

const HEAT_LEVELS = [
  "bg-ink-800 border-ink-700/80",
  "bg-ember-500/20 border-ember-500/25",
  "bg-ember-500/45 border-ember-500/45",
  "bg-ember-400 border-ember-400 shadow-[0_0_4px_0_var(--color-ember-400)]",
];

/** Conic-gradient ring — the hero cannot use the real <ProgressRing>, which is a client component. */
function StaticRing({ percent, size = 62 }: { percent: number; size?: number }) {
  return (
    <span className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow */}
      <span
        className="absolute inset-0 rounded-full opacity-40 blur-sm"
        style={{
          background: `conic-gradient(from -90deg, var(--color-ember-500) 0%, transparent ${percent}%, transparent 100%)`,
        }}
      />
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from -90deg, var(--color-ember-600) 0%, var(--color-ember-400) ${percent}%, var(--color-ink-800) ${percent}% 100%)`,
          WebkitMaskImage: "radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 8px))",
          maskImage: "radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 8px))",
        }}
      />
      <span className="relative text-xs font-bold text-ink-100 tabular-nums">{percent}%</span>
    </span>
  );
}

function TopicState({ state }: { state: (typeof MOCK_TOPICS)[number]["state"] }) {
  if (state === "done") {
    return (
      <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-mint-500/60 bg-mint-500/20 text-mint-400 shadow-[0_0_6px_-2px_var(--color-mint-500)]">
        <svg viewBox="0 0 12 12" fill="none" className="size-2.5" aria-hidden>
          <path d="M2.5 6.2 4.8 8.5 9.5 3.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  if (state === "active") {
    return (
      <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-ember-500/70 bg-ember-500/25 text-ember-400 shadow-[0_0_8px_-2px_var(--color-ember-500)]">
        <span className="size-1.5 rounded-full bg-current" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
      </span>
    );
  }

  return <span className="size-4 shrink-0 rounded-full border border-ink-600/80 bg-ink-800" />;
}

export function HeroMockup() {
  return (
    <div className="relative mx-auto max-w-5xl">
      {/* Bloom behind the frame */}
      <div
        className="pointer-events-none absolute -inset-x-16 -top-12 bottom-0 blur-3xl opacity-50"
        style={{ background: "radial-gradient(70% 55% at 50% 0%, color-mix(in oklab, var(--color-ember-500) 40%, transparent), transparent 65%)" }}
      />
      {/* Side blooms */}
      <div
        className="pointer-events-none absolute -left-8 top-1/3 size-40 blur-3xl opacity-25"
        style={{ background: "var(--color-sky-ember)" }}
      />
      <div
        className="pointer-events-none absolute -right-8 top-1/2 size-32 blur-3xl opacity-20"
        style={{ background: "var(--color-mint-500)" }}
      />

      {/* Browser chrome frame */}
      <div className="panel panel-raised relative overflow-hidden rounded-2xl border border-ink-700/80 animate-scale-in">
        {/* Title bar */}
        <div className="flex items-center gap-3 border-b border-ink-700/80 bg-ink-900/80 px-5 py-3.5">
          {/* Traffic lights */}
          <span className="flex gap-1.5">
            <span className="size-3 rounded-full bg-red-500/60" />
            <span className="size-3 rounded-full bg-yellow-500/60" />
            <span className="size-3 rounded-full bg-green-500/60" />
          </span>
          {/* URL bar */}
          <span className="mx-auto hidden max-w-60 flex-1 truncate rounded-md border border-ink-700 bg-ink-850/90 px-3 py-1.5 text-[10px] text-ink-500 sm:block">
            <span className="mr-1 text-mint-400/70">🔒</span>
            skillforge.dev/roadmaps/javascript-fundamentals
          </span>
          {/* Action dots */}
          <div className="hidden items-center gap-2 sm:flex">
            {["Share", "···"].map((label) => (
              <span key={label} className="rounded border border-ink-700 bg-ink-800/50 px-2 py-1 text-[9px] text-ink-500">
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.7fr_1fr]">
          {/* Roadmap column */}
          <div className="space-y-4">
            {/* Roadmap header */}
            <div className="flex items-center gap-4">
              <StaticRing percent={50} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink-100">JavaScript Fundamentals</p>
                <p className="mt-0.5 truncate text-[11px] text-ember-300/80">
                  Go from syntax to async without the hand-holding
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full border border-mint-500/30 bg-mint-500/10 px-2 py-0.5 text-[9px] font-medium text-mint-400">
                    <svg viewBox="0 0 12 12" fill="none" className="size-2" aria-hidden>
                      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    Public
                  </span>
                  <span className="text-[10px] text-ink-500 tabular-nums">3 of 6 topics ·</span>
                  <span className="text-[10px] text-ember-400/80">14 day streak 🔥</span>
                </div>
              </div>
            </div>

            {/* Module card */}
            <div className="overflow-hidden rounded-xl border border-ink-700/80 bg-ink-850/60">
              {/* Module header */}
              <div className="flex items-center gap-2.5 border-b border-ink-700/80 bg-ink-800/60 px-4 py-3">
                <span className="flex size-5 items-center justify-center rounded-md border border-ink-600 bg-ink-800 text-[10px] font-semibold text-ink-300">
                  1
                </span>
                <span className="text-[11px] font-semibold text-ink-100">Core language</span>
                <span className="ml-auto rounded-full border border-ink-600 bg-ink-800/50 px-2 py-0.5 text-[9px] tabular-nums text-ink-400">
                  3/6
                </span>
              </div>

              {/* Topic list */}
              <ul className="divide-y divide-ink-800/80">
                {MOCK_TOPICS.map((topic) => (
                  <li
                    key={topic.label}
                    className={`flex items-center gap-2.5 px-4 py-2.5 transition-colors duration-150 ${
                      topic.state === "active" ? "bg-ember-500/5" : ""
                    }`}
                  >
                    <TopicState state={topic.state} />
                    <span
                      className={`truncate text-[11px] flex-1 ${
                        topic.state === "locked"
                          ? "text-ink-600"
                          : topic.state === "active"
                          ? "text-ink-200 font-medium"
                          : "text-ink-300 line-through decoration-ink-600"
                      }`}
                    >
                      {topic.label}
                    </span>
                    {topic.state === "done" ? (
                      <span className="ml-auto shrink-0 rounded-full border border-ember-500/30 bg-ember-500/10 px-2 py-0.5 text-[9px] font-medium text-ember-300 hover:bg-ember-500/20 transition-colors">
                        proof ↗
                      </span>
                    ) : null}
                    {topic.state === "active" ? (
                      <span className="ml-auto shrink-0 rounded-full border border-ember-500/40 bg-ember-500/15 px-2 py-0.5 text-[9px] font-medium text-ember-300">
                        journaling…
                      </span>
                    ) : null}
                    {topic.state === "locked" ? (
                      <svg viewBox="0 0 12 12" fill="none" className="ml-auto size-3 text-ink-700 shrink-0" aria-hidden>
                        <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M4 5V4a2 2 0 0 1 4 0v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-3">
            {/* Streak widget */}
            <div className="rounded-xl border border-ink-700/80 bg-ink-850/60 p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl border border-ember-500/40 bg-ember-500/15 text-ember-400 shadow-[0_0_20px_-6px_var(--color-ember-500)]">
                  <svg viewBox="0 0 24 24" fill="none" className="size-4.5" aria-hidden>
                    <path
                      d="M12 2.5s5.5 4.2 5.5 9.2A5.5 5.5 0 0 1 12 21.5a5.5 5.5 0 0 1-5.5-5.8C6.5 12 9 10 9 10s-.6 2 1 2.8c0-2.4 2-4.6 2-4.6s.3 1.6 1.4 2.3c.5-2.5-.7-5.3-1.4-8Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <div className="flex-1">
                  <p className="text-[9px] font-medium uppercase tracking-widest text-ink-400">Current Streak</p>
                  <p className="text-xl leading-tight font-extrabold text-ink-100 tabular-nums">
                    14 <span className="text-[11px] font-normal text-ember-400/80">days 🔥</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-ink-500">Best</p>
                  <p className="text-sm font-bold text-ember-400 tabular-nums">21</p>
                </div>
              </div>

              {/* Heatmap */}
              <div className="mt-3.5 grid grid-cols-7 gap-1">
                {MOCK_HEAT.map((level, index) => (
                  <span
                    key={index}
                    title={level > 0 ? `${level} entr${level === 1 ? "y" : "ies"}` : "No activity"}
                    className={`aspect-square rounded-[3px] border transition-transform duration-150 hover:scale-110 ${HEAT_LEVELS[Math.min(level, HEAT_LEVELS.length - 1)]}`}
                  />
                ))}
              </div>

              {/* Weekday labels */}
              <div className="mt-1.5 grid grid-cols-7 gap-1">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} className="text-center text-[8px] text-ink-700">{d}</span>
                ))}
              </div>
            </div>

            {/* Latest proof */}
            <div className="rounded-xl border border-ink-700/80 bg-ink-850/60 p-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <div className="size-1.5 rounded-full bg-mint-400 shadow-[0_0_4px_0_var(--color-mint-400)]" />
                <p className="text-[9px] font-medium uppercase tracking-widest text-ink-400">Latest proof of work</p>
              </div>
              <div className="space-y-2">
                <a className="flex items-center gap-1.5 text-[10px] text-ember-300 hover:text-ember-200 transition-colors group">
                  <svg viewBox="0 0 24 24" fill="none" className="size-3 shrink-0 text-ink-500 group-hover:text-ember-400 transition-colors" aria-hidden>
                    <path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 1 0-5.7-5.7l-1.3 1.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 1 0 5.7 5.7l1.3-1.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <span className="truncate">github.com/kevin/event-loop-demo</span>
                  <svg viewBox="0 0 12 12" fill="none" className="size-2 shrink-0 opacity-50" aria-hidden>
                    <path d="M4 2h6v6M2 10l8-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </a>
                <p className="line-clamp-2 text-[10px] leading-relaxed text-ink-500">
                  Rebuilt the queue in a worker to finally see why a promise resolved twice. The stack trace clicked.
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full border border-ink-700 bg-ink-800 px-2 py-0.5 text-[9px] text-ink-500">The event loop</span>
                  <span className="text-[9px] text-ink-600">· 2 hours ago</span>
                </div>
              </div>
            </div>

            {/* Mini progress overview */}
            <div className="rounded-xl border border-ink-700/80 bg-ink-850/60 px-4 py-3">
              <p className="text-[9px] font-medium uppercase tracking-widest text-ink-400 mb-2.5">Module Progress</p>
              {[
                { label: "Core language", pct: 50, tone: "ember" },
                { label: "Async patterns", pct: 0, tone: "sky" },
                { label: "DOM & events", pct: 0, tone: "mint" },
              ].map((m) => (
                <div key={m.label} className="mb-2 last:mb-0">
                  <div className="flex justify-between text-[9px] mb-1">
                    <span className="text-ink-500">{m.label}</span>
                    <span className="text-ink-600 tabular-nums">{m.pct}%</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-ink-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${m.pct}%`,
                        background: m.tone === "ember"
                          ? "linear-gradient(90deg, var(--color-ember-600), var(--color-ember-400))"
                          : m.tone === "sky"
                          ? "linear-gradient(90deg, var(--color-sky-ember-deep), var(--color-sky-ember))"
                          : "linear-gradient(90deg, var(--color-mint-950), var(--color-mint-400))",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom edge fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-ink-950/90 to-transparent" />
      </div>
    </div>
  );
}
