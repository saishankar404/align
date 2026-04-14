# Chapter 14: Supabase and PostgreSQL

In Chapter 13, you learned how Dexie stores data locally in IndexedDB. But local storage alone has limits: users lose data when they switch devices, can't access their data from the web, and have no backup if they clear browser storage.

Align solves this with **Supabase** - an open-source Firebase alternative built on PostgreSQL. This chapter teaches you relational databases, SQL, and how Supabase provides the cloud backend for Align.

---

## 14.1 What is a Relational Database?

### THE VOCABULARY

**Relational database**: A system that stores data in tables with defined relationships between them. Each table has rows (records) and columns (fields). Tables connect through foreign keys.

**SQL (Structured Query Language)**: The standard language for querying and manipulating relational databases. Pronounced "sequel" or "S-Q-L".

**PostgreSQL**: A powerful, open-source relational database known for reliability, feature richness, and standards compliance. Often called "Postgres".

**Supabase**: A platform that wraps PostgreSQL with authentication, real-time subscriptions, storage, and auto-generated REST/GraphQL APIs.

### WHY Relational?

Compare to other approaches:

| Approach | Structure | Best For |
|----------|-----------|----------|
| Document (MongoDB) | Nested JSON blobs | Flexible schemas, rapid prototyping |
| Key-Value (Redis) | Simple key→value pairs | Caching, sessions |
| Relational (Postgres) | Normalized tables with relationships | Complex queries, data integrity |

Align uses relational because:
1. **Data integrity** - constraints prevent invalid states (can't have a move without a cycle)
2. **Complex queries** - easily answer "show me all completed moves grouped by direction"
3. **Transactions** - multiple writes either all succeed or all rollback
4. **Mature tooling** - decades of optimization, debugging tools, migration patterns

### WHY NOT Y: Why Not Stay Document-Based?

You might think: "Dexie stores objects. Why not use MongoDB for the cloud too?"

Problems with document databases for Align:
1. **Denormalized data** - storing cycles nested inside users means updating a direction requires updating everywhere it's referenced
2. **No foreign key constraints** - nothing prevents orphaned records (a move pointing to a deleted cycle)
3. **Query complexity** - "count all moves marked done across all users" becomes expensive with nested documents

### WHAT IT LOOKS LIKE

Tables in PostgreSQL visualized:

```
profiles                         cycles
┌─────────┬────────┬─────────┐   ┌─────────┬─────────┬────────────┐
│ id      │ name   │ timezone│   │ id      │ user_id │ start_date │
├─────────┼────────┼─────────┤   ├─────────┼─────────┼────────────┤
│ abc-123 │ Jordan │ PST     │   │ cyc-001 │ abc-123 │ 2026-04-01 │
│ def-456 │ Taylor │ EST     │   │ cyc-002 │ def-456 │ 2026-04-05 │
└─────────┴────────┴─────────┘   └─────────┴─────────┴────────────┘
                                       │
                                       │ user_id references profiles.id
                                       ▼
```

The `user_id` column in `cycles` is a **foreign key** - it must contain a value that exists in `profiles.id`. This relationship is enforced by the database itself.

---

## 14.2 SQL Fundamentals

Before diving into Supabase, you need SQL basics. PostgreSQL uses standard SQL with some extensions.

### CREATE TABLE

```sql
-- Create a table with columns and constraints
create table public.profiles (
  id          uuid primary key,
  name        text not null,
  created_at  timestamptz not null default now()
);
```

Breaking this down:

| Syntax | Meaning |
|--------|---------|
| `create table public.profiles` | Create a table named "profiles" in the "public" schema |
| `uuid` | Data type for UUIDs |
| `primary key` | This column uniquely identifies each row |
| `text` | Variable-length string |
| `not null` | Cannot be empty (NULL) |
| `timestamptz` | Timestamp with timezone |
| `default now()` | If not provided, use current time |

### CHECK Constraints

Constraints enforce rules at the database level:

```sql
-- From Align's schema: supabase/migrations/20260320091329_init.sql:4
name text not null check (length(trim(name)) >= 1 and length(name) <= 50)
```

This constraint ensures:
- Name is not null
- Trimmed name is at least 1 character (no empty strings or just spaces)
- Name is at most 50 characters

### WHAT IT COMPILES TO

When you violate a constraint, PostgreSQL returns an error:

```sql
insert into profiles (id, name) values ('abc', '');
-- ERROR: new row for relation "profiles" violates check constraint "profiles_name_check"
```

This error propagates to your JavaScript code where you can handle it.

### Foreign Keys

Foreign keys create relationships between tables:

```sql
-- From Align's schema: supabase/migrations/20260320091329_init.sql:18-19
create table public.cycles (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.profiles(id) on delete cascade,
  -- ...
);
```

Breaking this down:

| Syntax | Meaning |
|--------|---------|
| `references public.profiles(id)` | This column must contain a value from profiles.id |
| `on delete cascade` | If the referenced profile is deleted, delete this cycle too |

Other delete options:
- `on delete restrict` - Prevent deleting profile if cycles exist
- `on delete set null` - Set user_id to NULL if profile deleted

### INSERT, SELECT, UPDATE, DELETE

The four basic operations (CRUD):

```sql
-- Create
insert into profiles (id, name, timezone)
values ('uuid-here', 'Jordan', 'America/Los_Angeles');

-- Read
select * from profiles where id = 'uuid-here';
select name, timezone from profiles;  -- specific columns
select * from profiles where name like 'J%';  -- pattern matching

-- Update
update profiles 
set timezone = 'America/New_York' 
where id = 'uuid-here';

-- Delete
delete from profiles where id = 'uuid-here';
```

### JOINs

Combine data from multiple tables:

```sql
-- Get all moves with their direction titles
select 
  moves.title as move_title,
  directions.title as direction_title,
  moves.date
from moves
join directions on moves.direction_id = directions.id
where moves.user_id = 'uuid-here';
```

Types of joins:
- `join` (inner join) - Only rows with matches in both tables
- `left join` - All rows from left table, even without matches
- `right join` - All rows from right table
- `full join` - All rows from both tables

### Aggregate Functions

Compute summaries:

```sql
-- Count moves by status
select status, count(*) 
from moves 
where user_id = 'uuid-here' 
group by status;

-- Result:
-- status  | count
-- pending | 5
-- done    | 12
```

Common aggregates: `count()`, `sum()`, `avg()`, `min()`, `max()`

---

## 14.3 Align's Database Schema

Let's examine Align's complete schema from `supabase/migrations/20260320091329_init.sql`.

### The Seven Tables

```
┌─────────────┐
│  profiles   │ ─────────────────────────────────────────────┐
└──────┬──────┘                                              │
       │ id                                                  │
       │                                                     │
       ├─────────────┬─────────────┬──────────────┐          │
       ▼             ▼             ▼              ▼          │
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   cycles    │ │ later_items │ │ (via cycle) │ │ (via cycle) │
└──────┬──────┘ └─────────────┘ │             │ │             │
       │ id                      │             │ │             │
       │                         │             │ │             │
       ├──────────────┬──────────┼─────────────┤              │
       ▼              ▼          ▼             ▼              │
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ directions  │ │   moves     │ │  checkins   │ │ reflections │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

### profiles Table

```sql
-- supabase/migrations/20260320091329_init.sql:2-13
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  name                text not null check (length(trim(name)) >= 1 and length(name) <= 50),
  age                 int check (age is null or (age >= 13 and age <= 120)),
  timezone            text not null default 'UTC',
  push_subscription   jsonb,
  notif_morning_time  text not null default '08:00',
  notif_night_time    text not null default '21:30',
  notif_enabled       boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
```

Key observations:
1. **`references auth.users(id)`** - Links to Supabase's built-in auth table
2. **`jsonb`** - Binary JSON type for storing the push subscription object
3. **Age constraint** - `(age is null or ...)` allows optional age but validates if provided

### cycles Table

```sql
-- supabase/migrations/20260320091329_init.sql:16-26
create table public.cycles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  start_date    date not null,
  end_date      date not null,
  length_days   int not null default 14 check (length_days in (7, 14)),
  status        text not null default 'active' check (status in ('active', 'closed')),
  closed_at     timestamptz,
  created_at    timestamptz not null default now(),
  constraint valid_date_range check (end_date >= start_date)
);
```

Key observations:
1. **`gen_random_uuid()`** - PostgreSQL function to auto-generate UUID
2. **Enum-like constraint** - `check (status in ('active', 'closed'))` restricts to specific values
3. **Named constraint** - `constraint valid_date_range` makes error messages clearer

### moves Table with Trigger

```sql
-- supabase/migrations/20260320091329_init.sql:40-52
create table public.moves (
  id            uuid primary key default gen_random_uuid(),
  cycle_id      uuid not null references public.cycles(id) on delete cascade,
  direction_id  uuid references public.directions(id) on delete set null,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  title         text not null check (length(trim(title)) >= 1 and length(title) <= 80),
  date          date not null,
  status        text not null default 'pending' check (status in ('pending', 'done')),
  done_at       timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
```

### Triggers: Database-Level Business Logic

Align enforces the "max 3 moves per day" rule at the database level:

```sql
-- supabase/migrations/20260320091329_init.sql:55-68
create or replace function check_max_moves_per_day()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.moves
      where user_id = new.user_id and date = new.date and id != new.id) >= 3 then
    raise exception 'max_moves_exceeded'
      using hint = 'Maximum 3 moves per day';
  end if;
  return new;
end; $$;

create trigger enforce_max_moves_per_day
  before insert on public.moves
  for each row execute function check_max_moves_per_day();
```

### THE VOCABULARY

**Trigger**: A function that automatically runs before or after INSERT, UPDATE, or DELETE operations.

**`new`**: In a trigger, refers to the row being inserted/updated.

**`old`**: In a trigger, refers to the row before update (or being deleted).

**`plpgsql`**: PostgreSQL's procedural language for writing functions.

### WHY Database-Level Enforcement?

You might ask: "Why not just check in JavaScript before inserting?"

```typescript
// App-level check (fragile)
if (todayMoves.length >= 3) {
  showError("Max 3 moves per day")
  return
}
await db.moves.add(newMove)
```

Problems:
1. **Race conditions** - Two tabs could check simultaneously, both see 2 moves, both insert
2. **Bypass risk** - Direct database access (admin panel, API) could skip the check
3. **Inconsistent enforcement** - Different clients might implement differently

Database triggers guarantee the rule is enforced regardless of how data is inserted.

### MISTAKES: Trigger Gotchas

**Problem 1: Forgetting to exclude current row**

```sql
-- WRONG - would always fail on update
if (select count(*) from moves where user_id = new.user_id and date = new.date) >= 3 then
```

The `id != new.id` in Align's trigger prevents counting the row being inserted/updated.

**Problem 2: Not handling updates**

The trigger fires on INSERT only. If you could update a move's date to a day that already has 3 moves, you'd bypass the limit. Align handles this by having moves tied to specific dates that don't change.

---

## 14.4 Indexes for Performance

Indexes speed up queries by creating sorted lookup structures.

```sql
-- supabase/migrations/20260320091329_init.sql:103-111
create index idx_cycles_user_status     on public.cycles      (user_id, status);
create index idx_directions_cycle       on public.directions   (cycle_id);
create index idx_moves_user_date        on public.moves        (user_id, date);
create index idx_moves_cycle            on public.moves        (cycle_id);
create index idx_moves_user_date_status on public.moves        (user_id, date, status);
create index idx_checkins_user_date     on public.checkins     (user_id, date);
create index idx_checkins_cycle         on public.checkins     (cycle_id);
create index idx_later_user             on public.later_items  (user_id, dropped, promoted);
```

### HOW Indexes Work

Without an index:
```sql
select * from moves where user_id = 'abc' and date = '2026-04-05';
-- Database scans ALL rows, checking each one (O(n))
```

With an index on `(user_id, date)`:
```sql
-- Database looks up in B-tree structure (O(log n))
-- Like looking up a word in a dictionary vs. reading every page
```

### Composite Indexes

Notice `idx_moves_user_date_status` indexes three columns. Order matters:

```sql
-- This query uses the index efficiently
select * from moves where user_id = 'abc' and date = '2026-04-05' and status = 'done';

-- This also uses it (leftmost columns)
select * from moves where user_id = 'abc' and date = '2026-04-05';

-- This also uses it
select * from moves where user_id = 'abc';

-- This CANNOT use the index efficiently (skips user_id)
select * from moves where date = '2026-04-05' and status = 'done';
```

### WHY NOT Y: Why Not Index Everything?

Indexes have costs:
1. **Storage space** - Each index stores a copy of the indexed data
2. **Write overhead** - Every INSERT/UPDATE must also update indexes
3. **Diminishing returns** - Indexes on low-cardinality columns (like boolean) rarely help

Rule of thumb: Index columns used in WHERE clauses and JOIN conditions for queries that run frequently.

---

## 14.5 Row Level Security (RLS)

RLS is PostgreSQL's built-in authorization system. It makes the database filter rows based on who's querying.

### Enabling RLS

```sql
-- supabase/migrations/20260320091329_init.sql:120-127
alter table public.profiles    enable row level security;
alter table public.cycles       enable row level security;
alter table public.directions   enable row level security;
alter table public.moves        enable row level security;
alter table public.checkins     enable row level security;
alter table public.later_items  enable row level security;
alter table public.reflections  enable row level security;
```

When RLS is enabled, queries return **zero rows** by default - you must create policies to allow access.

### Creating Policies

```sql
-- supabase/migrations/20260320091329_init.sql:129-135
create policy "profiles own" on public.profiles 
  for all 
  using (auth.uid() = id) 
  with check (auth.uid() = id);

create policy "cycles own" on public.cycles 
  for all 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);
```

Breaking this down:

| Clause | Purpose |
|--------|---------|
| `for all` | Applies to SELECT, INSERT, UPDATE, DELETE |
| `using (...)` | Filter for SELECT, UPDATE, DELETE (which rows can be seen) |
| `with check (...)` | Filter for INSERT, UPDATE (what values can be written) |
| `auth.uid()` | Supabase function returning the current user's ID |

### HOW RLS Works

```typescript
// In your app
const { data } = await supabase.from('moves').select('*')
```

Without RLS:
```sql
select * from moves;  -- Returns ALL moves from ALL users
```

With RLS and the policy above:
```sql
select * from moves where user_id = auth.uid();  -- Automatically added!
```

### THE VOCABULARY

**Policy**: A rule defining which rows a user can access or modify.

**`auth.uid()`**: Supabase function that returns the authenticated user's UUID from the JWT token.

**Permissive vs Restrictive**: Permissive policies (default) are OR'd together - if any policy allows access, it's granted. Restrictive policies are AND'd - all must pass.

### MISTAKES: RLS Gotchas

**Problem 1: Forgetting to enable RLS**

```sql
create table public.secrets (
  id uuid primary key,
  user_id uuid,
  secret text
);
-- DANGER: Anyone can read all secrets!
```

Always enable RLS on tables containing user data.

**Problem 2: Service role bypasses RLS**

```typescript
// Client with anon key - RLS applies
const supabase = createClient(url, anonKey)

// Server with service role - RLS BYPASSED
const supabaseAdmin = createClient(url, serviceRoleKey)
```

The service role key should **never** be exposed to the client. Align uses it only in Edge Functions for sending notifications.

**Problem 3: Testing with wrong user**

```typescript
// You sign in as user A
await supabase.auth.signInWithOtp({ email: 'a@example.com' })

// Then try to access user B's data
const { data } = await supabase.from('profiles').select('*').eq('id', userBId)
// data is [] - empty! RLS filtered it out
```

This isn't an error - it's RLS working correctly. The query succeeds but returns no rows.

---

## 14.6 Supabase Client Setup

Align uses `@supabase/auth-helpers-nextjs` for seamless integration with Next.js.

### Client Component Client

```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/db/types";

export const supabase = createClientComponentClient<Database>();
```

### Server Component Client

```typescript
// lib/supabase/server.ts
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/lib/db/types";

export function createServerClient() {
  return createServerComponentClient<Database>({ cookies });
}
```

### WHY Two Clients?

| Context | Client Function | Reason |
|---------|----------------|--------|
| Client Components | `createClientComponentClient` | Uses browser cookies, persists across renders |
| Server Components | `createServerComponentClient` | Needs cookie access passed explicitly |
| Route Handlers | `createRouteHandlerClient` | Different cookie handling for API routes |

### Type Safety with Generated Types

Supabase can generate TypeScript types from your schema:

```bash
supabase gen types typescript --local > lib/db/types.ts
```

This creates types like:

```typescript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          timezone: string
          // ...
        }
        Insert: {
          id: string
          name: string
          timezone?: string  // optional because has default
          // ...
        }
        Update: {
          id?: string
          name?: string
          timezone?: string
          // ...
        }
      }
      // ... other tables
    }
  }
}
```

Now queries are type-safe:

```typescript
const { data } = await supabase
  .from('profiles')
  .select('*')
  .single()

// data is typed as Database['public']['Tables']['profiles']['Row'] | null
data?.name  // TypeScript knows this is string
data?.foo   // Error: Property 'foo' does not exist
```

---

## 14.7 Querying with Supabase

Supabase provides a JavaScript query builder that translates to SQL.

### Basic CRUD

```typescript
// CREATE
const { data, error } = await supabase
  .from('moves')
  .insert({
    id: newId(),
    cycle_id: cycleId,
    user_id: userId,
    title: 'Write documentation',
    date: '2026-04-05',
    status: 'pending'
  })
  .select()  // Return the inserted row
  .single()  // Expect exactly one result

// READ
const { data: moves } = await supabase
  .from('moves')
  .select('*')
  .eq('user_id', userId)
  .eq('date', '2026-04-05')

// UPDATE
const { error } = await supabase
  .from('moves')
  .update({ status: 'done', done_at: new Date().toISOString() })
  .eq('id', moveId)

// DELETE
const { error } = await supabase
  .from('moves')
  .delete()
  .eq('id', moveId)
```

### Query Operators

```typescript
// Equality
.eq('status', 'pending')

// Not equal
.neq('status', 'done')

// Greater than / less than
.gt('created_at', '2026-04-01')
.lt('date', '2026-04-30')
.gte('age', 18)  // greater than or equal
.lte('age', 65)  // less than or equal

// IN array
.in('status', ['pending', 'done'])

// Pattern matching
.like('title', '%documentation%')
.ilike('title', '%Documentation%')  // case-insensitive

// NULL checks
.is('done_at', null)
.not('done_at', 'is', null)

// Ordering
.order('created_at', { ascending: false })

// Pagination
.range(0, 9)  // First 10 rows (0-indexed)
```

### Selecting Related Data

```typescript
// Get moves with their direction info
const { data } = await supabase
  .from('moves')
  .select(`
    id,
    title,
    date,
    status,
    directions (
      id,
      title,
      color
    )
  `)
  .eq('user_id', userId)

// Result shape:
// [
//   {
//     id: 'move-1',
//     title: 'Write docs',
//     date: '2026-04-05',
//     status: 'pending',
//     directions: { id: 'dir-1', title: 'Career', color: 'terra' }
//   }
// ]
```

### WHAT IT COMPILES TO

The Supabase client builds a URL that hits the PostgREST API:

```typescript
supabase.from('moves').select('*').eq('user_id', 'abc').eq('date', '2026-04-05')
```

Becomes:
```
GET /rest/v1/moves?select=*&user_id=eq.abc&date=eq.2026-04-05
```

Which PostgREST converts to:
```sql
SELECT * FROM moves WHERE user_id = 'abc' AND date = '2026-04-05'
```

Plus RLS policy filtering:
```sql
SELECT * FROM moves WHERE user_id = 'abc' AND date = '2026-04-05' AND user_id = auth.uid()
```

---

## 14.8 Handling Errors

Supabase queries don't throw - they return `{ data, error }`.

### Error Patterns

```typescript
const { data, error } = await supabase
  .from('moves')
  .insert({ /* ... */ })
  .select()
  .single()

if (error) {
  // Handle specific errors
  if (error.code === '23505') {
    // Unique constraint violation
    showToast('This move already exists')
  } else if (error.code === '23503') {
    // Foreign key violation
    showToast('Referenced record not found')
  } else if (error.message.includes('max_moves_exceeded')) {
    // Our custom trigger error
    showToast("You've already added 3 moves today")
  } else {
    // Generic error
    console.error('Database error:', error)
    showToast('Something went wrong')
  }
  return
}

// data is guaranteed non-null here
console.log(data.id)
```

### Common Error Codes

| Code | Name | Meaning |
|------|------|---------|
| 23505 | unique_violation | Duplicate value in unique column |
| 23503 | foreign_key_violation | Referenced row doesn't exist |
| 23514 | check_violation | CHECK constraint failed |
| 42501 | insufficient_privilege | RLS denied access |
| PGRST116 | - | No rows returned for .single() |

### MISTAKES: The Single Trap

```typescript
// WRONG - crashes if no profile exists
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()  // Error if 0 rows!

// RIGHT - handle missing data
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .maybeSingle()  // Returns null if 0 rows, error only if > 1

if (!data) {
  // Profile doesn't exist yet - create it
}
```

---

## 14.9 Transactions and Atomic Operations

Sometimes you need multiple operations to succeed or fail together.

### The Problem

```typescript
// Creating a new cycle requires creating directions too
// What if cycle succeeds but directions fail?

await supabase.from('cycles').insert({ /* ... */ })  // Success
await supabase.from('directions').insert({ /* ... */ })  // Fails!

// Now we have an orphan cycle with no directions
```

### Solution 1: Database Functions (RPC)

Create a PostgreSQL function that does everything in a transaction:

```sql
create or replace function create_cycle_with_directions(
  p_user_id uuid,
  p_start_date date,
  p_length_days int,
  p_directions jsonb
) returns uuid language plpgsql as $$
declare
  v_cycle_id uuid;
  v_end_date date;
begin
  v_end_date := p_start_date + (p_length_days - 1);
  
  -- Insert cycle
  insert into cycles (user_id, start_date, end_date, length_days)
  values (p_user_id, p_start_date, v_end_date, p_length_days)
  returning id into v_cycle_id;
  
  -- Insert directions
  insert into directions (cycle_id, user_id, title, color, position)
  select 
    v_cycle_id,
    p_user_id,
    d->>'title',
    d->>'color',
    (d->>'position')::int
  from jsonb_array_elements(p_directions) as d;
  
  return v_cycle_id;
end; $$;
```

Call it from JavaScript:

```typescript
const { data: cycleId, error } = await supabase.rpc('create_cycle_with_directions', {
  p_user_id: userId,
  p_start_date: '2026-04-05',
  p_length_days: 14,
  p_directions: [
    { title: 'Health', color: 'terra', position: 1 },
    { title: 'Career', color: 'forest', position: 2 }
  ]
})
```

If any part fails, the entire transaction rolls back.

### Solution 2: Align's Approach (Offline-First)

Align takes a different approach because of offline-first requirements. Instead of transactions, it:

1. Creates records locally in Dexie (always succeeds)
2. Syncs to Supabase in background
3. Handles conflicts during sync

This is explored in Chapter 13's sync engine discussion. The trade-off: eventual consistency instead of immediate consistency, but works offline.

---

## 14.10 Migrations

Migrations are versioned SQL files that evolve your schema over time.

### Creating a Migration

```bash
supabase migration new add_reflection_rating
```

Creates: `supabase/migrations/20260405120000_add_reflection_rating.sql`

```sql
-- Add a rating column to reflections
alter table public.reflections 
add column rating int check (rating is null or (rating >= 1 and rating <= 5));
```

### Applying Migrations

```bash
# Apply to local database
supabase db push

# Verify (should show no diff if applied correctly)
supabase db diff
```

### WHY Migrations Matter

Without migrations:
1. **No history** - Can't see how schema evolved
2. **Team conflicts** - Multiple developers change schema differently
3. **Deployment risk** - Manual schema changes are error-prone

With migrations:
1. **Version control** - Schema changes tracked in git
2. **Reproducible** - Anyone can recreate the exact database state
3. **Rollback capability** - Can undo changes if needed

### Regenerate Types After Migration

```bash
supabase gen types typescript --local > lib/db/types.ts
```

This keeps your TypeScript types in sync with the actual schema.

---

## 14.11 Mental Model: The Data Flow

Here's how data flows in Align:

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTION                              │
│                    (tap "mark done" on move)                     │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      COMPONENT HANDLER                           │
│   async function markDone(moveId: string) {                      │
│     await db.moves.update(moveId, { status: 'done', ... })      │
│     context.refresh()                                            │
│     syncAllIfCloud(userId)  // fire and forget                  │
│   }                                                              │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
              ┌───────────────────┴───────────────────┐
              │                                       │
              ▼                                       ▼
┌─────────────────────────────┐         ┌─────────────────────────────┐
│       DEXIE (IndexedDB)      │         │    SYNC TO SUPABASE         │
│  - Immediate write           │         │  - Reads unsynced records   │
│  - UI updates instantly      │         │  - Maps camelCase→snake_case│
│  - Works offline             │         │  - Upserts to Postgres      │
└─────────────────────────────┘         │  - Marks _synced = 1        │
                                        └─────────────────────────────┘
                                                      │
                                                      ▼
                                        ┌─────────────────────────────┐
                                        │       POSTGRESQL            │
                                        │  - Validates constraints    │
                                        │  - Enforces RLS             │
                                        │  - Triggers run             │
                                        │  - Indexes updated          │
                                        └─────────────────────────────┘
```

### Key Insight

The user always sees immediate feedback because Dexie is synchronous. Supabase sync happens in the background. If sync fails (offline, server error), the change is retried later - but the user's experience is unaffected.

---

## 14.12 Practical Exercises

### Exercise 1: Understand the Schema

Open `supabase/migrations/20260320091329_init.sql` and answer:

1. What happens if you try to insert a move with `date = '2026-04-05'` when 3 moves already exist for that date?
2. What happens if you delete a cycle? What happens to its moves?
3. Why does `direction_id` use `on delete set null` instead of `on delete cascade`?

### Exercise 2: Write Queries

Using the Supabase client, write queries for:

1. Get all pending moves for today, ordered by creation time
2. Count how many moves are marked "done" in the current cycle
3. Get directions with a count of their associated moves

### Exercise 3: Add a Constraint

Imagine adding a feature where reflections must have a minimum of 10 characters. Write:

1. The migration SQL to add this constraint
2. How you'd handle the error in JavaScript when a user submits fewer characters

### Exercise 4: Trace the Flow

Starting from `AddMoveSheet.tsx`, trace what happens when a user adds a move:

1. What gets written to Dexie?
2. What triggers the sync?
3. How does the data reach PostgreSQL?
4. What constraints are checked?

---

## 14.13 Go Figure It Out

1. **EXPLAIN ANALYZE** - PostgreSQL can show you exactly how it executes a query. How would you use this to verify an index is being used?

2. **Partial indexes** - PostgreSQL supports indexes on a subset of rows. How would you create an index only on `status = 'active'` cycles?

3. **PostgREST** - Supabase uses PostgREST to generate APIs from your schema. What are its limitations compared to custom API endpoints?

4. **Connection pooling** - What is PgBouncer and why does Supabase use it? What problems does connection pooling solve?

5. **TOAST** - What happens when you store a large JSON object in a `jsonb` column? Research PostgreSQL's TOAST (The Oversized-Attribute Storage Technique).

---

## Summary

This chapter covered:

- **Relational databases** structure data in tables with relationships enforced by foreign keys
- **SQL** is the language for querying and manipulating relational data
- **Constraints and triggers** enforce business rules at the database level
- **Indexes** speed up queries by creating sorted lookup structures
- **Row Level Security** filters data based on the authenticated user
- **Supabase clients** vary by context (client component, server component, route handler)
- **Type generation** keeps TypeScript in sync with your schema
- **Migrations** version control your schema changes
- **The dual-write pattern** (Dexie + Supabase) gives immediate feedback with eventual cloud sync

---

## Connections

- **Chapter 13** (Dexie) - Local storage that syncs to Supabase
- **Chapter 15** (Authentication) - How `auth.uid()` gets populated for RLS
- **Chapter 12** (API Routes) - Server-side Supabase access patterns
- **Chapter 11** (Next.js) - Client vs Server component implications for Supabase clients

---

## What's Next

Chapter 15 explores authentication - how users prove their identity and how that identity flows through the system to enable Row Level Security.
