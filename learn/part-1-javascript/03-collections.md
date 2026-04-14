# Chapter 3: Collections and Iteration

Programs rarely deal with single values. They deal with lists of things: users, moves, directions, later items. This chapter teaches you how to work with collections of data using arrays and objects, and how to transform them with iteration methods.

---

## What You Will Learn

- Arrays: ordered lists of values
- Objects: key-value pairs
- Destructuring: extracting values elegantly
- The spread operator: copying and combining
- Array methods: map, filter, find, reduce
- When to use which method

---

## Prerequisites

- Chapter 1: Variables and types
- Chapter 2: Functions and arrow functions

---

## The Vocabulary

**Array** - An ordered list of values. Each value has an index (position), starting at 0.

**Object** - A collection of key-value pairs. Keys are names, values can be anything.

**Element** - A single value in an array.

**Property** - A single key-value pair in an object.

**Index** - The position of an element in an array. First element is index 0.

**Iterate** - Go through each item in a collection, one at a time.

**Callback** - A function passed to another function to be called later.

**Immutable operation** - An operation that creates a new array/object instead of modifying the original.

**Mutating operation** - An operation that changes the original array/object.

**Destructuring** - Extracting values from arrays or objects into variables.

**Spread** - Expanding an array or object into individual elements or properties.

---

## Section 1: Arrays

### The Concept

An array is an ordered list:

```javascript
const numbers = [1, 2, 3, 4, 5];
const names = ["Alice", "Bob", "Charlie"];
const mixed = [1, "hello", true, null];  // Can mix types (avoid in TypeScript)
```

### Accessing Elements

Arrays are zero-indexed. The first element is at index 0:

```javascript
const names = ["Alice", "Bob", "Charlie"];
//              [0]      [1]     [2]

console.log(names[0]);  // "Alice"
console.log(names[1]);  // "Bob"
console.log(names[2]);  // "Charlie"
console.log(names[3]);  // undefined (doesn't exist)
```

### Array Length

```javascript
const names = ["Alice", "Bob", "Charlie"];
console.log(names.length);  // 3
```

### Modifying Arrays (Mutation)

```javascript
const numbers = [1, 2, 3];

// Change an element
numbers[0] = 99;  // [99, 2, 3]

// Add to end
numbers.push(4);  // [99, 2, 3, 4]

// Remove from end
numbers.pop();    // [99, 2, 3]

// Add to beginning
numbers.unshift(0);  // [0, 99, 2, 3]

// Remove from beginning
numbers.shift();  // [99, 2, 3]
```

**Warning:** These methods MUTATE the original array. In React, you usually want to create new arrays instead.

### In The Codebase: lib/context/AppContext.tsx

```typescript
const directions: LocalDirection[] = [
  { id: "dir-1", cycleId: cycle.id, userId, title: "Landing page", color: "terra", position: 1, createdAt: now, _synced: 0 },
  { id: "dir-2", cycleId: cycle.id, userId, title: "Get fit", color: "forest", position: 2, createdAt: now, _synced: 0 },
  { id: "dir-3", cycleId: cycle.id, userId, title: "Find a client", color: "slate", position: 3, createdAt: now, _synced: 0 },
];
```

This is an array of objects. Each object represents a "direction" in the Align app. The `LocalDirection[]` type annotation (TypeScript) means "array of LocalDirection objects."

---

## Section 2: Objects

### The Concept

Objects store data as key-value pairs:

```javascript
const user = {
  name: "Alice",
  age: 30,
  isActive: true
};
```

### Accessing Properties

Two ways to access:

```javascript
// Dot notation
console.log(user.name);  // "Alice"

// Bracket notation (useful for dynamic keys)
console.log(user["name"]);  // "Alice"

const key = "age";
console.log(user[key]);  // 30
```

### Adding and Modifying Properties

```javascript
const user = { name: "Alice" };

// Add a property
user.age = 30;

// Modify a property
user.name = "Alice Smith";
```

**Warning:** This mutates the original object. In React, create new objects instead.

### In The Codebase: lib/db/local.ts

```typescript
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
```

This TypeScript interface defines the shape of a "move" object. Every move in Align has these properties.

A real move object looks like:

```typescript
const move = {
  id: "move-123",
  cycleId: "cycle-456",
  directionId: "dir-789",
  userId: "user-abc",
  title: "Morning run 5km",
  date: "2024-01-15",
  status: "done",
  doneAt: "2024-01-15T08:30:00Z",
  createdAt: "2024-01-15T06:00:00Z",
  updatedAt: "2024-01-15T08:30:00Z",
  _synced: 1
};
```

---

## Section 3: Destructuring

### The Concept

Destructuring extracts values from arrays or objects into variables:

```javascript
// Array destructuring
const numbers = [1, 2, 3];
const [first, second, third] = numbers;
console.log(first);   // 1
console.log(second);  // 2

// Object destructuring
const user = { name: "Alice", age: 30 };
const { name, age } = user;
console.log(name);  // "Alice"
console.log(age);   // 30
```

### Why Destructuring Exists

Without destructuring:

```javascript
const user = { name: "Alice", age: 30, city: "NYC" };
const name = user.name;
const age = user.age;
const city = user.city;
```

With destructuring:

```javascript
const { name, age, city } = user;
```

Much cleaner, especially with many properties.

### Renaming During Destructuring

```javascript
const user = { name: "Alice" };
const { name: userName } = user;  // Rename to userName
console.log(userName);  // "Alice"
```

### Default Values

```javascript
const user = { name: "Alice" };
const { name, age = 25 } = user;  // Default if missing
console.log(age);  // 25
```

### Nested Destructuring

```javascript
const data = {
  user: {
    name: "Alice",
    address: {
      city: "NYC"
    }
  }
};

const { user: { name, address: { city } } } = data;
console.log(name);  // "Alice"
console.log(city);  // "NYC"
```

### In The Codebase: Function Parameters

```typescript
export function isCycleExpired(cycle: { endDate: string; status: string }): boolean {
  return cycle.status === "active" && isAfter(...);
}
```

This function takes an object and accesses its properties. An alternative using destructuring in the parameter:

```typescript
export function isCycleExpired({ endDate, status }: { endDate: string; status: string }): boolean {
  return status === "active" && isAfter(..., parseISO(endDate));
}
```

Both are valid. The codebase uses both styles depending on readability.

### In The Codebase: Importing

```typescript
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
```

This is destructuring from a module. The `react` module exports many things; we pick exactly what we need.

---

## Section 4: The Spread Operator

### The Concept

The spread operator `...` expands an array or object:

```javascript
// Spreading an array
const numbers = [1, 2, 3];
const moreNumbers = [...numbers, 4, 5];  // [1, 2, 3, 4, 5]

// Spreading an object
const user = { name: "Alice" };
const updatedUser = { ...user, age: 30 };  // { name: "Alice", age: 30 }
```

### Copying (Shallow)

```javascript
// Copy an array
const original = [1, 2, 3];
const copy = [...original];
copy.push(4);
console.log(original);  // [1, 2, 3] (unchanged)
console.log(copy);      // [1, 2, 3, 4]

// Copy an object
const user = { name: "Alice" };
const userCopy = { ...user };
userCopy.name = "Bob";
console.log(user.name);      // "Alice" (unchanged)
console.log(userCopy.name);  // "Bob"
```

**Important:** This is a SHALLOW copy. Nested objects are still references:

```javascript
const user = { 
  name: "Alice", 
  address: { city: "NYC" }  // Nested object
};
const copy = { ...user };
copy.address.city = "LA";
console.log(user.address.city);  // "LA" - CHANGED! Nested object was shared
```

### Combining

```javascript
// Combine arrays
const first = [1, 2];
const second = [3, 4];
const combined = [...first, ...second];  // [1, 2, 3, 4]

// Merge objects (later wins on conflicts)
const defaults = { theme: "light", fontSize: 14 };
const userPrefs = { theme: "dark" };
const settings = { ...defaults, ...userPrefs };
// { theme: "dark", fontSize: 14 }
```

### In The Codebase: Immutable Updates

This pattern appears constantly in React code:

```typescript
// Adding an item to state
setItems(prev => [...prev, newItem]);

// Removing an item from state
setItems(prev => prev.filter(item => item.id !== idToRemove));

// Updating a property in state
setState(prev => ({ ...prev, isLoading: true }));
```

These create NEW arrays/objects instead of mutating. React requires this to detect changes.

---

## Section 5: Array Methods - map

### The Concept

`map` transforms every element in an array and returns a new array:

```javascript
const numbers = [1, 2, 3, 4];
const doubled = numbers.map(n => n * 2);
// doubled: [2, 4, 6, 8]
// numbers: [1, 2, 3, 4] (unchanged)
```

### How It Works

```javascript
// map takes a callback function
// The callback receives each element
// Whatever the callback returns becomes the new element

const names = ["alice", "bob"];
const upper = names.map(name => name.toUpperCase());
// ["ALICE", "BOB"]
```

### The Callback Arguments

The callback receives up to three arguments:

```javascript
array.map((element, index, array) => {
  // element: the current item
  // index: its position (0, 1, 2, ...)
  // array: the whole original array (rarely used)
});
```

### In The Codebase: lib/cycle/create.ts

```typescript
const validDirections = directions
  .map((d) => d.trim())
  .filter((d) => d.length > 0)
  .slice(0, 3);
```

This chains operations:
1. `map(d => d.trim())` - Remove whitespace from each direction string
2. Then filter, then slice (coming up)

```typescript
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
```

This maps each direction title to a database operation:
- `title` is the direction text
- `index` determines the color and position (first direction gets `terra`, position 1)

### What It Compiles To

When you write:
```javascript
const doubled = numbers.map(n => n * 2);
```

Conceptually, JavaScript does this:
```javascript
const doubled = [];
for (let i = 0; i < numbers.length; i++) {
  doubled.push(numbers[i] * 2);
}
```

`map` is a cleaner, functional way to express this pattern.

---

## Section 6: Array Methods - filter

### The Concept

`filter` creates a new array with only elements that pass a test:

```javascript
const numbers = [1, 2, 3, 4, 5, 6];
const evens = numbers.filter(n => n % 2 === 0);
// evens: [2, 4, 6]
```

### How It Works

```javascript
// filter takes a callback that returns true or false
// If true: element is included
// If false: element is excluded

const users = [
  { name: "Alice", active: true },
  { name: "Bob", active: false },
  { name: "Charlie", active: true }
];

const activeUsers = users.filter(user => user.active);
// [{ name: "Alice", active: true }, { name: "Charlie", active: true }]
```

### In The Codebase: lib/cycle/create.ts

```typescript
const validDirections = directions
  .map((d) => d.trim())
  .filter((d) => d.length > 0)  // Keep only non-empty strings
  .slice(0, 3);
```

The filter removes empty strings. If a user enters `["Learn React", "", "  "]`, after map and filter it becomes `["Learn React"]`.

### In The Codebase: Querying Data

```typescript
const existingActiveCycles = await db.cycles
  .where("userId")
  .equals(userId)
  .filter((cycle) => cycle.status === "active")
  .toArray();
```

This filters database results to only active cycles.

### Common Use Cases

```javascript
// Remove a specific item by ID
const remaining = items.filter(item => item.id !== idToRemove);

// Keep items matching a search
const results = items.filter(item => 
  item.title.toLowerCase().includes(searchTerm.toLowerCase())
);

// Remove falsy values
const truthy = [0, 1, "", "hello", null, undefined, false, true]
  .filter(Boolean);
// [1, "hello", true]
```

---

## Section 7: Array Methods - find

### The Concept

`find` returns the FIRST element that matches, or `undefined` if none:

```javascript
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" }
];

const bob = users.find(user => user.id === 2);
// { id: 2, name: "Bob" }

const nobody = users.find(user => user.id === 99);
// undefined
```

### find vs filter

- `filter` returns ALL matches as an array (even if empty)
- `find` returns the FIRST match (or undefined)

```javascript
const numbers = [1, 2, 3, 2, 4];

numbers.filter(n => n === 2);  // [2, 2] - array of all matches
numbers.find(n => n === 2);    // 2 - just the first match
```

Use `find` when you expect one result and want the item itself.
Use `filter` when you expect multiple results or want an array.

### In The Codebase: Finding Today's Check-in

```typescript
const todayCheckin = await db.checkins
  .where("[userId+date]")
  .equals([userId, today])
  .first();  // Similar to find - gets first match
```

There can only be one check-in per day, so we want the single match.

### findIndex

Returns the INDEX of the first match, or -1 if not found:

```javascript
const names = ["Alice", "Bob", "Charlie"];
const index = names.findIndex(name => name === "Bob");
// 1

const missing = names.findIndex(name => name === "Dave");
// -1
```

---

## Section 8: Array Methods - reduce

### The Concept

`reduce` accumulates array values into a single result:

```javascript
const numbers = [1, 2, 3, 4];
const sum = numbers.reduce((total, n) => total + n, 0);
// 10
```

### How It Works

```javascript
// reduce takes a callback and an initial value
// The callback receives:
//   - accumulator: the running total
//   - currentValue: the current element
// Whatever you return becomes the new accumulator

numbers.reduce((accumulator, current) => {
  return accumulator + current;
}, 0);  // 0 is the initial accumulator value

// Step by step:
// Start: accumulator = 0
// 1st: accumulator = 0 + 1 = 1
// 2nd: accumulator = 1 + 2 = 3
// 3rd: accumulator = 3 + 3 = 6
// 4th: accumulator = 6 + 4 = 10
// Result: 10
```

### Common Use Cases

```javascript
// Sum
const total = numbers.reduce((sum, n) => sum + n, 0);

// Max
const max = numbers.reduce((max, n) => n > max ? n : max, -Infinity);

// Count occurrences
const words = ["apple", "banana", "apple", "cherry", "apple"];
const counts = words.reduce((acc, word) => {
  acc[word] = (acc[word] || 0) + 1;
  return acc;
}, {});
// { apple: 3, banana: 1, cherry: 1 }

// Group by property
const people = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 },
  { name: "Charlie", age: 25 }
];
const byAge = people.reduce((acc, person) => {
  const key = person.age;
  acc[key] = acc[key] || [];
  acc[key].push(person);
  return acc;
}, {});
// { 25: [Alice, Charlie], 30: [Bob] }
```

### When to Use reduce

`reduce` is powerful but can be hard to read. Consider alternatives:

```javascript
// Instead of reduce for sum:
numbers.reduce((sum, n) => sum + n, 0);

// You could use:
let sum = 0;
for (const n of numbers) sum += n;

// Or for simple cases in modern JS:
// (Not in all environments yet)
```

Use `reduce` when:
- You need to transform an array into a single value
- The logic is complex enough that map/filter do not fit
- You are grouping or counting

---

## Section 9: Chaining Methods

### The Concept

Array methods return arrays (except `find`, `reduce`), so you can chain them:

```javascript
const result = data
  .filter(item => item.active)
  .map(item => item.name)
  .sort();
```

### In The Codebase: lib/cycle/create.ts

```typescript
const validDirections = directions
  .map((d) => d.trim())      // 1. Clean whitespace
  .filter((d) => d.length > 0)  // 2. Remove empty
  .slice(0, 3);              // 3. Take max 3
```

Each step returns a new array, which the next method operates on.

### Reading Chained Methods

Read top to bottom, like a pipeline:
1. Start with `directions` array
2. Transform each: trim whitespace
3. Keep only: non-empty strings
4. Take: first 3

### Performance Consideration

Each method iterates the array. For huge arrays, chaining creates intermediate arrays:

```javascript
// Creates 2 intermediate arrays
const result = hugeArray
  .map(x => x * 2)
  .filter(x => x > 10)
  .map(x => x.toString());
```

For most app code, this is fine. For performance-critical code with millions of items, consider a single loop or a library like Lodash.

---

## Section 10: Other Useful Array Methods

### includes - Check if Element Exists

```javascript
const fruits = ["apple", "banana", "cherry"];
fruits.includes("banana");  // true
fruits.includes("grape");   // false
```

### some - Check if ANY Element Matches

```javascript
const numbers = [1, 2, 3, 4];
numbers.some(n => n > 3);   // true (4 is > 3)
numbers.some(n => n > 10);  // false
```

### every - Check if ALL Elements Match

```javascript
const numbers = [2, 4, 6, 8];
numbers.every(n => n % 2 === 0);  // true (all even)
numbers.every(n => n > 5);        // false (2 and 4 aren't)
```

### slice - Extract a Portion

```javascript
const numbers = [1, 2, 3, 4, 5];
numbers.slice(1, 3);   // [2, 3] - index 1 to 3 (exclusive)
numbers.slice(2);      // [3, 4, 5] - from index 2 to end
numbers.slice(-2);     // [4, 5] - last 2 elements
```

Does NOT mutate. Returns a new array.

### sort - Order Elements

```javascript
const names = ["Charlie", "Alice", "Bob"];
names.sort();  // ["Alice", "Bob", "Charlie"]

// WARNING: sort mutates the original array!
// AND it converts to strings by default:
const numbers = [10, 2, 30];
numbers.sort();  // [10, 2, 30] - WRONG! Sorted as strings

// Fix: provide a compare function
numbers.sort((a, b) => a - b);  // [2, 10, 30] - correct numeric sort
```

### concat - Combine Arrays

```javascript
const a = [1, 2];
const b = [3, 4];
const c = a.concat(b);  // [1, 2, 3, 4]

// Spread is more common now:
const d = [...a, ...b];  // [1, 2, 3, 4]
```

---

## Where Collections Live in the Codebase

```
lib/
├── db/
│   └── local.ts    <- Defines interfaces for each collection type
├── context/
│   └── AppContext.tsx  <- Stores arrays in state (moves, directions, etc.)
└── cycle/
    └── create.ts   <- Creates arrays of directions
```

**Why arrays of objects?**

The Align app deals with lists of things:
- A cycle has 1-3 directions
- A day has 0-3 moves
- A user has many later items

Arrays with objects are the natural way to represent this. Each object has an `id` for identification.

**Why interfaces for each type?**

TypeScript interfaces (like `LocalMove`, `LocalDirection`) ensure every object has the required properties. The editor catches mistakes before runtime.

---

## Mistakes: What Breaks

### Mistake 1: Mutating Instead of Creating New

```javascript
// BUG in React
const [items, setItems] = useState([1, 2, 3]);

function addItem() {
  items.push(4);      // Mutates the array
  setItems(items);    // Same reference - React doesn't see a change!
}

// FIX
function addItem() {
  setItems([...items, 4]);  // New array
}
```

**Why it is hard to spot:** The data changes, but the UI does not update. No error.

### Mistake 2: Forgetting map Returns a New Array

```javascript
// BUG: Not using the result
const numbers = [1, 2, 3];
numbers.map(n => n * 2);  // Creates [2, 4, 6] but throws it away
console.log(numbers);     // Still [1, 2, 3]

// FIX: Capture the result
const doubled = numbers.map(n => n * 2);
```

### Mistake 3: Forgetting filter Can Return Empty

```javascript
const items = [];
const first = items.filter(i => i.active)[0];
console.log(first.name);  // ERROR: Cannot read property 'name' of undefined

// FIX: Check for existence
const active = items.filter(i => i.active);
if (active.length > 0) {
  console.log(active[0].name);
}

// OR use find (clearer intent)
const first = items.find(i => i.active);
if (first) {
  console.log(first.name);
}
```

### Mistake 4: sort Mutates the Original

```javascript
const original = [3, 1, 2];
const sorted = original.sort((a, b) => a - b);
console.log(original);  // [1, 2, 3] - MUTATED!

// FIX: Copy first
const sorted = [...original].sort((a, b) => a - b);
```

### Mistake 5: Confusing Reference Equality

```javascript
const a = [1, 2, 3];
const b = [1, 2, 3];
console.log(a === b);  // false! Different arrays in memory

const c = a;
console.log(a === c);  // true - same reference
```

To compare array contents, you need to check each element or use a library.

---

## Mental Debugging

When array operations give unexpected results:

1. **Log the array at each step:**
   ```javascript
   const step1 = data.map(x => x.name);
   console.log("after map:", step1);
   const step2 = step1.filter(n => n.length > 3);
   console.log("after filter:", step2);
   ```

2. **Check if you are mutating:** Is the original array changing? If so, you are using a mutating method.

3. **Check the callback:** Add logging inside:
   ```javascript
   data.filter(item => {
     console.log("checking:", item, "result:", item.active);
     return item.active;
   });
   ```

4. **Check for undefined:** Is the array actually populated when you use it?

5. **Check types:** Is `item.id` a string or number? `"1" !== 1`

---

## Connections

**From Chapter 2:** Array methods like `map` and `filter` take callback functions. Understanding functions is essential for using these methods.

**To Chapter 5:** TypeScript adds type safety to arrays: `string[]`, `LocalMove[]`, etc. The compiler catches type mismatches.

**To Chapter 8:** React state often holds arrays. You will use spread and array methods constantly for immutable updates.

**To Chapter 10:** Context often provides arrays that many components need. Understanding how to transform and filter data is critical.

**To Chapter 13:** Dexie stores collections in IndexedDB. You query them with similar filter/find patterns.

---

## Go Figure It Out

1. **What is the difference between "shallow copy" and "deep copy"?** Why does spreading not copy nested objects? How do you deep copy?

2. **What is "array-like"?** Some things look like arrays but are not (like `arguments`, DOM NodeLists). How do you convert them to real arrays?

3. **What does `Array.from()` do?** When would you use it instead of spread?

4. **What is `flatMap`?** It is like `map` but flattens the result. Find use cases.

5. **What is the performance difference between `for` loops and array methods?** When does it matter? (Hint: Almost never in app code.)

6. **What is a "pure function"?** How do array methods relate to pure functions and functional programming?

---

## Chapter Exercise

### Part 1: Practice Methods

Create `learn/exercises/sandbox/ch3-arrays.ts`:

```typescript
const moves = [
  { id: "1", title: "Morning run", status: "done", date: "2024-01-15" },
  { id: "2", title: "Write code", status: "pending", date: "2024-01-15" },
  { id: "3", title: "Read book", status: "done", date: "2024-01-14" },
  { id: "4", title: "Call mom", status: "pending", date: "2024-01-15" },
];

// 1. Get all done moves (filter)

// 2. Get just the titles (map)

// 3. Get titles of done moves (chain filter + map)

// 4. Find the move with id "3" (find)

// 5. Check if any move is pending (some)

// 6. Count moves by status (reduce)
// Expected: { done: 2, pending: 2 }

// 7. Add a new move immutably (spread)

// 8. Remove the move with id "2" immutably (filter)

// 9. Mark move "2" as done immutably (map)
```

### Part 2: In the Codebase

1. Open `lib/cycle/create.ts`. Find where `.map()` is used. What does each map do?

2. Open `lib/context/AppContext.tsx`. Find the `INITIAL_STATE` object. How many array properties does it have? Why are they all initialized to `[]`?

3. Find a place in the codebase where `.filter()` is used. What condition does it check?

### Part 3: Predict the Output

Without running:

```javascript
const data = [
  { name: "A", score: 80 },
  { name: "B", score: 90 },
  { name: "C", score: 70 },
];

const result = data
  .filter(d => d.score >= 80)
  .map(d => d.name)
  .sort()
  .join(", ");

console.log(result);
```

---

**Previous: [Chapter 2 - Functions and Logic](./02-functions-and-logic.md)**

**Next: [Chapter 4 - Async JavaScript](./04-async-javascript.md)**
