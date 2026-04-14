# Chapter 9: Side Effects and Lifecycle

Components need to interact with the world outside React - fetching data, subscribing to events, setting up timers, updating the document title. These are "side effects." The useEffect hook lets you run code when your component mounts, updates, or unmounts.

---

## What You Will Learn

- What side effects are and why they need special handling
- The useEffect hook syntax
- Dependency arrays and when effects run
- Cleanup functions
- The useRef hook
- Common effect patterns
- Rules of hooks

---

## Prerequisites

- Chapter 8: State and Interactivity (useState)

---

## The Vocabulary

**Side effect** - Any operation that affects something outside the component: network requests, subscriptions, DOM manipulation, timers.

**useEffect** - A hook that runs code after render, for handling side effects.

**Dependency array** - The second argument to useEffect. Controls when the effect re-runs.

**Cleanup function** - A function returned from useEffect that runs before the next effect or on unmount.

**Mount** - When a component is added to the DOM for the first time.

**Unmount** - When a component is removed from the DOM.

**useRef** - A hook that holds a mutable value that persists across renders without causing re-renders.

**Ref** - A reference to a value (or DOM element) that persists between renders.

---

## Section 1: What Are Side Effects?

### Pure Functions vs Side Effects

A pure function only depends on its inputs and returns an output:

```tsx
function add(a: number, b: number): number {
  return a + b;  // Pure: same inputs always give same output
}
```

A side effect is anything that affects the outside world:

```tsx
function logAndAdd(a: number, b: number): number {
  console.log("Adding...");  // Side effect: affects console
  return a + b;
}
```

### Side Effects in Components

React components should be pure during render. The same props and state should produce the same JSX. But apps need side effects:

- Fetch data from an API
- Subscribe to browser events
- Start timers
- Update the document title
- Save to localStorage
- Send analytics

These cannot happen during render. They need useEffect.

### Why Not During Render?

```tsx
// BAD - side effect during render
function BadComponent() {
  fetch("/api/data");  // Runs every render!
  localStorage.setItem("key", "value");  // Every render!
  
  return <div>Hello</div>;
}
```

Problems:
- Effects run on EVERY render (could be many times per second)
- No way to clean up
- Order is unpredictable
- Can cause infinite loops

---

## Section 2: The useEffect Hook

### Basic Syntax

```tsx
import { useEffect } from "react";

function Component() {
  useEffect(() => {
    // This code runs AFTER render
    console.log("Effect ran!");
  });
  
  return <div>Hello</div>;
}
```

### When Does It Run?

By default, useEffect runs:
- After the first render (mount)
- After every subsequent render

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log("Effect ran, count is:", count);
  });
  // Logs on every render
  
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### The Dependency Array

The second argument controls when the effect runs:

```tsx
// Runs EVERY render (usually not what you want)
useEffect(() => {
  console.log("Every render");
});

// Runs ONCE on mount only
useEffect(() => {
  console.log("Mount only");
}, []);

// Runs on mount AND when `count` changes
useEffect(() => {
  console.log("Count changed:", count);
}, [count]);

// Runs when `a` OR `b` changes
useEffect(() => {
  console.log("a or b changed");
}, [a, b]);
```

### In The Codebase: components/home/sheets/AddMoveSheet.tsx:22-26

```tsx
useEffect(() => {
  if (context.directions.length === 1) {
    setSelectedDirectionId(context.directions[0].id);
  }
}, [context.directions]);
```

This effect:
- Runs when `context.directions` changes
- Auto-selects the only direction if there is exactly one
- Does not run on every render - only when directions change

---

## Section 3: The Dependency Array Deep Dive

### What Belongs in Dependencies

Include any value that:
1. Is used inside the effect
2. Could change between renders

```tsx
function Example({ userId }: { userId: string }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setData);
  }, [userId]);  // userId is used and could change
}
```

### What Does NOT Belong

- Stable references (setState functions, dispatch, refs)
- Values that never change (constants outside component)

```tsx
useEffect(() => {
  setCount(count + 1);
}, [count]);  // count needed, setCount is stable (not needed)

// But including setCount does not hurt:
useEffect(() => {
  setCount(count + 1);
}, [count, setCount]);  // Works fine, setCount is stable
```

### The Linter Rule

ESLint's `exhaustive-deps` rule warns when you forget dependencies:

```tsx
// WARNING: React Hook useEffect has a missing dependency: 'userId'
useEffect(() => {
  fetchUser(userId);
}, []);  // Should include userId!
```

Trust the linter. Missing dependencies cause stale closure bugs.

### In The Codebase: lib/context/AppContext.tsx:321-349

```tsx
useEffect(() => {
  const run = async () => {
    if (typeof window !== "undefined" && new URL(window.location.href).searchParams.get("demo") === "1") {
      setState(buildDemoState());
      return;
    }

    const userId = await getActiveUserId();

    if (DEV_BYPASS_AUTH && !userId) {
      localStorage.setItem("align_dev_user_id", "dev-user");
    }

    if (DEV_BYPASS_AUTH && userId) {
      localStorage.setItem("align_dev_user_id", userId);
    }

    if (!userId) {
      setState((prev) => ({ ...prev, isLoading: false, userId: null }));
      return;
    }

    await loadAll(userId);
  };

  run().catch(() => {
    setState((prev) => ({ ...prev, isLoading: false }));
  });
}, [loadAll]);
```

This effect:
- Runs when `loadAll` changes (which is memoized with useCallback)
- Handles async initialization
- Uses an inner async function (effects cannot be async directly)

---

## Section 4: Cleanup Functions

### The Problem

Some effects create resources that need cleanup:
- Event listeners
- Timers
- Subscriptions
- WebSocket connections

Without cleanup, resources leak or handlers duplicate.

### The Solution

Return a cleanup function from your effect:

```tsx
useEffect(() => {
  // Setup
  const timer = setInterval(() => {
    console.log("Tick");
  }, 1000);
  
  // Cleanup
  return () => {
    clearInterval(timer);
  };
}, []);
```

### When Cleanup Runs

1. Before the effect runs again (if dependencies changed)
2. When the component unmounts

```tsx
useEffect(() => {
  console.log("Effect for:", userId);
  
  return () => {
    console.log("Cleaning up for:", userId);
  };
}, [userId]);

// If userId changes from "a" to "b":
// 1. "Cleaning up for: a"
// 2. "Effect for: b"
```

### In The Codebase: lib/hooks/useOnline.ts

```tsx
export function useOnline(): boolean {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return online;
}
```

This hook:
- Creates two event handlers
- Adds them to window on mount
- Removes them on unmount (in the cleanup function)
- Empty dependency array = runs once on mount

Without the cleanup, adding the same listeners every render would cause multiple handlers.

### In The Codebase: components/shared/Toast.tsx:42-48

```tsx
useEffect(() => {
  if (!toast) return;
  const timer = window.setTimeout(() => {
    dismissToast(toast.id);
  }, toast.duration);
  return () => window.clearTimeout(timer);
}, [toast, dismissToast]);
```

This effect:
- Starts a timer when a toast appears
- Dismisses the toast after `toast.duration` milliseconds
- Clears the timer in cleanup
- If toast changes before timer fires, old timer is cleared

---

## Section 5: Common Effect Patterns

### Pattern 1: Fetch Data on Mount

```tsx
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    async function load() {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchUser(userId);
        if (!cancelled) {
          setUser(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load user");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    
    load();
    
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  if (!user) return null;
  return <div>{user.name}</div>;
}
```

The `cancelled` flag prevents state updates after unmount or when userId changes mid-fetch.

### Pattern 2: Subscribe to Browser Events

```tsx
function WindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    function handleResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <div>{size.width} x {size.height}</div>;
}
```

### In The Codebase: components/home/HomeApp.tsx:116-125

```tsx
useEffect(() => {
  const check = () => {
    if (context.currentCycle && isCycleExpired(context.currentCycle)) {
      setWindowClosedVisible(true);
    }
  };
  check();
  document.addEventListener("visibilitychange", check);
  return () => document.removeEventListener("visibilitychange", check);
}, [context.currentCycle]);
```

This effect:
- Runs the check immediately
- Subscribes to visibility changes (tab becomes active)
- Cleans up the listener on unmount or when cycle changes

### Pattern 3: Sync to External System

```tsx
function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  
  return null;
}
```

Updates the browser tab title whenever `title` prop changes.

### Pattern 4: Conditional Effects

```tsx
useEffect(() => {
  if (!userId) return;  // Guard: do nothing if no user
  
  subscribeToUpdates(userId);
  
  return () => unsubscribeFromUpdates(userId);
}, [userId]);
```

The effect only does meaningful work when `userId` exists.

### In The Codebase: components/shared/Toast.tsx:42-43

```tsx
useEffect(() => {
  if (!toast) return;
  // ... rest of effect
```

Early return when there is no toast. No timer needed, no cleanup needed.

---

## Section 6: The useRef Hook

### The Problem

Sometimes you need a value that:
- Persists across renders
- Does NOT cause re-renders when changed
- Can be mutated

State causes re-renders. Variables reset each render. You need a ref.

### Syntax

```tsx
import { useRef } from "react";

function Component() {
  const countRef = useRef(0);
  
  function increment() {
    countRef.current = countRef.current + 1;
    console.log(countRef.current);  // Updated immediately
    // No re-render!
  }
}
```

### useRef for DOM Elements

The most common use: accessing DOM elements directly:

```tsx
function FocusInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  function focus() {
    inputRef.current?.focus();  // Direct DOM access
  }
  
  return (
    <>
      <input ref={inputRef} />
      <button onClick={focus}>Focus the input</button>
    </>
  );
}
```

### useRef for Tracking Values

Track values without causing renders:

```tsx
function Timer() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);
  
  function start() {
    if (intervalRef.current !== null) return;  // Already running
    intervalRef.current = window.setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  }
  
  function stop() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return (
    <div>
      <p>{seconds} seconds</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

### In The Codebase: components/home/shared/MoveCard.tsx:29-41

```tsx
const cardRef = useRef<HTMLDivElement | null>(null);
const overlayRef = useRef<HTMLDivElement | null>(null);
const rafRef = useRef<number | null>(null);
const holdDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const holdStartedAtRef = useRef<number>(0);
const holdProgressedRef = useRef(false);
const gestureStateRef = useRef<GestureState>("idle");
const suppressTapAfterHoldRef = useRef(false);
const touchTapHandledRef = useRef(false);
const touchStartXRef = useRef(0);
const touchStartYRef = useRef(0);
const fadeTimerRef = useRef<number | null>(null);
const deleteTimerRef = useRef<number | null>(null);
```

This component uses refs for:
- DOM element references (`cardRef`, `overlayRef`)
- Timer IDs (`rafRef`, `holdDelayTimerRef`, `fadeTimerRef`, `deleteTimerRef`)
- Tracking gesture state without causing re-renders
- Touch coordinates

All of these need to persist across renders but should NOT trigger re-renders when changed.

### useState vs useRef

| useState | useRef |
|----------|--------|
| Changing causes re-render | Changing does NOT re-render |
| Access via value | Access via `.current` |
| For data that affects UI | For values that do not affect UI |
| Immutable (use setter) | Mutable (assign to .current) |

---

## Section 7: Rules of Hooks

### Rule 1: Only Call at Top Level

```tsx
// BAD - conditional
function Component({ show }: { show: boolean }) {
  if (show) {
    const [value, setValue] = useState(0);  // Error!
  }
}

// BAD - in loop
function List({ items }: { items: string[] }) {
  for (const item of items) {
    useEffect(() => { /* ... */ });  // Error!
  }
}

// GOOD - always at top level
function Component({ show }: { show: boolean }) {
  const [value, setValue] = useState(0);  // Always called
  
  if (!show) return null;
  return <div>{value}</div>;
}
```

React tracks hooks by their call order. Conditional hooks break this.

### Rule 2: Only Call in React Functions

```tsx
// BAD - regular function
function regularFunction() {
  const [value, setValue] = useState(0);  // Error!
}

// GOOD - React component
function Component() {
  const [value, setValue] = useState(0);
}

// GOOD - custom hook
function useCustomHook() {
  const [value, setValue] = useState(0);
  return value;
}
```

Hooks only work inside:
- Function components
- Custom hooks (functions starting with `use`)

### Why These Rules?

React stores hook state in an array, indexed by call order:

```javascript
// Conceptually, React does something like:
const hookStates = [];
let currentIndex = 0;

function useState(initial) {
  const index = currentIndex++;
  if (hookStates[index] === undefined) {
    hookStates[index] = initial;
  }
  return [hookStates[index], (newVal) => { hookStates[index] = newVal }];
}

// On each render, currentIndex resets to 0
```

If hooks are called conditionally, the indices get misaligned.

---

## Section 8: Custom Hooks

### The Concept

Extract reusable effect logic into custom hooks:

```tsx
// Custom hook
function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

// Usage
function Page({ title }: { title: string }) {
  useDocumentTitle(title);
  return <div>...</div>;
}
```

### In The Codebase: lib/hooks/useOnline.ts

```tsx
export function useOnline(): boolean {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return online;
}
```

This custom hook:
- Encapsulates the subscription logic
- Handles SSR (typeof navigator !== "undefined")
- Returns a simple boolean
- Can be reused in any component

### Usage in components/home/shared/OfflineIndicator.tsx:24

```tsx
export default function OfflineIndicator() {
  const online = useOnline();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!online);
  }, [online]);
  // ...
}
```

The component does not care HOW online status is tracked. It just uses the hook.

### Building Custom Hooks

Rules:
- Name must start with `use`
- Can call other hooks
- Can have parameters
- Can return anything

```tsx
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          setData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => { cancelled = true };
  }, [url]);

  return { data, loading, error };
}

// Usage
function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error } = useFetch<User>(`/api/users/${userId}`);
  // ...
}
```

---

## Section 9: Effect Timing

### Order of Operations

```tsx
function Component() {
  console.log("1. Render");
  
  useEffect(() => {
    console.log("3. Effect runs");
    return () => console.log("2. Cleanup runs (before next effect)");
  });
  
  return <div>Hello</div>;
}
```

On mount:
1. "1. Render"
2. DOM updates
3. "3. Effect runs"

On re-render:
1. "1. Render"
2. DOM updates
3. "2. Cleanup runs"
4. "3. Effect runs"

On unmount:
1. "2. Cleanup runs"

### useLayoutEffect

For rare cases where you need the effect to run BEFORE the browser paints:

```tsx
import { useLayoutEffect } from "react";

function Component() {
  useLayoutEffect(() => {
    // Runs synchronously after DOM mutation, before paint
    // Use for: measuring DOM, preventing flicker
  }, []);
}
```

Use sparingly - blocks painting and can hurt performance.

---

## Why Not Other Approaches?

### Why Not Run Effects During Render?

```tsx
// BAD
function Component({ userId }) {
  const [data, setData] = useState(null);
  
  // This runs on every render!
  fetch(`/api/users/${userId}`)
    .then(res => res.json())
    .then(setData);  // Causes another render -> infinite loop!
}
```

Effects in render cause infinite loops and duplicate requests.

### Why Need Cleanup?

```tsx
// BAD - no cleanup
useEffect(() => {
  window.addEventListener("resize", handleResize);
}, []);
// If component unmounts, listener stays forever!
// If effect re-runs, listeners stack up!

// GOOD
useEffect(() => {
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
```

### Why Dependencies?

```tsx
// BAD - missing dependency
const [userId, setUserId] = useState("1");

useEffect(() => {
  fetchUser(userId);  // Uses userId but does not list it
}, []);  // Only runs once, even when userId changes!

// GOOD
useEffect(() => {
  fetchUser(userId);
}, [userId]);  // Runs when userId changes
```

---

## Mistakes: What Breaks

### Mistake 1: Infinite Loop

```tsx
const [count, setCount] = useState(0);

useEffect(() => {
  setCount(count + 1);  // Updates state -> triggers re-render -> runs effect
});  // No dependency array = runs every render = INFINITE LOOP
```

Fix: Add dependency array:
```tsx
useEffect(() => {
  setCount(count + 1);
}, []);  // Runs once
```

### Mistake 2: Missing Cleanup

```tsx
useEffect(() => {
  const id = setInterval(() => console.log("tick"), 1000);
  // No cleanup! Timer keeps running after unmount
}, []);
```

Fix:
```tsx
useEffect(() => {
  const id = setInterval(() => console.log("tick"), 1000);
  return () => clearInterval(id);
}, []);
```

### Mistake 3: Stale Closures

```tsx
const [count, setCount] = useState(0);

useEffect(() => {
  const id = setInterval(() => {
    console.log(count);  // Always logs initial count!
  }, 1000);
  return () => clearInterval(id);
}, []);  // count not in dependencies
```

Fix: Add count to dependencies (but then interval restarts each change):
```tsx
useEffect(() => {
  const id = setInterval(() => {
    console.log(count);
  }, 1000);
  return () => clearInterval(id);
}, [count]);

// Or use a ref:
const countRef = useRef(count);
useEffect(() => {
  countRef.current = count;
}, [count]);

useEffect(() => {
  const id = setInterval(() => {
    console.log(countRef.current);  // Always current
  }, 1000);
  return () => clearInterval(id);
}, []);
```

### Mistake 4: Async Effect

```tsx
// BAD - effect function cannot be async
useEffect(async () => {
  const data = await fetchData();  // TypeScript/lint error!
  setData(data);
}, []);

// GOOD - inner async function
useEffect(() => {
  async function load() {
    const data = await fetchData();
    setData(data);
  }
  load();
}, []);
```

### Mistake 5: Object Dependencies

```tsx
const options = { userId: "1" };  // New object every render!

useEffect(() => {
  fetch(options);
}, [options]);  // Runs EVERY render because options is always "new"
```

Fix: primitive dependencies or useMemo:
```tsx
useEffect(() => {
  fetch({ userId });
}, [userId]);  // Primitive, stable comparison

// Or:
const options = useMemo(() => ({ userId }), [userId]);
useEffect(() => {
  fetch(options);
}, [options]);  // Only changes when userId changes
```

---

## Mental Debugging

When effects do not behave as expected:

1. **Log effect execution.** Add console.log at the start. Does it run when expected?

2. **Log cleanup execution.** Add console.log in the cleanup function. Is it cleaning up?

3. **Check dependencies.** Is every value used in the effect listed? Is the linter warning you?

4. **Check for object references.** Are dependencies objects/arrays created each render?

5. **Check for stale closures.** Does your effect reference a value that might be stale? Use a ref.

6. **Check for async issues.** If fetching data, is the component still mounted when the response arrives?

---

## Connections

**From Chapter 8:** Effects complement state. State holds data; effects synchronize with the outside world.

**From Chapter 4:** Async JavaScript applies directly. Effects use async functions, promises, and cleanup.

**To Chapter 10:** Context uses effects internally. Understanding effects helps with context.

**To Chapter 13:** Data fetching from Dexie uses effects for loading data on mount.

---

## Go Figure It Out

1. **What is useLayoutEffect?** How does its timing differ from useEffect? When would you use it?

2. **What is the "React StrictMode double-invoke"?** Why does React run effects twice in development?

3. **What is AbortController?** How can you use it to cancel fetch requests in cleanup?

4. **What is "effect dependency exhaustive checking"?** What does the eslint-plugin-react-hooks rule do?

5. **What is useSyncExternalStore?** When would you use it instead of useEffect for subscriptions?

---

## Chapter Exercise

### Part 1: Build a Clock

Create `learn/exercises/sandbox/ch9-clock.tsx`:

```tsx
// Build a component that:
// 1. Shows the current time (HH:MM:SS)
// 2. Updates every second
// 3. Properly cleans up the interval on unmount
// 4. Hint: Use setInterval in useEffect
```

### Part 2: Build a Debounced Search

```tsx
// Build a search input that:
// 1. Has a text input
// 2. Waits 300ms after typing stops before "searching"
// 3. Shows "Searching..." while waiting
// 4. Shows "Results for: {query}" after the debounce
// 5. Cancels the pending search if the user types again
// Hint: Use setTimeout in useEffect, clear in cleanup
```

### Part 3: Build a Window Size Hook

```tsx
// Create a custom hook useWindowSize() that:
// 1. Returns { width: number, height: number }
// 2. Updates when the window is resized
// 3. Cleans up the listener on unmount
// 4. Handles SSR (window might not exist)
```

### Part 4: In the Codebase

1. Open `lib/hooks/useOnline.ts`. Why does it check `typeof navigator !== "undefined"`?

2. Open `components/shared/Toast.tsx`. Trace the effect: when does the timer start? When does it clear? What triggers a new timer?

3. Open `components/home/shared/MoveCard.tsx`. Count the refs. Why are refs used instead of state for gesture tracking?

4. Find the effect in `lib/context/AppContext.tsx` that loads data. How does it handle async? What is in its dependency array?

---

**Previous: [Chapter 8 - State and Interactivity](./08-state-and-interactivity.md)**

**Next: [Chapter 10 - Context and Global State](./10-context-and-global-state.md)**
