# Chapter 11: Next.js Architecture

Next.js is a React framework that adds routing, server-side rendering, and build optimization on top of React. It structures your application with file-based routing and provides patterns for handling both server and client code. This chapter explains how Next.js 14 (App Router) organizes code and how the Align codebase uses these patterns.

---

## What You Will Learn

- What Next.js adds to React
- The App Router and file-based routing
- Server Components vs Client Components
- Layouts and nested routing
- Route groups
- Loading and error states
- Metadata and SEO
- How Align structures its routes

---

## Prerequisites

- Chapters 7-10: React fundamentals (components, state, effects, context)

---

## The Vocabulary

**App Router** - Next.js 14's routing system based on the `app/` directory.

**Page** - A file named `page.tsx` that defines a route's UI.

**Layout** - A file named `layout.tsx` that wraps pages and persists across navigation.

**Route Group** - A folder in parentheses `(name)` that organizes routes without affecting the URL.

**Server Component** - A component that renders on the server. The default in App Router.

**Client Component** - A component that renders in the browser. Marked with `"use client"`.

**Loading UI** - A file named `loading.tsx` that shows while the page loads.

**Error Boundary** - A file named `error.tsx` that catches errors in that route segment.

**Route Handler** - A file named `route.ts` that handles HTTP requests (API routes).

---

## Section 1: What Next.js Adds to React

### React Alone

React is a library for building UIs. It does not include:
- Routing (navigating between pages)
- Server-side rendering
- Build optimization
- File organization conventions

### Next.js Adds

1. **File-based routing** - Files become URLs
2. **Server rendering** - Pages render on the server first
3. **Automatic code splitting** - Only load code for current page
4. **API routes** - Backend endpoints in the same project
5. **Optimizations** - Images, fonts, scripts

### The Mental Model

```
Pure React:
- You decide file structure
- You add a router library
- You configure bundling
- Everything runs in browser

Next.js:
- File structure IS the routes
- Routing is built-in
- Bundling is automatic
- Code runs on server AND client
```

---

## Section 2: The App Directory

### Structure

The `app/` directory contains all routes:

```
app/
├── layout.tsx        <- Root layout (wraps everything)
├── page.tsx          <- Home page (/)
├── globals.css       <- Global styles
├── loading.tsx       <- Loading state for /
├── error.tsx         <- Error boundary for /
├── (app)/           <- Route group (no URL impact)
│   ├── home/
│   │   ├── layout.tsx
│   │   └── page.tsx  <- /home
│   ├── auth/
│   │   ├── page.tsx  <- /auth
│   │   └── callback/
│   │       └── route.ts  <- /auth/callback (API route)
│   └── onboarding/
│       └── page.tsx  <- /onboarding
├── (marketing)/     <- Another route group
│   └── page.tsx      <- / (marketing landing)
└── api/
    └── account/
        └── route.ts  <- /api/account
```

### URL Mapping

| File Path | URL |
|-----------|-----|
| `app/page.tsx` | `/` |
| `app/(app)/home/page.tsx` | `/home` |
| `app/(app)/auth/page.tsx` | `/auth` |
| `app/(app)/onboarding/page.tsx` | `/onboarding` |
| `app/api/account/route.ts` | `/api/account` |

Route groups in parentheses `(app)` and `(marketing)` do NOT appear in the URL.

---

## Section 3: Pages

### The page.tsx File

Every route needs a `page.tsx` file:

```tsx
// app/(app)/home/page.tsx
export default function HomePage() {
  return (
    <main>
      <h1>Home</h1>
    </main>
  );
}
```

This creates the `/home` route.

### In The Codebase: app/(app)/home/page.tsx

```tsx
import HomeApp from "@/components/home/HomeApp";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

export default function HomePage() {
  return (
    <main className="h-full w-full overflow-hidden">
      <ErrorBoundary>
        <HomeApp />
      </ErrorBoundary>
    </main>
  );
}
```

The page:
- Is a Server Component (no "use client")
- Imports the actual UI from `components/`
- Wraps content in an ErrorBoundary
- Returns JSX that becomes the `/home` route

### Why Components Live Outside app/

Pages are thin. The actual UI lives in `components/`:

```
app/(app)/home/page.tsx      <- 10 lines, imports HomeApp
components/home/HomeApp.tsx  <- 190 lines, actual UI
```

Benefits:
- Pages stay simple
- Components are reusable
- Testing is easier
- Clear separation of routing and UI

---

## Section 4: Layouts

### The layout.tsx File

Layouts wrap pages and persist across navigation:

```tsx
// app/layout.tsx - Root layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

The `children` prop is the page content.

### In The Codebase: app/layout.tsx

```tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { buildDefaultMetadata } from "@/lib/site";

export const metadata: Metadata = buildDefaultMetadata();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1A1A1A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full w-full">
      <body className="h-full w-full bg-parchment">
        {children}
      </body>
    </html>
  );
}
```

This is the outermost layout. It:
- Sets metadata (title, description)
- Sets viewport settings
- Imports global CSS
- Wraps everything in `<html>` and `<body>`

### Nested Layouts

Layouts can nest. Each adds its own wrapper:

```
app/
├── layout.tsx              <- <html><body>
└── (app)/
    ├── layout.tsx          <- <div className="app-shell">
    └── home/
        ├── layout.tsx      <- <AuthGuard><Providers>
        └── page.tsx        <- actual content
```

The final HTML nests all three:

```html
<html>
  <body>
    <div class="app-shell">
      <AuthGuard>
        <Providers>
          <!-- page content -->
        </Providers>
      </AuthGuard>
    </div>
  </body>
</html>
```

### In The Codebase: app/(app)/home/layout.tsx

```tsx
import AuthGuard from "@/components/auth/AuthGuard";
import HomeProviders from "@/components/home/HomeProviders";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <HomeProviders>{children}</HomeProviders>
    </AuthGuard>
  );
}
```

This layout:
- Wraps all `/home` routes
- Adds authentication checking (AuthGuard)
- Provides context (HomeProviders)
- Does NOT re-render when navigating within `/home`

### Layouts Persist

When you navigate from `/home` to `/home?sheet=add-move`, the layout does NOT remount. Only the page content changes. This is efficient.

---

## Section 5: Route Groups

### The Concept

Route groups organize files without affecting URLs:

```
app/
├── (app)/           <- Group: does not appear in URL
│   ├── home/        <- URL: /home
│   └── auth/        <- URL: /auth
└── (marketing)/     <- Group: does not appear in URL
    └── page.tsx     <- URL: /
```

### Why Use Route Groups?

1. **Separate layouts** - Marketing pages have different layout than app pages
2. **Organize code** - Group related routes together
3. **Different configurations** - Each group can have its own layout, loading, error handling

### In The Codebase

```
app/
├── (app)/              <- Protected app routes
│   ├── layout.tsx      <- App shell, PWA components
│   ├── home/           <- /home (authenticated)
│   ├── auth/           <- /auth (auth flow)
│   └── onboarding/     <- /onboarding
└── (marketing)/        <- Public marketing routes
    ├── page.tsx        <- / (landing page)
    └── method/         <- /method (method page)
```

The `(app)` group:
- Has a layout with PWA components
- Contains authenticated routes
- Has `robots: noindex` metadata

The `(marketing)` group:
- Public pages
- Different layout (if needed)
- SEO-friendly

---

## Section 6: Server vs Client Components

### The Default: Server Components

In App Router, components are Server Components by default:

```tsx
// This is a Server Component
export default function Page() {
  // Can access database directly
  // Can read files
  // Cannot use useState, useEffect, onClick
  return <div>Hello</div>;
}
```

Server Components:
- Render on the server
- Can access databases, file system
- Cannot use React hooks
- Cannot handle user events
- Send only HTML to browser (smaller bundle)

### Client Components

Add `"use client"` at the top:

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

Client Components:
- Start with `"use client"`
- Render in the browser
- Can use hooks, events
- Are hydrated (JavaScript attached to HTML)

### In The Codebase: Server Component

```tsx
// app/(app)/home/layout.tsx (no "use client")
import AuthGuard from "@/components/auth/AuthGuard";
import HomeProviders from "@/components/home/HomeProviders";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <HomeProviders>{children}</HomeProviders>
    </AuthGuard>
  );
}
```

This layout is a Server Component. It can await data, check auth on server.

### In The Codebase: Client Component

```tsx
// components/home/HomeApp.tsx
"use client";

import { useState, useEffect } from "react";

export default function HomeApp() {
  const [view, setView] = useState("home");
  // ...hooks, state, effects
}
```

HomeApp uses state and effects, so it must be a Client Component.

### The Pattern

```
Server Component (layout or page)
└── Client Component (interactive parts)
    └── Server Component (possible, but less common)
```

Start at the server, drop into client when you need interactivity.

### In The Codebase: AuthGuard

```tsx
// components/auth/AuthGuard.tsx
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export default async function AuthGuard({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
```

AuthGuard is an async Server Component that:
- Creates a Supabase client on the server
- Checks the session
- Redirects if not authenticated
- No `"use client"` - runs entirely on server

---

## Section 7: Route Handlers (API Routes)

### The Concept

Files named `route.ts` create API endpoints:

```tsx
// app/api/hello/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

This creates `GET /api/hello`.

### HTTP Methods

Export functions named after HTTP methods:

```tsx
export async function GET(request: Request) { /* ... */ }
export async function POST(request: Request) { /* ... */ }
export async function PUT(request: Request) { /* ... */ }
export async function DELETE(request: Request) { /* ... */ }
```

### In The Codebase: app/(app)/auth/callback/route.ts

```tsx
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const error = searchParams.get("error");
  
  // Build redirect URL
  const baseUrl = /* ... */;
  const onboardingUrl = new URL(`${baseUrl}/onboarding`);
  
  if (code) onboardingUrl.searchParams.set("code", code);
  if (error) onboardingUrl.searchParams.set("authError", error);
  
  return NextResponse.redirect(onboardingUrl.toString());
}
```

This is the OAuth callback handler:
- Supabase redirects here after email link clicked
- Extracts code and error from URL
- Redirects to onboarding with parameters

### When to Use Route Handlers

- OAuth callbacks
- Webhooks from external services
- API endpoints for mobile apps
- Server-side only operations

For most data operations in Align, we use Supabase directly from Client Components or Edge Functions.

---

## Section 8: Loading and Error States

### loading.tsx

Shows while the page is loading:

```tsx
// app/(app)/home/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}
```

Next.js automatically shows this during navigation.

### In The Codebase: app/loading.tsx

```tsx
export default function Loading() {
  return (
    <div className="h-full w-full bg-parchment flex items-center justify-center">
      <div className="flex items-center gap-[10px]">
        <Logo size={22} className="opacity-70" />
        <span className="font-gtw text-[32px] tracking-[-0.03em] text-dusk/60">Align.</span>
      </div>
    </div>
  );
}
```

Shows the logo while loading.

### error.tsx

Catches errors in that route segment:

```tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### In The Codebase: app/error.tsx

```tsx
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-full w-full bg-parchment flex flex-col items-center justify-center gap-6 p-8">
      <p className="font-gtw text-2xl text-ink tracking-tight">Something went wrong.</p>
      <button
        onClick={() => reset()}
        className="bg-ink text-parchment font-body text-sm px-6 py-3 rounded-full"
      >
        Try again
      </button>
    </div>
  );
}
```

Error boundaries must be Client Components (need hooks for reset).

---

## Section 9: Metadata

### Static Metadata

Export a `metadata` object:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home - Align",
  description: "Your daily alignment",
};
```

### In The Codebase: app/(app)/layout.tsx

```tsx
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};
```

The app routes tell search engines not to index them (private user data).

### Viewport

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1A1A1A",
};
```

Sets mobile viewport behavior and theme color.

---

## Section 10: The Import Alias

### The @ Alias

Throughout the codebase you see:

```tsx
import { useAppContext } from "@/lib/context/AppContext";
import HomeApp from "@/components/home/HomeApp";
```

The `@` is an alias for the project root, configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Why Use Aliases?

Without alias:
```tsx
import { useAppContext } from "../../../lib/context/AppContext";
```

With alias:
```tsx
import { useAppContext } from "@/lib/context/AppContext";
```

- Clearer paths
- No counting `../`
- Works from any depth
- Refactoring is easier

---

## Section 11: Configuration

### next.config.js

```tsx
const nextPwa = require("@ducanh2912/next-pwa");

const withPWA = nextPwa.default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  // ... PWA configuration
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = withPWA(nextConfig);
```

This file:
- Configures PWA (Progressive Web App) features
- Customizes webpack
- Could add redirects, rewrites, environment variables

---

## The Full Picture

```
Request: GET /home
         │
         ▼
app/layout.tsx (Server)
└── Sets <html>, <body>, metadata
    │
    ▼
app/(app)/layout.tsx (Server)
└── Adds PWA components
    │
    ▼
app/(app)/home/layout.tsx (Server)
└── AuthGuard checks session (Server)
    └── HomeProviders adds Context (Client)
        │
        ▼
app/(app)/home/page.tsx (Server)
└── Renders HomeApp (Client)
    └── Full interactive UI with state, effects
```

The request flows through nested layouts, each adding its layer, finally reaching the page.

---

## Why Not Other Approaches?

### Why Not Plain React with react-router?

You could. But you would need to:
- Configure bundling yourself
- Set up code splitting manually
- Handle server rendering yourself
- Create API routes separately
- Organize files however you want (no conventions)

Next.js provides conventions and optimizations out of the box.

### Why Not Pages Router (older Next.js)?

App Router (Next.js 13+) offers:
- Server Components (smaller bundles)
- Nested layouts (shared UI persists)
- Streaming (progressive loading)
- Better TypeScript support

Pages Router still works but App Router is the future.

### Why Route Groups?

Without groups, you would need:
- Separate projects for marketing and app
- Or complex conditional layouts
- Or URLs like `/app/home` instead of `/home`

Groups give organizational power without URL complexity.

---

## Mistakes: What Breaks

### Mistake 1: Using Hooks in Server Components

```tsx
// app/(app)/home/page.tsx (Server Component by default)
import { useState } from "react";

export default function Page() {
  const [count, setCount] = useState(0);  // Error!
}
```

Error: "You're importing a component that needs useState..."

Fix: Add `"use client"` or move to a Client Component.

### Mistake 2: Forgetting "use client"

```tsx
// components/Counter.tsx
import { useState } from "react";  // Error if imported by Server Component!

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

Fix: Add `"use client"` at the top of the file.

### Mistake 3: Wrong File Names

```tsx
// app/(app)/home/index.tsx  <- Does not work
// app/(app)/home/Home.tsx   <- Does not work

// Must be:
// app/(app)/home/page.tsx   <- This is the route
```

Next.js looks for specific file names: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`.

### Mistake 4: Async Client Components

```tsx
"use client";

// BAD - client components cannot be async
export default async function Page() {
  const data = await fetch(...);  // Error!
}
```

Client Components cannot be async. Fetch data in Server Components or use useEffect in Client Components.

---

## Mental Debugging

When routes do not work:

1. **Check file names.** Is it `page.tsx` not `Page.tsx`?

2. **Check the path.** Does the folder structure match the expected URL?

3. **Check for "use client".** If using hooks, does the file have the directive?

4. **Check the layout chain.** Are all parent layouts rendering `{children}`?

5. **Check route groups.** Parentheses `()` do not appear in URLs.

6. **Check the console.** Server errors appear in terminal, client errors in browser.

---

## Connections

**From Chapters 7-10:** Next.js pages are React components. Everything you learned applies.

**To Chapter 12:** API routes (route.ts) handle server logic.

**To Chapter 15:** AuthGuard uses Next.js server features for secure authentication.

---

## Go Figure It Out

1. **What is React Server Components (RSC)?** How are they different from Server-Side Rendering (SSR)?

2. **What is streaming in Next.js?** How does Suspense work with Server Components?

3. **What is the "use server" directive?** How does it differ from "use client"?

4. **What are Parallel Routes?** When would you use `@folder` syntax?

5. **What is Incremental Static Regeneration (ISR)?** How does it differ from SSR and SSG?

---

## Chapter Exercise

### Part 1: Map the Routes

Draw the route structure for Align:
1. List every `page.tsx` file in `app/`
2. Write the URL each creates
3. List every `layout.tsx` and what it wraps
4. Identify which are Server vs Client Components

### Part 2: Trace a Request

For a request to `/home`:
1. Which layouts are rendered?
2. In what order?
3. Which are Server Components?
4. Which are Client Components?
5. Where does authentication happen?

### Part 3: Create a New Route

Imagine adding a `/settings` route:
1. What files would you create?
2. Where would they go?
3. Should it be in `(app)` or a new group?
4. What layout would wrap it?
5. Server or Client Component?

### Part 4: In the Codebase

1. Open `app/(app)/layout.tsx`. What does it add that the root layout does not?

2. Open `components/auth/AuthGuard.tsx`. Why is it a Server Component? What would break if it were Client?

3. Find where `HomeProviders` is defined. What providers does it include?

4. Look at `app/(app)/auth/callback/route.ts`. What is the complete flow when a user clicks an email link?

---

**Previous: [Chapter 10 - Context and Global State](../part-3-react/10-context-and-global-state.md)**

**Next: [Chapter 12 - API Routes and Server Logic](./12-api-routes-and-server.md)**
