import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { HeroMockup } from "@/components/hero-mockup";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-ink-800/50 bg-ink-950/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4">
          <Logo />
          <nav className="ml-6 hidden items-center gap-1 text-xs text-ink-400 md:flex">
            <a href="#features" className="rounded-lg px-3 py-1.5 transition-all duration-200 hover:bg-ink-800/80 hover:text-ink-100">
              Features
            </a>
            <a href="#how" className="rounded-lg px-3 py-1.5 transition-all duration-200 hover:bg-ink-800/80 hover:text-ink-100">
              How it works
            </a>
            <a href="#testimonials" className="rounded-lg px-3 py-1.5 transition-all duration-200 hover:bg-ink-800/80 hover:text-ink-100">
              Reviews
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-300 transition-all duration-200 hover:bg-ink-800 hover:text-ink-100"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="sheen btn-glow rounded-lg bg-ember-500 px-3 py-1.5 text-xs font-semibold text-ink-950 transition-all duration-200 hover:bg-ember-400"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-0 pt-20 sm:pt-28">
          {/* Animated background grid */}
          <div className="grid-bg pointer-events-none absolute inset-0 opacity-[0.04] [mask-image:radial-gradient(65%_55%_at_50%_0%,#000,transparent)]" />

          {/* Floating orbs */}
          <div
            className="pointer-events-none absolute left-1/4 top-20 size-72 rounded-full opacity-30 blur-3xl animate-glow-pulse"
            style={{ background: "radial-gradient(circle, var(--color-ember-500), transparent 70%)" }}
          />
          <div
            className="pointer-events-none absolute right-1/4 top-40 size-56 rounded-full opacity-20 blur-3xl animate-glow-pulse"
            style={{ background: "radial-gradient(circle, var(--color-sky-ember), transparent 70%)", animationDelay: "1.5s" }}
          />

          <div className="relative mx-auto max-w-4xl text-center">
            {/* Announcement badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ember-500/30 bg-ember-500/10 px-4 py-1.5 text-[11px] font-medium text-ember-300 animate-fade-in shadow-[0_0_20px_-8px_var(--color-ember-500)]">
              <span className="size-1.5 rounded-full bg-ember-400 animate-pulse" />
              Track every topic. Prove every skill.
              <span className="ml-1 text-ember-500/70">→</span>
            </div>

            <h1 className="animate-rise text-4xl font-bold tracking-tight text-ink-100 sm:text-5xl lg:text-[4rem] lg:leading-[1.1]">
              Build your learning roadmap.{" "}
              <br className="hidden sm:block" />
              <span className="text-gradient glow-ember">Show your work.</span>
            </h1>

            <p
              className="animate-rise mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-400 sm:text-lg"
              style={{ animationDelay: "80ms" }}
            >
              SkillForge turns a self-directed study plan into a trackable, shareable portfolio — with
              daily streaks, micro-journals, and proof-of-work links attached to every topic you complete.
            </p>

            <div
              className="animate-rise mt-10 flex flex-wrap items-center justify-center gap-3"
              style={{ animationDelay: "160ms" }}
            >
              <Link
                href="/register"
                className="sheen btn-glow inline-flex h-12 items-center gap-2 rounded-xl bg-ember-500 px-7 text-sm font-semibold text-ink-950 transition-all duration-300 hover:bg-ember-400 hover:scale-[1.02]"
              >
                Start for free
                <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center rounded-xl border border-ink-600 bg-ink-800/60 px-7 text-sm font-medium text-ink-200 transition-all duration-300 hover:border-ink-500 hover:bg-ink-700 hover:scale-[1.02]"
              >
                Sign in
              </Link>
            </div>

            <p className="mt-4 text-xs text-ink-500 animate-fade-in" style={{ animationDelay: "300ms" }}>
              Free forever · Private until you publish · No credit card
            </p>

            {/* Social proof avatars */}
            <div className="mt-8 flex items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: "350ms" }}>
              <div className="flex -space-x-2">
                {["KS", "AM", "JR", "PL", "TC"].map((initials, i) => (
                  <span
                    key={initials}
                    className="inline-flex size-7 items-center justify-center rounded-full border-2 border-ink-950 bg-linear-to-br from-ember-500/40 to-ink-800 text-[9px] font-bold text-ink-200"
                    style={{ zIndex: 5 - i }}
                  >
                    {initials}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-ink-400">
                <span className="font-semibold text-ink-200">2,400+</span> learners already tracking
              </p>
            </div>
          </div>

          <div className="relative mt-16 sm:mt-20">
            <HeroMockup />
          </div>
        </section>

        {/* Stats ticker */}
        <section className="border-y border-ink-800/60 bg-ink-900/40 py-12 overflow-hidden">
          <div className="mx-auto max-w-5xl px-4">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { value: "2,400+", label: "Active learners", accent: "ember" },
                { value: "18,000+", label: "Topics completed", accent: "sky" },
                { value: "4,200+", label: "Proof-of-work links", accent: "mint" },
                { value: "94%", label: "7-day streak retention", accent: "ember" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p
                    className={`text-3xl font-extrabold tracking-tight tabular-nums ${
                      stat.accent === "ember"
                        ? "text-gradient-warm"
                        : stat.accent === "sky"
                        ? "text-gradient-cool"
                        : "text-gradient"
                    }`}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-ink-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Status flow */}
        <section className="bg-ink-900/20 px-4 py-10">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <p className="eyebrow">One topic, one state</p>
            <ol className="flex flex-1 flex-wrap items-center justify-center gap-3 sm:gap-4">
              {[
                { label: "Locked", hint: "not started", className: "border-ink-600 bg-ink-800 text-ink-400" },
                { label: "In progress", hint: "journal open", className: "border-ember-500/40 bg-ember-500/10 text-ember-300" },
                { label: "Completed", hint: "proof required", className: "border-mint-500/40 bg-mint-500/10 text-mint-400" },
              ].map((step, index) => (
                <li key={step.label} className="flex items-center gap-3 sm:gap-4">
                  <span
                    className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-300 hover:scale-105 ${step.className}`}
                  >
                    {step.label}
                    <span className="text-[10px] font-normal opacity-70">{step.hint}</span>
                  </span>
                  {index < 2 ? (
                    <svg viewBox="0 0 24 24" fill="none" className="size-4 shrink-0 text-ink-600" aria-hidden>
                      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Feature grid */}
        <section id="features" className="px-4 py-20 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <div className="mb-14 text-center">
              <p className="flex justify-center">
                <span className="eyebrow">Everything in one place</span>
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-100 sm:text-4xl">
                Everything you need to{" "}
                <span className="text-gradient">learn in public</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-400">
                No more scattered notes or unfinished courses. One place for the whole journey.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={
                  <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
                    <path d="M9 4 4 6.5v13L9 17l6 2.5 5-2.5v-13L15 6.5 9 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M9 4v13M15 6.5v13" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                }
                title="Structured roadmaps"
                description="Organise any curriculum into modules and topics. Reorder, rename, and add links to study resources."
                accent="ember"
                index={0}
              />
              <FeatureCard
                icon={
                  <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
                    <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 1 5 19.5v-15Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M8.5 8h7M8.5 12h7M8.5 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                }
                title="Micro-journals"
                description="Write 3–5 sentences about what you actually understood. Explaining it back proves you learned it."
                accent="sky"
                index={1}
              />
              <FeatureCard
                icon={
                  <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
                    <path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 1 0-5.7-5.7l-1.3 1.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 1 0 5.7 5.7l1.3-1.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                }
                title="Proof of work"
                description="Attach a GitHub repo, Figma file, deployed demo, or any public link to each completed topic."
                accent="mint"
                index={2}
              />
              <FeatureCard
                icon={
                  <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
                    <path d="M12 2.5s5.5 4.2 5.5 9.2A5.5 5.5 0 0 1 12 21.5a5.5 5.5 0 0 1-5.5-5.8C6.5 12 9 10 9 10s-.6 2 1 2.8c0-2.4 2-4.6 2-4.6s.3 1.6 1.4 2.3c.5-2.5-.7-5.3-1.4-8Z" fill="currentColor" opacity="0.9" />
                  </svg>
                }
                title="Daily streaks"
                description="Log an entry every day to keep your streak alive. A contribution heatmap shows months of activity at a glance."
                accent="ember"
                index={3}
              />
              <FeatureCard
                icon={
                  <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
                    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M3.5 12h17M12 3.5c2.2 2.4 3.3 5.4 3.3 8.5s-1.1 6.1-3.3 8.5c-2.2-2.4-3.3-5.4-3.3-8.5S9.8 5.9 12 3.5Z" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                }
                title="Public portfolio"
                description="Publish any roadmap to a shareable URL. Show hiring managers exactly what you built and when."
                accent="sky"
                index={4}
              />
              <FeatureCard
                icon={
                  <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
                    <path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                }
                title="Progress tracking"
                description="Per-module and overall completion rings update in real time. See exactly how much of your plan you've finished."
                accent="mint"
                index={5}
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="relative overflow-hidden px-4 py-20 sm:py-24">
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0 opacity-30">
            <div
              className="absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--color-ember-500) 10%, transparent), transparent 70%)" }}
            />
          </div>
          <div className="relative mx-auto max-w-3xl">
            <div className="mb-14 text-center">
              <p className="flex justify-center">
                <span className="eyebrow">How it works</span>
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-100 sm:text-4xl">
                From zero to portfolio{" "}
                <span className="text-gradient">in three steps</span>
              </h2>
            </div>

            <div className="relative space-y-4">
              {/* Connecting line */}
              <div className="absolute left-[1.625rem] top-12 bottom-12 w-px bg-gradient-to-b from-ember-500/50 via-sky-ember/30 to-transparent" aria-hidden />

              {[
                {
                  step: "01",
                  title: "Build your roadmap",
                  desc: "Create a roadmap from any curriculum — a YouTube playlist, a book, a bootcamp syllabus. Add modules for each stage and topics for each concept.",
                  accent: "ember",
                },
                {
                  step: "02",
                  title: "Learn and journal",
                  desc: "Work through topics one at a time. For each completed topic, write a short note explaining it in your own words and attach a link to something you made.",
                  accent: "sky",
                },
                {
                  step: "03",
                  title: "Publish and share",
                  desc: "Flip the switch to make a roadmap public. Share the link with recruiters, post it on LinkedIn, or add it to your resume as evidence of your skills.",
                  accent: "mint",
                },
              ].map((item, i) => (
                <div
                  key={item.step}
                  className="panel panel-raised panel-hover animate-rise flex gap-5 p-6"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div
                    className={`relative flex size-10 shrink-0 items-center justify-center rounded-xl border text-lg font-bold tabular-nums z-10 ${
                      item.accent === "ember"
                        ? "border-ember-500/40 bg-ember-500/15 text-ember-400 shadow-[0_0_20px_-8px_var(--color-ember-500)]"
                        : item.accent === "sky"
                        ? "border-sky-ember/40 bg-sky-ember/10 text-sky-ember shadow-[0_0_20px_-8px_var(--color-sky-ember)]"
                        : "border-mint-500/40 bg-mint-500/10 text-mint-400 shadow-[0_0_20px_-8px_var(--color-mint-500)]"
                    }`}
                  >
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-ink-100">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="border-y border-ink-800/60 bg-ink-900/30 px-4 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-14 text-center">
              <p className="flex justify-center">
                <span className="eyebrow">What learners say</span>
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-100 sm:text-4xl">
                Trusted by{" "}
                <span className="text-gradient">self-starters</span>
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  quote: "SkillForge made me actually finish my JavaScript roadmap. The proof-of-work requirement is genius — I can't mark something done without showing I built something.",
                  name: "Alex M.",
                  role: "Frontend developer",
                  initials: "AM",
                  accent: "ember",
                },
                {
                  quote: "I used to abandon courses halfway. Now I have a 47-day streak and three completed roadmaps I can literally show during interviews. Game changer.",
                  name: "Priya K.",
                  role: "CS student",
                  initials: "PK",
                  accent: "sky",
                },
                {
                  quote: "The public portfolio URL alone is worth it. Sharing my React roadmap on LinkedIn got me two recruiter messages within a week.",
                  name: "Jordan T.",
                  role: "Career switcher",
                  initials: "JT",
                  accent: "mint",
                },
              ].map((t) => (
                <div key={t.name} className="panel panel-raised panel-hover flex flex-col gap-4 p-6">
                  {/* Stars */}
                  <div className="flex gap-1" aria-label="5 stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} viewBox="0 0 12 12" fill="none" className="size-3" aria-hidden>
                        <path d="M6 1l1.2 3.6H11L8.1 6.9l1.1 3.6L6 8.4l-3.2 2.1L3.9 6.9 1 4.6h3.8L6 1z" fill="#f59e0b" />
                      </svg>
                    ))}
                  </div>
                  {/* Quote */}
                  <div className="testimonial-quote flex-1">
                    <p className="text-sm leading-relaxed text-ink-300">&ldquo;{t.quote}&rdquo;</p>
                  </div>
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex size-8 items-center justify-center rounded-full border text-[10px] font-bold ${
                        t.accent === "ember"
                          ? "border-ember-500/40 bg-ember-500/10 text-ember-300"
                          : t.accent === "sky"
                          ? "border-sky-ember/40 bg-sky-ember/10 text-sky-ember"
                          : "border-mint-500/40 bg-mint-500/10 text-mint-400"
                      }`}
                    >
                      {t.initials}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-ink-200">{t.name}</p>
                      <p className="text-[10px] text-ink-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-24">
          <div className="border-gradient relative mx-auto max-w-2xl overflow-hidden rounded-2xl p-12 text-center panel-raised">
            {/* Background glow */}
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{ background: "radial-gradient(70% 55% at 50% 0%, #f59e0b, transparent)" }}
            />
            <div
              className="pointer-events-none absolute -bottom-10 left-1/2 size-48 -translate-x-1/2 rounded-full blur-3xl opacity-30"
              style={{ background: "var(--color-sky-ember)" }}
            />

            <div className="relative">
              {/* Icon */}
              <div className="mb-5 inline-flex size-14 items-center justify-center rounded-2xl border border-ember-500/30 bg-ember-500/10 shadow-[0_0_30px_-8px_var(--color-ember-500)]">
                <svg viewBox="0 0 24 24" fill="none" className="size-7 text-ember-400" aria-hidden>
                  <path d="M12 2.5s5.5 4.2 5.5 9.2A5.5 5.5 0 0 1 12 21.5a5.5 5.5 0 0 1-5.5-5.8C6.5 12 9 10 9 10s-.6 2 1 2.8c0-2.4 2-4.6 2-4.6s.3 1.6 1.4 2.3c.5-2.5-.7-5.3-1.4-8Z" fill="currentColor" opacity="0.9" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-ink-100 sm:text-3xl">
                Ready to start forging skills?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-400">
                Free to use. No credit card required. Your roadmap is private until you choose to share it.
              </p>

              <Link
                href="/register"
                className="sheen btn-glow mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-ember-500 px-9 text-sm font-semibold text-ink-950 transition-all duration-300 hover:bg-ember-400 hover:scale-[1.03]"
              >
                Create your account
                <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <p className="mt-4 text-xs text-ink-500">Joins 2,400+ learners already building in public</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-800/60 bg-ink-900/40">
        {/* Glowing divider */}
        <div className="divider-glow" />
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 sm:flex-row sm:justify-between">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Logo showWordmark />
            <p className="text-xs text-ink-500">Built for learners who show their work.</p>
          </div>
          <nav className="flex items-center gap-5 text-xs text-ink-400">
            <Link href="/login" className="transition-colors duration-200 hover:text-ink-100">
              Sign in
            </Link>
            <Link href="/register" className="transition-colors duration-200 hover:text-ink-100">
              Create account
            </Link>
          </nav>
        </div>
        <div className="border-t border-ink-800/50 px-4 py-5 text-center text-[11px] text-ink-600">
          © 2026 SkillForge · All rights reserved
        </div>
      </footer>
    </div>
  );
}

const ACCENTS = {
  ember: {
    chip: "border-ember-500/30 bg-ember-500/10 text-ember-400",
    glow: "group-hover:shadow-[0_0_28px_-8px_var(--color-ember-500)]",
    bar: "bg-ember-500/20 border-ember-500/20",
  },
  sky: {
    chip: "border-sky-ember/30 bg-sky-ember/10 text-sky-ember",
    glow: "group-hover:shadow-[0_0_28px_-8px_var(--color-sky-ember)]",
    bar: "bg-sky-ember/10 border-sky-ember/20",
  },
  mint: {
    chip: "border-mint-500/30 bg-mint-500/10 text-mint-400",
    glow: "group-hover:shadow-[0_0_28px_-8px_var(--color-mint-500)]",
    bar: "bg-mint-500/10 border-mint-500/20",
  },
} as const;

function FeatureCard({
  icon,
  title,
  description,
  accent,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: keyof typeof ACCENTS;
  index: number;
}) {
  const styles = ACCENTS[accent];

  return (
    <div
      className="panel panel-raised panel-hover group animate-rise p-6"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className={`mb-4 inline-flex size-11 items-center justify-center rounded-xl border transition-all duration-300 ${styles.chip} ${styles.glow}`}
      >
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-ink-100">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-ink-400">{description}</p>
      {/* Subtle bottom accent */}
      <div className={`mt-4 h-px rounded-full border-t ${styles.bar} opacity-50`} />
    </div>
  );
}
