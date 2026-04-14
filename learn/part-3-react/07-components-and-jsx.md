# Chapter 7: Components and JSX

React is a JavaScript library for building user interfaces. Instead of manipulating the DOM directly, you describe what the UI should look like, and React handles the updates. This chapter introduces components, JSX, and props - the fundamental concepts of React.

---

## What You Will Learn

- What React is and why it exists
- Components: functions that return UI
- JSX: HTML-like syntax in JavaScript
- Props: passing data to components
- The virtual DOM and reconciliation
- Component composition

---

## Prerequisites

- Chapters 1-4: JavaScript fundamentals
- Chapters 5-6: TypeScript basics

---

## The Vocabulary

**Component** - A reusable piece of UI. A function that returns JSX.

**JSX** - JavaScript XML. A syntax extension that looks like HTML but compiles to JavaScript.

**Props** - Properties passed to a component. Read-only data from parent to child.

**Render** - When React calls your component to determine what UI to show.

**Virtual DOM** - React's internal representation of the UI, used to calculate efficient updates.

**Reconciliation** - The process of comparing virtual DOM trees to determine what changed.

**Children** - Content nested between a component's opening and closing tags.

**Composition** - Building complex UIs by combining simpler components.

---

## Section 1: What Is React?

### The Problem It Solves

Before React, building dynamic UIs meant manual DOM manipulation:

```javascript
// Vanilla JavaScript
const button = document.createElement("button");
button.textContent = "Click me";
button.addEventListener("click", () => {
  const count = parseInt(button.dataset.count || "0");
  button.dataset.count = count + 1;
  button.textContent = `Clicked ${count + 1} times`;
});
document.body.appendChild(button);
```

This gets complex quickly:
- Track what needs updating
- Find elements in the DOM
- Update them in the right order
- Handle all edge cases

### The React Solution

React lets you describe what the UI should look like:

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```

You describe the RESULT you want. React figures out HOW to achieve it.

### Declarative vs Imperative

**Imperative (vanilla JS):** Step-by-step instructions. "Create a button. Add text. Add listener. Append to body."

**Declarative (React):** Describe the desired state. "There should be a button showing the count. When clicked, the count increases."

React handles the imperative details for you.

---

## Section 2: Components

### The Concept

A component is a function that returns UI:

```tsx
function Greeting() {
  return <h1>Hello, world!</h1>;
}
```

Components:
- Start with a capital letter (required)
- Return JSX (or null)
- Can be reused anywhere

### In The Codebase: components/shared/Logo.tsx

```tsx
import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
  src?: string;
  priority?: boolean;
}

const LOGO_RATIO = 225 / 236;

export function Logo({ size = 28, className, src = "/logo_primary.svg", priority = false }: LogoProps) {
  return (
    <Image
      src={src}
      alt="Align."
      height={size}
      width={Math.round(size * LOGO_RATIO)}
      className={className}
      priority={priority}
    />
  );
}
```

This component:
- Defines an interface for its props
- Has default values for optional props
- Returns JSX (the `Image` component)
- Can be used anywhere: `<Logo size={40} />`

### Why Components Exist

Components enable:
1. **Reusability** - Define once, use anywhere
2. **Encapsulation** - Internal logic is hidden
3. **Composition** - Build complex UIs from simple parts
4. **Maintainability** - Change one place, affects everywhere

---

## Section 3: JSX

### The Concept

JSX looks like HTML but is actually JavaScript:

```tsx
const element = <h1 className="title">Hello, world!</h1>;
```

### What It Compiles To

JSX is syntax sugar for `React.createElement`:

```tsx
// This JSX:
const element = <h1 className="title">Hello, world!</h1>;

// Compiles to:
const element = React.createElement(
  "h1",
  { className: "title" },
  "Hello, world!"
);

// Which produces an object like:
{
  type: "h1",
  props: {
    className: "title",
    children: "Hello, world!"
  }
}
```

React uses these objects to build the virtual DOM.

### JSX Rules

**1. One root element:**
```tsx
// BAD
return (
  <h1>Title</h1>
  <p>Content</p>
);

// GOOD
return (
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
);

// OR use a Fragment
return (
  <>
    <h1>Title</h1>
    <p>Content</p>
  </>
);
```

**2. Close all tags:**
```tsx
// BAD
<img src="photo.jpg">
<input type="text">

// GOOD
<img src="photo.jpg" />
<input type="text" />
```

**3. className instead of class:**
```tsx
// BAD (class is a reserved word in JS)
<div class="container">

// GOOD
<div className="container">
```

**4. camelCase for attributes:**
```tsx
// BAD
<button onclick={handleClick} tabindex="0">

// GOOD
<button onClick={handleClick} tabIndex={0}>
```

### Embedding JavaScript in JSX

Use curly braces `{}` to embed JavaScript:

```tsx
const name = "Alice";
const items = ["apple", "banana", "cherry"];

return (
  <div>
    <h1>Hello, {name}!</h1>
    <p>2 + 2 = {2 + 2}</p>
    <ul>
      {items.map(item => <li key={item}>{item}</li>)}
    </ul>
  </div>
);
```

### In The Codebase: components/home/shared/DotRow.tsx

```tsx
export default function DotRow({ currentDay, lengthDays }: DotRowProps) {
  return (
    <div className="flex gap-1 items-center">
      {Array.from({ length: lengthDays }).map((_, index) => {
        const day = index + 1;
        if (day < currentDay) {
          return <div key={day} className="w-[8px] h-[8px] rounded-full bg-ink" />;
        }
        if (day === currentDay) {
          return <div key={day} className="w-[8px] h-[8px] rounded-full bg-slate animate-[pulse_1.8s_ease-in-out_infinite]" />;
        }
        return <div key={day} className="w-[8px] h-[8px] rounded-full border border-border bg-transparent" />;
      })}
    </div>
  );
}
```

This component:
- Creates an array of `lengthDays` items
- Maps each to a dot element
- Uses conditionals to style based on position
- Each dot has a `key` (required for lists)

---

## Section 4: Props

### The Concept

Props are inputs to components:

```tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

// Usage
<Greeting name="Alice" />
<Greeting name="Bob" />
```

### Props Are Read-Only

You cannot modify props inside a component:

```tsx
function BadComponent({ count }: { count: number }) {
  count = count + 1;  // This works but is wrong!
  return <div>{count}</div>;
}
```

Props flow one direction: parent to child. If you need to change data, use state (Chapter 8).

### Default Props

Use default parameters or TypeScript defaults:

```tsx
interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary";
}

function Button({ label, variant = "primary" }: ButtonProps) {
  return <button className={variant}>{label}</button>;
}

// Usage
<Button label="Click" />           // variant = "primary"
<Button label="Click" variant="secondary" />
```

### In The Codebase: components/home/shared/SectionHeader.tsx

```tsx
interface SectionHeaderProps {
  label: string;
  title: string;
  count: string;
  paddingTop?: number;
}

export default function SectionHeader({ label, title, count, paddingTop = 36 }: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-end pb-[10px]" style={{ paddingTop }}>
      <div>
        <div className="font-body text-[9px] font-medium tracking-[0.11em] uppercase text-dusk">{label}</div>
        <div className="font-gtw text-[31px] font-normal tracking-[-0.035em] leading-[1] text-ink whitespace-nowrap">{title}</div>
      </div>
      <div className="font-gtw text-[38px] font-light tracking-[-0.04em] leading-none text-ink opacity-[0.12] mb-[-1px]">{count}</div>
    </div>
  );
}
```

The props interface documents:
- `label`, `title`, `count` are required strings
- `paddingTop` is an optional number with default 36

### Children Prop

Content between component tags becomes `children`:

```tsx
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

// Usage
<Card>
  <h2>Title</h2>
  <p>Content goes here</p>
</Card>
```

`children` can be text, elements, or other components.

### Callback Props

Functions can be passed as props:

```tsx
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

function Button({ onClick, children }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// Usage
<Button onClick={() => console.log("Clicked!")}>
  Click me
</Button>
```

### In The Codebase: components/home/shared/MoveCard.tsx

```tsx
interface MoveCardProps {
  move: LocalMove;
  direction?: LocalDirection;
  tone: "warm" | "sage";
  onCardTap: () => void;
  onCheckTap: () => void;
  onDelete: (id: string) => void;
}

export default function MoveCard({ move, direction, tone, onCardTap, onCheckTap, onDelete }: MoveCardProps) {
  // ...
}
```

This component accepts:
- Data props: `move`, `direction`, `tone`
- Callback props: `onCardTap`, `onCheckTap`, `onDelete`

The parent component provides the data and handles the events.

---

## Section 5: The Virtual DOM

### The Concept

React does not update the real DOM directly. Instead:

1. Your component returns JSX
2. React creates a virtual DOM (plain JS objects)
3. React compares new virtual DOM with previous
4. React calculates minimal changes needed
5. React updates only what changed in the real DOM

```
Your Component
      |
      | Returns JSX
      v
Virtual DOM (new)
      |
      | Compare with...
      v
Virtual DOM (old)
      |
      | Calculate diff
      v
Minimal DOM Updates
```

### Why This Matters

DOM operations are slow. Minimizing them makes React fast.

```tsx
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>Counter</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

When you click the button:
- React re-runs `Counter()`
- New virtual DOM is created
- React compares: only the text content of `<p>` changed
- React updates ONLY that text node in the real DOM

The `<h1>` and `<button>` are untouched.

### Keys and Reconciliation

When rendering lists, React needs to identify each item:

```tsx
// BAD - no keys, React cannot track items
items.map(item => <li>{item.name}</li>)

// GOOD - keys help React track items
items.map(item => <li key={item.id}>{item.name}</li>)
```

Without keys, React re-renders the entire list. With keys, React knows which items changed, were added, or removed.

**Key rules:**
- Must be unique among siblings
- Must be stable (same item, same key)
- Do not use array index if items can reorder

---

## Section 6: Component Composition

### The Concept

Build complex UIs by combining simple components:

```tsx
function App() {
  return (
    <Page>
      <Header>
        <Logo />
        <Navigation />
      </Header>
      <Main>
        <Sidebar />
        <Content>
          <Article />
          <Comments />
        </Content>
      </Main>
      <Footer />
    </Page>
  );
}
```

Each component is simple. Together, they form a complete page.

### In The Codebase: Component Hierarchy

```
HomeApp
├── TodayView
│   ├── SectionHeader
│   ├── DotRow
│   ├── MoveCard (multiple)
│   ├── InfoCard
│   └── ...
├── WindowView
│   └── ...
├── LaterView
│   └── ...
└── ProfileView
    └── ...
```

Each view is a component. Each view contains smaller components. Each small component does one thing well.

### When to Create a New Component

Create a component when:
1. **Reuse** - You use the same UI in multiple places
2. **Complexity** - A piece of UI is getting too complex
3. **Responsibility** - A piece has a distinct purpose

Signs you might need to split:
- File is getting long (100+ lines)
- Too many props being passed through
- Logic is tangled with unrelated concerns

---

## Where Components Live in the Codebase

```
components/
├── home/
│   ├── HomeApp.tsx         <- Main app shell
│   ├── views/              <- Tab views
│   │   ├── TodayView.tsx
│   │   ├── WindowView.tsx
│   │   ├── LaterView.tsx
│   │   └── ProfileView.tsx
│   ├── sheets/             <- Bottom sheet modals
│   │   ├── SheetOverlay.tsx
│   │   ├── AddMoveSheet.tsx
│   │   └── ...
│   └── shared/             <- Reusable home components
│       ├── DotRow.tsx
│       ├── MoveCard.tsx
│       ├── InfoCard.tsx
│       └── SectionHeader.tsx
├── onboarding/
│   ├── OnboardingFlow.tsx  <- Onboarding orchestrator
│   └── screens/            <- Individual screens
└── shared/                 <- App-wide shared components
    ├── Logo.tsx
    ├── Toast.tsx
    └── ErrorBoundary.tsx
```

**Why this structure?**
- **By feature:** `home/`, `onboarding/` group related components
- **By type:** `views/`, `sheets/`, `shared/` within a feature
- **Shared at the right level:** `home/shared/` for home-only; `shared/` for app-wide

---

## Mistakes: What Breaks

### Mistake 1: Lowercase Component Names

```tsx
// BAD - React treats lowercase as DOM elements
function myButton() {
  return <button>Click</button>;
}
<myButton />  // React looks for <mybutton> DOM element

// GOOD - Capital letter
function MyButton() {
  return <button>Click</button>;
}
<MyButton />
```

### Mistake 2: Forgetting Keys

```tsx
// BAD - React warning, poor performance
{items.map(item => <Item data={item} />)}

// GOOD
{items.map(item => <Item key={item.id} data={item} />)}
```

**The error you will see:** "Warning: Each child in a list should have a unique 'key' prop."

### Mistake 3: Using Index as Key When Order Changes

```tsx
// BAD if items can be reordered or removed
{items.map((item, index) => <Item key={index} data={item} />)}

// GOOD
{items.map(item => <Item key={item.id} data={item} />)}
```

With index keys, removing item 0 causes all items to re-render because their keys changed.

### Mistake 4: Mutating Props

```tsx
function List({ items }: { items: string[] }) {
  items.push("new item");  // BAD - mutating prop
  return <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>;
}
```

Props should be treated as immutable. This can cause bugs in parent components.

### Mistake 5: Missing Return

```tsx
function Greeting({ name }: { name: string }) {
  <h1>Hello, {name}!</h1>;  // Missing return!
}
// Returns undefined, renders nothing
```

---

## Mental Debugging

When a component does not render correctly:

1. **Is it being called?** Add `console.log("Rendering MyComponent")` at the top.

2. **Check props.** Log them: `console.log("props:", props)`. Are they what you expect?

3. **Check the return.** Is there a return statement? Is the JSX correct?

4. **Check keys.** Are list items keyed properly? Are keys unique?

5. **Check the hierarchy.** Is the component mounted in the right place?

6. **Use React DevTools.** Install the browser extension. Inspect the component tree.

---

## Connections

**From Chapters 1-4:** Components are functions. JSX uses JavaScript expressions. Props use objects and destructuring.

**From Chapters 5-6:** Props interfaces use TypeScript. Component types are enforced.

**To Chapter 8:** State makes components interactive. Right now, components are static.

**To Chapter 9:** Effects let components interact with the outside world.

**To Chapter 11:** Next.js adds server components - components that render on the server.

---

## Go Figure It Out

1. **What is the difference between a "controlled" and "uncontrolled" component?** Hint: it relates to form inputs and who owns the state.

2. **What is "lifting state up"?** When two sibling components need the same data, where should the state live?

3. **What are "render props"?** A pattern where a prop is a function that returns JSX. Why would you use this?

4. **What is React.memo?** How does it prevent unnecessary re-renders?

5. **What is the difference between React.createElement and JSX?** Can you use React without JSX?

6. **Install React DevTools** in your browser. Open the Align app locally and explore the component tree.

---

## Chapter Exercise

### Part 1: Create a Component

Create `learn/exercises/sandbox/ch7-components.tsx`:

```tsx
// 1. Create a UserCard component that displays:
//    - name (string, required)
//    - email (string, required)
//    - avatar (string URL, optional with default placeholder)
//    - isOnline (boolean, optional, default false)
// Define the props interface

// 2. Create a UserList component that:
//    - Takes an array of users
//    - Renders a UserCard for each
//    - Handles empty array case

// 3. Create a Badge component that uses children:
//    <Badge variant="success">Active</Badge>
//    variant can be "success", "warning", "error"
```

### Part 2: In the Codebase

1. Open `components/home/shared/DotRow.tsx`. How does it decide which style to apply to each dot?

2. Open `components/home/shared/MoveCard.tsx`. Find all the callback props. What events do they handle?

3. Find where `SectionHeader` is used. What values are passed for each prop?

### Part 3: Trace the Rendering

Given this code:

```tsx
function Parent() {
  console.log("Parent rendering");
  return (
    <div>
      <Child name="Alice" />
      <Child name="Bob" />
    </div>
  );
}

function Child({ name }: { name: string }) {
  console.log(`Child ${name} rendering`);
  return <p>Hello, {name}</p>;
}
```

What is logged when `<Parent />` is mounted? In what order?

---

**Previous: [Chapter 6 - Advanced TypeScript](../part-2-typescript/06-advanced-typescript.md)**

**Next: [Chapter 8 - State and Interactivity](./08-state-and-interactivity.md)**
