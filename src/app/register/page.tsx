import type { Metadata } from "next";
import Link from "next/link";

import { SignUpForm } from "./sign-up-form";
import { AuthShell } from "@/components/auth-shell";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  const githubEnabled = Boolean(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET);

  return (
    <AuthShell>
      <div className="w-full max-w-sm animate-rise">
        <div className="mb-8 flex justify-center">
          <LogoMark className="size-10 rounded-xl shadow-[0_8px_28px_-8px_var(--color-ember-500)] [&_svg]:size-5" />
        </div>

        <h1 className="text-center text-2xl font-semibold text-ink-100">Create your account</h1>
        <p className="mt-1 text-center text-sm text-ink-400">
          Turn your learning plan into a roadmap you can finish.
        </p>

        <div className="mt-8 panel panel-raised accent-top p-6">
          <SignUpForm githubEnabled={githubEnabled} />
        </div>

        <p className="mt-5 text-center text-xs text-ink-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ember-400 hover:text-ember-300">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
