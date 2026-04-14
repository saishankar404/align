# Chapter 4: Async JavaScript

JavaScript runs in a single thread. It can only do one thing at a time. Yet we need to fetch data from servers, read from databases, and wait for user input without freezing the entire application. This chapter explains how JavaScript handles asynchronous operations.

---

## What You Will Learn

- Why JavaScript needs asynchronous programming
- The event loop and how JavaScript manages time
- Callbacks and their problems
- Promises: the modern solution
- async/await: making promises readable
- Error handling in async code
- Parallel vs sequential operations

---

## Prerequisites

- Chapter 2: Functions (especially callbacks)
- Chapter 3: Arrays (for Promise.all examples)

---

## The Vocabulary

**Synchronous** - Code that runs line by line, each line waiting for the previous to finish.

**Asynchronous** - Code that starts an operation and continues without waiting. The result comes later.

**Blocking** - When code prevents anything else from running until it finishes.

**Non-blocking** - When code starts an operation but lets other code run while waiting.

**Callback** - A function passed to another function to be called when an operation completes.

**Promise** - An object representing a future value. It will either resolve (success) or reject (failure).

**async** - A keyword that makes a function return a Promise.

**await** - A keyword that pauses execution until a Promise resolves.

**Event loop** - The mechanism that allows JavaScript to handle async operations despite being single-threaded.

---

## Section 1: The Problem

### JavaScript is Single-Threaded

JavaScript can only execute one piece of code at a time:

```javascript
console.log("First");
console.log("Second");
console.log("Third");
// Output: First, Second, Third (always in this order)
```

### The Blocking Problem

What if one operation takes time?

```javascript
console.log("Starting");
// Imagine this takes 3 seconds
const data = fetchDataFromServer();  // BLOCKS everything
console.log("Got data:", data);
console.log("Done");
```

If `fetchDataFromServer` blocked, the entire page would freeze. No scrolling, no clicking, no animations. For 3 seconds.

This is unacceptable for user interfaces.

### The Solution: Non-Blocking Operations

JavaScript handles slow operations differently:

```javascript
console.log("Starting");
fetchDataFromServer((data) => {
  console.log("Got data:", data);  // Runs later, when data arrives
});
console.log("Done");
// Output: Starting, Done, Got data: ...
```

Notice the order: "Done" prints BEFORE "Got data". The fetch started but did not block. When the data arrived, the callback ran.

---

## Section 2: The Event Loop

### How It Works

JavaScript has:
1. **Call Stack** - Where code executes, one function at a time
2. **Web APIs** - Browser features that handle async operations (timers, network, etc.)
3. **Task Queue** - Where completed async operations wait
4. **Event Loop** - Moves tasks from queue to stack when stack is empty

```
                     ┌───────────────┐
                     │   Call Stack  │
                     │  (executing)  │
                     └───────┬───────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
    ┌─────────┐        ┌─────────┐        ┌─────────┐
    │ Timer   │        │ Network │        │  DOM    │
    │  API    │        │   API   │        │ Events  │
    └────┬────┘        └────┬────┘        └────┬────┘
         │                  │                   │
         └──────────────────┼───────────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │ Task Queue  │
                     │ (waiting)   │
                     └──────┬──────┘
                            │
                    Event Loop checks:
                    Is Call Stack empty?
                    If yes, move task to stack
```

### Example: setTimeout

```javascript
console.log("1");

setTimeout(() => {
  console.log("2");
}, 0);  // 0 milliseconds!

console.log("3");

// Output: 1, 3, 2
```

Even with 0ms delay, "2" prints last. Why?

1. `console.log("1")` runs
2. `setTimeout` registers the callback with the Timer API
3. `console.log("3")` runs
4. Call stack is empty
5. Event loop moves the callback to the stack
6. `console.log("2")` runs

The callback goes through the queue even with 0ms delay.

### Why This Matters

Understanding the event loop helps you:
- Know why code runs in a certain order
- Debug timing issues
- Understand why UI updates happen when they do

---

## Section 3: Callbacks

### The Old Way

Before Promises, async code used callbacks:

```javascript
function fetchUser(id, callback) {
  setTimeout(() => {
    callback({ id, name: "Alice" });
  }, 1000);
}

fetchUser(1, (user) => {
  console.log(user.name);  // "Alice" after 1 second
});
```

### Callback Hell

The problem: nested callbacks become unreadable:

```javascript
fetchUser(1, (user) => {
  fetchPosts(user.id, (posts) => {
    fetchComments(posts[0].id, (comments) => {
      fetchReplies(comments[0].id, (replies) => {
        console.log(replies);
        // And imagine error handling here too...
      });
    });
  });
});
```

This pyramid of doom is hard to read, hard to debug, and hard to handle errors in.

---

## Section 4: Promises

### The Concept

A Promise represents a value that will exist in the future:

```javascript
const promise = new Promise((resolve, reject) => {
  // Async operation here
  setTimeout(() => {
    resolve("Success!");  // or reject("Error!")
  }, 1000);
});
```

A Promise is in one of three states:
- **Pending** - Operation in progress
- **Fulfilled** - Operation succeeded (resolved)
- **Rejected** - Operation failed

### Using Promises with .then()

```javascript
fetchUser(1)
  .then((user) => {
    console.log(user.name);
    return fetchPosts(user.id);
  })
  .then((posts) => {
    console.log(posts);
    return fetchComments(posts[0].id);
  })
  .then((comments) => {
    console.log(comments);
  })
  .catch((error) => {
    console.error("Something failed:", error);
  });
```

Chaining with `.then()` is flat, not nested. Each `.then()` returns a new Promise.

### Creating Promises

```javascript
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

delay(1000).then(() => console.log("1 second passed"));
```

### In The Codebase: Supabase Returns Promises

```typescript
const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", userId);
```

`supabase.from(...).select(...)` returns a Promise. The `await` waits for it to resolve.

---

## Section 5: async/await

### The Concept

`async/await` is syntax that makes Promises look synchronous:

```javascript
// With .then()
fetchUser(1)
  .then(user => fetchPosts(user.id))
  .then(posts => console.log(posts));

// With async/await
async function loadPosts() {
  const user = await fetchUser(1);
  const posts = await fetchPosts(user.id);
  console.log(posts);
}
```

### The async Keyword

`async` before a function makes it return a Promise:

```javascript
async function greet() {
  return "Hello";
}

// Equivalent to:
function greet() {
  return Promise.resolve("Hello");
}

greet().then(msg => console.log(msg));  // "Hello"
```

### The await Keyword

`await` pauses execution until the Promise resolves:

```javascript
async function example() {
  console.log("Before");
  await delay(1000);  // Pauses here for 1 second
  console.log("After");
}
```

**Important:** `await` only pauses the async function, not the whole program. Other code can run while waiting.

### In The Codebase: lib/cycle/create.ts

```typescript
export async function createNewCycle(
  userId: string, 
  directions: string[], 
  lengthDays: 7 | 14
): Promise<string> {
  const now = new Date().toISOString();
  const today = new Date();
  const cycleId = newId();
  
  // First operation: query existing cycles
  const existingActiveCycles = await db.cycles
    .where("userId")
    .equals(userId)
    .filter((cycle) => cycle.status === "active")
    .toArray();
  
  // Second operation: close existing cycles
  await Promise.all(
    existingActiveCycles.map((cycle) =>
      db.cycles.update(cycle.id, {
        status: "closed",
        closedAt: now,
        _synced: 0,
      })
    )
  );
  
  // Third operation: create new cycle
  await db.cycles.put({...});
  
  // Fourth operation: create directions
  await Promise.all(
    validDirections.map((title, index) =>
      db.directions.put({...})
    )
  );
  
  return cycleId;
}
```

Each `await` pauses until that database operation completes. The operations run in sequence: query, then close, then create cycle, then create directions.

---

## Section 6: Error Handling

### try/catch with async/await

```javascript
async function loadUser(id) {
  try {
    const user = await fetchUser(id);
    console.log(user);
  } catch (error) {
    console.error("Failed to load user:", error);
  }
}
```

If `fetchUser` throws or the Promise rejects, execution jumps to the `catch` block.

### .catch() with Promises

```javascript
fetchUser(id)
  .then(user => console.log(user))
  .catch(error => console.error("Failed:", error));
```

### In The Codebase: lib/db/sync.ts

```typescript
async function pushProfiles(userId: string): Promise<void> {
  try {
    const p = await db.profiles.get(userId);
    if (!p) return;
    const { error } = await supabase.from("profiles").upsert(profileToDb(p), { onConflict: "id" });
    if (error) {
      debug("push profiles failed", error.message);
    }
  } catch (error) {
    debug("push profiles exception", error);
  }
}
```

Two layers of error handling:
1. The Supabase call can return an error object (API-level error)
2. The whole operation can throw (network failure, etc.)

Both are handled gracefully without crashing the app.

### Fire and Forget

Sometimes you start an async operation without waiting:

```javascript
// Start sync but don't wait for it
syncAll(userId).catch(() => {});  // Ignore errors

// Continue immediately
doSomethingElse();
```

The empty `.catch()` prevents unhandled rejection warnings. This pattern is used in Align for background syncing that should not block the UI.

---

## Section 7: Parallel vs Sequential

### Sequential (One at a Time)

```javascript
async function sequential() {
  const a = await fetchA();  // Wait for A
  const b = await fetchB();  // Then wait for B
  const c = await fetchC();  // Then wait for C
  // Total time: A + B + C
}
```

### Parallel (All at Once)

```javascript
async function parallel() {
  const [a, b, c] = await Promise.all([
    fetchA(),
    fetchB(),
    fetchC()
  ]);
  // Total time: max(A, B, C)
}
```

`Promise.all` starts all operations simultaneously and waits for all to complete.

### In The Codebase: lib/cycle/create.ts

```typescript
// These MUST be sequential (directions need the cycle to exist)
await db.cycles.put({...});  // Create cycle first
await Promise.all(           // Then create all directions in parallel
  validDirections.map(...)
);
```

The cycle must exist before directions can reference it. But all directions can be created in parallel since they do not depend on each other.

### Promise.all Fails Fast

If any Promise in `Promise.all` rejects, the whole thing rejects:

```javascript
try {
  const results = await Promise.all([
    Promise.resolve(1),
    Promise.reject("Error!"),
    Promise.resolve(3)
  ]);
} catch (e) {
  console.log(e);  // "Error!"
}
```

Use `Promise.allSettled` if you need all results even if some fail:

```javascript
const results = await Promise.allSettled([
  Promise.resolve(1),
  Promise.reject("Error!"),
  Promise.resolve(3)
]);
// [
//   { status: "fulfilled", value: 1 },
//   { status: "rejected", reason: "Error!" },
//   { status: "fulfilled", value: 3 }
// ]
```

---

## Section 8: Common Patterns in the Codebase

### Pattern 1: Load Data on Mount

```typescript
useEffect(() => {
  async function load() {
    const data = await fetchData();
    setData(data);
  }
  load();
}, []);
```

You cannot make the `useEffect` callback async directly. Instead, define an async function inside and call it.

### Pattern 2: Background Sync

```typescript
// Write locally first (instant)
await db.moves.put(newMove);

// Sync in background (don't wait)
syncAll(userId).catch(() => {});

// Update UI immediately
refresh();
```

The user sees the change instantly. Sync happens in the background.

### Pattern 3: Single-Flight Request

From `lib/db/sync.ts`:

```typescript
const inFlightSyncByUser = new Map<string, Promise<void>>();

async function runSingleFlightSync(userId: string): Promise<void> {
  // If already syncing, wait for that sync
  const existing = inFlightSyncByUser.get(userId);
  if (existing) {
    return existing;
  }
  
  // Start new sync
  const syncPromise = doActualSync(userId);
  inFlightSyncByUser.set(userId, syncPromise);
  
  try {
    await syncPromise;
  } finally {
    inFlightSyncByUser.delete(userId);
  }
}
```

This prevents duplicate syncs. If sync is already running, callers share the same Promise.

### Pattern 4: Debouncing

```typescript
const debounceTimerByUser = new Map<string, number>();

function requestSyncDebounced(userId: string) {
  const existing = debounceTimerByUser.get(userId);
  if (existing) {
    clearTimeout(existing);
  }
  
  const timer = setTimeout(() => {
    debounceTimerByUser.delete(userId);
    runSync(userId);
  }, 700);
  
  debounceTimerByUser.set(userId, timer);
}
```

If multiple sync requests come quickly, only the last one actually runs. This prevents hammering the server.

---

## What It Compiles To

When you write:

```javascript
async function example() {
  const a = await fetchA();
  const b = await fetchB();
  return a + b;
}
```

The JavaScript engine transforms this into something like:

```javascript
function example() {
  return fetchA()
    .then(a => {
      return fetchB()
        .then(b => {
          return a + b;
        });
    });
}
```

`async/await` is syntax sugar over Promises. The engine handles the transformation.

---

## Mistakes: What Breaks

### Mistake 1: Forgetting await

```javascript
async function loadData() {
  const data = fetchData();  // Missing await!
  console.log(data);  // Logs: Promise { <pending> }
}
```

**Why it is hard to spot:** No error. You just get a Promise object instead of the data.

### Mistake 2: await in a Loop (Accidentally Sequential)

```javascript
// SLOW: Sequential, one at a time
async function loadAll(ids) {
  const results = [];
  for (const id of ids) {
    const item = await fetchItem(id);  // Waits each time
    results.push(item);
  }
  return results;
}

// FAST: Parallel
async function loadAll(ids) {
  return Promise.all(ids.map(id => fetchItem(id)));
}
```

### Mistake 3: Unhandled Promise Rejection

```javascript
async function risky() {
  throw new Error("Oops");
}

risky();  // No catch! Unhandled rejection warning
```

Always handle errors or use `.catch(() => {})` if you intentionally ignore them.

### Mistake 4: Using await Outside async

```javascript
// ERROR: SyntaxError
const data = await fetchData();

// FIX: Wrap in async function
async function load() {
  const data = await fetchData();
}

// OR use top-level await (in modules)
```

### Mistake 5: Promise.all with Mutations

```javascript
// BUG: Order not guaranteed
const results = [];
await Promise.all(items.map(async item => {
  const result = await processItem(item);
  results.push(result);  // Race condition!
}));

// FIX: Use the return value
const results = await Promise.all(items.map(async item => {
  return await processItem(item);
}));
```

---

## Mental Debugging

When async code misbehaves:

1. **Add timing logs:**
   ```javascript
   console.log("Before fetch", Date.now());
   const data = await fetchData();
   console.log("After fetch", Date.now());
   ```

2. **Check if await is present:** Missing await is the most common bug.

3. **Check error handling:** Is there a try/catch? Is the catch logging the error?

4. **Check the Promise state:** In browser DevTools, you can inspect Promise objects.

5. **Check for race conditions:** Are multiple async operations modifying the same data?

6. **Verify the order:** Sequential vs parallel can cause different behaviors.

---

## Connections

**From Chapter 2:** Async functions are still functions. They just return Promises.

**From Chapter 3:** Array methods like `.map()` are crucial for `Promise.all` patterns.

**To Chapter 9:** React's `useEffect` is where you typically do async operations in components.

**To Chapter 13:** Dexie operations are all async. You will await database queries constantly.

**To Chapter 14:** Supabase API calls return Promises. Understanding async is essential for data fetching.

---

## Go Figure It Out

1. **What is the "microtask queue"?** How does it differ from the task queue? Why do Promise callbacks run before setTimeout callbacks?

2. **What is "async iteration"?** What do `for await...of` loops do? When would you use them?

3. **What is a "race condition"?** Give an example where two async operations cause bugs by running in unexpected order.

4. **What does `Promise.race` do?** How is it different from `Promise.all`? When would you use it?

5. **What is "callback hell" historically?** Before Promises existed, how did developers manage complex async flows? What libraries existed?

6. **What are "async generators"?** Functions that are both `async` and `function*`. What problem do they solve?

---

## Chapter Exercise

### Part 1: Practice Promises

Create `learn/exercises/sandbox/ch4-async.ts`:

```typescript
// 1. Create a delay function that returns a Promise
function delay(ms: number): Promise<void> {
  // Your code here
}

// 2. Use delay to log "Hello" after 1 second
// (Use .then())

// 3. Same thing with async/await

// 4. Create a function that fetches data with error handling
async function fetchWithRetry(url: string, retries: number): Promise<Response> {
  // If fetch fails, retry up to `retries` times
  // Your code here
}

// 5. Run three delays in parallel (1s, 2s, 3s)
// Log the total time taken (should be ~3s, not 6s)

// 6. Run the same delays sequentially
// Log the total time (should be ~6s)
```

### Part 2: In the Codebase

1. Open `lib/db/sync.ts`. Find `pushUnsynced`. How many `await` statements are there? Are they sequential or could some be parallel?

2. Find the `Promise.all` calls. What operations are being parallelized?

3. Find the try/catch blocks. What types of errors are being caught?

### Part 3: Predict the Output

Without running:

```javascript
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

console.log("D");

// What is the order?
```

Hint: Microtasks (Promises) run before macrotasks (setTimeout).

---

**Previous: [Chapter 3 - Collections and Iteration](./03-collections.md)**

**Next: [Chapter 5 - Types That Protect You](../part-2-typescript/05-types-that-protect.md)**
