# Chapter 6: Advanced TypeScript

Chapter 5 covered the basics: annotations, interfaces, and simple types. This chapter goes deeper: union types, generics, type guards, and utility types. These features make TypeScript powerful enough to describe complex data flows safely.

---

## What You Will Learn

- Union and intersection types
- Generics: functions and types that work with any type
- Type guards and narrowing
- Utility types: Partial, Pick, Omit, etc.
- Discriminated unions
- Mapped types

---

## Prerequisites

- Chapter 5: Basic TypeScript

---

## The Vocabulary

**Union type** - A type that can be one of several types: `string | number`.

**Intersection type** - A type that combines multiple types: `A & B`.

**Generic** - A type that takes a type parameter, like a function for types.

**Type guard** - A function or check that narrows a type within a block.

**Narrowing** - When TypeScript determines a more specific type based on code flow.

**Utility type** - Built-in types that transform other types: `Partial<T>`, `Pick<T, K>`.

**Discriminated union** - A union where each member has a unique literal property for identification.

**Mapped type** - A type that transforms properties of another type.

---

## Section 1: Union Types

### The Concept

A union type allows multiple types:

```typescript
type StringOrNumber = string | number;

let value: StringOrNumber;
value = "hello";  // OK
value = 42;       // OK
value = true;     // ERROR
```

### Why Unions Exist

Real data often has multiple valid forms:

```typescript
// A function that accepts either format
function formatId(id: string | number): string {
  return `ID: ${id}`;
}

formatId("abc");  // OK
formatId(123);    // OK
```

### In The Codebase: Status Types

```typescript
export interface LocalMove {
  status: "pending" | "done";
  // ...
}
```

This is a union of literal types. Only these exact strings are valid.

### Working with Unions

When you have a union, you can only use properties/methods common to all types:

```typescript
function process(value: string | number) {
  value.toUpperCase();  // ERROR: number doesn't have toUpperCase
  
  // Narrow first
  if (typeof value === "string") {
    value.toUpperCase();  // OK, TypeScript knows it's a string here
  }
}
```

---

## Section 2: Intersection Types

### The Concept

An intersection combines types:

```typescript
type A = { name: string };
type B = { age: number };
type C = A & B;  // { name: string; age: number }

const person: C = {
  name: "Alice",
  age: 30
};
```

### When to Use Intersections

Combining existing types:

```typescript
type WithId = { id: string };
type WithTimestamps = { createdAt: string; updatedAt: string };

type Entity = WithId & WithTimestamps;
// { id: string; createdAt: string; updatedAt: string }

interface User extends Entity {
  name: string;
}
```

---

## Section 3: Type Narrowing

### The Concept

Narrowing is when TypeScript determines a more specific type:

```typescript
function process(value: string | number) {
  // value is string | number here
  
  if (typeof value === "string") {
    // value is string here (narrowed)
    return value.toUpperCase();
  }
  
  // value is number here (TypeScript eliminated string)
  return value * 2;
}
```

### Narrowing Techniques

**typeof:**
```typescript
if (typeof x === "string") { ... }
if (typeof x === "number") { ... }
if (typeof x === "boolean") { ... }
```

**Truthiness:**
```typescript
if (x) {
  // x is not null, undefined, 0, "", or false
}
```

**Equality:**
```typescript
if (x === null) {
  // x is null
}
if (x !== undefined) {
  // x is not undefined
}
```

**in operator:**
```typescript
if ("name" in obj) {
  // obj has a name property
}
```

**instanceof:**
```typescript
if (x instanceof Date) {
  // x is a Date
}
```

### In The Codebase: Optional Property Checks

```typescript
export interface LocalMove {
  doneAt?: string;  // Optional
}

function getDoneTime(move: LocalMove): string {
  if (move.doneAt) {
    return move.doneAt;  // TypeScript knows it's string, not undefined
  }
  return "Not done yet";
}
```

---

## Section 4: Type Guards

### The Concept

A type guard is a function that narrows types:

```typescript
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function process(value: unknown) {
  if (isString(value)) {
    // value is string here
    console.log(value.toUpperCase());
  }
}
```

The `value is string` return type is special. It tells TypeScript this function narrows the type.

### Custom Type Guards

```typescript
interface User {
  type: "user";
  name: string;
}

interface Admin {
  type: "admin";
  name: string;
  permissions: string[];
}

function isAdmin(person: User | Admin): person is Admin {
  return person.type === "admin";
}

function showPermissions(person: User | Admin) {
  if (isAdmin(person)) {
    console.log(person.permissions);  // OK, TypeScript knows it's Admin
  }
}
```

### In The Codebase: Runtime Type Checking

When data comes from external sources, you need runtime checks:

```typescript
function isValidMove(data: unknown): data is LocalMove {
  if (typeof data !== "object" || data === null) return false;
  if (!("id" in data) || typeof data.id !== "string") return false;
  if (!("status" in data)) return false;
  if (data.status !== "pending" && data.status !== "done") return false;
  // ... more checks
  return true;
}
```

---

## Section 5: Generics

### The Concept

Generics let you write code that works with any type:

```typescript
function identity<T>(value: T): T {
  return value;
}

identity<string>("hello");  // Returns string
identity<number>(42);       // Returns number
identity(true);             // T inferred as boolean
```

`T` is a type parameter. It is like a variable for types.

### Why Generics Exist

Without generics:

```typescript
function firstString(arr: string[]): string | undefined {
  return arr[0];
}

function firstNumber(arr: number[]): number | undefined {
  return arr[0];
}

// Repeat for every type...
```

With generics:

```typescript
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

first(["a", "b"]);  // Returns string | undefined
first([1, 2, 3]);   // Returns number | undefined
```

One function, any type.

### Generic Interfaces

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

const userResponse: ApiResponse<User> = {
  data: { id: "1", name: "Alice" },
  status: 200,
  message: "OK"
};

const postsResponse: ApiResponse<Post[]> = {
  data: [{ id: "1", title: "Hello" }],
  status: 200,
  message: "OK"
};
```

### In The Codebase: Dexie Tables

```typescript
class AlignDB extends Dexie {
  profiles!: Table<LocalProfile, string>;
  cycles!: Table<LocalCycle, string>;
  moves!: Table<LocalMove, string>;
  // ...
}
```

`Table<LocalProfile, string>` is a generic type:
- First parameter: the type of objects in the table
- Second parameter: the type of the primary key

This makes all database operations type-safe:

```typescript
const profile = await db.profiles.get(userId);
// profile is LocalProfile | undefined
```

### In The Codebase: lib/db/sync.ts

```typescript
async function pushUnsyncedTable<T extends { id: string }>(
  records: T[],
  push: (items: T[]) => Promise<boolean>,
  markSynced: (id: string) => Promise<number>
): Promise<void> {
  if (!records.length) return;
  const ok = await push(records);
  if (!ok) return;
  await Promise.all(records.map((record) => markSynced(record.id)));
}
```

This generic function:
- Takes any type `T` that has an `id` property (`T extends { id: string }`)
- Works with cycles, moves, directions, etc.
- Is called for each table type

### Generic Constraints

Constrain what types are allowed:

```typescript
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength("hello");     // OK, strings have length
getLength([1, 2, 3]);   // OK, arrays have length
getLength(123);         // ERROR, numbers don't have length
```

The `extends` keyword limits `T` to types with a `length` property.

---

## Section 6: Utility Types

TypeScript provides built-in types for common transformations.

### Partial<T>

Makes all properties optional:

```typescript
interface User {
  id: string;
  name: string;
  age: number;
}

type PartialUser = Partial<User>;
// { id?: string; name?: string; age?: number }

function updateUser(id: string, updates: Partial<User>) {
  // Can pass any subset of user properties
}

updateUser("1", { name: "New Name" });  // OK
updateUser("1", { age: 25 });           // OK
```

### Required<T>

Makes all properties required:

```typescript
type RequiredUser = Required<PartialUser>;
// { id: string; name: string; age: number }
```

### Pick<T, K>

Select specific properties:

```typescript
type UserPreview = Pick<User, "id" | "name">;
// { id: string; name: string }
```

### Omit<T, K>

Exclude specific properties:

```typescript
type UserWithoutId = Omit<User, "id">;
// { name: string; age: number }
```

### In The Codebase: Partial Updates

When updating a profile, you do not send all fields:

```typescript
await db.profiles.update(userId, {
  notifEnabled: true  // Only updating this field
});
```

Dexie's `update` method accepts `Partial<LocalProfile>`.

### Record<K, V>

Create an object type with specific keys and value type:

```typescript
type ColorMap = Record<"terra" | "forest" | "slate", string>;
// { terra: string; forest: string; slate: string }

const colors: ColorMap = {
  terra: "#c45a3b",
  forest: "#2d5a3d",
  slate: "#5a5a6a"
};
```

### Readonly<T>

Make all properties readonly:

```typescript
type ImmutableUser = Readonly<User>;

const user: ImmutableUser = { id: "1", name: "Alice", age: 30 };
user.name = "Bob";  // ERROR: Cannot assign to 'name'
```

---

## Section 7: Discriminated Unions

### The Concept

A discriminated union uses a literal property to distinguish between types:

```typescript
interface PendingMove {
  status: "pending";
  title: string;
  date: string;
}

interface DoneMove {
  status: "done";
  title: string;
  date: string;
  doneAt: string;  // Only present when done
}

type Move = PendingMove | DoneMove;
```

### Why Discriminated Unions

TypeScript can narrow based on the discriminant:

```typescript
function formatMove(move: Move): string {
  if (move.status === "done") {
    // TypeScript knows move is DoneMove here
    return `${move.title} (completed ${move.doneAt})`;
  }
  // TypeScript knows move is PendingMove here
  return `${move.title} (pending)`;
}
```

### In The Codebase: Sheet Data

Different sheets need different data:

```typescript
// Conceptually:
type SheetData =
  | { sheet: "mark-done"; move: LocalMove }
  | { sheet: "direction-detail"; direction: LocalDirection }
  | { sheet: "day-detail"; date: string }
  | { sheet: "tips" };  // No additional data

function renderSheet(data: SheetData) {
  switch (data.sheet) {
    case "mark-done":
      return <MarkDoneSheet move={data.move} />;
    case "direction-detail":
      return <DirectionDetailSheet direction={data.direction} />;
    // ...
  }
}
```

The `sheet` property discriminates which type you have.

---

## Section 8: Mapped Types

### The Concept

Transform every property of a type:

```typescript
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

interface User {
  id: string;
  name: string;
}

type NullableUser = Nullable<User>;
// { id: string | null; name: string | null }
```

### How Partial Works

`Partial<T>` is implemented as:

```typescript
type Partial<T> = {
  [K in keyof T]?: T[K];
};
```

- `keyof T` gets all property names
- `[K in keyof T]` iterates over each property
- `?:` makes each property optional
- `T[K]` gets the original type of each property

### In The Codebase: Database Type Mappings

The sync code maps between local and database types:

```typescript
// Local uses camelCase
interface LocalMove {
  cycleId: string;
  userId: string;
  directionId?: string;
}

// Database uses snake_case
interface DbMove {
  cycle_id: string;
  user_id: string;
  direction_id: string | null;
}
```

Conversion functions handle the mapping:

```typescript
function moveToDb(m: LocalMove): DbMove {
  return {
    cycle_id: m.cycleId,
    user_id: m.userId,
    direction_id: m.directionId ?? null,
    // ...
  };
}
```

---

## Where Advanced Types Appear in the Codebase

```
lib/
├── db/
│   ├── local.ts    <- Interfaces with literal types
│   ├── types.ts    <- Generated types with generics
│   └── sync.ts     <- Generic sync functions
├── context/
│   └── AppContext.tsx  <- Union types for sheets
```

**Why literal unions for status?**
- Self-documenting (shows all valid values)
- Autocomplete in editors
- Exhaustiveness checking in switch statements

**Why generics for database operations?**
- One function works for all table types
- Type safety maintained throughout
- Less code duplication

---

## Mistakes: What Breaks

### Mistake 1: Forgetting to Narrow

```typescript
function process(value: string | null) {
  return value.toUpperCase();  // ERROR: value might be null
}

// FIX
function process(value: string | null) {
  if (value === null) return "";
  return value.toUpperCase();
}
```

### Mistake 2: Wrong Generic Constraint

```typescript
function first<T>(arr: T): T {  // T should be T[]
  return arr[0];  // ERROR: Type 'T' has no index signature
}

// FIX
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

### Mistake 3: Non-Exhaustive Switches

```typescript
type Status = "pending" | "done" | "cancelled";

function format(status: Status): string {
  switch (status) {
    case "pending": return "Pending";
    case "done": return "Done";
    // Missing "cancelled"!
  }
}

// TypeScript can catch this with exhaustiveness checking:
function format(status: Status): string {
  switch (status) {
    case "pending": return "Pending";
    case "done": return "Done";
    case "cancelled": return "Cancelled";
    default:
      const _exhaustive: never = status;
      return _exhaustive;
  }
}
```

If you add a new status, TypeScript errors because it cannot be assigned to `never`.

### Mistake 4: Overusing any in Generics

```typescript
// BAD
function wrap<T = any>(value: T): { data: T } {
  return { data: value };
}

// BETTER - no default, force caller to specify or infer
function wrap<T>(value: T): { data: T } {
  return { data: value };
}
```

---

## Mental Debugging

When generic or union errors confuse you:

1. **Hover over the type.** What does TypeScript think it is?

2. **Simplify.** Remove generics temporarily to understand the base case.

3. **Check the constraint.** Is `T extends Something` correct?

4. **Check for narrow.** Did you narrow the union before accessing specific properties?

5. **Read the error carefully.** Generic errors are verbose but specific.

**Common error patterns:**

```
Type 'X' is not assignable to type 'Y'
// The generic constraint is not satisfied

Property 'foo' does not exist on type 'X | Y'
// You need to narrow before accessing

Type 'T' does not satisfy constraint 'U'
// T is too broad, constrain it
```

---

## Connections

**From Chapter 5:** Generics and utility types build on basic type concepts.

**To Chapter 8:** React component props use generics (`FC<Props>`).

**To Chapter 10:** Context types use generics for type-safe providers.

**To Chapter 13:** Dexie heavily uses generics for type-safe queries.

**To Chapter 14:** Supabase generated types use advanced TypeScript features.

---

## Go Figure It Out

1. **What is "conditional types"?** Syntax like `T extends U ? X : Y`. When would you use this?

2. **What is the `infer` keyword?** How does it extract types from other types?

3. **What is "variance"?** Covariance, contravariance, invariance. How do they affect generic type assignment?

4. **What are "template literal types"?** Types like `` `get${Capitalize<string>}` ``. What can you do with them?

5. **What is "declaration merging" with modules?** How do you add types to existing libraries?

6. **Explore the TypeScript source for utility types:** How is `Omit<T, K>` actually implemented? (Hint: It uses `Pick` and `Exclude`.)

---

## Chapter Exercise

### Part 1: Practice Generics

Create `learn/exercises/sandbox/ch6-advanced.ts`:

```typescript
// 1. Write a generic function that returns the last element of an array

// 2. Write a generic function that merges two objects
// Hint: Use intersection types

// 3. Create a generic type for API responses:
// { success: true; data: T } | { success: false; error: string }

// 4. Write a type guard for the API response that checks success

// 5. Use Pick to create a "UserPreview" type from:
interface FullUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}
// UserPreview should only have id and name
```

### Part 2: In the Codebase

1. Open `lib/db/sync.ts`. Find `pushUnsyncedTable`. What is the generic constraint? Why is it needed?

2. Find the `Tables<>` type in `lib/db/types.ts`. How does it extract table types from the Database type?

3. Find union types used for status fields. How many different status unions are there?

### Part 3: Fix the Type Errors

```typescript
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

interface Cat extends Animal {
  indoor: boolean;
}

type Pet = Dog | Cat;

function describePet(pet: Pet): string {
  return `${pet.name} is a ${pet.breed}`;  // Error!
}

// Fix the function to work correctly for both dogs and cats
```

---

**Previous: [Chapter 5 - Types That Protect You](./05-types-that-protect.md)**

**Next: [Chapter 7 - Components and JSX](../part-3-react/07-components-and-jsx.md)**
