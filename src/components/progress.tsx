"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

const TONES = {
  ember: { from: "var(--color-ember-600)", to: "var(--color-ember-300)" },
  mint: { from: "var(--color-mint-500)", to: "var(--color-mint-400)" },
} as const;

export type Tone = keyof typeof TONES;

export function ProgressBar({
  percent,
  className,
  tone = "ember",
  label,
}: {
  percent: number;
  className?: string;
  tone?: Tone | "muted";
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const fill =
    tone === "muted"
      ? "bg-ink-500"
      : tone === "mint"
        ? "bg-linear-to-r from-mint-500 to-mint-400"
        : "bg-linear-to-r from-ember-600 via-ember-500 to-ember-400";

  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-ink-800", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          fill,
          tone !== "muted" && "shadow-[0_0_12px_-2px_currentColor]",
        )}
        style={{ width: `${clamped}%`, color: tone === "mint" ? "var(--color-mint-400)" : "var(--color-ember-500)" }}
      />
    </div>
  );
}

export function ProgressRing({
  percent,
  size = 64,
  strokeWidth = 6,
  tone = "ember",
  children,
  className,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  tone?: Tone;
  children?: React.ReactNode;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const done = (clamped / 100) * circumference;

  // Gradient ids must be unique per instance, otherwise the first one on the
  // page wins and every ring renders with the same colours.
  const raw = useId();
  const gradientId = `ring-${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
  const { from, to } = TONES[tone];

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-ink-800)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${done} ${circumference - done}`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
          // color-mix keeps the glow tied to the theme variable; appending a hex
          // alpha to var() would be invalid CSS.
          style={{ filter: `drop-shadow(0 0 6px color-mix(in oklab, ${to} 45%, transparent))` }}
        />
      </svg>
      <span className={cn("absolute font-semibold text-ink-100 tabular-nums", size >= 80 ? "text-lg" : "text-sm")}>
        {children ?? `${clamped}%`}
      </span>
    </div>
  );
}

const STATUS_STYLES = {
  LOCKED: {
    dot: "bg-ink-800 text-ink-500 border-ink-600",
    chip: "border-ink-600 bg-ink-800 text-ink-400",
    label: "Locked",
  },
  IN_PROGRESS: {
    dot: "bg-ember-500/15 text-ember-300 border-ember-500/60 shadow-[0_0_12px_-2px_var(--color-ember-500)]",
    chip: "border-ember-500/40 bg-ember-500/10 text-ember-300",
    label: "In progress",
  },
  COMPLETED: {
    dot: "bg-mint-500/15 text-mint-400 border-mint-500/60 shadow-[0_0_12px_-3px_var(--color-mint-500)]",
    chip: "border-mint-500/40 bg-mint-500/10 text-mint-400",
    label: "Completed",
  },
} as const;

export type StatusKey = keyof typeof STATUS_STYLES;

/** Small circular node marker used in the roadmap tree. */
export function StatusDot({ status, className }: { status: StatusKey; className?: string }) {
  const styles = STATUS_STYLES[status];

  return (
    <span
      aria-label={styles.label}
      title={styles.label}
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center rounded-full border",
        styles.dot,
        className,
      )}
    >
      {status === "COMPLETED" ? <CheckIcon className="size-3" /> : null}
      {status === "IN_PROGRESS" ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {status === "LOCKED" ? <LockIcon className="size-2.5 opacity-70" /> : null}
    </span>
  );
}

export function StatusChip({ status }: { status: StatusKey }) {
  const styles = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        styles.chip,
      )}
    >
      {status === "COMPLETED" ? <CheckIcon className="size-2.5" /> : null}
      {status === "IN_PROGRESS" ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {styles.label}
    </span>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className={className} aria-hidden>
      <path d="M2.5 6.2 4.8 8.5 9.5 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className={className} aria-hidden>
      <rect x="2.5" y="5" width="7" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4.2 5V3.8a1.8 1.8 0 0 1 3.6 0V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
