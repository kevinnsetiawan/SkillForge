import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      {/* Minimal header */}
      <header className="flex h-14 items-center px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-ink-100">
          <span className="flex size-7 items-center justify-center rounded-lg bg-ember-500 text-ink-950 shadow-[0_4px_14px_-4px_#f59e0b]">
            <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
              <path d="M5 7h9a4 4 0 0 1 4 4v1H8a3 3 0 0 1-3-3V7Z" fill="currentColor" />
              <path d="M8 16h7l1.5 4h-10L8 16Z" fill="currentColor" opacity="0.75" />
            </svg>
          </span>
          SkillForge
        </Link>
      </header>

      {/* Decorative side column on large screens */}
      <div className="flex flex-1">
        {/* Auth form column */}
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          {children}
        </div>

        {/* Visual panel — hidden on mobile */}
        <aside className="hidden w-[45%] max-w-lg items-center justify-center border-l border-ink-800 bg-ink-900/40 p-12 lg:flex">
          <div className="max-w-xs space-y-8">
            <div className="space-y-4">
              {/* Mini roadmap preview */}
              <div className="panel panel-raised overflow-hidden">
                <div className="border-b border-ink-700 bg-ink-850/60 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-md border border-ink-600 bg-ink-800 text-[10px] font-bold text-ink-300">1</span>
                    <span className="text-xs font-semibold text-ink-100">JavaScript Fundamentals</span>
                    <span className="ml-auto text-[10px] text-ink-400 tabular-nums">4/6</span>
                  </div>
                </div>
                <ul className="divide-y divide-ink-800 text-[11px]">
                  {[
                    { label: "Variables & Scope", status: "done" },
                    { label: "Closures", status: "done" },
                    { label: "Promises & async/await", status: "done" },
                    { label: "Event Loop", status: "active" },
                    { label: "Prototypes", status: "locked" },
                    { label: "Modules (ESM)", status: "locked" },
                  ].map((item) => (
                    <li key={item.label} className="flex items-center gap-2.5 px-4 py-2">
                      <span className={`size-4 rounded-full border flex items-center justify-center ${
                        item.status === "done"
                          ? "border-mint-500/60 bg-mint-500/20 text-mint-400"
                          : item.status === "active"
                          ? "border-ember-500/60 bg-ember-500/20 text-ember-400"
                          : "border-ink-600 bg-ink-800 text-ink-500"
                      }`}>
                        {item.status === "done" && (
                          <svg viewBox="0 0 12 12" fill="none" className="size-2.5" aria-hidden>
                            <path d="M2.5 6.2 4.8 8.5 9.5 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                        {item.status === "active" && <span className="size-1.5 rounded-full bg-current" />}
                      </span>
                      <span className={item.status === "locked" ? "text-ink-500" : "text-ink-200"}>{item.label}</span>
                      {item.status === "done" && (
                        <span className="ml-auto text-[9px] text-ember-400/70">proof ↗</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Streak widget */}
            <div className="panel flex items-center gap-3 px-4 py-3">
              <div className="flex size-9 items-center justify-center rounded-xl border border-ember-500/40 bg-ember-500/10 text-ember-400">
                <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
                  <path d="M12 2.5s5.5 4.2 5.5 9.2A5.5 5.5 0 0 1 12 21.5a5.5 5.5 0 0 1-5.5-5.8C6.5 12 9 10 9 10s-.6 2 1 2.8c0-2.4 2-4.6 2-4.6s.3 1.6 1.4 2.3c.5-2.5-.7-5.3-1.4-8Z" fill="currentColor" opacity="0.9" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-ink-400">Daily streak</p>
                <p className="text-xl font-bold text-ink-100 tabular-nums">
                  14 <span className="text-xs font-normal text-ink-400">days</span>
                </p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {Array.from({ length: 14 }, (_, i) => (
                  <span key={i} className="h-4 w-1.5 rounded-sm bg-ember-500/70" style={{ opacity: 0.3 + (i / 14) * 0.7 }} />
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-ink-500">
              Track every topic you study. Prove every skill you learn.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
