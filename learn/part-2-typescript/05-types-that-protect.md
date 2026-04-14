# Chapter 5: Types That Protect You

JavaScript is dynamically typed. Variables can hold any type, and types can change at runtime. This flexibility causes bugs. TypeScript adds a type system that catches errors before your code runs. This chapter teaches you why types matter and how to use them.

---

## What You Will Learn

- Why type systems exist
- Basic type annotations
- Interfaces and type aliases
- Optional and required properties
- Type inference (when you do not need to write types)
- The difference between compile-time and runtime

---

## Prerequisites

- Chapters 1-4: JavaScript fundamentals

---

## The Vocabulary

**Type** - A category of values. `string`, `number`, `boolean` are types.

**Type annotation** - Explicitly declaring what type a variable or parameter should be.

**Type inference** - TypeScript automatically determining the type from context.

**Interface** - A named structure that defines the shape of an object.

**Type alias** - A name for any type, including primitives, unions, and complex types.

**Compile-time** - When TypeScript checks your code, before it runs.

**Runtime** - When the code actually executes in the browser.

**Type error** - A mismatch between expected and actual types, caught by the compiler.

**Type safety** - The guarantee that operations only happen on compatible types.

---

## Section 1: Why Types Exist

### The Problem with JavaScript

JavaScript does not care about types:

```javascript
function add(a, b) {
  return a + b;
}

add(2, 3);        // 5 - what you expected
add("2", 3);      // "23" - string concatenation, not addition!
add(null, 3);     // 3 - null becomes 0
add({}, []);      // "[object Object]" - what?!
```

No errors. JavaScript happily does something weird.

These bugs are hard to find because:
1. No error message
2. The code "works," just not correctly
3. The bug might only appear with certain inputs

### The TypeScript Solution

TypeScript adds type checking:

```typescript
function add(a: number, b: number): number {
  return a + b;
}

add(2, 3);      // OK
add("2", 3);    // ERROR: Argument of type 'string' is not assignable to parameter of type 'number'
```

The error appears immediately in your editor, before you run the code.

### Compile-Time vs Runtime

**Compile-time:** TypeScript checks your code when you save or build. This is when type errors appear.

**Runtime:** When JavaScript executes in the browser. TypeScript is gone by then; it compiles to plain JavaScript.

```
TypeScript Code (.ts)
        |
        | TypeScript Compiler (tsc)
        | - Checks types
        | - Removes type annotations
        |
        v
JavaScript Code (.js)
        |
        | Browser executes
        v
    Runtime
```

Types exist only at compile-time. They are erased from the final JavaScript.

---

## Section 2: Basic Type Annotations

### Variables

```typescript
const name: string = "Alice";
const age: number = 30;
const isActive: boolean = true;
```

### Function Parameters and Return Types

```typescript
function greet(name: string): string {
  return `Hello, ${name}!`;
}

function add(a: number, b: number): number {
  return a + b;
}

function logMessage(message: string): void {
  console.log(message);
  // void means "returns nothing"
}
```

### Arrays

```typescript
const numbers: number[] = [1, 2, 3];
const names: string[] = ["Alice", "Bob"];

// Alternative syntax
const scores: Array<number> = [95, 87, 92];
```

### In The Codebase: lib/utils/ids.ts

```typescript
export function newId(): string {
  return crypto.randomUUID();
}
```

The `: string` after the parentheses is the return type. This function always returns a string.

Anyone calling `newId()` knows they will get a string. The editor autocompletes string methods on the result.

### In The Codebase: lib/cycle/close.ts

```typescript
export function isCycleExpired(cycle: { endDate: string; status: string }): boolean {
  return cycle.status === "active" && isAfter(...);
}
```

- Parameter `cycle` has an inline type: an object with `endDate` (string) and `status` (string)
- Return type is `boolean`

---

## Section 3: Type Inference

### When You Do Not Need to Annotate

TypeScript is smart. It can often figure out the type:

```typescript
// TypeScript infers these types
const name = "Alice";        // string (inferred)
const age = 30;              // number (inferred)
const isActive = true;       // boolean (inferred)
const numbers = [1, 2, 3];   // number[] (inferred)
```

### When to Annotate Explicitly

Annotate when:
1. TypeScript cannot infer (function parameters)
2. You want to enforce a specific type
3. The inferred type is too narrow or too wide

```typescript
// Parameter types must be annotated
function greet(name: string) {  // Required
  return `Hello, ${name}`;      // Return type inferred as string
}

// Enforce a specific type
const id: string = getIdFromSomewhere();  // Even if function returns `any`

// Widen a type
let status: "pending" | "done" = "pending";  // Without annotation, would be just "pending"
```

### The Rule of Thumb

- **Let TypeScript infer** variable types from their values
- **Always annotate** function parameters
- **Consider annotating** return types for clarity in public APIs

---

## Section 4: Interfaces

### The Concept

An interface defines the shape of an object:

```typescript
interface User {
  id: string;
  name: string;
  age: number;
}

const alice: User = {
  id: "123",
  name: "Alice",
  age: 30
};
```

### Why Interfaces Exist

Without interfaces:

```typescript
function createUser(id: string, name: string, age: number): { id: string; name: string; age: number } {
  return { id, name, age };
}

function updateUser(user: { id: string; name: string; age: number }): void {
  // ...
}
```

You repeat the same object shape everywhere.

With interfaces:

```typescript
interface User {
  id: string;
  name: string;
  age: number;
}

function createUser(id: string, name: string, age: number): User {
  return { id, name, age };
}

function updateUser(user: User): void {
  // ...
}
```

Define once, use everywhere.

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

This interface defines what a "move" looks like in the local database. Every move in Align must have these properties with these exact types.

### Optional Properties

The `?` makes a property optional:

```typescript
interface User {
  id: string;
  name: string;
  age?: number;  // Optional - might be undefined
}

const alice: User = { id: "1", name: "Alice" };  // OK, no age
const bob: User = { id: "2", name: "Bob", age: 25 };  // OK, with age
```

### In The Codebase: Optional Fields

```typescript
export interface LocalMove {
  // ...
  directionId?: string;  // Move might not have a direction
  doneAt?: string;       // Only set when status is "done"
}
```

`directionId` is optional because a move can exist without being linked to a direction.
`doneAt` is optional because it only has a value once the move is marked done.

---

## Section 5: Type Aliases

### The Concept

A type alias gives a name to any type:

```typescript
type UserId = string;
type Status = "pending" | "done";
type NumberArray = number[];

const id: UserId = "abc123";
const status: Status = "pending";
```

### Interface vs Type Alias

Both can define object shapes:

```typescript
// Interface
interface User {
  id: string;
  name: string;
}

// Type alias
type User = {
  id: string;
  name: string;
};
```

Key differences:

| Feature | Interface | Type Alias |
|---------|-----------|------------|
| Extend/merge | Yes (declaration merging) | No |
| Union types | No | Yes |
| Primitive aliases | No | Yes |
| Use for objects | Preferred | Works |

The Align codebase convention:
- **Interfaces** for object shapes (most common)
- **Type aliases** for unions and primitives

### In The Codebase: Type Aliases for Unions

```typescript
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
```

This type alias defines all possible sheet names. If you try to use a sheet name that does not exist, TypeScript catches it.

---

## Section 6: Literal Types

### The Concept

A literal type is an exact value:

```typescript
type Status = "pending" | "done";  // Only these two strings
type Position = 1 | 2 | 3;         // Only these three numbers
type Answer = true | false;        // Same as boolean, but explicit
```

### In The Codebase: lib/db/local.ts

```typescript
export interface LocalMove {
  status: "pending" | "done";
  // ...
}

export interface LocalDirection {
  color: "terra" | "forest" | "slate";
  position: 1 | 2 | 3;
  // ...
}

export interface LocalCycle {
  lengthDays: 7 | 14;
  status: "active" | "closed";
  // ...
}
```

Why literal types instead of just `string` or `number`?

1. **Self-documenting:** The type shows all valid values
2. **Autocomplete:** Your editor suggests only valid options
3. **Error catching:** Invalid values are caught at compile time

```typescript
const move: LocalMove = {
  status: "completed",  // ERROR: '"completed"' is not assignable to type '"pending" | "done"'
  // ...
};
```

The correct vocabulary is enforced by the type system.

---

## Section 7: The any Escape Hatch

### What any Does

`any` disables type checking:

```typescript
let value: any = "hello";
value = 42;       // OK
value = true;     // OK
value.foo.bar();  // OK (but will crash at runtime!)
```

With `any`, you lose all type safety.

### Why any Exists

Sometimes you genuinely do not know the type:
- Data from external APIs
- Migration from JavaScript
- Dynamic data structures

### Why to Avoid any

The Align codebase avoids `any`. The CLAUDE.md file explicitly states:

> **Never:** `any` TypeScript type

Instead, use:
- `unknown` - A type-safe version of any (requires type checking before use)
- Proper interfaces
- Generic types (Chapter 6)

```typescript
// BAD
function process(data: any) {
  return data.name;  // No type checking!
}

// BETTER
function process(data: unknown) {
  if (typeof data === "object" && data !== null && "name" in data) {
    return (data as { name: string }).name;
  }
  throw new Error("Invalid data");
}

// BEST
interface UserData {
  name: string;
}
function process(data: UserData) {
  return data.name;  // Type-safe!
}
```

---

## Section 8: Working with Existing Types

### typeof for Variables

Get the type of an existing variable:

```typescript
const user = { name: "Alice", age: 30 };
type UserType = typeof user;  // { name: string; age: number }

function clone(u: typeof user) {
  return { ...u };
}
```

### keyof for Object Keys

Get a union of an object's keys:

```typescript
interface User {
  id: string;
  name: string;
  age: number;
}

type UserKey = keyof User;  // "id" | "name" | "age"

function getProperty(user: User, key: keyof User) {
  return user[key];
}
```

### In The Codebase: lib/db/types.ts

The file `lib/db/types.ts` is auto-generated by Supabase:

```typescript
export interface Database {
  public: {
    Tables: {
      profiles: { ... }
      cycles: { ... }
      moves: { ... }
      // etc.
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = 
  Database["public"]["Tables"][T]["Row"];
```

This allows:

```typescript
type DbProfile = Tables<"profiles">;  // Type of a profiles row
type DbMove = Tables<"moves">;        // Type of a moves row
```

The types are derived from the actual database schema, so they always match.

---

## Where Types Live in the Codebase

```
lib/
├── db/
│   ├── local.ts     <- Local interfaces (LocalMove, LocalCycle, etc.)
│   └── types.ts     <- Auto-generated Supabase types
├── context/
│   └── AppContext.tsx  <- App state interfaces
└── supabase/
    └── client.ts    <- Uses Database type for type-safe queries
```

**Why separate Local and Supabase types?**

The local database uses camelCase (`cycleId`). Supabase uses snake_case (`cycle_id`). Having separate types for each makes the mapping explicit:

```typescript
// Local type
interface LocalMove {
  cycleId: string;  // camelCase
}

// Supabase type (auto-generated)
interface DbMove {
  cycle_id: string;  // snake_case
}

// Conversion function
function moveToDb(m: LocalMove): DbMove {
  return {
    cycle_id: m.cycleId,
    // ...
  };
}
```

---

## Mistakes: What Breaks

### Mistake 1: Type Assertion Abuse

```typescript
// DANGEROUS
const data = fetchData() as User;  // Assumes it's a User
console.log(data.name);  // Might crash if data isn't actually a User!

// SAFER
const data = fetchData();
if (isUser(data)) {  // Runtime check
  console.log(data.name);
}
```

Type assertions (`as`) override the compiler. Use them sparingly.

### Mistake 2: Forgetting Optional Check

```typescript
interface User {
  name: string;
  age?: number;
}

function isAdult(user: User): boolean {
  return user.age >= 18;  // ERROR: 'age' is possibly undefined
}

// FIX
function isAdult(user: User): boolean {
  return user.age !== undefined && user.age >= 18;
}

// OR
function isAdult(user: User): boolean {
  return (user.age ?? 0) >= 18;
}
```

### Mistake 3: Thinking Types Exist at Runtime

```typescript
interface User {
  name: string;
}

function process(data: unknown) {
  if (data instanceof User) {  // ERROR: 'User' only refers to a type
    // ...
  }
}
```

Interfaces do not exist at runtime. You cannot use `instanceof` with them.

```typescript
// FIX: Runtime check
function isUser(data: unknown): data is User {
  return typeof data === "object" 
    && data !== null 
    && "name" in data 
    && typeof (data as User).name === "string";
}

if (isUser(data)) {
  console.log(data.name);  // Type-safe!
}
```

### Mistake 4: Mutating Object Types

```typescript
const user: User = { id: "1", name: "Alice" };
user.id = "2";  // Allowed by default!

// If you want immutability:
const user: Readonly<User> = { id: "1", name: "Alice" };
user.id = "2";  // ERROR: Cannot assign to 'id' because it is a read-only property
```

---

## Mental Debugging

When you see a type error:

1. **Read the error message.** TypeScript errors are verbose but specific. They tell you exactly what is wrong.

2. **Hover over variables.** Your editor shows the inferred type. Is it what you expected?

3. **Check for typos.** `staus` vs `status`, `userId` vs `user_id`.

4. **Check optional properties.** Did you handle the `undefined` case?

5. **Check unions.** Is the value one of the allowed options?

6. **Trace the type.** Where does this type come from? Is the source correct?

**Common error messages:**

```
Type 'string' is not assignable to type 'number'
// You're using a string where a number is expected

Property 'foo' does not exist on type 'Bar'
// The object doesn't have that property (typo? wrong type?)

Argument of type 'X' is not assignable to parameter of type 'Y'
// Function expects Y but you passed X

Object is possibly 'undefined'
// You need to check for undefined before accessing
```

---

## Connections

**From Chapters 1-4:** Types describe the JavaScript values you already learned about.

**To Chapter 6:** Advanced TypeScript covers generics, utility types, and type guards.

**To Chapter 8:** React props and state are typed with interfaces.

**To Chapter 13:** Dexie uses TypeScript for type-safe database queries.

**To Chapter 14:** Supabase generates types from your database schema.

---

## Go Figure It Out

1. **What is "structural typing"?** TypeScript cares about shape, not names. Two types with the same properties are compatible. How does this differ from "nominal typing" in languages like Java?

2. **What is "type narrowing"?** How do `if` statements and `typeof` checks affect the type inside the block?

3. **What is the `never` type?** When would a function return `never`? What does it mean conceptually?

4. **What is "strict mode" in TypeScript?** What does `"strict": true` in tsconfig.json enable? Why would you want it?

5. **What is "declaration merging"?** Interfaces with the same name merge. When is this useful? When is it confusing?

6. **Explore the TypeScript Playground:** Go to https://www.typescriptlang.org/play and paste code. Watch the compiled JavaScript output change.

---

## Chapter Exercise

### Part 1: Write Types

Create `learn/exercises/sandbox/ch5-types.ts`:

```typescript
// 1. Create an interface for a blog post
// It should have: id (string), title (string), content (string),
// published (boolean), tags (array of strings), author (optional string)

// 2. Create a type alias for post status: "draft" | "published" | "archived"

// 3. Write a function that takes a post and returns its title
// Include parameter and return type annotations

// 4. Create an array of posts with correct typing

// 5. Write a function that filters posts by status
// The status parameter should only accept valid status values
```

### Part 2: In the Codebase

1. Open `lib/db/local.ts`. Count how many interfaces are exported. What do they all have in common?

2. Find the `_synced` property. What type is it? Why those specific values?

3. Open `lib/context/AppContext.tsx`. Find `AppState` interface. How many properties use arrays? How many use the types from `local.ts`?

### Part 3: Fix the Errors

Without running, identify the type errors:

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  inStock?: boolean;
}

const product: Product = {
  id: "123",
  name: "Widget",
  price: 9.99
};

function getDiscount(product: Product): number {
  if (product.inStock) {
    return product.price * 0.1;
  }
  return product.prce * 0.05;  // Note the typo
}

const discount = getDiscount({ name: "Gadget" });
```

---

**Previous: [Chapter 4 - Async JavaScript](../part-1-javascript/04-async-javascript.md)**

**Next: [Chapter 6 - Advanced TypeScript](./06-advanced-typescript.md)**
