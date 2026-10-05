import Link from "next/link";

import { cn } from "@/lib/utils";

/** The SkillForge mark: an anvil with a glowing seam. Decorative only. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-linear-to-br from-ember-300 via-ember-500 to-ember-600 text-ink-950",
        "shadow-[0_4px_14px_-4px_var(--color-ember-500)]",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
        <path d="M4 8h11a4 4 0 0 1 4 4v1H8a4 4 0 0 1-4-4V8Z" fill="currentColor" />
        <path d="M8 17h8l1.5 3.5h-11L8 17Z" fill="currentColor" opacity="0.7" />
        <path d="M9 13.2v3.6M15 13.2v3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
      </svg>
    </span>
  );
}

/** Wordmark + mark, linking home. `href` points at the dashboard for signed-in chrome. */
export function Logo({
  href = "/",
  className,
  showWordmark = true,
}: {
  href?: string;
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("group flex items-center gap-2 text-sm font-semibold text-ink-100", className)}
    >
      <LogoMark className="transition-transform duration-300 group-hover:scale-105" />
      {showWordmark ? <span className="tracking-tight">SkillForge</span> : null}
    </Link>
  );
}
