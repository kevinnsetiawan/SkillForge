import Link from "next/link";

import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-20">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-ember-500), transparent 70%)" }}
      />

      <div className="relative text-center animate-rise">
        <div className="mb-6 inline-flex size-16 items-center justify-center rounded-2xl border border-ink-700 bg-ink-850 text-ink-500">
          <svg viewBox="0 0 24 24" fill="none" className="size-7" aria-hidden>
            <path
              d="M9.172 14.828 12 12m0 0 2.828-2.828M12 12 9.172 9.172M12 12l2.828 2.828M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-xs font-semibold tracking-widest text-ember-400 uppercase">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-100">Page not found</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-400">
          This roadmap, topic or profile does not exist — or it is still private.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="sheen btn-glow inline-flex h-10 items-center gap-2 rounded-xl bg-ember-500 px-5 text-sm font-semibold text-ink-950 transition hover:bg-ember-400"
          >
            Back to dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-xl border border-ink-600 bg-ink-800/60 px-5 text-sm font-medium text-ink-200 transition hover:border-ink-500 hover:bg-ink-700"
          >
            Home
          </Link>
        </div>

        <div className="mt-12 flex justify-center opacity-50">
          <Logo />
        </div>
      </div>
    </main>
  );
}
