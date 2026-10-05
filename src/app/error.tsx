"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-20">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #ef4444, transparent 70%)" }}
      />

      <div className="relative max-w-md text-center animate-rise">
        <div className="mb-6 inline-flex size-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 shadow-[0_0_30px_-10px_var(--color-red-500)]">
          <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden>
            <path
              d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-100">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink-400">
          The page failed to render. This is usually a stale session or a database that is not reachable.
        </p>
        <button
          type="button"
          onClick={reset}
          className="sheen btn-glow mt-7 inline-flex h-10 items-center gap-2 rounded-xl bg-ember-500 px-5 text-sm font-semibold text-ink-950 transition hover:bg-ember-400"
        >
          Try again
        </button>
        {error.digest ? (
          <p className="mt-4 rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 font-mono text-[10px] text-ink-500">
            ref: {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
