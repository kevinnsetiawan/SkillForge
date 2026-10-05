import { auth } from "@/lib/auth";
import { requireUser } from "@/lib/dal";
import { AppNav } from "@/components/app-nav";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  const session = await auth();

  const initials = (user.name ?? user.username).slice(0, 2).toUpperCase();
  const displayName = user.name ?? user.username;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-ink-800/60 bg-ink-950/90 backdrop-blur-2xl">
        {/* Top accent glow line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember-500/30 to-transparent" />

        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4">
          <Logo href="/dashboard" className="mr-3 shrink-0" />

          <AppNav />

          <div className="ml-auto flex items-center gap-2">
            <a
              href={`/p/${user.username}`}
              className="hidden rounded-lg px-2.5 py-1.5 text-xs text-ink-400 transition-all duration-200 hover:bg-ink-800 hover:text-ink-200 sm:inline"
            >
              Portfolio ↗
            </a>

            {/* Avatar */}
            <a
              href="/settings"
              title={`${displayName} · @${user.username} · Settings`}
              className="group relative flex size-8 items-center justify-center rounded-full border border-ink-600 bg-linear-to-br from-ember-500/30 to-ink-800 text-[11px] font-bold text-ink-200 transition-all duration-300 hover:border-ember-500/70 hover:shadow-[0_0_18px_-4px_var(--color-ember-500)] hover:scale-105"
            >
              {initials}
              {/* Online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-ink-950 bg-mint-500 shadow-[0_0_4px_0_var(--color-mint-500)]" />
            </a>

            <SignOutButton name={session?.user?.name ?? user.username} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>

      <footer className="border-t border-ink-800/50 py-5 text-center text-[11px] text-ink-700">
        SkillForge · Your roadmap stays private until you publish it
      </footer>
    </div>
  );
}
