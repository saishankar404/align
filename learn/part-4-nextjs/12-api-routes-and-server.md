# Chapter 12: API Routes and Server Logic

Web applications need server-side logic for tasks that cannot or should not happen in the browser - authentication callbacks, database operations with elevated privileges, webhooks, and scheduled jobs. This chapter covers how to write server-side code in Next.js and Supabase Edge Functions.

---

## What You Will Learn

- Route handlers in Next.js (API routes)
- Server vs client Supabase clients
- Handling authentication in API routes
- Supabase Edge Functions
- Environment variables and secrets
- Error handling patterns
- When to use which approach

---

## Prerequisites

- Chapter 11: Next.js Architecture
- Basic understanding of HTTP methods (GET, POST, etc.)

---

## The Vocabulary

**Route Handler** - A file named `route.ts` in the app directory that handles HTTP requests.

**Edge Function** - Serverless function running on Supabase's edge network, close to users.

**Service Role Key** - A secret key with admin access that bypasses Row Level Security.

**Anon Key** - A public key used by clients, respects Row Level Security.

**Environment Variable** - Configuration values stored outside code, accessed via `process.env`.

**Secret** - Sensitive environment variable (API keys, passwords) that should never be exposed to clients.

**Request** - The incoming HTTP request object with URL, headers, body.

**Response** - The outgoing HTTP response with status, headers, body.

---

## Section 1: Route Handlers

### The Basics

Route handlers are files named `route.ts` that export HTTP method functions:

```typescript
// app/api/hello/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

This creates `GET /api/hello`.

### HTTP Methods

Export functions for the methods you want to handle:

```typescript
export async function GET(request: Request) {
  // Handle GET requests
}

export async function POST(request: Request) {
  // Handle POST requests
}

export async function PUT(request: Request) {
  // Handle PUT requests
}

export async function DELETE(request: Request) {
  // Handle DELETE requests
}

export async function PATCH(request: Request) {
  // Handle PATCH requests
}
```

### The Request Object

The request parameter is the standard Web API Request:

```typescript
export async function POST(request: Request) {
  // Get URL and query params
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  
  // Get headers
  const authHeader = request.headers.get("authorization");
  
  // Get JSON body
  const body = await request.json();
  
  // Get form data
  const formData = await request.formData();
  
  // Get raw text
  const text = await request.text();
}
```

### The Response Object

Use `NextResponse` for structured responses:

```typescript
import { NextResponse } from "next/server";

// JSON response
return NextResponse.json({ data: "value" });

// JSON with status code
return NextResponse.json({ error: "Not found" }, { status: 404 });

// Redirect
return NextResponse.redirect("https://example.com/new-url");

// Custom headers
return NextResponse.json(
  { data: "value" },
  {
    status: 200,
    headers: {
      "Cache-Control": "max-age=3600",
    },
  }
);
```

---

## Section 2: In The Codebase - Auth Callback

### app/(app)/auth/callback/route.ts

```typescript
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const intent = searchParams.get("intent");
  const error = searchParams.get("error");
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");
  
  // Determine base URL (handles proxies)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";
  const baseUrl = host ? `${protocol}://${host}` : new URL(request.url).origin;
  
  // Build redirect URL
  const onboardingUrl = new URL(`${baseUrl}/onboarding`);
  onboardingUrl.searchParams.set("afterAuth", "1");
  if (next === "link") onboardingUrl.searchParams.set("intent", "link");
  if (intent === "signup" || intent === "existing") onboardingUrl.searchParams.set("intent", intent);
  if (code) onboardingUrl.searchParams.set("code", code);
  if (error) onboardingUrl.searchParams.set("authError", error);
  
  return NextResponse.redirect(onboardingUrl.toString());
}
```

This handler:
1. Receives the OAuth callback from Supabase
2. Extracts parameters (code, error, etc.)
3. Builds a redirect URL with those parameters
4. Sends the user to the onboarding page

### Why a Route Handler?

OAuth callbacks need a fixed URL. The identity provider (Supabase) redirects to this URL after authentication. It must:
- Accept GET requests
- Parse query parameters
- Redirect to the app

This cannot be done in a React component - it must run on the server.

---

## Section 3: Server vs Client Supabase Clients

### Two Different Clients

Align has two Supabase clients:

**Client (browser):** `lib/supabase/client.ts`
```typescript
"use client";

import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/db/types";

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);
```

**Server:** `lib/supabase/server.ts`
```typescript
import { createServerClient as createSupabaseServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/lib/db/types";

export function createServerClient() {
  const cookieStore = cookies();
  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );
}
```

### Why Different Clients?

**Browser client:**
- Runs in the browser
- Stores session in localStorage
- Uses the user's session for RLS
- Marked with `"use client"`

**Server client:**
- Runs on the server
- Reads session from cookies
- Uses the same session for RLS
- Access to `cookies()` from Next.js

Both use the **anon key** - they respect Row Level Security.

### The Service Role Client

For admin operations, create a client with the service role key:

```typescript
import { createClient } from "@supabase/supabase-js";

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,  // Secret!
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

This client:
- Bypasses Row Level Security
- Can access all data
- Can perform admin operations (delete users)
- Should ONLY be used on the server
- The key must NEVER be in client code

---

## Section 4: In The Codebase - Account Deletion

### app/api/account/delete/route.ts

This is the most complex API route in Align. Let us break it down:

#### Step 1: Authentication Helper

```typescript
async function getAuthenticatedUserId(
  request: Request,
  url: string,
  anonKey: string
): Promise<string | null> {
  // Try Bearer token first (for programmatic access)
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;

  if (bearerToken) {
    const authClient = createClient<Database>(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error } = await authClient.auth.getUser(bearerToken);
    if (!error && user) return user.id;
  }

  // Fall back to cookie-based session
  const supabase = createServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;
  
  return user.id;
}
```

This function:
1. Checks for a Bearer token in the Authorization header
2. If found, validates it with Supabase
3. If not, checks for a cookie-based session
4. Returns the user ID or null

#### Step 2: Main Handler

```typescript
export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Check configuration
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  // Authenticate user
  const userId = await getAuthenticatedUserId(request, url, anonKey);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
```

#### Step 3: Delete User Data

```typescript
  const userClient = createServerClient();

  const deletionSteps = [
    userClient.from("reflections").delete().eq("user_id", userId),
    userClient.from("checkins").delete().eq("user_id", userId),
    userClient.from("moves").delete().eq("user_id", userId),
    userClient.from("directions").delete().eq("user_id", userId),
    userClient.from("cycles").delete().eq("user_id", userId),
    userClient.from("later_items").delete().eq("user_id", userId),
    userClient.from("profiles").delete().eq("id", userId),
  ];

  const deletionResults = await Promise.all(deletionSteps);
  const deletionError = deletionResults.find((result) => result.error)?.error;

  if (deletionError) {
    console.error("synced data delete failed", {
      userId,
      message: deletionError.message,
      code: deletionError.code,
    });
    return NextResponse.json({ error: "Failed to delete synced data" }, { status: 500 });
  }
```

This uses the **user's own client** (respects RLS) to delete their data. The user can only delete their own rows.

#### Step 4: Delete Auth Account (Admin Operation)

```typescript
  if (!serviceRole) {
    return NextResponse.json({ ok: true, accountDeleted: false });
  }

  const adminClient = createClient<Database>(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    console.error("account delete failed", {
      userId,
      message: error.message,
      status: error.status,
    });
    return NextResponse.json({ ok: true, accountDeleted: false });
  }

  return NextResponse.json({ ok: true, accountDeleted: true });
}
```

This uses the **admin client** to delete the auth user - something only the service role can do.

---

## Section 5: Environment Variables

### Types of Variables

**Public (NEXT_PUBLIC_*):**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

- Prefixed with `NEXT_PUBLIC_`
- Available in browser AND server
- Safe to expose (anon key has RLS protection)

**Secret (no prefix):**
```
SUPABASE_SERVICE_ROLE_KEY=eyJ...
VAPID_PRIVATE_KEY=abc...
```

- No `NEXT_PUBLIC_` prefix
- ONLY available on server
- Never sent to browser
- Used for admin operations

### Accessing Variables

```typescript
// Server-only (API routes, Server Components)
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Both client and server
const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
```

### The .env.local File

```
# .env.local (never commit this file!)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
VAPID_PUBLIC_KEY=BA...
VAPID_PRIVATE_KEY=xyz...
```

### Security Check

Never expose secrets in client code:

```bash
# Check for leaked secrets in build
grep -r "service_role" .next/ 2>/dev/null
grep -r "VAPID_PRIVATE" .next/ 2>/dev/null
```

These should return nothing.

---

## Section 6: Supabase Edge Functions

### What They Are

Edge Functions run on Supabase's infrastructure, not your Next.js server:

- Written in TypeScript (Deno runtime)
- Run close to users (edge network)
- Can be triggered by HTTP or scheduled
- Have their own secrets

### In The Codebase: supabase/functions/send-notifications/index.ts

This function sends push notifications:

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push";

Deno.serve(async () => {
  // Create admin client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Configure web push
  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
  const subject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:align@localhost.dev";
  webpush.setVapidDetails(subject, publicKey, privateKey);

  // Fetch users with notifications enabled
  const { data, error } = await supabase
    .from("profiles")
    .select("id, timezone, notif_morning_time, notif_night_time, notif_enabled, push_subscription")
    .eq("notif_enabled", true)
    .not("push_subscription", "is", null);

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
  }

  // ... time checking and sending logic ...

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

### Key Differences from Next.js

| Next.js Route Handler | Supabase Edge Function |
|----------------------|------------------------|
| Runs on your server | Runs on Supabase edge |
| `process.env.X` | `Deno.env.get("X")` |
| `import from "package"` | `import from "npm:package"` |
| `NextResponse` | Standard `Response` |
| Part of your deploy | Separate deploy |

### Time Window Check

```typescript
function isInNotifWindow(nowUtc: Date, targetTimeHHMM: string, timezone: string): boolean {
  const safeTimezone = timezone || "UTC";
  const localTime = new Date(nowUtc.toLocaleString("en-US", { timeZone: safeTimezone }));
  const [th, tm] = targetTimeHHMM.split(":").map(Number);
  const localH = localTime.getHours();
  const localM = localTime.getMinutes();
  const localTotalMins = localH * 60 + localM;
  const targetTotalMins = th * 60 + tm;
  return localTotalMins >= targetTotalMins && localTotalMins < targetTotalMins + 5;
}
```

This checks if the current time (converted to user's timezone) is within 5 minutes of their notification time.

### Handling Errors

```typescript
try {
  await webpush.sendNotification(subscription, JSON.stringify(payload));
  sent += 1;
} catch (pushError) {
  const err = pushError as { statusCode?: number };
  if (err.statusCode === 410) {
    // Subscription expired - disable notifications
    await supabase
      .from("profiles")
      .update({ notif_enabled: false, push_subscription: null })
      .eq("id", profile.id);
  }
}
```

Error 410 (Gone) means the push subscription is no longer valid. The function cleans up by disabling notifications for that user.

---

## Section 7: When to Use What

### Use Next.js Route Handlers When:

- OAuth callbacks (fixed URL needed)
- Operations that need Next.js features (cookies, headers)
- Simple API endpoints
- Part of your main deployment

### Use Supabase Edge Functions When:

- Scheduled tasks (cron jobs)
- Database triggers
- Operations that need to run close to users
- Heavy computation separate from your app
- Webhooks from external services

### Use Client-Side Supabase When:

- User CRUD operations (RLS protects data)
- Real-time subscriptions
- Most data operations
- No admin privileges needed

### Use Server-Side Supabase When:

- Need to check session on server
- Server Components need data
- API routes need user context

### Use Service Role When:

- Admin operations (delete user account)
- Bypassing RLS (scheduled jobs)
- Cross-user operations
- ONLY on server, NEVER on client

---

## Section 8: Error Handling Patterns

### Structured Error Responses

```typescript
export async function POST(request: Request) {
  try {
    // ... logic ...
    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    console.error("Operation failed:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### Validation First

```typescript
export async function POST(request: Request) {
  // Check required environment variables
  const requiredKey = process.env.REQUIRED_KEY;
  if (!requiredKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  // Check authentication
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate request body
  const body = await request.json();
  if (!body.requiredField) {
    return NextResponse.json({ error: "Missing required field" }, { status: 400 });
  }

  // ... actual logic ...
}
```

### Logging

```typescript
if (error) {
  console.error("operation failed", {
    userId,
    message: error.message,
    code: error.code,
    // Include context but not sensitive data
  });
  return NextResponse.json({ error: "Operation failed" }, { status: 500 });
}
```

Log enough to debug but do not leak sensitive information.

---

## Why Not Other Approaches?

### Why Not Just Client-Side?

Some operations cannot happen in the browser:
- Deleting auth accounts (needs service role)
- OAuth callbacks (need fixed URL)
- Scheduled jobs (no browser running)

### Why Not All Server-Side?

Client-side is simpler for most operations:
- RLS handles permissions
- Real-time works
- Offline-first with Dexie
- Less server load

### Why Edge Functions vs Route Handlers?

Edge Functions:
- Run on Supabase's infrastructure
- Can be scheduled
- Separate from app deployment

Route Handlers:
- Part of your Next.js app
- Use Next.js features
- Single deployment

---

## Mistakes: What Breaks

### Mistake 1: Exposing Service Role Key

```typescript
// BAD - client.ts with service role
"use client";
const client = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);
```

The service role key NEVER goes in client code. Use the anon key.

### Mistake 2: Forgetting Authentication

```typescript
// BAD - no auth check
export async function POST(request: Request) {
  const body = await request.json();
  await db.users.delete(body.userId);  // Anyone can delete any user!
}
```

Always authenticate and authorize.

### Mistake 3: Not Handling Errors

```typescript
// BAD - no error handling
export async function POST(request: Request) {
  const body = await request.json();  // Might throw!
  const result = await someOperation(body);  // Might throw!
  return NextResponse.json(result);
}
```

Wrap in try/catch, return proper status codes.

### Mistake 4: Logging Secrets

```typescript
// BAD - logs contain secrets
console.log("Request with key:", process.env.SUPABASE_SERVICE_ROLE_KEY);
```

Never log secrets.

---

## Mental Debugging

When API routes do not work:

1. **Check the URL.** Is the file in the right place? Is it `route.ts`?

2. **Check the method.** Does the request method match the exported function?

3. **Check environment variables.** Are they set? Are they spelled correctly?

4. **Check authentication.** Is the session being passed? Are cookies working?

5. **Check the response.** What status code? What body?

6. **Check server logs.** Errors appear in the terminal, not browser console.

---

## Connections

**From Chapter 11:** Route handlers are part of Next.js App Router architecture.

**To Chapter 14:** Supabase clients connect to the database covered there.

**To Chapter 15:** Authentication patterns are covered in depth.

---

## Go Figure It Out

1. **What is CORS?** When do you need to handle it in API routes?

2. **What is rate limiting?** How would you implement it?

3. **What is middleware in Next.js?** How does it differ from route handlers?

4. **What are Supabase Database Functions?** When would you use SQL functions vs Edge Functions?

5. **What is the difference between Deno and Node?** Why do Edge Functions use Deno?

---

## Chapter Exercise

### Part 1: Analyze the Delete Route

Open `app/api/account/delete/route.ts`:
1. List all the environment variables it uses
2. Which are public? Which are secret?
3. What happens if service role key is missing?
4. Why does it delete data before deleting the user?

### Part 2: Trace Authentication

For a logged-in user calling `POST /api/account/delete`:
1. How does the route know who the user is?
2. What is checked first - Bearer token or cookies?
3. Why support both methods?

### Part 3: Analyze the Edge Function

Open `supabase/functions/send-notifications/index.ts`:
1. Why does it use service role key?
2. What happens when a push subscription expires?
3. How does it know what time it is for each user?

### Part 4: Design Exercise

Design an API route that:
1. Allows users to export their data as JSON
2. Only returns the authenticated user's data
3. Handles errors gracefully
4. What client would you use? Why?

---

**Previous: [Chapter 11 - Next.js Architecture](./11-nextjs-architecture.md)**

**Next: [Chapter 13 - Offline-First with Dexie](../part-5-data/13-offline-first-dexie.md)**
