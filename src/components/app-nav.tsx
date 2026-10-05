"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/roadmaps", label: "Roadmaps" },
  { href: "/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5">
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
              active
                ? "bg-linear-to-b from-ink-700/80 to-ink-800/80 text-ink-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_6px_16px_-10px_var(--color-ember-500)]"
                : "text-ink-400 hover:bg-ink-800/60 hover:text-ink-200",
            )}
          >
            {active ? (
              <span className="absolute inset-x-2 -bottom-px h-px rounded-full bg-linear-to-r from-transparent via-ember-400 to-transparent" />
            ) : null}
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
