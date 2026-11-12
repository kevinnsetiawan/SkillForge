# SkillForge

Build your skill roadmap, track progress, and publish a proof-of-work portfolio.

Learners turn a goal into a roadmap of **modules** and **topics**, move each topic
through `Locked → In Progress → Completed`, record a short journal with a
proof-of-work link, and publish the finished trail at `/p/<username>`.

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS 4 |
| Language | TypeScript (strict) |
| Database | PostgreSQL 17 + Prisma 6 |
| Auth | Auth.js (NextAuth v5) — credentials + optional GitHub OAuth |
| Validation | Zod 4 |

Route protection lives in `src/proxy.ts` (Next.js 16 renamed `middleware.ts`).

---

## Prerequisites

- Node.js 20+
- PostgreSQL 17 running locally

Install PostgreSQL with winget (asks for UAC):

```bash
winget install --id PostgreSQL.PostgreSQL.17 -e
```

During setup use:

- superuser `postgres`
- password `skillforge_dev`
- port `5432`

Then create the database:

```bash
createdb -U postgres skillforge
```

> The app expects a local PostgreSQL server. It does not require Docker.

---

## Setup

```bash
npm install

copy .env.example .env        # PowerShell: Copy-Item .env.example .env
npx auth secret               # paste the value into AUTH_SECRET in .env
```

To enable the AI roadmap generator, set `AI_API_KEY` (and, for non-OpenAI
providers, `AI_BASE_URL` + `AI_MODEL`) in `.env`, then restart the dev server.
`.env.example` has ready-to-use snippets for OpenAI, Gemini, and OpenRouter.

Then create the schema and demo data:

```bash
npm run db:migrate            # applies migrations, then seeds automatically
```

`db:migrate` runs `prisma/seed.ts`, which creates two demo accounts:

| Email | Password |
| --- | --- |
| `demo@skillforge.dev` | `skillforge123` |
| `siti@skillforge.dev` | `skillforge123` |

Start the dev server:

```bash
npm run dev
```

Open <http://localhost:3000>.

---

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Unit tests for progress / streak / URL + username rules |
| `npm run check` | typecheck + lint + test |
| `npm run db:migrate` | Create/apply a migration (dev) |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:reset` | Drop, re-migrate, re-seed |
| `npm run db:backfill-resources` | Give older topics without a link a search resource |
| `npm run db:studio` | Prisma Studio |

---

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `AUTH_SECRET` | yes | Generate with `npx auth secret` |
| `AUTH_URL` | no | Set when deploying behind a proxy |
| `AUTH_TRUST_HOST` | no | `true` for local/containerised runs |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | no | Enables the GitHub button; blank hides it |
| `AI_API_KEY` | no | Enables the AI roadmap generator; blank shows a setup hint |
| `AI_BASE_URL` | no | OpenAI-compatible endpoint, defaults to OpenAI |
| `AI_MODEL` | no | Model name, defaults to `gpt-4o-mini` |
| `AI_JSON_MODE` | no | Set `false` if the provider rejects `response_format` |
| `AI_MAX_TOKENS` | no | Token cap for generation, defaults to `3000` |
| `APP_TIMEZONE` | yes | IANA zone used for streaks and the heatmap |

Changing `APP_TIMEZONE` changes which calendar day activity is attributed to.
Streaks are only correct if this matches the learner's timezone.

---

## Features

**Roadmaps**
Create, duplicate, rename, publish, and delete roadmaps. Each roadmap gets a
unique slug, giving it a stable public URL at `/p/<username>/<slug>`. Every
topic must point at a study resource; older topics without one fall back to a
search link, and `db:backfill-resources` can persist those links.

**AI roadmap generator**
On `/roadmaps/new`, describe what you want to learn and the AI drafts a
module-by-module roadmap with topics and a resource link on every topic. The
draft is shown as a preview first; nothing is written to the database until you
press "Create this roadmap". Any OpenAI-compatible chat-completions API works (OpenAI,
Gemini's compatibility endpoint, OpenRouter, or a local model), configured with
`AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL`. Generated output is re-validated
server-side (counts, lengths, and http(s)-only links) before saving.

**Visual manager**
Modules hold ordered topics. Reordering uses up/down buttons and writes the full
new sibling order in one transaction, so a tampered request cannot move rows
that belong to someone else.

**Progress and streaks**
Percentages count only `COMPLETED` topics, so work-in-progress never inflates
the bar. Activity is bucketed per calendar day in `APP_TIMEZONE`; the current
streak survives a day that is still in progress and breaks once a full day is
missed.

**Journal and proof of work**
Every topic takes a note plus an external proof link. A topic cannot be marked
completed without one, so a published portfolio always has real evidence
attached. Links are validated to `http(s)` only.

**Public portfolio**
Opt-in per user. Shows overall and per-roadmap progress, module breakdowns,
topic status, journal notes, and proof links.

---

## Project layout

```
prisma/
  schema.prisma          Auth.js models + SkillForge domain models
  seed.ts                Demo users, roadmaps, topics, journals, activity
src/
  lib/
    auth.ts              NextAuth instance, credentials + GitHub
    auth.config.ts       Edge-safe auth config used by the proxy
    dal.ts               requireUser / getCurrentUser (password hash excluded)
    progress.ts          Progress, streak, and heatmap maths
    validation.ts        Zod schemas shared by actions and forms
    ai/                  Provider-agnostic roadmap generation + plan parsing
    actions/             Server actions: auth, roadmaps, structure, journal, AI
    queries.ts           Read-side queries, incl. public portfolio
  components/            UI, incl. the client-side roadmap manager
  proxy.ts               Route protection
  app/
    (auth)/              Login and register
    (app)/               Dashboard, roadmap manager, settings
    p/[username]/        Public portfolio
```

---

## Troubleshooting

**`Can't reach database server`** — the PostgreSQL service is not running. Check
with `Get-Service postgresql*` (PowerShell) and start it if needed.

**`P1001` / connection refused** — `DATABASE_URL` port or password does not match
your install.

**`Invalid database name`** — the database does not exist yet. Create it, or let
`npm run db:migrate` run against an existing one.

**Blank screen after clicking a client button** — the database is likely
unreachable; check the terminal running `npm run dev` for a `PrismaClientKnownRequestError`.