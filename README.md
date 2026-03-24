# align.

14 day commitment. strict constraints. local-first by default.

align is a commitment app built around a narrow loop:

- pick 1-3 directions
- keep today to 3 moves max
- answer honestly at night
- reset after 14 days

it is not trying to be a task manager, project board, or life operating system. the codebase follows that same bias: fewer moving parts, clear state boundaries, and a strong local-first core.

## stack

- next.js 14 app router
- react 18
- typescript
- tailwind css
- framer motion + gsap
- dexie for local-first storage
- supabase for auth, sync, and edge functions
- next-pwa / workbox for installability and update flow

## product shape

align has two modes:

- local-first mode, where the app works without a cloud account
- optional cloud sync, backed by supabase

core concepts in the app:

- `cycle`: a 14-day window
- `direction`: one area of focus inside the cycle
- `move`: one concrete action for a day
- `checkin`: the nightly "showed up" / "avoided" answer
- `later pile`: ideas that should not hijack today

if you are editing copy, keep the product vocabulary consistent. the app intentionally avoids planner-speak.

## getting started

### 1. install dependencies

```bash
pnpm install
```

### 2. set env

create `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:align@localhost.dev
```

optional local-dev flag:

```bash
NEXT_PUBLIC_BYPASS_AUTH=true
```

use `NEXT_PUBLIC_BYPASS_AUTH=true` only when you deliberately want to skip the normal auth path in local development.


### 3. run the app

```bash
pnpm dev
```

open `http://localhost:3000`.

## scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

`pnpm build` is the most reliable sanity check for this repo because it exercises app-router rendering, type-checking, metadata routes, and the pwa build step in one pass.

## supabase local setup

if you need cloud sync, auth, or push-related flows locally:

```bash
supabase start
```

the repo already contains:

- `supabase/config.toml`
- a base migration in `supabase/migrations`
- an edge function in `supabase/functions/send-notifications`

if you are working only on the landing page or local-only flows, you can often stay in bypass mode and skip booting supabase.

## architecture notes

### app structure

- `app/(marketing)` holds the public site and seo routes
- `app/(app)` holds the signed-in / onboarding application shell
- `components/onboarding` contains the onboarding state machine
- `components/home` contains the daily app, sheets, and home views
- `lib/db` contains dexie models and sync logic
- `lib/identity` handles local vs cloud identity selection

### data model

there are two layers of state:

- local state in indexeddb via dexie
- remote state in supabase for sync-enabled users

the sync logic lives in `lib/db/sync.ts`. if you touch record shape or sync rules, review both the local schema and the remote mapping logic.

### pwa behavior

align ships with:

- a custom service worker
- install prompt handling
- controller/update recovery logic
- generated workbox assets in `public/`

if you change caching, manifest, icons, or update flow, always run `pnpm build` and verify that the app still boots cleanly after a reload.

## working on the codebase

some practical constraints:

- this repo is intentionally opinionated about naming; do not casually rename domain terms
- offline behavior matters as much as online behavior
- auth, sync, and destructive account actions need extra care
- pwa regressions usually show up only after a real build, not during `pnpm dev`

when changing behavior, prefer small, coherent edits over broad rewrites.

## deploy notes

before deploying, make sure:

- `NEXT_PUBLIC_SITE_URL` points to the real production domain
- supabase keys are set correctly
- vapid keys are set if push is enabled
- `pnpm build` passes

the site uses metadata routes for `robots.txt` and `sitemap.xml`, so incorrect `NEXT_PUBLIC_SITE_URL` will leak into canonical and social URLs.

## local-only files

the repo intentionally ignores some local working files and notes. if they exist in your checkout, that is expected. they should stay local and should not be re-added to git.

## contributing

read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request or filing an issue.
