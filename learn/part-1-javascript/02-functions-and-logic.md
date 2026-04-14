# Chapter 2: Functions and Logic

Functions are the building blocks of programs. They let you write code once and use it many times. In this chapter, you will learn how to create functions, how JavaScript executes them, and how to control the flow of your program with conditional logic.

---

## What You Will Learn

- How to define and call functions
- The difference between regular functions and arrow functions
- Parameters, arguments, and return values
- How the call stack works
- Conditional statements (if/else)
- Closures and why they matter
- Scope and where variables live

---

## Prerequisites

- Chapter 1: Variables, types, operators

---

## The Vocabulary

**Function** - A reusable block of code that performs a task. You define it once, call it many times.

**Parameter** - A variable in the function definition. Like a placeholder.

**Argument** - The actual value you pass when calling the function.

**Return value** - What the function gives back when it finishes.

**Call / Invoke** - Running a function. `doSomething()` calls the function.

**Declaration** - Creating a function with the `function` keyword.

**Expression** - Creating a function as a value (arrow functions, anonymous functions).

**Scope** - Where a variable exists and can be accessed.

**Closure** - A function that remembers variables from where it was created.

**Call stack** - The list of functions currently running, in order.

---

## Section 1: Defining Functions

### The Concept

A function is a named block of code:

```javascript
function greet(name) {
  return "Hello, " + name + "!";
}
```

You call it by using its name with parentheses:

```javascript
const message = greet("Alice");  // "Hello, Alice!"
```

### The Parts of a Function

```javascript
function calculateTotal(price, quantity) {
  const total = price * quantity;
  return total;
}
//       |            |             |
//     name      parameters       body
```

- **Name** - How you refer to the function
- **Parameters** - Inputs the function expects (can be zero or more)
- **Body** - The code that runs when called
- **Return** - What gets sent back to the caller

### Why Functions Exist

Without functions, you would copy-paste code everywhere:

```javascript
// Without functions - repetitive and error-prone
const total1 = 10 * 2;
const total2 = 15 * 3;
const total3 = 8 * 4;

// With functions - write once, use anywhere
function calculateTotal(price, quantity) {
  return price * quantity;
}
const total1 = calculateTotal(10, 2);
const total2 = calculateTotal(15, 3);
const total3 = calculateTotal(8, 4);
```

Functions let you:
- Avoid repetition
- Give meaningful names to operations
- Test and debug in one place
- Change behavior everywhere by changing one place

### In The Codebase: lib/utils/ids.ts

```typescript
export function newId(): string {
  return crypto.randomUUID();
}
```

This is a minimal function:
- Named `newId`
- Takes no parameters
- Returns a string (the UUID)

Every time Align creates a move, cycle, or direction, it calls `newId()` to generate a unique identifier.

**Why a function and not just `crypto.randomUUID()` everywhere?**
1. If we ever need to change ID format, we change one place
2. The name `newId` is clearer than the raw API
3. We can add validation or logging later without changing callers

### In The Codebase: lib/cycle/close.ts

```typescript
export function isCycleExpired(cycle: { endDate: string; status: string }): boolean {
  return cycle.status === "active" && isAfter(startOfDay(new Date()), startOfDay(parseISO(cycle.endDate)));
}
```

This function:
- Takes a `cycle` object with specific properties
- Returns a boolean (true/false)
- Uses logical AND (`&&`) to check two conditions

Let's break down the logic:

```typescript
cycle.status === "active"  // Is the cycle still active?
&&                         // AND
isAfter(                   // Is today after the end date?
  startOfDay(new Date()),        // Today at midnight
  startOfDay(parseISO(cycle.endDate))  // End date at midnight
)
```

Both conditions must be true for the cycle to be expired.

---

## Section 2: Arrow Functions

### The Concept

Arrow functions are a shorter syntax for functions:

```javascript
// Regular function
function double(x) {
  return x * 2;
}

// Arrow function
const double = (x) => {
  return x * 2;
};

// Even shorter - implicit return
const double = (x) => x * 2;
```

### The Syntax Variations

```javascript
// Multiple parameters
const add = (a, b) => a + b;

// Single parameter - parentheses optional
const square = x => x * x;

// No parameters - parentheses required
const sayHello = () => "Hello!";

// Multiple lines - braces and return required
const complex = (x) => {
  const doubled = x * 2;
  const result = doubled + 1;
  return result;
};
```

### Why Arrow Functions Exist

1. **Shorter syntax** - Less typing for simple functions
2. **Lexical `this`** - They inherit `this` from surrounding code (critical for React)
3. **Implicit return** - One-liners can skip `return` keyword

### In The Codebase: lib/hooks/useOnline.ts

```typescript
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
```

Every function here is an arrow function:
- `() => setOnline(true)` - Called when browser goes online
- `() => setOnline(false)` - Called when browser goes offline
- The `useEffect` callback itself is an arrow function
- The return (cleanup function) is an arrow function

**Why arrows here?** These are callbacks - functions passed to other functions. Arrow syntax is cleaner and the lexical `this` binding works correctly with React.

### Regular vs Arrow: When to Use Which

| Use Regular Functions | Use Arrow Functions |
|----------------------|---------------------|
| Top-level named functions | Callbacks |
| Methods in objects (sometimes) | Inline short functions |
| When you need `this` binding | When you need surrounding `this` |
| Constructor functions | Array methods (.map, .filter) |

The Align codebase convention:
- **Top-level exports**: Regular functions (`export function newId()`)
- **Callbacks and handlers**: Arrow functions (`() => setOnline(true)`)

---

## Section 3: Parameters and Arguments

### The Concept

Parameters are variables in the function definition. Arguments are values you pass when calling.

```javascript
function greet(name, greeting) {  // name, greeting are PARAMETERS
  return `${greeting}, ${name}!`;
}

greet("Alice", "Hello");  // "Alice", "Hello" are ARGUMENTS
```

### Default Parameters

You can provide default values:

```javascript
function greet(name, greeting = "Hello") {
  return `${greeting}, ${name}!`;
}

greet("Alice");           // "Hello, Alice!" (used default)
greet("Bob", "Hi");       // "Hi, Bob!" (used argument)
```

### In The Codebase: lib/cycle/create.ts

```typescript
export async function createNewCycle(
  userId: string, 
  directions: string[], 
  lengthDays: 7 | 14
): Promise<string> {
```

Three parameters:
- `userId` - Who is creating the cycle
- `directions` - Array of direction titles
- `lengthDays` - Either 7 or 14 (this type constraint is TypeScript)

### Rest Parameters

Sometimes you want to accept any number of arguments:

```javascript
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

sum(1, 2);          // 3
sum(1, 2, 3, 4, 5); // 15
```

### In The Codebase: lib/utils/debug.ts

```typescript
export function debug(...args: unknown[]): void {
  if (process.env.NODE_ENV === "development") {
    console.log("[align]", ...args);
  }
}
```

`...args` means "collect ALL arguments into an array called args."

Then `...args` inside `console.log` spreads them back out.

```javascript
debug("syncing", tableName, count);
// Inside the function: args = ["syncing", tableName, count]
// console.log("[align]", "syncing", tableName, count)
```

---

## Section 4: Return Values

### The Concept

Functions can send back a value using `return`:

```javascript
function add(a, b) {
  return a + b;  // Sends this value back
}

const result = add(2, 3);  // result is 5
```

### Returning Early

`return` also exits the function immediately:

```javascript
function divide(a, b) {
  if (b === 0) {
    return null;  // Exit early, avoid division by zero
  }
  return a / b;
}
```

### Functions Without Return

If a function has no `return`, it returns `undefined`:

```javascript
function logMessage(msg) {
  console.log(msg);
  // no return - implicitly returns undefined
}

const result = logMessage("hello");
console.log(result);  // undefined
```

### In The Codebase: lib/cycle/close.ts

```typescript
export async function closeCycle(cycleId: string): Promise<void> {
  await db.cycles.update(cycleId, {
    status: "closed",
    closedAt: new Date().toISOString(),
    _synced: 0,
  });
}
```

Return type is `Promise<void>` - this means "returns a Promise that resolves to nothing." The function performs an action (updating the database) but does not need to give back any data.

Compare to:

```typescript
export function isCycleExpired(cycle: {...}): boolean {
  return cycle.status === "active" && isAfter(...);
}
```

This returns `boolean` because the caller needs to know: true or false?

---

## Section 5: Conditionals - if/else

### The Concept

Conditionals let your code make decisions:

```javascript
if (condition) {
  // runs if condition is truthy
} else {
  // runs if condition is falsy
}
```

### Truthy and Falsy

JavaScript treats some values as "false-like" in conditions:

**Falsy values:**
- `false`
- `0`
- `""` (empty string)
- `null`
- `undefined`
- `NaN`

Everything else is truthy, including:
- `"0"` (string with zero)
- `[]` (empty array)
- `{}` (empty object)

```javascript
if ("hello") {
  // This runs - non-empty string is truthy
}

if (0) {
  // This does NOT run - 0 is falsy
}
```

### Multiple Conditions: else if

```javascript
function getGrade(score) {
  if (score >= 90) {
    return "A";
  } else if (score >= 80) {
    return "B";
  } else if (score >= 70) {
    return "C";
  } else {
    return "F";
  }
}
```

### Combining Conditions

```javascript
// AND - both must be true
if (isLoggedIn && hasPermission) {
  showAdminPanel();
}

// OR - at least one must be true
if (isAdmin || isModerator) {
  showModTools();
}

// NOT - inverts
if (!isLoading) {
  showContent();
}
```

### In The Codebase: lib/cycle/close.ts

```typescript
export function isCycleExpired(cycle: { endDate: string; status: string }): boolean {
  return cycle.status === "active" && isAfter(startOfDay(new Date()), startOfDay(parseISO(cycle.endDate)));
}
```

This is a conditional in disguise. The `&&` operator returns:
- The second value if the first is truthy
- The first value if it is falsy

So this reads: "Return true only if status is active AND today is after end date."

### The Ternary Operator

A shorthand for simple if/else:

```javascript
// Long form
let message;
if (count > 0) {
  message = "You have items";
} else {
  message = "Your cart is empty";
}

// Ternary
const message = count > 0 ? "You have items" : "Your cart is empty";
//              condition ? if true         : if false
```

The Align codebase uses ternaries frequently in JSX for conditional rendering.

---

## Section 6: The Call Stack

### The Concept

When a function calls another function, JavaScript keeps track with the "call stack":

```javascript
function first() {
  console.log("first start");
  second();
  console.log("first end");
}

function second() {
  console.log("second start");
  third();
  console.log("second end");
}

function third() {
  console.log("third");
}

first();
```

Output:
```
first start
second start
third
second end
first end
```

The call stack:
```
1. first() called - push onto stack
   Stack: [first]

2. first calls second() - push
   Stack: [first, second]

3. second calls third() - push
   Stack: [first, second, third]

4. third finishes - pop
   Stack: [first, second]

5. second finishes - pop
   Stack: [first]

6. first finishes - pop
   Stack: []
```

### Why This Matters

When you see an error in the browser console, you see a "stack trace":

```
Error: Something went wrong
    at third (script.js:12)
    at second (script.js:8)
    at first (script.js:4)
```

This tells you the chain of function calls that led to the error.

### Stack Overflow

The stack has a limit. If a function calls itself forever:

```javascript
function infinite() {
  infinite();  // Calls itself
}
infinite();  // RangeError: Maximum call stack size exceeded
```

This is a "stack overflow" - the stack ran out of space.

---

## Section 7: Scope

### The Concept

Scope determines where variables exist and can be accessed.

### Block Scope (let, const)

Variables declared with `let` or `const` exist only within their block `{}`:

```javascript
function example() {
  const outer = "I'm outside";
  
  if (true) {
    const inner = "I'm inside";
    console.log(outer);  // Works - can see outer scope
    console.log(inner);  // Works - we're inside
  }
  
  console.log(outer);  // Works
  console.log(inner);  // ERROR - inner doesn't exist here
}
```

### Function Scope

Each function creates its own scope:

```javascript
function outer() {
  const x = 1;
  
  function inner() {
    const y = 2;
    console.log(x);  // Works - can see parent scope
    console.log(y);  // Works
  }
  
  console.log(x);  // Works
  console.log(y);  // ERROR - y is in inner's scope
}
```

### The Scope Chain

JavaScript looks for variables by going up the scope chain:

```javascript
const global = "global";

function outer() {
  const outerVar = "outer";
  
  function inner() {
    const innerVar = "inner";
    
    // JavaScript searches: inner -> outer -> global
    console.log(innerVar);  // Found in inner
    console.log(outerVar);  // Found in outer
    console.log(global);    // Found in global
  }
  
  inner();
}
```

---

## Section 8: Closures

### The Concept

A closure is a function that remembers variables from where it was created, even after that outer function has finished.

```javascript
function createCounter() {
  let count = 0;  // This variable will be "remembered"
  
  return function() {
    count += 1;
    return count;
  };
}

const counter = createCounter();
console.log(counter());  // 1
console.log(counter());  // 2
console.log(counter());  // 3
```

The inner function "closes over" the `count` variable. Even though `createCounter` has finished running, the returned function still has access to `count`.

### Why Closures Matter

Closures enable:
1. **Private data** - `count` cannot be accessed directly, only through the function
2. **State that persists** - The count survives between calls
3. **Factory functions** - Functions that create other functions

### In The Codebase: Event Handlers

```typescript
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
```

The `on` and `off` functions are closures. They "close over" the `setOnline` function from the component scope. Even when the browser fires the "online" event (later, asynchronously), the function still knows how to call `setOnline`.

### The Classic Closure Bug

```javascript
// BUG: All buttons alert "5"
for (var i = 0; i < 5; i++) {
  buttons[i].onclick = function() {
    alert(i);  // Captures reference to i, not value
  };
}
// When clicked, i is 5 (loop finished)

// FIX: Use let instead of var
for (let i = 0; i < 5; i++) {
  buttons[i].onclick = function() {
    alert(i);  // Each iteration gets its own i
  };
}
```

With `var`, there is one `i` shared by all iterations. With `let`, each iteration gets its own copy.

---

## In The Codebase: A Complex Example

Let's study `lib/cycle/create.ts` in depth:

```typescript
export async function createNewCycle(
  userId: string, 
  directions: string[], 
  lengthDays: 7 | 14
): Promise<string> {
  // Create timestamps once, reuse
  const now = new Date().toISOString();
  const today = new Date();
  const cycleId = newId();
  
  // Fixed color rotation
  const colorMap: Array<"terra" | "forest" | "slate"> = ["terra", "forest", "slate"];

  // First: close any existing active cycles for this user
  const existingActiveCycles = await db.cycles
    .where("userId")
    .equals(userId)
    .filter((cycle) => cycle.status === "active")
    .toArray();
    
  await Promise.all(
    existingActiveCycles.map((cycle) =>
      db.cycles.update(cycle.id, {
        status: "closed",
        closedAt: now,
        _synced: 0,
      })
    )
  );

  // Second: create the new cycle
  await db.cycles.put({
    id: cycleId,
    userId,
    startDate: format(today, "yyyy-MM-dd"),
    endDate: format(addDays(today, lengthDays - 1), "yyyy-MM-dd"),
    lengthDays,
    status: "active",
    createdAt: now,
    _synced: 0,
  });

  // Third: create directions for the cycle
  const validDirections = directions
    .map((d) => d.trim())
    .filter((d) => d.length > 0)
    .slice(0, 3);
    
  await Promise.all(
    validDirections.map((title, index) =>
      db.directions.put({
        id: newId(),
        cycleId,
        userId,
        title,
        color: colorMap[index],
        position: (index + 1) as 1 | 2 | 3,
        createdAt: now,
        _synced: 0,
      })
    )
  );

  return cycleId;
}
```

### Concepts in This Function

1. **Parameters with types** - TypeScript ensures correct inputs
2. **Async function** - Uses `await` (covered in Chapter 4)
3. **Variable scope** - `now`, `today`, `cycleId` are reused throughout
4. **Arrow function callbacks** - `.filter((cycle) => ...)`, `.map((title, index) => ...)`
5. **Closures** - The arrow functions close over `now`, `cycleId`, `colorMap`
6. **Return value** - Returns the new cycle's ID so the caller knows what was created

### Why Is It Structured This Way?

**Why create `now` once at the top?**
So all related records have the exact same timestamp. If you called `new Date()` multiple times, they would differ by milliseconds.

**Why close existing cycles first?**
A user should only have one active cycle. This ensures data integrity.

**Why `Promise.all` for directions?**
Creating directions can happen in parallel - they do not depend on each other. This is faster than creating them one by one.

**Why return `cycleId`?**
The caller often needs to navigate to the new cycle or reference it immediately.

---

## Where This Lives in the File Structure

```
lib/
├── cycle/
│   ├── close.ts    <- Closing/expiring cycles
│   └── create.ts   <- Creating new cycles
├── utils/
│   └── ids.ts      <- ID generation
└── db/
    └── local.ts    <- Database interface
```

**Why `lib/cycle/`?**
Cycle-related business logic is grouped together. If you need to understand how cycles work, you look in one folder.

**Why separate `close.ts` and `create.ts`?**
Each file has a focused purpose. You can import just what you need. Files stay small and readable.

**Why not in `utils/`?**
These are not general utilities - they are specific to the Align domain. `utils/` is for generic helpers like date formatting and ID generation.

---

## Mistakes: What Breaks

### Mistake 1: Forgetting to Return

```javascript
function double(x) {
  x * 2;  // No return!
}

const result = double(5);
console.log(result);  // undefined
```

**Why it is hard to spot:** No error. The function runs. You just get `undefined`.

### Mistake 2: Returning in a Callback Does Not Return from Outer Function

```javascript
function findItem(items, id) {
  items.forEach(item => {
    if (item.id === id) {
      return item;  // This returns from the callback, not findItem!
    }
  });
  // Implicitly returns undefined
}
```

**Fix:** Use `find` instead:
```javascript
function findItem(items, id) {
  return items.find(item => item.id === id);
}
```

### Mistake 3: Parameter Mutation

```javascript
function addItem(list, item) {
  list.push(item);  // Mutates the original array!
  return list;
}

const original = [1, 2];
const result = addItem(original, 3);
console.log(original);  // [1, 2, 3] - MUTATED!
```

**Fix:** Create a new array:
```javascript
function addItem(list, item) {
  return [...list, item];  // Returns new array
}
```

### Mistake 4: Stale Closures

```javascript
function setup() {
  let count = 0;
  
  setInterval(() => {
    console.log(count);  // Always logs 0!
  }, 1000);
  
  count = 5;  // This happens before the interval fires
}
```

Wait, this actually logs 5. Let me show the real stale closure issue:

```javascript
// In React (you'll see this in Chapter 8)
function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count);  // Always logs the initial value!
    }, 1000);
    return () => clearInterval(timer);
  }, []);  // Empty deps - effect never re-runs
  
  return <button onClick={() => setCount(c => c + 1)}>Click</button>;
}
```

The closure captures the initial `count` and never sees updates.

---

## Mental Debugging

When a function is not working:

1. **Is it being called?** Add `console.log("function called")` at the start.

2. **What are the arguments?** Log all parameters: `console.log("args:", a, b, c)`

3. **Is it returning what you expect?** Log before the return: `console.log("returning:", result)`

4. **Is the return value being used?** Maybe you forgot to use what the function returns.

5. **Check the scope:** Is the variable you are accessing where you think it is? Log it to confirm.

6. **Is it a closure issue?** If a value seems "stuck," you might be closing over a stale reference.

**The debugger is your friend:**
1. Add `debugger;` on a line
2. Open browser DevTools
3. Run the code
4. Step through line by line, inspect variables

---

## Connections

**From Chapter 1:** Functions operate on the variables and types you learned. Parameters are just variables scoped to the function.

**To Chapter 3:** You will use functions as callbacks to `.map()`, `.filter()`, and `.find()` for working with arrays.

**To Chapter 4:** Async functions build on regular functions, adding the ability to wait for operations.

**To Chapter 8:** React's `useState` returns a function (the setter). Understanding functions is critical for React.

**To Chapter 10:** Context uses closures heavily - the context value is "closed over" by consumers.

---

## Go Figure It Out

1. **What is "hoisting" for functions?** Why can you call a function before it is defined (with `function` declarations) but not with `const` arrow functions?

2. **What is the difference between "declaration" and "expression" for functions?** Why does JavaScript treat `function foo() {}` differently from `const foo = function() {}`?

3. **What is "currying"?** It is a technique using closures and functions returning functions. Find an example and understand why it is useful.

4. **What is "recursion"?** A function calling itself. How does the call stack handle this? What is a "base case"?

5. **What is "tail call optimization"?** Some languages optimize recursive functions that return a function call directly. Does JavaScript do this?

6. **What is an "IIFE" (Immediately Invoked Function Expression)?** Why did developers use `(function() { ... })()` before modules existed?

---

## Chapter Exercise

### Part 1: Write These Functions

Create `learn/exercises/sandbox/ch2-functions.ts`:

```typescript
// 1. Write a function that takes a name and returns a greeting
// Use a template literal

// 2. Write a function that takes two numbers and returns the larger one
// Use a ternary operator

// 3. Write a function with a default parameter
// If no argument given, use a sensible default

// 4. Write a function that demonstrates closure
// It should return a function that increments and returns a count
```

### Part 2: Trace the Code

Without running this, predict the output:

```javascript
function outer(x) {
  return function inner(y) {
    return x + y;
  };
}

const add5 = outer(5);
const add10 = outer(10);

console.log(add5(3));
console.log(add10(3));
console.log(add5(add10(0)));
```

### Part 3: In the Codebase

1. Open `lib/cycle/create.ts`. The function has multiple `await` statements. Why can they not all run at the same time? (Hint: Think about what each one needs.)

2. Find the arrow function inside `.filter()`. What does it "close over"?

3. Find the arrow function inside `.map()` for creating directions. What does `index` represent? How is it used?

---

**Previous: [Chapter 1 - The Building Blocks](./01-building-blocks.md)**

**Next: [Chapter 3 - Collections and Iteration](./03-collections.md)**
