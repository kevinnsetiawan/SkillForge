import type { Metadata } from "next";
import Link from "next/link";

import { SignInForm } from "./sign-in-form";
import { AuthShell } from "@/components/auth-shell";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  const githubEnabled = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);

  return (
    <AuthShell>
      <div className="w-full max-w-sm animate-rise">
        <div className="mb-8 flex justify-center">
          <LogoMark className="size-12 rounded-xl shadow-[0_8px_36px_-8px_var(--color-ember-500)] [&_svg]:size-6" />
        </div>

        <h1 className="text-center text-2xl font-bold tracking-tight text-ink-100">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-ink-400">Sign in to keep your roadmap moving.</p>

        <div className="mt-8 panel panel-raised accent-top p-6">
          <SignInForm githubEnabled={githubEnabled} />
        </div>

        <p className="mt-5 text-center text-xs text-ink-500">
          No account yet?{" "}
          <Link href="/register" className="font-semibold text-ember-400 transition-colors duration-200 hover:text-ember-300">
            Create one for free
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
