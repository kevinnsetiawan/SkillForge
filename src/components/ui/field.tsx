import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const field = cn(
  "w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2.5 text-sm text-ink-100 placeholder:text-ink-600 transition-all duration-200",
  "focus:border-ember-500/70 focus:outline-none focus:ring-2 focus:ring-ember-500/20 focus:bg-ink-900/90",
  "disabled:opacity-50",
  "hover:border-ink-600",
);

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(field, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(field, "min-h-24 resize-y leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(field, "appearance-none pr-8", className)} {...props} />;
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn("mb-1.5 block text-xs font-medium text-ink-300", className)} {...props} />;
}

/** A field with label, hint and error slots already wired up. */
export function Field({
  label,
  htmlFor,
  hint,
  errors,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !errors?.length ? <p className="text-xs text-ink-500 leading-relaxed">{hint}</p> : null}
      {errors?.length ? (
        <ul className="space-y-0.5">
          {errors.map((message) => (
            <li key={message} className="flex items-start gap-1.5 text-xs text-red-300">
              <span className="mt-0.5 shrink-0">⚠</span>
              {message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function FormBanner({ state }: { state?: { ok: boolean; message?: string } }) {
  if (!state?.message) return null;

  return (
    <p
      role="status"
      className={cn(
        "flex items-start gap-2 rounded-xl border px-4 py-3 text-xs leading-relaxed",
        state.ok
          ? "border-mint-500/40 bg-mint-500/10 text-mint-400"
          : "border-red-500/40 bg-red-500/10 text-red-300",
      )}
    >
      <span className="mt-0.5 shrink-0">{state.ok ? "✓" : "⚠"}</span>
      {state.message}
    </p>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-ink-700/70 bg-ink-900/30 px-8 py-16 text-center">
      <p className="text-sm font-semibold text-ink-200">{title}</p>
      <p className="max-w-sm text-xs leading-relaxed text-ink-500">{description}</p>
      {action}
    </div>
  );
}
