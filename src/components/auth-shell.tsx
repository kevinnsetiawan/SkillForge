import { Logo } from "./logo";

/**
 * Shared shell for /login and /register.
 * Renders a split layout: auth form on the left, decorative preview panel on the right.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col">
      {/* Minimal nav */}
      <header className="relative flex h-14 shrink-0 items-center px-6 border-b border-ink-800/50">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember-500/25 to-transparent" />
        <Logo />
      </header>

      <div className="flex flex-1">
        {/* Form column */}
        <div className="flex flex-1 items-center justify-center px-4 py-12">{children}</div>

        {/* Decorative preview panel — visible on large screens only */}
        <aside
          aria-hidden
          className="relative hidden w-[44%] max-w-md flex-col items-center justify-center gap-6 overflow-hidden border-l border-ink-800/80 px-10 py-12 lg:flex"
        >
          {/* Background glow */}
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{ background: "radial-gradient(70% 50% at 50% 30%, color-mix(in oklab, var(--color-ember-500) 14%, transparent), transparent 70%)" }}
          />
          {/* Secondary glow */}
          <div
            className="pointer-events-none absolute bottom-0 right-0 size-64 -z-10 blur-3xl opacity-20"
            style={{ background: "var(--color-sky-ember)" }}
          />

          {/* Mock roadmap card */}
          <div className="panel panel-raised accent-top w-full max-w-xs overflow-hidden animate-rise shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-2 border-b border-ink-700/80 bg-ink-850/60 px-4 py-3">
              <span className="flex size-6 items-center justify-center rounded-md border border-ink-600 bg-ink-800 text-[10px] font-bold text-ink-300">
                1
              </span>
              <span className="flex-1 text-xs font-semibold text-ink-100">JavaScript Fundamentals</span>
              <span className="text-[10px] tabular-nums text-ink-500 font-medium">4/6</span>
            </div>
            <ul className="divide-y divide-ink-800/80">
              {[
                { label: "Variables & Scope", s: "done" },
                { label: "Closures", s: "done" },
                { label: "Promises & async/await", s: "done" },
                { label: "Event Loop", s: "active" },
                { label: "Prototypes", s: "locked" },
                { label: "Modules (ESM)", s: "locked" },
              ].map((item) => (
                <li key={item.label} className={`flex items-center gap-2.5 px-4 py-2.5 ${item.s === "active" ? "bg-ember-500/5" : ""}`}>
                  <span
                    className={`inline-flex size-4 shrink-0 items-center justify-center rounded-full border text-[9px] ${
                      item.s === "done"
                        ? "border-mint-500/60 bg-mint-500/20 text-mint-400 shadow-[0_0_6px_-2px_var(--color-mint-500)]"
                        : item.s === "active"
                          ? "border-ember-500/70 bg-ember-500/25 text-ember-400 shadow-[0_0_8px_-2px_var(--color-ember-500)]"
                          : "border-ink-600 bg-ink-800 text-ink-600"
                    }`}
                  >
                    {item.s === "done" && (
                      <svg viewBox="0 0 12 12" fill="none" className="size-2.5" aria-hidden>
                        <path d="M2.5 6.2 4.8 8.5 9.5 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {item.s === "active" && <span className="size-1.5 rounded-full bg-current" />}
                  </span>
                  <span
                    className={`flex-1 text-[11px] ${
                      item.s === "locked"
                        ? "text-ink-600"
                        : item.s === "done"
                        ? "text-ink-400 line-through decoration-ink-600"
                        : "text-ink-200 font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.s === "done" && (
                    <span className="text-[9px] text-ember-400/70 font-medium">proof ↗</span>
                  )}
                  {item.s === "active" && (
                    <span className="rounded-full border border-ember-500/40 bg-ember-500/15 px-1.5 py-0.5 text-[8px] font-medium text-ember-300">
                      now
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Streak mini widget */}
          <div className="panel panel-raised flex w-full max-w-xs items-center gap-3 px-4 py-3.5 animate-rise" style={{ animationDelay: "100ms" }}>
            <div className="flex size-9 items-center justify-center rounded-xl border border-ember-500/40 bg-ember-500/15 text-ember-400 shadow-[0_0_24px_-6px_var(--color-ember-500)]">
              <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
                <path
                  d="M12 2.5s5.5 4.2 5.5 9.2A5.5 5.5 0 0 1 12 21.5a5.5 5.5 0 0 1-5.5-5.8C6.5 12 9 10 9 10s-.6 2 1 2.8c0-2.4 2-4.6 2-4.6s.3 1.6 1.4 2.3c.5-2.5-.7-5.3-1.4-8Z"
                  fill="currentColor"
                  opacity="0.9"
                />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-ink-500">Daily streak</p>
              <p className="text-xl font-extrabold text-ink-100 tabular-nums">
                14 <span className="text-xs font-normal text-ember-400/80">days</span>
              </p>
            </div>
            <div className="ml-auto flex items-end gap-0.5">
              {Array.from({ length: 14 }, (_, i) => (
                <span
                  key={i}
                  className="w-1.5 rounded-sm"
                  style={{
                    height: `${8 + (i / 13) * 14}px`,
                    opacity: 0.25 + (i / 13) * 0.75,
                    background: `linear-gradient(to top, var(--color-ember-600), var(--color-ember-400))`,
                  }}
                />
              ))}
            </div>
          </div>

          <p className="max-w-xs text-center text-[11px] leading-relaxed text-ink-500 animate-rise" style={{ animationDelay: "200ms" }}>
            Track every topic you study. Prove every skill you earn.{" "}
            <span className="text-ember-400/80">Share your journey.</span>
          </p>
        </aside>
      </div>
    </main>
  );
}
