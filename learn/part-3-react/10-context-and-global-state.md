# Chapter 10: Context and Global State

As applications grow, some data needs to be accessible by many components at different levels of the component tree. Passing props through every intermediate component (prop drilling) becomes tedious and error-prone. React Context solves this by creating a way to share values across the component tree without explicit prop passing.

---

## What You Will Learn

- The prop drilling problem
- What Context is and when to use it
- Creating and using Context
- The Provider pattern
- Performance considerations
- Context vs other state management
- Real patterns from the codebase

---

## Prerequisites

- Chapter 8: State and Interactivity (useState)
- Chapter 9: Side Effects and Lifecycle (useEffect, useCallback, useMemo)

---

## The Vocabulary

**Context** - A way to pass data through the component tree without passing props manually at every level.

**Provider** - A component that wraps part of the tree and makes a value available to all descendants.

**Consumer** - A component that reads from a Context.

**Prop drilling** - Passing props through intermediate components that do not need them, just to get data to deeply nested components.

**createContext** - The function that creates a Context object.

**useContext** - The hook that reads the current value from a Context.

---

## Section 1: The Prop Drilling Problem

### The Scenario

Imagine a component tree where the user's profile is needed deep down:

```
App
└── Layout
    └── Sidebar
        └── Navigation
            └── UserMenu
                └── UserAvatar  ← needs user data
```

### Without Context

Every component in the chain must pass the prop:

```tsx
function App() {
  const [user, setUser] = useState<User | null>(null);
  return <Layout user={user} />;
}

function Layout({ user }: { user: User | null }) {
  return <Sidebar user={user} />;  // Does not use user, just passes it
}

function Sidebar({ user }: { user: User | null }) {
  return <Navigation user={user} />;  // Does not use user, just passes it
}

function Navigation({ user }: { user: User | null }) {
  return <UserMenu user={user} />;  // Does not use user, just passes it
}

function UserMenu({ user }: { user: User | null }) {
  return <UserAvatar user={user} />;  // Finally uses it!
}

function UserAvatar({ user }: { user: User | null }) {
  return <img src={user?.avatar} alt={user?.name} />;
}
```

Problems:
- Layout, Sidebar, Navigation have props they do not use
- Adding a new prop requires changing every intermediate component
- Removing a prop requires tracing through the chain
- Components are coupled to their position in the tree

### With Context

Only the components that need the data access it:

```tsx
const UserContext = createContext<User | null>(null);

function App() {
  const [user, setUser] = useState<User | null>(null);
  return (
    <UserContext.Provider value={user}>
      <Layout />
    </UserContext.Provider>
  );
}

function Layout() {
  return <Sidebar />;  // No user prop needed
}

function Sidebar() {
  return <Navigation />;  // No user prop needed
}

function Navigation() {
  return <UserMenu />;  // No user prop needed
}

function UserMenu() {
  return <UserAvatar />;  // No user prop needed
}

function UserAvatar() {
  const user = useContext(UserContext);  // Gets it directly!
  return <img src={user?.avatar} alt={user?.name} />;
}
```

The intermediate components do not even know user data exists.

---

## Section 2: Creating Context

### The Pattern

```tsx
import { createContext, useContext, useState, type ReactNode } from "react";

// 1. Create the context with a default value
const MyContext = createContext<ContextType | null>(null);

// 2. Create a provider component
function MyProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState(initialValue);
  
  return (
    <MyContext.Provider value={value}>
      {children}
    </MyContext.Provider>
  );
}

// 3. Create a hook to use the context
function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useMyContext must be used within MyProvider");
  }
  return context;
}
```

### In The Codebase: lib/hooks/useToast.tsx

```tsx
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { newId } from "@/lib/utils/ids";

export type ToastType = "info" | "error" | "success";

export interface ToastAction {
  label: string;
  fn: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  action?: ToastAction;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, duration?: number, action?: ToastAction) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 2500, action?: ToastAction) => {
      setToasts((prev) => [...prev, { id: newId(), message, type, duration, action }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(
    () => ({ toasts: toasts.slice(0, 1), showToast, dismissToast }),
    [toasts, showToast, dismissToast]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
```

This context provides:
- `toasts` - The list of current toast messages
- `showToast` - Function to add a toast
- `dismissToast` - Function to remove a toast

Any component can show a toast without knowing how toasts work internally.

---

## Section 3: The Provider Component

### What It Does

The Provider component:
1. Holds the state
2. Provides methods to modify state
3. Wraps part of the component tree
4. Makes values available to all descendants

### In The Codebase: lib/context/AppContext.tsx

This is the main application context. Let us break it down:

#### Step 1: Define the shape

```tsx
export type SheetName =
  | "mark-done"
  | "showed-up"
  | "night-checkin"
  | "avoided"
  | "today-info"
  | "tips"
  | "add-move"
  | "add-later"
  | "directions"
  | "direction-detail"
  | "later-item"
  | "day-detail";

interface AppState {
  profile: LocalProfile | null;
  currentCycle: LocalCycle | null;
  allCycles: LocalCycle[];
  directions: LocalDirection[];
  todayMoves: LocalMove[];
  allMovesThisCycle: LocalMove[];
  allMoves: LocalMove[];
  todayCheckin: LocalCheckin | null;
  checkinsThisCycle: LocalCheckin[];
  allCheckins: LocalCheckin[];
  laterItems: LocalLaterItem[];
  allLaterItems: LocalLaterItem[];
  currentDay: number;
  daysRemaining: number;
  isLoading: boolean;
  userId: string | null;
  activeSheet: SheetName | null;
  sheetData: Record<string, unknown>;
}

interface AppContextValue extends AppState {
  refresh: () => Promise<void>;
  openSheet: (name: SheetName, data?: Record<string, unknown>) => void;
  closeSheet: () => void;
  openSheetChain: (name: SheetName, data?: Record<string, unknown>) => void;
}
```

The context value extends the state with methods. Components get both data and actions.

#### Step 2: Create the context

```tsx
const AppContext = createContext<AppContextValue | null>(null);
```

The default value is `null`. We will check for this in the hook.

#### Step 3: Define initial state

```tsx
const INITIAL_STATE: AppState = {
  profile: null,
  currentCycle: null,
  allCycles: [],
  directions: [],
  todayMoves: [],
  allMovesThisCycle: [],
  allMoves: [],
  todayCheckin: null,
  checkinsThisCycle: [],
  allCheckins: [],
  laterItems: [],
  allLaterItems: [],
  currentDay: 1,
  daysRemaining: 0,
  isLoading: true,
  userId: null,
  activeSheet: null,
  sheetData: {},
};
```

#### Step 4: Build the provider

```tsx
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const loadAll = useCallback(async (userId: string) => {
    // Load all data from Dexie
    // Update state with loaded data
  }, []);

  const refresh = useCallback(async () => {
    if (!state.userId) return;
    await loadAll(state.userId);
  }, [loadAll, state.userId]);

  const openSheet = useCallback((name: SheetName, data?: Record<string, unknown>) => {
    setState((prev) => ({ ...prev, activeSheet: name, sheetData: data ?? {} }));
  }, []);

  const closeSheet = useCallback(() => {
    setState((prev) => ({ ...prev, activeSheet: null, sheetData: {} }));
  }, []);

  const openSheetChain = useCallback((name: SheetName, data?: Record<string, unknown>) => {
    setState((prev) => ({ ...prev, activeSheet: null }));
    window.setTimeout(() => {
      setState((prev) => ({ ...prev, sheetData: data ?? {}, activeSheet: name }));
    }, 220);
  }, []);

  // Load data on mount
  useEffect(() => {
    const run = async () => {
      const userId = await getActiveUserId();
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

  // Memoize the value object
  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      refresh,
      openSheet,
      closeSheet,
      openSheetChain,
    }),
    [closeSheet, openSheet, openSheetChain, refresh, state]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
```

#### Step 5: Create the hook

```tsx
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
```

---

## Section 4: Using Context

### In Components

```tsx
import { useAppContext } from "@/lib/context/AppContext";

function TodayView() {
  const context = useAppContext();
  
  // Access state
  const { profile, todayMoves, directions, currentDay } = context;
  
  // Access methods
  const { openSheet, refresh } = context;
  
  return (
    <div>
      <h1>Hello, {profile?.name}</h1>
      <p>Day {currentDay}</p>
      {todayMoves.map(move => (
        <MoveCard 
          key={move.id} 
          move={move}
          onTap={() => openSheet("mark-done", { move })}
        />
      ))}
    </div>
  );
}
```

### In The Codebase: components/home/sheets/AddMoveSheet.tsx:12-13

```tsx
export default function AddMoveSheet() {
  const context = useAppContext();
  const isOpen = context.activeSheet === "add-move";
```

The sheet checks if it should be open by reading `activeSheet` from context.

### Destructuring for Convenience

```tsx
function Component() {
  // Full context
  const context = useAppContext();
  
  // Or destructure what you need
  const { todayMoves, openSheet, closeSheet } = useAppContext();
  
  // Both work identically
}
```

---

## Section 5: Provider Placement

### Where to Place Providers

Providers should wrap the parts of the tree that need access:

```tsx
// Root level - app-wide state
function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Layout />
      </ToastProvider>
    </AppProvider>
  );
}

// Feature level - only where needed
function CheckoutPage() {
  return (
    <CartProvider>
      <CheckoutForm />
      <OrderSummary />
    </CartProvider>
  );
}
```

### In The Codebase: app/(app)/home/layout.tsx

```tsx
export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <ToastProvider>
        {children}
        <OfflineIndicator />
        <Toast />
      </ToastProvider>
    </AppProvider>
  );
}
```

AppProvider wraps everything that needs app state. ToastProvider is inside (can use AppContext if needed). The Toast component at the bottom reads from ToastContext.

### Nesting Order Matters

```tsx
// ToastProvider can use AppContext
<AppProvider>
  <ToastProvider>
    {children}
  </ToastProvider>
</AppProvider>

// But AppProvider CANNOT use ToastContext
// because ToastProvider is inside it
```

---

## Section 6: Performance Considerations

### The Problem: Unnecessary Re-renders

When context value changes, ALL consumers re-render:

```tsx
function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  
  // New object every render!
  const value = { user, setUser, theme, setTheme };
  
  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}
```

Every state change creates a new `value` object, causing all consumers to re-render.

### Solution 1: useMemo

```tsx
function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  
  const value = useMemo(
    () => ({ user, setUser, theme, setTheme }),
    [user, theme]  // Only recreate when these change
  );
  
  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}
```

### Solution 2: useCallback for Functions

```tsx
function Provider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Without useCallback, new function every render
  const showToast = (message) => {
    setToasts(prev => [...prev, { id: newId(), message }]);
  };

  // With useCallback, stable reference
  const showToast = useCallback((message) => {
    setToasts(prev => [...prev, { id: newId(), message }]);
  }, []);  // Empty deps = never changes
}
```

### In The Codebase: lib/hooks/useToast.tsx:32-46

```tsx
const showToast = useCallback(
  (message: string, type: ToastType = "info", duration = 2500, action?: ToastAction) => {
    setToasts((prev) => [...prev, { id: newId(), message, type, duration, action }]);
  },
  []
);

const dismissToast = useCallback((id: string) => {
  setToasts((prev) => prev.filter((t) => t.id !== id));
}, []);

const value = useMemo(
  () => ({ toasts: toasts.slice(0, 1), showToast, dismissToast }),
  [toasts, showToast, dismissToast]
);
```

- `showToast` and `dismissToast` are memoized with useCallback
- The value object is memoized with useMemo
- Consumers only re-render when `toasts` actually changes

### Solution 3: Split Contexts

If different parts of state change at different rates, split them:

```tsx
// Instead of one big context:
const AppContext = createContext({ user, theme, settings });

// Split into separate contexts:
const UserContext = createContext(user);
const ThemeContext = createContext(theme);
const SettingsContext = createContext(settings);

// Components only subscribe to what they need
function Avatar() {
  const user = useContext(UserContext);  // Only re-renders when user changes
  return <img src={user.avatar} />;
}

function ThemeToggle() {
  const theme = useContext(ThemeContext);  // Only re-renders when theme changes
  return <button>{theme}</button>;
}
```

---

## Section 7: The Value Object Pattern

### Combining State and Actions

The context value typically contains:
- Current state
- Functions to modify state

```tsx
interface CounterContextValue {
  count: number;              // State
  increment: () => void;      // Action
  decrement: () => void;      // Action
  reset: () => void;          // Action
}
```

### In The Codebase: lib/context/AppContext.tsx:63-68

```tsx
interface AppContextValue extends AppState {
  refresh: () => Promise<void>;
  openSheet: (name: SheetName, data?: Record<string, unknown>) => void;
  closeSheet: () => void;
  openSheetChain: (name: SheetName, data?: Record<string, unknown>) => void;
}
```

AppState contains all the data (profile, moves, directions, etc.). AppContextValue extends it with methods (refresh, openSheet, closeSheet, openSheetChain).

### Why Include Methods?

Without methods in context:
```tsx
function Component() {
  const state = useAppContext();
  // How do I refresh? I need access to loadAll...
  // How do I open a sheet? I need access to setState...
}
```

With methods in context:
```tsx
function Component() {
  const { todayMoves, refresh, openSheet } = useAppContext();
  
  async function handleSave() {
    await saveMove();
    await refresh();  // Reload data
  }
  
  return <button onClick={() => openSheet("add-move")}>Add</button>;
}
```

Components do not need to know HOW data is managed, just that they can call `refresh()`.

---

## Section 8: Error Boundaries for Context

### The Guard Pattern

Always check if context exists:

```tsx
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
```

This pattern:
- Throws a clear error if used outside Provider
- Tells developers exactly what is wrong
- Provides type safety (context is never null after check)

### Common Mistakes

```tsx
// BAD - no check, context might be null
export function useAppContext() {
  return useContext(AppContext);  // Could be null!
}

// Usage - TypeScript allows but runtime crashes
const { todayMoves } = useAppContext();  // Error if outside provider
```

---

## Section 9: Context vs Props

### When to Use Props

- Data flows to direct children
- Only 1-2 levels deep
- Component is reusable in different contexts
- Data is specific to that component relationship

```tsx
// Props are fine here
function UserCard({ user }: { user: User }) {
  return (
    <div>
      <Avatar image={user.avatar} />
      <Name>{user.name}</Name>
    </div>
  );
}
```

### When to Use Context

- Data needed by many components at different levels
- Data changes infrequently
- Alternative is passing through many intermediate components
- Data is "global" to a subtree

```tsx
// Context is appropriate here
// - Used by many components (sheets, views, cards)
// - Changed by user actions (not every frame)
// - Would need to pass through Layout, Views, Cards, etc.
<AppProvider>
  <HomeApp />
</AppProvider>
```

### Do Not Overuse Context

Context is not a replacement for all props. Use it for truly shared state, not for every piece of data.

---

## Why Not Other Approaches?

### Why Not Just Global Variables?

```tsx
// BAD - global mutable state
let user = null;

function setUser(newUser) {
  user = newUser;
  // Components do not know to re-render!
}
```

Global variables:
- Do not trigger re-renders
- Are hard to test
- Create hidden dependencies
- Do not work with SSR

### Why Not Pass Everything as Props?

For shallow trees, props are fine. For deep trees:
- Every intermediate component needs the prop
- Adding/removing props requires many file changes
- Components become coupled to their tree position

### Why Not Use a State Library (Redux, Zustand)?

Context is built into React. For many apps, it is sufficient. State libraries add:
- More complexity
- Another dependency
- Different patterns to learn

Consider libraries when:
- State updates are very complex
- You need middleware (logging, persistence)
- Performance is critical and Context is not enough
- Team prefers the library's patterns

---

## Mistakes: What Breaks

### Mistake 1: Missing Provider

```tsx
function App() {
  return <HomeApp />;  // No AppProvider!
}

function HomeApp() {
  const context = useAppContext();  // Throws: "must be used within AppProvider"
}
```

Always wrap with the Provider.

### Mistake 2: Creating Value Object Every Render

```tsx
function Provider({ children }) {
  const [count, setCount] = useState(0);
  
  // BAD - new object every render
  return (
    <MyContext.Provider value={{ count, setCount }}>
      {children}
    </MyContext.Provider>
  );
}
```

Use useMemo:
```tsx
const value = useMemo(() => ({ count, setCount }), [count]);
```

### Mistake 3: Not Using useCallback for Methods

```tsx
function Provider({ children }) {
  const [items, setItems] = useState([]);
  
  // BAD - new function every render
  const addItem = (item) => setItems([...items, item]);
  
  // GOOD
  const addItem = useCallback(
    (item) => setItems(prev => [...prev, item]),
    []
  );
}
```

### Mistake 4: Wrong Context (Multiple Providers)

```tsx
// Two different providers with same-looking context
<UserProvider>      // Provides UserContext A
  <SomeComponent />
</UserProvider>

<UserProvider>      // Provides UserContext B
  <OtherComponent /> // Uses UserContext B, not A!
</UserProvider>
```

Components use the nearest Provider ancestor.

### Mistake 5: Using Context for Frequently Changing Data

```tsx
// BAD - mouse position changes every frame
const MouseContext = createContext({ x: 0, y: 0 });

function MouseProvider({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handler = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  
  // Every mouse move re-renders ALL consumers!
  return <MouseContext.Provider value={position}>{children}</MouseContext.Provider>;
}
```

For high-frequency updates, consider refs or dedicated libraries.

---

## Mental Debugging

When context does not work:

1. **Check Provider placement.** Is the Provider above the component in the tree?

2. **Check the hook.** Does useContext return null? Is the error message clear?

3. **Check for multiple Providers.** Are there duplicate Providers creating separate contexts?

4. **Check re-renders.** Is the value object stable (useMemo)? Are functions stable (useCallback)?

5. **Log the value.** Add `console.log(value)` in the Provider. Is it what you expect?

6. **Use React DevTools.** The Components tab shows Context values.

---

## Connections

**From Chapters 8-9:** Context Providers use useState and useEffect internally. Understanding those is essential.

**From Chapter 6:** TypeScript interfaces define the context value shape.

**To Chapter 11:** Next.js has special considerations for Context with server components.

**To Chapter 13:** AppContext loads data from Dexie. The context is the bridge between database and UI.

---

## Go Figure It Out

1. **What is useReducer?** How would you use it instead of useState in a Context Provider?

2. **What is "context selector"?** Libraries like `use-context-selector` allow subscribing to parts of context. Why would you need this?

3. **What is the React Compiler (React Forget)?** How might it change the need for useMemo/useCallback?

4. **What is Zustand?** Compare it to Context. When would you choose one over the other?

5. **What is "compound components"?** How does Context enable patterns like `<Tabs><Tab>A</Tab><Tab>B</Tab></Tabs>`?

---

## Chapter Exercise

### Part 1: Build a Theme Context

Create `learn/exercises/sandbox/ch10-theme.tsx`:

```tsx
// Build a theme system with:
// 1. ThemeContext with current theme ("light" | "dark")
// 2. ThemeProvider that holds state
// 3. useTheme hook that returns { theme, toggleTheme }
// 4. A ThemedBox component that changes background based on theme
// 5. A ThemeToggle button component
```

### Part 2: Build a Counter Context

```tsx
// Build a counter context with:
// 1. CounterContext with count and actions
// 2. CounterProvider with increment, decrement, reset
// 3. useCounter hook
// 4. Display component showing count
// 5. Controls component with three buttons
// 6. Both components should work independently (test by putting them far apart in tree)
```

### Part 3: Optimize with useMemo/useCallback

Take your counter from Part 2 and:
1. Add console.log in Provider when value changes
2. Add console.log in consumers when they render
3. Without optimization, how many logs on each action?
4. Add useMemo and useCallback
5. How many logs now?

### Part 4: In the Codebase

1. Open `lib/context/AppContext.tsx`. List all the methods provided. What does each do?

2. Open `lib/hooks/useToast.tsx`. How does `toasts.slice(0, 1)` limit displayed toasts?

3. Find a component that uses `useAppContext()`. How does it use the context? Does it destructure?

4. Trace how `openSheet` works: from the button click to the sheet appearing.

---

**Previous: [Chapter 9 - Side Effects and Lifecycle](./09-effects-and-lifecycle.md)**

**Next: [Chapter 11 - Next.js Architecture](../part-4-nextjs/11-nextjs-architecture.md)**
