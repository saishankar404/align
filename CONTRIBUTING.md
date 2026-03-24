# contributing

thanks for wanting to work on align.

this project is small on purpose. contributions should make it sharper, more reliable, or easier to maintain, not more bloated.

## before you open anything

please do two things first:

1. read the current `README.md`
2. check whether the bug, feature, or cleanup is already covered by an existing issue or recent commit

if the change is large, opinionated, or product-shaping, open an issue first before spending time on a pull request.

## what we welcome

- bug fixes
- reliability improvements
- pwa/offline fixes
- sync and auth hardening
- performance work with clear impact
- docs improvements
- focused ux polish that fits the existing product language

## what needs discussion first

- feature expansions that widen the product scope
- new dependencies without a clear payoff
- terminology changes to core domain words
- major design system rewrites
- schema or sync model changes

## opening an issue

write issues like you are handing them to an engineer who did not watch you reproduce the problem.

include:

- what you expected
- what actually happened
- exact steps to reproduce
- screenshots or recordings if ui-related
- browser / device / os if relevant
- whether you were using local mode, bypass auth, or supabase-backed sync

good issue titles:

- `night check-in sheet can get stuck after reload`
- `service worker update banner loops on ios standalone mode`
- `cloud sync onboarding path fails when profile already exists`

bad issue titles:

- `bug`
- `it broke`
- `please fix asap`

## opening a pull request

keep prs narrow and intentional.

aim for one coherent change per pull request:

- one bug
- one feature slice
- one reliability fix
- one docs pass

include in the pr description:

- what changed
- why it changed
- how it was tested
- screenshots if the ui changed
- env/setup assumptions if the change depends on supabase, push, or bypass auth

## development notes

### setup

```bash
pnpm install
pnpm dev
```

if your change touches sync, auth, or push flow, you will usually also need:

```bash
supabase start
```

### env

common local env vars:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:align@localhost.dev
NEXT_PUBLIC_BYPASS_AUTH=true
```

production hostname for deploys:

```bash
NEXT_PUBLIC_SITE_URL=https://align.saishankar.xyz
```

### validation

before submitting, run what makes sense for your change.

minimum expectation:

```bash
pnpm build
```

also run:

```bash
pnpm lint
```

if your change touches:

- onboarding: test both local-first and sync-enabled paths
- home flow: test move limits, check-ins, and resets
- pwa: test a real production build
- sync: test local data creation and remote reconciliation

## style expectations

- keep naming aligned with the product vocabulary
- prefer simple code over clever abstractions
- preserve local-first behavior
- do not add comments that restate obvious code
- keep user-facing copy tight and intentional

if you touch app copy, avoid generic productivity language. align is specific on purpose.

## repo hygiene

- do not commit local-only notes or ignored working files
- do not re-add ignored exports or scratch docs
- avoid drive-by reformatting in unrelated files
- if you need to rewrite history, call it out clearly

## security and secrets

never commit:

- supabase service role keys
- vapid private keys
- local env files

if a change touches auth, account deletion, or sync, treat it as a sensitive change and explain the failure modes in the pr.
