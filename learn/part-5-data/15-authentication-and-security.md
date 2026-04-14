# Chapter 15: Authentication and Security

Authentication answers a fundamental question: "Who is this user?" Security ensures that question is answered correctly and that users can only access their own data.

This chapter teaches you how authentication works from first principles, how Supabase implements it, and how Align combines cloud authentication with local-only mode.

---

## 15.1 What is Authentication?

### THE VOCABULARY

**Authentication (AuthN)**: Verifying identity - proving you are who you claim to be. "Are you really Jordan?"

**Authorization (AuthZ)**: Verifying permission - determining what you're allowed to do. "Can Jordan access this data?"

**Session**: A temporary period of authenticated access. Instead of proving identity on every request, you prove it once and get a session token.

**Token**: A string representing authenticated state. Contains or references identity information.

**JWT (JSON Web Token)**: A specific token format containing encoded JSON data plus a cryptographic signature. Pronounced "jot".

### Authentication vs Authorization

These are often confused. Here's a clear distinction:

| Concern | Question | Align Example |
|---------|----------|---------------|
| Authentication | Who are you? | User signs in with Google |
| Authorization | What can you do? | User can only see their own moves (RLS) |

You can be authenticated but unauthorized. Signing in proves you're Jordan, but RLS prevents Jordan from accessing Taylor's data.

### Traditional Flow

```
┌─────────┐     1. Username/Password      ┌─────────┐
│  User   │ ─────────────────────────────>│ Server  │
└─────────┘                               └────┬────┘
                                               │
     2. Verify credentials                     │
        (check database)                       │
                                               │
┌─────────┐     3. Session cookie         ┌────┴────┐
│  User   │ <─────────────────────────────│ Server  │
└─────────┘                               └─────────┘
                                               
┌─────────┐     4. Cookie sent with        ┌─────────┐
│  User   │        every request           │ Server  │
│         │ ─────────────────────────────> │         │
│         │ <───────────────────────────── │         │
└─────────┘     5. Protected data          └─────────┘
```

### Modern Flow with OAuth

Instead of managing passwords yourself, delegate to trusted providers:

```
┌─────────┐   1. "Sign in with Google"   ┌─────────┐
│  User   │ ────────────────────────────>│   App   │
└─────────┘                              └────┬────┘
                                              │
                                    2. Redirect to Google
                                              │
                                              ▼
┌─────────┐   3. Enter Google password   ┌─────────┐
│  User   │ ────────────────────────────>│ Google  │
└─────────┘                              └────┬────┘
                                              │
                                    4. Redirect back with code
                                              │
                                              ▼
┌─────────┐                              ┌─────────┐
│  User   │                              │   App   │◄──── 5. Exchange code
└─────────┘                              └────┬────┘         for tokens
                                              │
                                    6. Create session
                                              │
                                              ▼
┌─────────┐   7. Session established     ┌─────────┐
│  User   │ <────────────────────────────│   App   │
└─────────┘                              └─────────┘
```

### WHY OAuth?

1. **No password storage** - You don't store passwords, so they can't be stolen from you
2. **User trust** - Users trust Google's login more than typing passwords into every app
3. **MFA included** - Google handles two-factor authentication
4. **Reduced liability** - Security breach responsibility shifts to the provider

### WHY NOT Y: Why Not Build Your Own Auth?

It seems simple: hash passwords, store in database, compare on login.

Problems:
1. **Password hashing** - Which algorithm? bcrypt? argon2? How many rounds?
2. **Password reset** - Email delivery, token expiration, rate limiting
3. **Brute force protection** - Account lockout, CAPTCHA integration
4. **Session management** - Token rotation, concurrent sessions, logout from all devices
5. **OAuth complexity** - Each provider has different flows, edge cases
6. **Compliance** - GDPR, CCPA, SOC2 requirements

Auth is a solved problem. Use Supabase, Auth0, Clerk, or Firebase Auth.

---

## 15.2 How JWTs Work

JWTs are the standard for modern web authentication. Understanding them helps debug auth issues.

### JWT Structure

A JWT has three parts separated by dots:

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U
│─────── Header ───────││─────── Payload ───────││────────── Signature ──────────│
```

**Header**: Algorithm and token type
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload**: Claims (data about the user)
```json
{
  "sub": "abc-123-uuid",           // Subject (user ID)
  "email": "jordan@example.com",
  "role": "authenticated",
  "exp": 1712345678,               // Expiration timestamp
  "iat": 1712342078                // Issued at timestamp
}
```

**Signature**: Cryptographic proof that header and payload haven't been tampered with
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

### WHAT IT COMPILES TO

You can decode a JWT without the secret (it's just base64):

```javascript
const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U"
const [header, payload, signature] = jwt.split('.')
const decoded = JSON.parse(atob(payload))
// { sub: "1234567890" }
```

But you can't **forge** a valid JWT without the secret. The signature verification fails.

### Access Tokens vs Refresh Tokens

| Token Type | Purpose | Lifetime | Storage |
|------------|---------|----------|---------|
| Access Token | Authenticate API requests | Short (1 hour) | Memory/cookie |
| Refresh Token | Get new access tokens | Long (days/weeks) | HttpOnly cookie |

Why two tokens?
- If access token is stolen, damage is limited (expires soon)
- Refresh token is more secure (HttpOnly, never sent to API)
- Users stay logged in without re-entering credentials

Supabase handles this automatically. When the access token expires, the client library uses the refresh token to get a new one.

---

## 15.3 Supabase Authentication

Supabase wraps PostgreSQL's authentication with a complete auth system.

### The auth.users Table

Supabase creates a special `auth.users` table you don't directly modify:

```sql
-- Managed by Supabase (don't create this yourself)
auth.users (
  id uuid primary key,
  email text,
  encrypted_password text,  -- for email/password auth
  email_confirmed_at timestamptz,
  -- ... many more fields
)
```

Your `profiles` table references this:

```sql
-- From supabase/migrations/20260320091329_init.sql:3
id uuid primary key references auth.users(id) on delete cascade
```

### Auth Methods Supabase Supports

1. **Email/Password** - Traditional credentials
2. **Magic Link** - Email with login link (no password)
3. **OAuth** - Google, GitHub, Apple, etc.
4. **Phone/SMS** - OTP to phone number

Align uses **OAuth with Google**:

```typescript
// components/onboarding/OnboardingFlow.tsx:612-620
const { error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/auth/callback?next=onboarding&intent=${intent}`,
    queryParams: {
      prompt: "select_account",
    },
  },
});
```

### The OAuth Flow in Detail

1. **User clicks "Continue with Google"**
   - App calls `supabase.auth.signInWithOAuth()`
   - Browser redirects to Google's consent screen

2. **User authenticates with Google**
   - Enters email/password (or uses existing session)
   - Approves requested permissions

3. **Google redirects back with code**
   - URL: `/auth/callback?code=ABC123&intent=signup`
   - The code is a one-time authorization code

4. **Supabase exchanges code for tokens**
   - Happens automatically via Supabase client
   - Creates/updates user in `auth.users`
   - Returns access token and refresh token

5. **App receives authenticated session**
   - `onAuthStateChange` fires with session data
   - User is now authenticated

### Callback Route

```typescript
// app/(app)/auth/callback/route.ts:3-23
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const intent = searchParams.get("intent");
  const error = searchParams.get("error");
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");
  
  // Build redirect URL with all relevant params
  const onboardingUrl = new URL(`${baseUrl}/onboarding`);
  onboardingUrl.searchParams.set("afterAuth", "1");
  if (next === "link") onboardingUrl.searchParams.set("intent", "link");
  if (intent === "signup" || intent === "existing") 
    onboardingUrl.searchParams.set("intent", intent);
  if (code) onboardingUrl.searchParams.set("code", code);
  if (error) onboardingUrl.searchParams.set("authError", error);
  
  return NextResponse.redirect(onboardingUrl.toString());
}
```

This route is simple - it just forwards the auth response to the onboarding flow where the actual token exchange happens.

---

## 15.4 Auth State Management

Tracking authentication state is tricky because it can change asynchronously.

### onAuthStateChange

```typescript
// components/onboarding/OnboardingFlow.tsx:490-507
const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    setModeCloud(session.user.id);
  }
});

// Cleanup on unmount
return () => {
  authListener.subscription.unsubscribe();
};
```

Events you can listen for:
- `SIGNED_IN` - User just authenticated
- `SIGNED_OUT` - User logged out
- `TOKEN_REFRESHED` - Access token was renewed
- `USER_UPDATED` - User data changed

### Getting Current Session

```typescript
// Method 1: getSession (from storage)
const { data: { session } } = await supabase.auth.getSession()

// Method 2: getUser (validates with server)
const { data: { user } } = await supabase.auth.getUser()
```

**Critical difference**:
- `getSession()` reads from local storage - fast but might be stale
- `getUser()` makes a network request - slower but authoritative

Use `getSession()` for UI state, `getUser()` for security-critical operations.

### THE VOCABULARY

**Session**: Contains both the user object and the tokens (access + refresh).

**User**: Just the user object (id, email, metadata) without tokens.

**Auth state change**: Any modification to authentication status.

---

## 15.5 Server-Side Authentication

Server Components and API routes need different auth handling.

### AuthGuard Pattern

```typescript
// components/auth/AuthGuard.tsx:5-24
export default async function AuthGuard({ children }: { children: React.ReactNode }) {
  // Development bypass
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
    return <>{children}</>;
  }

  // Local mode: check cookie for local user ID
  if (getServerIdentityMode() === "local" && hasServerLocalIdentity()) {
    return <>{children}</>;
  }

  // Cloud mode: check Supabase session
  const supabase = createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
```

### WHY This Works Server-Side

The Supabase server client reads cookies from the request:

```typescript
// lib/supabase/server.ts
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export function createServerClient() {
  return createServerComponentClient<Database>({ cookies });
}
```

Next.js `cookies()` gives access to the incoming request's cookies, which contain the Supabase session.

### Server Identity Helpers

```typescript
// lib/identity/server.ts:8-20
export function getServerIdentityMode(): IdentityMode {
  const cookieStore = cookies();
  const mode = cookieStore.get(MODE_KEY)?.value;
  if (mode === "local" || mode === "cloud") {
    return mode;
  }
  return "cloud";
}

export function hasServerLocalIdentity(): boolean {
  const cookieStore = cookies();
  return Boolean(cookieStore.get(LOCAL_USER_ID_KEY)?.value);
}
```

This reads cookies directly - no Supabase needed for local mode.

---

## 15.6 Align's Identity System

Align supports two modes: **cloud** (Supabase auth) and **local** (no account).

### WHY Local Mode?

Some users don't want to create accounts:
- Privacy concerns
- Quick trial
- Offline-only use case

Local mode gives full functionality without sign-up friction.

### Identity State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                        First Visit                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
         ▼                                 ▼
┌─────────────────┐               ┌─────────────────┐
│  Click "Start   │               │  Click "Sign in │
│  without        │               │  with Google"   │
│  account"       │               │                 │
└────────┬────────┘               └────────┬────────┘
         │                                 │
         ▼                                 ▼
┌─────────────────┐               ┌─────────────────┐
│  LOCAL MODE     │               │  CLOUD MODE     │
│                 │               │                 │
│  - UUID in      │               │  - Supabase     │
│    localStorage │               │    session      │
│  - No sync      │               │  - Syncs to     │
│  - Cookie for   │               │    Postgres     │
│    SSR          │               │                 │
└────────┬────────┘               └────────┬────────┘
         │                                 │
         │      User clicks "Link          │
         │      account" later             │
         │─────────────────────────────────┘
         │                                 │
         ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CONFLICT RESOLUTION                           │
│  - Local data exists                                             │
│  - Cloud data exists (from another device)                       │
│  - User chooses: keep local OR keep cloud                        │
└─────────────────────────────────────────────────────────────────┘
```

### Client-Side Identity

```typescript
// lib/identity/client.ts:24-35
export function getIdentityMode(): IdentityMode {
  const mode = localStorage.getItem(MODE_KEY);
  if (mode === "cloud" || mode === "local") {
    return mode;
  }
  // Fallback to cookie (for page load before localStorage accessible)
  const cookieMode = getCookie(MODE_KEY);
  if (cookieMode === "cloud" || cookieMode === "local") {
    localStorage.setItem(MODE_KEY, cookieMode);
    return cookieMode;
  }
  return "cloud";  // Default
}
```

### WHY Both localStorage AND Cookies?

| Storage | Accessible From | Persists |
|---------|-----------------|----------|
| localStorage | Client JS only | Until cleared |
| Cookies | Client JS + Server | Until expiry |

Server Components can't read localStorage (they run on the server). Cookies bridge the gap - the identity mode is written to both.

```typescript
// lib/identity/client.ts:50-55
export function setModeLocal(): string {
  const localUserId = getOrCreateLocalUserId();
  localStorage.setItem(MODE_KEY, "local");   // For client reads
  setCookie(MODE_KEY, "local");              // For server reads
  setCookie(LOCAL_USER_ID_KEY, localUserId); // Server needs user ID too
  return localUserId;
}
```

### Active User ID

The app needs to know the current user ID regardless of mode:

```typescript
// lib/identity/client.ts:90-95
export async function getActiveUserId(): Promise<string | null> {
  if (isLocalMode()) {
    return getOrCreateLocalUserId();  // From localStorage
  }
  return getCloudUserId();  // From Supabase session
}
```

This abstraction lets the rest of the app not care which mode is active.

---

## 15.7 Security Considerations

### Never Expose Secrets

```typescript
// WRONG - service role key in client bundle
const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// RIGHT - use anon key in client
const supabase = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
```

Environment variables without `NEXT_PUBLIC_` prefix are server-only in Next.js.

### RLS is Your Safety Net

Even if you make a client-side mistake, RLS prevents data leaks:

```typescript
// Client code has a bug - tries to fetch all users
const { data } = await supabase.from('profiles').select('*')

// RLS policy kicks in:
// create policy "profiles own" on profiles using (auth.uid() = id)

// Result: data contains only the current user's profile
```

### MISTAKES: Common Security Errors

**Problem 1: Trusting client-provided user IDs**

```typescript
// WRONG - user could send any ID
async function getProfile(userId: string) {
  return supabase.from('profiles').select('*').eq('id', userId).single()
}

// RIGHT - use authenticated user's ID
async function getMyProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return supabase.from('profiles').select('*').eq('id', user.id).single()
}
```

**Problem 2: Using getSession for authorization decisions**

```typescript
// RISKY - getSession reads from storage (could be stale)
const { data: { session } } = await supabase.auth.getSession()
if (session?.user.role === 'admin') {
  deleteAllData()  // Dangerous!
}

// SAFER - getUser validates with server
const { data: { user } } = await supabase.auth.getUser()
if (user?.role === 'admin') {
  deleteAllData()
}
```

**Problem 3: Logging tokens**

```typescript
// NEVER do this
console.log('Session:', JSON.stringify(session))  // Tokens in logs!

// Safe
console.log('User ID:', session?.user.id)
```

### Account Deletion

Align implements proper account deletion:

```typescript
// app/api/account/delete/route.ts (conceptual flow)
export async function DELETE(request: Request) {
  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return unauthorized()
  
  // 2. Delete user data (cascade handles related tables)
  await supabaseAdmin.from('profiles').delete().eq('id', user.id)
  
  // 3. Delete auth user (requires service role)
  await supabaseAdmin.auth.admin.deleteUser(user.id)
  
  return success()
}
```

Note: Deleting the auth user requires the service role key, which is only available server-side.

---

## 15.8 Session Persistence and Refresh

### How Supabase Stores Sessions

By default, Supabase stores sessions in `localStorage`:

```javascript
// Stored under key: sb-<project-ref>-auth-token
{
  "access_token": "eyJ...",
  "refresh_token": "abc...",
  "expires_at": 1712345678,
  "user": { "id": "...", "email": "..." }
}
```

### Auto-Refresh

The Supabase client automatically refreshes tokens:

```typescript
// This happens automatically
// 1. Client detects access_token expiring soon
// 2. Sends refresh_token to Supabase
// 3. Gets new access_token
// 4. Updates storage
// 5. onAuthStateChange fires TOKEN_REFRESHED
```

### MISTAKES: Token Expiration Handling

**Problem: Assuming session is always valid**

```typescript
// WRONG - session might be expired
const session = getStoredSession()
await fetch('/api/data', {
  headers: { Authorization: `Bearer ${session.access_token}` }
})  // 401 Unauthorized!

// RIGHT - let Supabase client handle refresh
const { data: { session } } = await supabase.auth.getSession()
// Client automatically refreshes if needed
```

---

## 15.9 Sign Out

### Client-Side Sign Out

```typescript
// components/home/views/ProfileView.tsx:155
await supabase.auth.signOut();
```

This:
1. Clears tokens from storage
2. Invalidates refresh token on server
3. Triggers `onAuthStateChange` with `SIGNED_OUT` event

### Complete Sign Out (All Devices)

```typescript
// Sign out everywhere
await supabase.auth.signOut({ scope: 'global' })
```

This invalidates all sessions, not just the current one.

### Sign Out Flow in Align

```typescript
// components/home/views/ProfileView.tsx:188-211 (simplified)
async function handleSignOut() {
  const confirmed = await showConfirm("Sign out?")
  if (!confirmed) return
  
  // Sign out of Supabase
  await supabase.auth.signOut().catch(() => undefined)
  
  // Clear local identity state
  localStorage.clear()
  
  // Clear cookies
  document.cookie.split(";").forEach(cookie => {
    const name = cookie.split("=")[0].trim()
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  })
  
  // Navigate to onboarding
  router.push('/onboarding')
}
```

---

## 15.10 Mental Model: Auth Flow Visualization

Here's the complete authentication flow in Align:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ONBOARDING                                     │
│                                                                          │
│   ┌──────────────┐              ┌──────────────┐                        │
│   │ "Start       │              │ "Continue    │                        │
│   │  without     │              │  with        │                        │
│   │  account"    │              │  Google"     │                        │
│   └──────┬───────┘              └──────┬───────┘                        │
│          │                             │                                 │
│          ▼                             ▼                                 │
│   setModeLocal()               signInWithOAuth()                        │
│   - Generate UUID              - Redirect to Google                     │
│   - Store in localStorage      - OAuth dance                            │
│   - Set cookie                 - Return with code                       │
│          │                             │                                 │
│          │                             ▼                                 │
│          │                      /auth/callback                          │
│          │                      - Forward code to onboarding            │
│          │                             │                                 │
│          │                             ▼                                 │
│          │                      Exchange code for session               │
│          │                      setModeCloud(userId)                    │
│          │                             │                                 │
│          └──────────┬──────────────────┘                                │
│                     │                                                    │
│                     ▼                                                    │
│            Complete onboarding                                           │
│            Create profile + cycle                                        │
│            Redirect to /home                                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              HOME                                        │
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                         AuthGuard                                 │  │
│   │                                                                   │  │
│   │   if (localMode && hasLocalUserId) → allow                       │  │
│   │   if (cloudMode && hasSession) → allow                           │  │
│   │   else → redirect to /onboarding                                 │  │
│   │                                                                   │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│   Every data operation uses getActiveUserId():                          │
│   - Local mode → localStorage UUID                                      │
│   - Cloud mode → Supabase session user.id                               │
│                                                                          │
│   Sync (cloud mode only):                                                │
│   - Reads use anon key + RLS filters by auth.uid()                      │
│   - Writes use anon key + RLS validates auth.uid()                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 15.11 Practical Exercises

### Exercise 1: Trace the Auth Flow

Open these files and trace what happens when a user clicks "Continue with Google":

1. `components/onboarding/OnboardingFlow.tsx` - Find `startAuth`
2. `app/(app)/auth/callback/route.ts` - What does it do with the code?
3. Back to `OnboardingFlow.tsx` - Find the `useEffect` that handles `afterAuth`

Questions:
- Why does the callback route not exchange the code itself?
- What happens if the OAuth fails?

### Exercise 2: Test RLS

1. Create two test users in Supabase
2. Sign in as User A, create a move
3. Sign in as User B, try to query User A's move
4. Verify RLS returns empty results (not an error)

### Exercise 3: Implement Session Timeout

Currently, sessions last indefinitely. How would you implement:
1. Auto-logout after 30 minutes of inactivity?
2. A warning toast 5 minutes before timeout?

Consider: Where do you track activity? How do you detect "inactivity"?

### Exercise 4: Debug Auth Issues

A user reports "I can't sign in - it just loops back to the login page."

Write down your debugging steps:
1. What would you check in browser DevTools?
2. What Supabase logs would you look at?
3. What client-side state would you inspect?

---

## 15.12 Go Figure It Out

1. **OAuth scopes** - When you sign in with Google, you can request different permissions (email, profile, calendar, etc.). How do you specify scopes in Supabase OAuth?

2. **PKCE flow** - Supabase uses PKCE (Proof Key for Code Exchange) for OAuth. Research what security problem PKCE solves and how it works.

3. **Session fixation attacks** - What is session fixation and how do modern auth systems prevent it?

4. **HttpOnly cookies** - Why are refresh tokens typically stored in HttpOnly cookies? What attacks does this prevent?

5. **Magic links vs OAuth** - What are the tradeoffs between magic link authentication and OAuth? When would you choose one over the other?

---

## Summary

This chapter covered:

- **Authentication** verifies identity; **authorization** controls access
- **JWTs** encode user claims with cryptographic signatures
- **Supabase Auth** handles OAuth, sessions, and token refresh automatically
- **onAuthStateChange** lets you react to authentication events
- **Server-side auth** requires different patterns (cookies, server clients)
- **Align's identity system** supports both cloud (Supabase) and local (UUID) modes
- **RLS** is the final security layer, filtering data regardless of client bugs
- **Security best practices**: never expose secrets, validate on server, use getUser for authorization

---

## Connections

- **Chapter 14** (Supabase) - RLS policies use `auth.uid()` from authentication
- **Chapter 13** (Dexie) - Local mode stores user ID for Dexie queries
- **Chapter 12** (API Routes) - Server-side auth patterns for route handlers
- **Chapter 11** (Next.js) - Server vs Client component auth differences

---

## What's Next

Chapter 16 explores animation with Framer Motion - how Align creates fluid, responsive interactions that make the app feel alive.
