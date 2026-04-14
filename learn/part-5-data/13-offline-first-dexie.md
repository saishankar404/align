# Chapter 13: Offline-First with Dexie

Align works without an internet connection. You can add moves, check them off, and record your nightly check-in even when offline. When you reconnect, everything syncs automatically. This architecture is called "offline-first" - the local database is the source of truth, and the cloud syncs in the background. This chapter explains how Dexie (IndexedDB wrapper) and the sync engine work together.

---

## What You Will Learn

- What offline-first means and why it matters
- IndexedDB and Dexie basics
- The local database schema
- Querying with Dexie
- The sync strategy
- Conflict resolution
- The `_synced` flag pattern

---

## Prerequisites

- Chapter 4: Async JavaScript (promises, async/await)
- Chapter 11: Next.js Architecture (client vs server)
- Chapter 12: API Routes (Supabase clients)

---

## The Vocabulary

**IndexedDB** - Browser API for storing structured data locally. Large capacity, survives page reloads.

**Dexie** - A friendly wrapper around IndexedDB that provides a cleaner API.

**Offline-first** - Architecture where the local database is primary. Network is optional.

**Local database** - Data stored in the browser (IndexedDB).

**Remote database** - Data stored in the cloud (Supabase/PostgreSQL).

**Sync** - Process of reconciling local and remote data.

**_synced flag** - A field (0 or 1) indicating if a record has been pushed to the server.

**Tombstone** - A marker indicating a record was deleted locally (for later sync).

**Upsert** - Insert or update a record (INSERT ... ON CONFLICT UPDATE).

---

## Section 1: Why Offline-First?

### The User Experience

Consider the alternatives:

**Online-only:**
```
User taps "Done" → Network request → Wait... → Success (or failure)
```
- Slow feedback
- Fails without network
- Poor mobile experience

**Offline-first:**
```
User taps "Done" → Write to local DB → Instant success → Sync in background
```
- Instant feedback
- Works without network
- Background sync when connected

### When Offline-First Matters

- Mobile apps (spotty connectivity)
- PWAs (Progressive Web Apps)
- Critical actions that should not fail
- Apps where speed matters

Align is a daily habit app. If the user cannot log their moves because of network issues, they will abandon the app.

---

## Section 2: IndexedDB and Dexie

### What is IndexedDB?

IndexedDB is a browser API for storing large amounts of structured data:

```javascript
// Raw IndexedDB (verbose!)
const request = indexedDB.open("myDatabase", 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  const store = db.createObjectStore("users", { keyPath: "id" });
  store.createIndex("email", "email", { unique: true });
};

request.onsuccess = function(event) {
  const db = event.target.result;
  const tx = db.transaction("users", "readwrite");
  const store = tx.objectStore("users");
  store.add({ id: 1, email: "alice@example.com" });
};
```

This API is complex and callback-based.

### What is Dexie?

Dexie wraps IndexedDB with a promise-based API:

```typescript
import Dexie from "dexie";

const db = new Dexie("myDatabase");

db.version(1).stores({
  users: "id, email"
});

// Simple CRUD
await db.users.add({ id: 1, email: "alice@example.com" });
await db.users.get(1);
await db.users.update(1, { email: "alice@new.com" });
await db.users.delete(1);
```

Much cleaner!

---

## Section 3: The Local Database Schema

### In The Codebase: lib/db/local.ts

This file defines all local data structures and the Dexie database.

#### Interfaces

```typescript
export interface LocalProfile {
  id: string;
  name: string;
  age?: number;
  timezone: string;
  pushSubscription?: string;
  notifMorningTime: string;
  notifNightTime: string;
  notifEnabled: boolean;
}

export interface LocalCycle {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  lengthDays: 7 | 14;
  status: "active" | "closed";
  closedAt?: string;
  createdAt: string;
  _synced: 0 | 1;  // Key for sync!
}

export interface LocalMove {
  id: string;
  cycleId: string;
  directionId?: string;
  userId: string;
  title: string;
  date: string;
  status: "pending" | "done";
  doneAt?: string;
  createdAt: string;
  updatedAt: string;
  _synced: 0 | 1;
}

// ... similar interfaces for Direction, Checkin, LaterItem, Reflection
```

Notice `_synced: 0 | 1` on most interfaces. This flag tracks whether the record has been pushed to the server.

#### The Database Class

```typescript
class AlignDB extends Dexie {
  profiles!: Table<LocalProfile, string>;
  cycles!: Table<LocalCycle, string>;
  directions!: Table<LocalDirection, string>;
  moves!: Table<LocalMove, string>;
  checkins!: Table<LocalCheckin, string>;
  laterItems!: Table<LocalLaterItem, string>;
  reflections!: Table<LocalReflection, string>;
  pendingDeletes!: Table<LocalPendingDelete, string>;

  constructor() {
    super("align_db");
    this.version(1).stores({
      profiles: "id",
      cycles: "id, userId, status",
      directions: "id, cycleId, userId, [cycleId+position]",
      moves: "id, userId, date, cycleId, status, _synced, [userId+date]",
      checkins: "id, userId, date, cycleId, _synced, [userId+date]",
      laterItems: "id, userId, dropped, promoted, _synced",
      reflections: "id, cycleId, userId, _synced",
    });
    // ... version upgrades ...
  }
}

export const db = new AlignDB();
```

#### Schema String Syntax

```typescript
moves: "id, userId, date, cycleId, status, _synced, [userId+date]"
```

- `id` - Primary key (first item)
- `userId, date, cycleId, status, _synced` - Indexed fields
- `[userId+date]` - Compound index for efficient queries like `where([userId+date]).equals([userId, date])`

### Why These Indexes?

```typescript
// This query:
db.moves.where("[userId+date]").equals([userId, today]).toArray()

// Needs the compound index: [userId+date]
// Without it, Dexie would scan all moves
```

---

## Section 4: Querying with Dexie

### Basic Operations

```typescript
import { db } from "@/lib/db/local";

// Get by primary key
const move = await db.moves.get("move-123");

// Add (will error if id exists)
await db.moves.add({
  id: newId(),
  title: "Write code",
  // ...
});

// Put (insert or update)
await db.moves.put(moveData);

// Update specific fields
await db.moves.update("move-123", { status: "done", doneAt: now });

// Delete
await db.moves.delete("move-123");
```

### Where Clauses

```typescript
// Simple equality
const active = await db.cycles.where("status").equals("active").toArray();

// Compound index
const todayMoves = await db.moves
  .where("[userId+date]")
  .equals([userId, today])
  .toArray();

// Multiple conditions with filter
const unsynced = await db.moves
  .where("_synced")
  .equals(0)
  .and(row => row.userId === userId)
  .toArray();

// First match
const todayCheckin = await db.checkins
  .where("[userId+date]")
  .equals([userId, today])
  .first();

// Sorted
const directions = await db.directions
  .where("cycleId")
  .equals(cycleId)
  .sortBy("position");
```

### In The Codebase: lib/context/AppContext.tsx

```typescript
const [directions, todayMoves, allMovesThisCycle, todayCheckin, ...] = await Promise.all([
  db.directions.where("cycleId").equals(cycle.id).sortBy("position"),
  db.moves.where("[userId+date]").equals([userId, today]).toArray(),
  db.moves.where("cycleId").equals(cycle.id).toArray(),
  db.checkins.where("[userId+date]").equals([userId, today]).first(),
  db.checkins.where("cycleId").equals(cycle.id).toArray(),
  db.laterItems.where("userId").equals(userId).filter((item) => !item.dropped && !item.promoted).toArray(),
  // ...
]);
```

All app data is loaded from IndexedDB. The cloud is only for sync.

---

## Section 5: The Sync Strategy

### The Flow

```
User Action (e.g., add move)
         │
         ▼
Write to IndexedDB with _synced: 0
         │
         ▼
Update UI immediately
         │
         ▼
Request background sync (debounced)
         │
         ▼
If online: pushUnsynced() then pullFromSupabase()
```

### The _synced Flag

When you create or modify a record locally:

```typescript
await db.moves.put({
  id: newId(),
  title: title.trim(),
  status: "pending",
  _synced: 0,  // Not yet synced!
  // ...
});
```

The sync engine finds unsynced records:

```typescript
const unsynced = await db.moves
  .where("_synced")
  .equals(0)
  .and(row => row.userId === userId)
  .toArray();
```

After successful push:

```typescript
await db.moves.update(id, { _synced: 1 });
```

### In The Codebase: lib/db/sync.ts

#### Push Unsynced Records

```typescript
export async function pushUnsynced(userId: string): Promise<void> {
  await pushProfiles(userId);

  await pushUnsyncedTable(
    await db.cycles.where("_synced").equals(0).and((row) => row.userId === userId).toArray(),
    async (items) => {
      const { error } = await supabase.from("cycles").upsert(items.map(cycleToDb), { onConflict: "id" });
      if (error) {
        debug("push cycles failed", error.message);
        return false;
      }
      return true;
    },
    async (id) => db.cycles.update(id, { _synced: 1 })
  );

  // Similar for directions, moves, checkins, laterItems, reflections...
}
```

The `pushUnsyncedTable` helper:
1. Gets unsynced records
2. Tries to push them to Supabase
3. If successful, marks them as synced

#### Pull from Supabase

```typescript
export async function pullFromSupabase(userId: string): Promise<void> {
  // ... 
  try {
    const { data: moves } = await supabase.from("moves").select("*").eq("user_id", userId);
    for (const row of moves ?? []) {
      if (pendingMoveDeleteIds.has(row.id)) continue;  // Skip if we deleted it locally
      await mergeIfSynced(
        (id) => db.moves.get(id),
        (value) => db.moves.put(value),
        moveFromDb(row)
      );
    }
  } catch (error) {
    debug("pull moves exception", error);
  }
}
```

The `mergeIfSynced` helper avoids overwriting local changes:

```typescript
async function mergeIfSynced<T extends { id: string; _synced: 0 | 1 }>(
  localGet: (id: string) => Promise<T | undefined>,
  localPut: (value: T) => Promise<string>,
  incoming: T
): Promise<void> {
  const local = await localGet(incoming.id);
  if (!local || local._synced === 1) {
    // Only overwrite if no local record OR local is synced
    await localPut(incoming);
  }
  // If local exists and _synced === 0, keep local (user's changes win)
}
```

---

## Section 6: Field Mapping

### The Problem

Local and remote databases use different naming conventions:

| Local (camelCase) | Remote (snake_case) |
|-------------------|---------------------|
| userId | user_id |
| cycleId | cycle_id |
| createdAt | created_at |
| lengthDays | length_days |

### The Solution: Mapper Functions

```typescript
function moveToDb(m: LocalMove): DbMove {
  return {
    id: m.id,
    created_at: m.createdAt,
    cycle_id: m.cycleId,
    date: m.date,
    direction_id: m.directionId ?? null,
    done_at: m.doneAt ?? null,
    status: m.status,
    title: m.title,
    updated_at: m.updatedAt,
    user_id: m.userId,
  };
}

function moveFromDb(r: DbMove): LocalMove {
  return {
    id: r.id,
    createdAt: r.created_at,
    cycleId: r.cycle_id,
    date: r.date,
    directionId: r.direction_id ?? undefined,
    doneAt: r.done_at ?? undefined,
    status: r.status as "pending" | "done",
    title: r.title,
    updatedAt: r.updated_at,
    userId: r.user_id,
    _synced: 1,  // Coming from server = synced
  };
}
```

Every table has a `toDb` and `fromDb` function.

---

## Section 7: Handling Deletes

### The Problem

If you delete a record locally while offline, how does the server know?

```typescript
// This only removes from IndexedDB:
await db.moves.delete(moveId);

// The server still has the record!
```

### The Solution: Tombstones

When deleting, record the intent to delete:

```typescript
export interface LocalPendingDelete {
  key: string;
  table: "moves";
  recordId: string;
  userId: string;
  createdAt: string;
  attempts: number;
}
```

The delete function:

```typescript
export async function deleteMoveWithTombstone(userId: string, moveId: string): Promise<void> {
  const key = pendingDeleteKey("moves", moveId);
  const now = new Date().toISOString();

  await db.transaction("rw", db.moves, db.pendingDeletes, async () => {
    const move = await db.moves.get(moveId);
    if (!move || move.userId !== userId || move.status === "done") return;

    // Delete locally
    await db.moves.delete(moveId);
    
    // Record the intent to delete
    await db.pendingDeletes.put({
      key,
      table: "moves",
      recordId: moveId,
      userId,
      createdAt: now,
      attempts: 0,
    });
  });
}
```

During sync, process pending deletes:

```typescript
async function processPendingDeletes(userId: string): Promise<void> {
  const pending = await db.pendingDeletes.where("userId").equals(userId).toArray();
  
  for (const entry of pending) {
    const { error } = await supabase
      .from("moves")
      .delete()
      .eq("id", entry.recordId)
      .eq("user_id", userId);
    
    if (error) {
      // Retry later
      await db.pendingDeletes.update(entry.key, { attempts: entry.attempts + 1 });
    } else {
      // Success - remove tombstone
      await db.pendingDeletes.delete(entry.key);
    }
  }
}
```

During pull, skip records that we deleted locally:

```typescript
const pendingMoveDeleteIds = await getPendingMoveDeleteIds(userId);

for (const row of moves ?? []) {
  if (pendingMoveDeleteIds.has(row.id)) continue;  // Skip!
  await mergeIfSynced(/* ... */);
}
```

---

## Section 8: Sync Debouncing and Single-Flight

### The Problem

If the user types fast or clicks multiple times:

```typescript
// Click 1 → sync
// Click 2 → sync
// Click 3 → sync
// = 3 simultaneous syncs (wasteful)
```

### The Solution: Debouncing

```typescript
const REQUEST_DEBOUNCE_MS = 700;
const debounceTimerByUser = new Map<string, number>();

export function requestSyncIfCloud(userId: string): void {
  if (!isCloudMode()) return;
  if (!isOnline()) return;

  // Cancel existing timer
  const existingTimer = debounceTimerByUser.get(userId);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }

  // Set new timer
  const timer = window.setTimeout(() => {
    debounceTimerByUser.delete(userId);
    void runSingleFlightSync(userId);
  }, REQUEST_DEBOUNCE_MS);

  debounceTimerByUser.set(userId, timer);
}
```

Rapid calls reset the timer. Sync only runs after 700ms of quiet.

### Single-Flight Pattern

Only one sync runs at a time:

```typescript
const inFlightSyncByUser = new Map<string, Promise<void>>();
const pendingFollowupByUser = new Set<string>();

async function runSingleFlightSync(userId: string): Promise<void> {
  if (!isOnline()) return;

  // If already syncing, queue a follow-up
  const existing = inFlightSyncByUser.get(userId);
  if (existing) {
    pendingFollowupByUser.add(userId);
    await existing;
    return;
  }

  // Run the sync
  const runPromise = performSync(userId)
    .catch((error) => debug("sync failed", error))
    .finally(() => {
      inFlightSyncByUser.delete(userId);
    });

  inFlightSyncByUser.set(userId, runPromise);
  await runPromise;

  // If follow-up was queued, run it
  if (pendingFollowupByUser.has(userId) && isOnline()) {
    pendingFollowupByUser.delete(userId);
    await runSingleFlightSync(userId);
  }
}
```

---

## Section 9: Auto-Sync on Reconnect

### In The Codebase: lib/db/sync.ts

```typescript
export function startAutoSync(userId: string): () => void {
  const handler = () => {
    window.setTimeout(() => {
      void runSingleFlightSync(userId);
    }, 500);
  };

  window.addEventListener("online", handler);

  // Initial sync if online
  if (navigator.onLine) {
    void runSingleFlightSync(userId);
  }

  // Return cleanup function
  return () => {
    window.removeEventListener("online", handler);
  };
}
```

This is called from HomeProviders:

```typescript
useEffect(() => {
  if (userId) return startAutoSync(userId);
}, [userId]);
```

When the browser comes online, sync automatically runs.

---

## Section 10: The Write Pattern

### Throughout the Codebase

Every data write follows this pattern:

```typescript
// 1. Write to local DB with _synced: 0
await db.moves.put({
  id: newId(),
  // ... data
  _synced: 0,
});

// 2. Refresh the UI (reads from local DB)
await context.refresh();

// 3. Request background sync
requestSyncIfCloud(context.userId);
```

For example, in AddMoveSheet:

```typescript
await db.moves.put({
  id: newId(),
  cycleId: context.currentCycle.id,
  directionId: selectedDirection.id,
  userId: context.userId,
  title: title.trim(),
  date: todayStr(),
  status: "pending",
  createdAt: now,
  updatedAt: now,
  _synced: 0,  // Not yet synced
});

await context.refresh();  // Update UI from local DB
context.closeSheet();
requestSyncIfCloud(context.userId);  // Sync in background
```

The user sees instant feedback. Sync happens invisibly.

---

## Why Not Other Approaches?

### Why Not Online-Only?

- Slow (wait for network)
- Fails without connectivity
- Bad mobile experience

### Why Not Local-Only?

- No backup
- No cross-device sync
- Data loss if browser data cleared

### Why Not Real-Time Sync?

- Complex conflict resolution
- Battery drain on mobile
- Overkill for a daily app

Offline-first with background sync is the sweet spot for Align.

### Why Dexie Instead of Raw IndexedDB?

- Promise-based (async/await)
- Cleaner query syntax
- Built-in versioning
- TypeScript support
- Smaller learning curve

---

## Mistakes: What Breaks

### Mistake 1: Forgetting _synced Flag

```typescript
// BAD - no _synced flag
await db.moves.put({
  id: newId(),
  title: "Work out",
  // ...
});
// Never syncs!

// GOOD
await db.moves.put({
  id: newId(),
  title: "Work out",
  _synced: 0,  // Will be picked up by sync
});
```

### Mistake 2: Not Handling Offline

```typescript
// BAD - assumes online
const { data } = await supabase.from("moves").select("*");
setMoves(data);  // Empty or error when offline!

// GOOD - read from local
const moves = await db.moves.where("userId").equals(userId).toArray();
setMoves(moves);  // Always works
```

### Mistake 3: Overwriting Local Changes

```typescript
// BAD - always overwrites local
for (const row of serverData) {
  await db.moves.put(moveFromDb(row));  // Loses local changes!
}

// GOOD - merge if synced
for (const row of serverData) {
  await mergeIfSynced(
    (id) => db.moves.get(id),
    (value) => db.moves.put(value),
    moveFromDb(row)
  );
}
```

### Mistake 4: Missing Index

```typescript
// BAD - no index for this query
moves: "id, userId, date"

const result = await db.moves.where("status").equals("done");
// Works but SLOW - scans all records

// GOOD - add index
moves: "id, userId, date, status"
// Now the query uses the index
```

---

## Mental Debugging

When sync does not work:

1. **Check _synced flags.** Are records marked as `_synced: 0`?

2. **Check network.** Is `navigator.onLine` true?

3. **Check isCloudMode().** Are you in cloud mode or local-only?

4. **Check debounce.** Is the sync debounced? Wait 700ms.

5. **Check console.** Look for "push failed" or "pull exception" debug messages.

6. **Check DevTools.** Application tab → IndexedDB → align_db

7. **Check Supabase.** Table Editor → verify data exists

---

## Connections

**From Chapter 4:** Async/await makes Dexie queries readable.

**From Chapter 9:** Effects call sync on mount and when online.

**From Chapter 10:** AppContext reads from Dexie and calls refresh().

**To Chapter 14:** The remote side of sync uses Supabase.

---

## Go Figure It Out

1. **What is IndexedDB's storage limit?** How much can you store?

2. **What is a compound index?** When would you use `[a+b]` vs separate indexes?

3. **What is CRDTs?** A different approach to conflict resolution. How does it differ?

4. **What is Dexie.js Observable?** How can you subscribe to database changes?

5. **What is service worker background sync?** How could it improve offline support?

---

## Chapter Exercise

### Part 1: Explore the Database

Using browser DevTools:
1. Open Align in your browser
2. Go to Application → IndexedDB → align_db
3. Find the `moves` table
4. What fields does a move have?
5. Find a record with `_synced: 0` (if any)

### Part 2: Trace a Write

For adding a new move:
1. Open `components/home/sheets/AddMoveSheet.tsx`
2. Find where `db.moves.put()` is called
3. What value is `_synced` set to?
4. What happens after the put?
5. Where is `requestSyncIfCloud` called?

### Part 3: Trace the Sync

Open `lib/db/sync.ts`:
1. What does `pushUnsynced` do first?
2. How does it find unsynced records?
3. What does `mergeIfSynced` check?
4. What happens if local `_synced === 0` when pulling?

### Part 4: Understand Tombstones

Open `lib/db/sync.ts`:
1. Find `deleteMoveWithTombstone`
2. What does it write to `pendingDeletes`?
3. When does `processPendingDeletes` run?
4. How does pull avoid re-creating deleted records?

---

**Previous: [Chapter 12 - API Routes and Server Logic](../part-4-nextjs/12-api-routes-and-server.md)**

**Next: [Chapter 14 - Supabase and PostgreSQL](./14-supabase-postgresql.md)**
