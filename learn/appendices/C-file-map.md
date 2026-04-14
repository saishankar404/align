# Appendix C: File Map

A complete guide to the Align codebase structure. Use this to understand where things live and what each file does.

---

## Directory Overview

```
align_v2/
├── app/                    # Next.js App Router pages and routes
├── components/             # React components
├── lib/                    # Shared utilities, hooks, and business logic
├── public/                 # Static assets (icons, manifest, fonts)
├── supabase/              # Database migrations and Edge Functions
├── learn/                  # This learning book
├── .env.local             # Environment variables (not committed)
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies and scripts
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

---

## app/ - Next.js Pages

### Route Groups

```
app/
├── (app)/                  # Protected app routes
│   ├── app/               # Entry redirect logic
│   │   └── page.tsx       # Smart redirect based on auth state
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts   # OAuth callback handler
│   ├── home/
│   │   ├── layout.tsx     # Home layout with providers
│   │   └── page.tsx       # Home page entry
│   └── onboarding/
│       └── page.tsx       # Onboarding flow entry
│
├── (marketing)/           # Public marketing routes
│   └── page.tsx           # Landing page
│
├── api/                   # API route handlers
│   └── account/
│       └── delete/
│           └── route.ts   # Account deletion endpoint
│
├── layout.tsx             # Root layout (fonts, metadata)
├── loading.tsx            # Global loading state
└── globals.css            # Global styles and Tailwind
```

### Key Files

| File | Purpose | Chapter |
|------|---------|---------|
| `app/(app)/app/page.tsx` | Smart redirect logic | 11 |
| `app/(app)/auth/callback/route.ts` | OAuth callback | 15 |
| `app/(app)/home/layout.tsx` | App context provider wrapper | 10, 11 |
| `app/(app)/home/page.tsx` | HomeApp entry point | 11 |
| `app/api/account/delete/route.ts` | Account deletion | 12 |
| `app/layout.tsx` | Root layout with fonts | 11 |
| `app/globals.css` | Global styles | - |

---

## components/ - React Components

### Structure

```
components/
├── app/                   # App-level components
│   └── DesktopAppEntryGate.tsx  # Desktop detection
│
├── auth/                  # Authentication
│   └── AuthGuard.tsx      # Route protection
│
├── home/                  # Home screen components
│   ├── HomeApp.tsx        # Main home orchestrator
│   ├── views/             # Tab views
│   │   ├── TodayView.tsx
│   │   ├── WindowView.tsx
│   │   ├── LaterView.tsx
│   │   └── ProfileView.tsx
│   ├── sheets/            # Bottom sheets
│   │   ├── AddMoveSheet.tsx
│   │   ├── MarkDoneSheet.tsx
│   │   ├── ShowedUpSheet.tsx
│   │   ├── NightCheckinSheet.tsx
│   │   └── ... (more sheets)
│   └── shared/            # Shared home components
│       ├── MoveCard.tsx
│       ├── DotRow.tsx
│       ├── InfoCard.tsx
│       └── SectionHeader.tsx
│
├── onboarding/            # Onboarding flow
│   ├── OnboardingFlow.tsx # Flow orchestrator
│   ├── screens/           # Individual screens
│   │   ├── Welcome.tsx
│   │   ├── SyncChoiceScreen.tsx
│   │   ├── NameScreen.tsx
│   │   ├── DirectionsScreen.tsx
│   │   ├── CycleScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   ├── DoneScreen.tsx
│   │   └── textVariants.ts  # Animation variants
│   └── shared/            # Shared onboarding components
│       ├── CtaButton.tsx
│       └── GhostButton.tsx
│
├── pwa/                   # PWA components
│   ├── PWAInstallPrompt.tsx
│   └── PWAUpdateController.tsx
│
└── shared/                # App-wide shared components
    ├── Logo.tsx
    ├── Sheet.tsx          # Base sheet component
    └── AnimatedAutoSize.tsx
```

### Key Components

| Component | Purpose | Chapter |
|-----------|---------|---------|
| `AuthGuard.tsx` | Server-side route protection | 15 |
| `HomeApp.tsx` | Main home orchestrator with view transitions | 11, 16 |
| `OnboardingFlow.tsx` | Multi-step onboarding state machine | 8, 15 |
| `MoveCard.tsx` | Move card with hold-to-delete | 9, 16 |
| `PWAUpdateController.tsx` | Service worker update handling | 17 |
| `PWAInstallPrompt.tsx` | Install to home screen prompt | 17 |

---

## lib/ - Shared Logic

### Structure

```
lib/
├── context/               # React context providers
│   └── AppContext.tsx     # Main app state
│
├── cycle/                 # Cycle business logic
│   ├── close.ts           # Closing expired cycles
│   └── create.ts          # Creating new cycles
│
├── db/                    # Database layer
│   ├── local.ts           # Dexie schema and tables
│   ├── sync.ts            # Sync engine
│   └── types.ts           # Generated Supabase types
│
├── hooks/                 # Custom React hooks
│   ├── useOnline.ts       # Online/offline detection
│   └── useToast.tsx       # Toast notification system
│
├── identity/              # User identity management
│   ├── client.ts          # Client-side identity
│   └── server.ts          # Server-side identity
│
├── motion/                # Animation tokens
│   └── tokens.ts          # Durations, easings, springs
│
├── notifications/         # Push notifications
│   └── push.ts            # Registration and subscription
│
├── pwa/                   # PWA utilities
│   └── cache.ts           # Cache recovery helpers
│
├── supabase/              # Supabase clients
│   ├── client.ts          # Browser client
│   └── server.ts          # Server client
│
└── utils/                 # General utilities
    ├── dates.ts           # Date formatting
    ├── debug.ts           # Debug logging
    └── ids.ts             # UUID generation
```

### Key Files

| File | Purpose | Chapter |
|------|---------|---------|
| `lib/context/AppContext.tsx` | Global app state | 10 |
| `lib/db/local.ts` | Dexie schema | 13 |
| `lib/db/sync.ts` | Sync engine | 13 |
| `lib/db/types.ts` | Generated TypeScript types | 14 |
| `lib/hooks/useOnline.ts` | Online detection hook | 9 |
| `lib/hooks/useToast.tsx` | Toast system | 10 |
| `lib/identity/client.ts` | Cloud/local mode | 15 |
| `lib/motion/tokens.ts` | Animation constants | 16 |
| `lib/notifications/push.ts` | Push registration | 17 |
| `lib/supabase/client.ts` | Browser Supabase client | 14 |
| `lib/supabase/server.ts` | Server Supabase client | 14 |
| `lib/utils/dates.ts` | Date helpers | 3 |
| `lib/utils/ids.ts` | UUID generation | 3 |

---

## supabase/ - Database

### Structure

```
supabase/
├── migrations/
│   └── 20260320091329_init.sql  # Initial schema
│
├── functions/
│   └── send-notifications/
│       └── index.ts             # Push notification Edge Function
│
└── config.toml                  # Supabase local config
```

### Schema Overview

| Table | Purpose | Chapter |
|-------|---------|---------|
| `profiles` | User profiles, notification settings | 14 |
| `cycles` | 7 or 14 day commitment windows | 14 |
| `directions` | User's focus areas (1-3 per cycle) | 14 |
| `moves` | Daily actions (max 3 per day) | 14 |
| `checkins` | Nightly check-ins | 14 |
| `later_items` | Ideas/links saved for later | 14 |
| `reflections` | End-of-cycle reflections | 14 |

---

## public/ - Static Assets

```
public/
├── icons/
│   ├── icon-192.png       # PWA icon (192x192)
│   └── icon-512.png       # PWA icon (512x512)
├── fonts/
│   ├── gt-walsheim/       # GT Walsheim font files
│   └── satoshi/           # Satoshi font files
├── manifest.json          # PWA manifest
├── sw.js                  # Generated service worker
└── logo_secondary.svg     # Logo asset
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `next.config.js` | Next.js config with PWA plugin |
| `tailwind.config.ts` | Tailwind theme (colors, fonts) |
| `tsconfig.json` | TypeScript compiler options |
| `package.json` | Dependencies and npm scripts |
| `.env.local` | Environment variables |
| `.env.example` | Template for env vars |
| `.gitignore` | Git ignore rules |

---

## Finding Things by Topic

### Authentication
- `components/auth/AuthGuard.tsx` - Route protection
- `lib/identity/client.ts` - Mode switching
- `lib/identity/server.ts` - Server-side mode check
- `app/(app)/auth/callback/route.ts` - OAuth callback
- `components/onboarding/OnboardingFlow.tsx` - Sign in flow

### Data Management
- `lib/db/local.ts` - IndexedDB schema
- `lib/db/sync.ts` - Sync engine
- `lib/context/AppContext.tsx` - State management
- `supabase/migrations/*.sql` - Database schema

### Animation
- `lib/motion/tokens.ts` - Animation constants
- `components/onboarding/screens/textVariants.ts` - Text animation
- `components/home/HomeApp.tsx` - View transitions
- `components/home/shared/MoveCard.tsx` - Gesture animations

### PWA
- `public/manifest.json` - App manifest
- `next.config.js` - Service worker config
- `components/pwa/PWAUpdateController.tsx` - Update handling
- `components/pwa/PWAInstallPrompt.tsx` - Install prompt
- `lib/notifications/push.ts` - Push registration
- `supabase/functions/send-notifications/` - Push delivery

### Forms & Input
- `components/home/sheets/AddMoveSheet.tsx` - Add move form
- `components/onboarding/screens/NameScreen.tsx` - Name input
- `components/onboarding/screens/DirectionsScreen.tsx` - Directions input

### UI Components
- `components/home/shared/MoveCard.tsx` - Move display
- `components/home/shared/DotRow.tsx` - Cycle progress dots
- `components/shared/Sheet.tsx` - Bottom sheet base
- `components/onboarding/shared/CtaButton.tsx` - Primary button

---

## File Naming Conventions

| Pattern | Example | Meaning |
|---------|---------|---------|
| `PascalCase.tsx` | `MoveCard.tsx` | React component |
| `camelCase.ts` | `useOnline.ts` | Utility or hook |
| `page.tsx` | `app/home/page.tsx` | Next.js page |
| `layout.tsx` | `app/home/layout.tsx` | Next.js layout |
| `route.ts` | `app/api/.../route.ts` | API route handler |
| `*.sql` | `init.sql` | Database migration |
| `UPPER.md` | `CLAUDE.md` | Documentation |

---

## Import Aliases

Configured in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

Usage:
```tsx
// Instead of relative paths
import { db } from '../../../lib/db/local'

// Use alias
import { db } from '@/lib/db/local'
```

---

## Quick Reference by Chapter

| Chapter | Primary Files |
|---------|---------------|
| 1-4 (JS Basics) | `lib/utils/*.ts` |
| 5-6 (TypeScript) | `lib/db/types.ts`, all `.tsx` files |
| 7-8 (React Basics) | `components/onboarding/screens/*.tsx` |
| 9 (Effects) | `lib/hooks/*.ts`, `MoveCard.tsx` |
| 10 (Context) | `lib/context/AppContext.tsx`, `useToast.tsx` |
| 11 (Next.js) | `app/**/*`, `next.config.js` |
| 12 (API Routes) | `app/api/**/*`, `lib/supabase/*.ts` |
| 13 (Dexie) | `lib/db/local.ts`, `lib/db/sync.ts` |
| 14 (Supabase) | `supabase/migrations/*.sql`, `lib/db/types.ts` |
| 15 (Auth) | `lib/identity/*.ts`, `AuthGuard.tsx` |
| 16 (Animation) | `lib/motion/tokens.ts`, `HomeApp.tsx` |
| 17 (PWA) | `public/manifest.json`, `components/pwa/*.tsx` |

---

[Previous: Appendix B - Pattern Reference](./B-pattern-reference.md) | [Next: Appendix D - Research Topics](./D-research-topics.md) | [Back to README](../README.md)
