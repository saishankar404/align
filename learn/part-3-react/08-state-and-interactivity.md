# Chapter 8: State and Interactivity

Components become interactive when they can respond to user input and change over time. State is data that a component owns and can modify. This chapter covers useState, event handling, and form patterns.

---

## What You Will Learn

- What state is and how it differs from props
- The useState hook
- Event handling in React
- Controlled vs uncontrolled inputs
- Form patterns and validation
- Why state updates are asynchronous
- Common state patterns in the codebase

---

## Prerequisites

- Chapter 7: Components and JSX (components, props)

---

## The Vocabulary

**State** - Data owned by a component that can change over time. When state changes, the component re-renders.

**useState** - A React hook that creates a state variable and a function to update it.

**Hook** - A function that lets you use React features (like state) inside a function component. Always starts with `use`.

**Setter function** - The function returned by useState that updates the state value.

**Re-render** - When React calls your component again because state or props changed.

**Event handler** - A function that runs in response to user actions (click, type, submit).

**Controlled component** - A form input whose value is controlled by React state.

**Uncontrolled component** - A form input that manages its own state internally.

**Derived state** - Values calculated from existing state rather than stored separately.

---

## Section 1: What Is State?

### The Problem

Props are read-only. What if a component needs to track data that changes?

```tsx
function Counter() {
  let count = 0;
  
  function handleClick() {
    count = count + 1;
    console.log(count);  // This updates...
  }
  
  return (
    <button onClick={handleClick}>
      Count: {count}  // But this never changes!
    </button>
  );
}
```

The variable updates, but React does not know to re-render. The UI stays at 0.

### The Solution: State

State is data that React tracks. When it changes, React re-renders:

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  
  function handleClick() {
    setCount(count + 1);  // Tell React to update
  }
  
  return (
    <button onClick={handleClick}>
      Count: {count}  // Updates!
    </button>
  );
}
```

### Props vs State

| Props | State |
|-------|-------|
| Passed from parent | Owned by component |
| Read-only | Can be modified |
| Parent controls | Component controls |
| Changes cause re-render | Changes cause re-render |

Think of props as arguments to a function. State is like a component's memory.

---

## Section 2: The useState Hook

### Syntax

```tsx
const [value, setValue] = useState(initialValue);
```

- `value` - Current state value
- `setValue` - Function to update state
- `initialValue` - Starting value (only used on first render)

### The Array Destructuring

useState returns an array of two items:

```tsx
// This:
const [count, setCount] = useState(0);

// Is equivalent to:
const stateArray = useState(0);
const count = stateArray[0];
const setCount = stateArray[1];
```

You can name the variables anything, but the convention is `[thing, setThing]`.

### In The Codebase: components/home/sheets/NightCheckinSheet.tsx

```tsx
import { useState } from "react";

export default function NightCheckinSheet() {
  const [loading, setLoading] = useState<"showed_up" | "avoided" | null>(null);
  
  // loading starts as null
  // Can be set to "showed_up" or "avoided" during async operations
  // TypeScript knows the type from the generic
}
```

The type annotation `<"showed_up" | "avoided" | null>` tells TypeScript exactly what values are valid.

### Multiple State Variables

One component can have many state variables:

```tsx
function Form() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Each is independent
}
```

### In The Codebase: components/home/sheets/AddMoveSheet.tsx:14-17

```tsx
const [title, setTitle] = useState("");
const [selectedDirectionId, setSelectedDirectionId] = useState<string>("");
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);
```

Four separate concerns:
- `title` - What the user is typing
- `selectedDirectionId` - Which direction is selected
- `error` - Error message to display
- `loading` - Whether we are saving

---

## Section 3: Updating State

### Basic Updates

```tsx
setCount(5);         // Set to specific value
setCount(count + 1); // Set based on current value
```

### Functional Updates

When the new value depends on the old value, use a function:

```tsx
// These might not work correctly in rapid succession:
setCount(count + 1);
setCount(count + 1);
// Both might read the same count!

// Use functional updates:
setCount(prev => prev + 1);
setCount(prev => prev + 1);
// Each reads the latest value
```

Why? State updates are asynchronous and batched. Multiple calls in the same event might all see the same "old" value.

### In The Codebase: components/onboarding/screens/NameScreen.tsx:175

```tsx
onChange={(event) => setData((prev) => ({ ...prev, name: event.target.value }))}
```

This pattern:
1. Takes the previous state object
2. Spreads it (`...prev`) to copy all fields
3. Overrides just the `name` field
4. Returns the new object

This is the standard pattern for updating one field in an object state.

### State Updates Are Asynchronous

```tsx
function Example() {
  const [count, setCount] = useState(0);
  
  function handleClick() {
    setCount(1);
    console.log(count);  // Still 0!
  }
}
```

`setCount` schedules an update. The component will re-render, and THEN `count` will be 1. The console.log runs before the re-render.

### What It Compiles To

React's useState maintains state in an internal data structure. Conceptually:

```javascript
// React maintains something like this internally:
const componentStates = new Map();

function useState(initialValue) {
  const componentId = getCurrentlyRenderingComponent();
  const stateIndex = getCurrentStateIndex();
  
  if (!componentStates.has(componentId)) {
    componentStates.set(componentId, []);
  }
  
  const states = componentStates.get(componentId);
  
  if (states[stateIndex] === undefined) {
    states[stateIndex] = initialValue;
  }
  
  function setState(newValue) {
    states[stateIndex] = newValue;
    scheduleRerender(componentId);
  }
  
  return [states[stateIndex], setState];
}
```

This is simplified, but shows why:
- State persists between renders
- The order of hooks matters (they are stored by index)
- Setting state triggers a re-render

---

## Section 4: Event Handling

### The Concept

Events let users interact with your UI:

```tsx
function Button() {
  function handleClick() {
    console.log("Clicked!");
  }
  
  return <button onClick={handleClick}>Click me</button>;
}
```

### Event Handler Naming

Convention: `handle` + event name

```tsx
function Form() {
  function handleSubmit(event: React.FormEvent) { /* ... */ }
  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) { /* ... */ }
  function handleEmailBlur() { /* ... */ }
  
  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleNameChange} onBlur={handleEmailBlur} />
    </form>
  );
}
```

### Inline Handlers

For simple operations, inline is fine:

```tsx
<button onClick={() => setCount(count + 1)}>+</button>
```

For complex logic, extract a function for readability.

### Common Events

| Event | When it fires |
|-------|---------------|
| onClick | User clicks element |
| onChange | Input value changes |
| onSubmit | Form is submitted |
| onFocus | Element gains focus |
| onBlur | Element loses focus |
| onKeyDown | Key is pressed down |
| onKeyUp | Key is released |
| onMouseEnter | Mouse enters element |
| onMouseLeave | Mouse leaves element |

### The Event Object

Event handlers receive an event object:

```tsx
function Input() {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    console.log(event.target.value);  // The input's current value
  }
  
  return <input onChange={handleChange} />;
}
```

### In The Codebase: components/home/sheets/AddMoveSheet.tsx:86-92

```tsx
<input
  value={title}
  onChange={(event) => setTitle(event.target.value)}
  placeholder="e.g. write the hero copy"
  className="w-full px-4 py-[14px] border-[1.5px] border-dashed border-bs rounded-[10px] font-body text-[15px] text-ink bg-transparent outline-none mb-[10px]"
  maxLength={80}
/>
```

The pattern:
1. `value={title}` - Display current state
2. `onChange={(event) => setTitle(event.target.value)}` - Update state on every keystroke

This is a "controlled input" - React controls the value.

### Preventing Default Behavior

Some events have default browser behavior. Forms submit and reload the page. Links navigate. To prevent:

```tsx
function Form() {
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();  // Stop page reload
    // Handle submission manually
  }
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Stopping Propagation

Events bubble up through the DOM. To stop:

```tsx
function Card() {
  return (
    <div onClick={() => console.log("Card clicked")}>
      <button onClick={(event) => {
        event.stopPropagation();  // Card onClick won't fire
        console.log("Button clicked");
      }}>
        Click me
      </button>
    </div>
  );
}
```

### In The Codebase: components/home/shared/MoveCard.tsx:314-318

```tsx
onClick={(event) => {
  event.stopPropagation();
  if (done) return;
  onCheckTap();
}}
```

The checkmark button is inside the card. Without `stopPropagation()`, clicking the checkmark would also trigger the card's click handler.

---

## Section 5: Controlled Components

### The Pattern

A controlled component's value is controlled by React state:

```tsx
function ControlledInput() {
  const [value, setValue] = useState("");
  
  return (
    <input
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
}
```

React is the "source of truth." The input always displays what state holds.

### Why Use Controlled Components?

1. **Validation** - Check input before accepting it
2. **Formatting** - Transform input as user types
3. **Conditional disable** - Enable submit only when valid
4. **Synchronized values** - Multiple inputs derived from same data

### In The Codebase: components/onboarding/screens/NameScreen.tsx:178-191

```tsx
<input
  ref={ageInputRef}
  className="fixed left-[-9999px] top-[-9999px] opacity-0"
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  value={age}
  onFocus={() => setAgeFocused(true)}
  onBlur={() => setAgeFocused(false)}
  onChange={(event) => {
    const digitsOnly = event.target.value.replace(/\D+/g, "").slice(0, 2);
    setData((prev) => ({ ...prev, age: digitsOnly }));
  }}
/>
```

This input:
- Is hidden off-screen (custom UI shows the value)
- Only accepts digits (filters non-digits)
- Limits to 2 characters
- Updates parent state on change

The `replace(/\D+/g, "")` strips anything that is not a digit. The `.slice(0, 2)` limits to two characters. This transforms input before storing it.

### Validation Example

```tsx
function EmailInput() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setEmail(value);
    
    // Validate on every change
    if (value && !value.includes("@")) {
      setError("Please enter a valid email");
    } else {
      setError(null);
    }
  }
  
  return (
    <div>
      <input value={email} onChange={handleChange} />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

### In The Codebase: components/home/sheets/AddMoveSheet.tsx:19-20

```tsx
const isFull = context.todayMoves.length >= 3;
const canSave = title.trim().length >= 1 && title.trim().length <= 80 && selectedDirectionId.length > 0;
```

These are "derived state" - computed from actual state. They are not stored with useState because they can be calculated.

`canSave` determines if the submit button should be enabled. It checks:
- Title is not empty
- Title is not too long
- A direction is selected

---

## Section 6: Form Patterns

### Complete Form Example

```tsx
function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const canSubmit = name.trim().length > 0 && email.includes("@");
  
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await submitForm({ name, email });
      // Success - maybe redirect or show message
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        disabled={loading}
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        disabled={loading}
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" disabled={loading || !canSubmit}>
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

### In The Codebase: components/home/sheets/AddMoveSheet.tsx:33-68

```tsx
const save = async () => {
  if (!context.userId || !context.currentCycle) return;
  const moveCount = await db.moves.where("[userId+date]").equals([context.userId, todayStr()]).count();
  if (moveCount >= 3) {
    setError("3 moves max for today. Window's full.");
    await context.refresh();
    return;
  }
  if (!canSave || !selectedDirection) {
    setError("Add a title and pick a direction.");
    return;
  }

  setLoading(true);
  setError(null);
  const now = new Date().toISOString();

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
    _synced: 0,
  });

  await context.refresh();
  context.closeSheet();
  requestSyncIfCloud(context.userId);
  setLoading(false);
  setTitle("");
};
```

The pattern:
1. **Guard clauses** - Return early if preconditions fail
2. **Validation** - Check constraints before proceeding
3. **Loading state** - Show feedback during async work
4. **Error handling** - Display errors, clear on retry
5. **Success cleanup** - Reset form, close modal, sync

### Selection State

For selecting from a list:

```tsx
const [selectedId, setSelectedId] = useState<string>("");

return (
  <div>
    {options.map((option) => (
      <button
        key={option.id}
        onClick={() => setSelectedId(option.id)}
        className={selectedId === option.id ? "bg-black text-white" : "bg-gray-100"}
      >
        {option.name}
      </button>
    ))}
  </div>
);
```

### In The Codebase: components/home/sheets/AddMoveSheet.tsx:95-105

```tsx
<div className="flex flex-wrap gap-[7px] mb-5">
  {context.directions.map((direction) => (
    <button
      key={direction.id}
      onClick={() => setSelectedDirectionId(direction.id)}
      className={`font-body text-[12px] px-[13px] py-[6px] rounded-full border ${selectedDirectionId === direction.id ? "bg-ink border-ink text-parchment" : "border-border text-dusk"}`}
    >
      {direction.title}
    </button>
  ))}
</div>
```

Clicking a direction button sets its ID as selected. The className changes based on whether the ID matches.

---

## Section 7: State Design Principles

### Keep State Minimal

Only store what you cannot compute:

```tsx
// BAD - redundant state
const [items, setItems] = useState<Item[]>([]);
const [itemCount, setItemCount] = useState(0);  // Can be computed!

// GOOD - derived value
const [items, setItems] = useState<Item[]>([]);
const itemCount = items.length;  // Computed, not stored
```

### In The Codebase: Derived Values

From `components/home/sheets/AddMoveSheet.tsx`:

```tsx
// These are computed, not stored:
const isFull = context.todayMoves.length >= 3;
const canSave = title.trim().length >= 1 && title.trim().length <= 80 && selectedDirectionId.length > 0;

const selectedDirection = useMemo(
  () => context.directions.find((item) => item.id === selectedDirectionId),
  [context.directions, selectedDirectionId]
);
```

`selectedDirection` is found from the array using the ID. No need to store it separately.

### Colocate State

Put state in the component that uses it. Lift it up only when siblings need to share it.

```tsx
// State in parent when children need to share
function Parent() {
  const [selected, setSelected] = useState<string | null>(null);
  
  return (
    <>
      <ChildA selected={selected} onSelect={setSelected} />
      <ChildB selected={selected} />
    </>
  );
}
```

### Group Related State

When state values always change together:

```tsx
// BAD - separate but always updated together
const [x, setX] = useState(0);
const [y, setY] = useState(0);

function handleMove(newX: number, newY: number) {
  setX(newX);
  setY(newY);
}

// GOOD - grouped
const [position, setPosition] = useState({ x: 0, y: 0 });

function handleMove(newX: number, newY: number) {
  setPosition({ x: newX, y: newY });
}
```

But do not group unrelated state:

```tsx
// BAD - unrelated values grouped
const [state, setState] = useState({
  name: "",
  isLoading: false,
  theme: "dark"
});

// GOOD - separate concerns
const [name, setName] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [theme, setTheme] = useState("dark");
```

---

## Section 8: Loading and Error States

### The Pattern

Most async operations need three states:

```tsx
type AsyncState = "idle" | "loading" | "success" | "error";
const [status, setStatus] = useState<AsyncState>("idle");
const [error, setError] = useState<string | null>(null);
```

Or track loading separately:

```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### In The Codebase: components/home/sheets/MarkDoneSheet.tsx

```tsx
const [loading, setLoading] = useState(false);
```

Simple boolean - either saving or not.

### In The Codebase: components/home/views/ProfileView.tsx:80

```tsx
const [syncState, setSyncState] = useState<"idle" | "syncing" | "ok" | "error">("idle");
```

Union type - four distinct states with semantic meaning.

### Rendering Based on State

```tsx
function AsyncContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Data | null>(null);
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return <EmptyState />;
  return <Content data={data} />;
}
```

### In The Codebase: components/home/sheets/AddMoveSheet.tsx:75-80

```tsx
{isFull ? (
  <>
    <div className="font-gtw text-[26px] tracking-[-0.025em] leading-[1.15] text-ink mb-2">Window&apos;s full.</div>
    <p className="font-body text-[14px] text-dusk leading-[1.65] mb-6">You already have 3 moves today.</p>
    <button onClick={context.closeSheet} className="w-full px-4 py-4 rounded-full bg-ink text-parchment font-gtw text-[14px] tracking-[-0.01em]">Close</button>
  </>
) : (
  // ... normal form
)}
```

The component checks `isFull` first and shows a different UI entirely.

---

## Section 9: Focus and Input State

### Tracking Focus

```tsx
const [focused, setFocused] = useState(false);

return (
  <input
    onFocus={() => setFocused(true)}
    onBlur={() => setFocused(false)}
    className={focused ? "ring-2 ring-blue-500" : ""}
  />
);
```

### In The Codebase: components/onboarding/screens/NameScreen.tsx:19-20

```tsx
const [nameFocused, setNameFocused] = useState(false);
const [ageFocused, setAgeFocused] = useState(false);
```

And on the inputs:

```tsx
onFocus={() => setNameFocused(true)}
onBlur={() => setNameFocused(false)}
```

This enables showing a custom cursor animation only when the hidden input is focused.

### Refs for Focus Management

Sometimes you need to focus an input programmatically:

```tsx
import { useRef } from "react";

function Form() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  function focusInput() {
    inputRef.current?.focus();
  }
  
  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>Focus the input</button>
    </>
  );
}
```

This will be covered more in Chapter 9 (useRef).

---

## Why Not Other Approaches?

### Why Not Just Variables?

```tsx
// This does not work
function Counter() {
  let count = 0;
  return <button onClick={() => count++}>{count}</button>;
}
```

Variables reset every render. State persists.

### Why Not Modify State Directly?

```tsx
const [user, setUser] = useState({ name: "Alice", age: 30 });

// BAD - mutating state
user.name = "Bob";  // React does not know this happened

// GOOD - new object
setUser({ ...user, name: "Bob" });  // React sees the update
```

React uses reference equality. Same object reference = no change detected.

### Why Not Store Everything in One State?

```tsx
// BAD - everything in one object
const [state, setState] = useState({
  name: "",
  email: "",
  loading: false,
  error: null,
  theme: "light",
  notifications: []
});

// Update is verbose
setState(prev => ({ ...prev, name: "Alice" }));
```

Better to split by concern. Easier to update, easier to reason about.

---

## Mistakes: What Breaks

### Mistake 1: Stale State in Event Handlers

```tsx
function Timer() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);  // BUG: count is always 0!
    }, 1000);
    return () => clearInterval(id);
  }, []);
}
```

The callback captures `count` from the first render. Fix: use functional update:

```tsx
setCount(prev => prev + 1);  // Always reads latest
```

### Mistake 2: Setting State in Render

```tsx
function BadComponent() {
  const [count, setCount] = useState(0);
  setCount(1);  // BUG: infinite loop!
  return <div>{count}</div>;
}
```

Setting state during render causes another render, which sets state again. Only set state in event handlers or effects.

### Mistake 3: Forgetting That Updates Are Async

```tsx
function Form() {
  const [value, setValue] = useState("");
  
  function handleSubmit() {
    setValue("submitted");
    console.log(value);  // Still the OLD value!
    sendToServer(value); // Sends old value!
  }
}
```

If you need the new value immediately, use a variable:

```tsx
function handleSubmit() {
  const newValue = "submitted";
  setValue(newValue);
  sendToServer(newValue);  // Use the variable
}
```

### Mistake 4: Mutating Arrays

```tsx
const [items, setItems] = useState(["a", "b", "c"]);

// BAD - mutation
items.push("d");
setItems(items);  // Same reference, React sees no change

// GOOD - new array
setItems([...items, "d"]);
```

### Mistake 5: Wrong Event Type

```tsx
// TypeScript error: onChange expects ChangeEvent, not MouseEvent
function handleChange(event: React.MouseEvent) {
  console.log(event.target.value);  // Error!
}

<input onChange={handleChange} />  // Type mismatch
```

Use the correct event type:
- `onChange` on inputs: `React.ChangeEvent<HTMLInputElement>`
- `onClick` on buttons: `React.MouseEvent<HTMLButtonElement>`
- `onSubmit` on forms: `React.FormEvent<HTMLFormElement>`

---

## Mental Debugging

When state does not work as expected:

1. **Log the state.** Before and after setting. Is it what you expect?

2. **Check when you set state.** Is it in an event handler? Effect? (Not during render?)

3. **Check for stale closures.** Is your callback capturing an old value? Use functional updates.

4. **Check for mutations.** Are you modifying the state object/array directly?

5. **Use React DevTools.** The Components tab shows current state values.

6. **Check the re-render.** Add a console.log at the top of the component. Does it run when you expect?

---

## Connections

**From Chapter 7:** State makes the static components we built interactive. Props receive data, state owns data.

**From Chapters 2-4:** Event handlers are callbacks (functions passed around). Async/await applies to form submissions.

**To Chapter 9:** Effects let us run code when state changes. Loading data, subscriptions, timers.

**To Chapter 10:** Context shares state across many components without prop drilling.

---

## Go Figure It Out

1. **What is "batching"?** React batches multiple setState calls in the same event. Why? What changed in React 18?

2. **What is a "reducer"?** The useReducer hook is an alternative to useState. When would you use it?

3. **What is "controlled vs uncontrolled"?** We covered controlled. When would you use an uncontrolled input with a ref?

4. **What is "optimistic UI"?** Updating the UI before the server confirms. How would you implement it?

5. **What happens if you call useState conditionally?** Why does React enforce calling hooks in the same order every render?

---

## Chapter Exercise

### Part 1: Build a Counter

Create `learn/exercises/sandbox/ch8-counter.tsx`:

```tsx
// Build a counter with:
// 1. Display the count
// 2. Increment button (+1)
// 3. Decrement button (-1)
// 4. Reset button (back to 0)
// 5. Cannot go below 0 (decrement disabled or ignored)
```

### Part 2: Build a Form

Create `learn/exercises/sandbox/ch8-form.tsx`:

```tsx
// Build a signup form with:
// 1. Name input (required, at least 2 characters)
// 2. Email input (required, must contain @)
// 3. Age input (optional, only digits, max 2 digits)
// 4. Submit button (disabled unless valid)
// 5. Show validation errors below each field
// 6. Show loading state during submit
// 7. Log form data on successful submit
```

### Part 3: Selection Component

```tsx
// Build a color picker:
// 1. Array of colors: ["red", "blue", "green", "yellow"]
// 2. Show a button for each color
// 3. Track which color is selected (or null if none)
// 4. Selected button should look different (your choice)
// 5. Show "Selected: {color}" below, or "None selected"
```

### Part 4: In the Codebase

1. Open `components/home/sheets/AddMoveSheet.tsx`. Trace how `title` flows from input to save function.

2. Open `components/onboarding/screens/NameScreen.tsx`. Why is the actual input hidden off-screen? How does the visible text display what the user types?

3. Find another component with loading state. How does it handle the three phases: idle, loading, done?

---

**Previous: [Chapter 7 - Components and JSX](./07-components-and-jsx.md)**

**Next: [Chapter 9 - Side Effects and Lifecycle](./09-effects-and-lifecycle.md)**
