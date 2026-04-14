# Chapter 1: The Building Blocks

This is where it begins. In this chapter, you will learn the fundamental pieces that make up all JavaScript code: variables, data types, operators, and how the computer actually stores and works with your data.

---

## What You Will Learn

- How to store data in variables
- The difference between `const`, `let`, and `var`
- JavaScript's data types and how to recognize them
- How operators transform data
- Template literals for building strings
- How memory actually works when you create variables

---

## Prerequisites

- You have read Chapter 0 and understand what the browser and server are
- You have a code editor open (VS Code recommended)
- You can open the browser console (Right-click > Inspect > Console tab)

---

## The Vocabulary

**Variable** - A named container for storing data. Like a labeled box.

**Declaration** - The act of creating a variable. "I want a box called `name`."

**Assignment** - Putting a value into a variable. "Put 'Alice' in the box."

**Type** - The category of data. Is it text? A number? True/false?

**Expression** - Code that produces a value. `2 + 2` is an expression that produces `4`.

**Statement** - A complete instruction. `const x = 5;` is a statement.

**Literal** - A value written directly in code. `"hello"` is a string literal. `42` is a number literal.

---

## Section 1: Variables - Storing Data

### The Concept

Programs need to remember things. Variables are how we give names to pieces of data so we can use them later.

```javascript
const userName = "Alice";
```

This creates a variable named `userName` and stores the text "Alice" in it.

### Why Variables Exist

Without variables, you would have to repeat values everywhere:

```javascript
// Without variables - painful
console.log("Welcome, Alice");
console.log("Alice, you have 3 messages");
console.log("Goodbye, Alice");

// With variables - change one place, changes everywhere
const userName = "Alice";
console.log("Welcome, " + userName);
console.log(userName + ", you have 3 messages");
console.log("Goodbye, " + userName);
```

Variables also let you:
- Change values over time
- Pass data between different parts of your code
- Give meaningful names to confusing values

### The Three Ways to Declare Variables

JavaScript has three keywords for creating variables: `const`, `let`, and `var`.

#### const - Constant (Cannot Be Reassigned)

```javascript
const pi = 3.14159;
const appName = "Align";

pi = 3.14;  // ERROR! Cannot reassign a const
```

`const` means "this variable will always point to the same value." It is your default choice.

#### let - Can Be Reassigned

```javascript
let count = 0;
count = 1;  // OK
count = 2;  // OK

let userName;      // Can declare without assigning
userName = "Bob";  // Assign later
```

Use `let` when you know the value will change.

#### var - The Old Way (Avoid)

```javascript
var oldStyle = "from 1995";
```

`var` is how JavaScript worked before 2015. It has confusing behavior that causes bugs. Do not use it in new code.

### In The Codebase: lib/utils/ids.ts

Open the file `lib/utils/ids.ts`:

```typescript
export function newId(): string {
  return crypto.randomUUID();
}
```

This tiny file has no `const` or `let` - it just returns a value directly. But when you USE this function elsewhere in the codebase:

```typescript
const moveId = newId();
```

Here `moveId` is a `const` because once you generate an ID for something, it should never change. If you accidentally wrote `moveId = "something else"` later, TypeScript would catch the error.

### Where in the File Structure

```
lib/
└── utils/
    └── ids.ts    <- Pure utility function
```

**Why utils/?** This folder contains "pure utility functions" - small, focused functions that do one thing. They do not depend on React, do not have side effects, and can be used anywhere. The name `utils` is a convention meaning "general-purpose tools."

**Why its own file?** Even though it is only 3 lines, it gets its own file because:
1. It can be imported from anywhere without pulling in unrelated code
2. If ID generation ever needs to change (different format, etc.), you change one place
3. The filename makes the purpose obvious

### The Mental Model: Variables as Boxes

Think of memory as a wall of labeled boxes:

```
Memory:
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ userName    │ │ count       │ │ isActive    │
│ "Alice"     │ │ 42          │ │ true        │
└─────────────┘ └─────────────┘ └─────────────┘
```

When you write `const userName = "Alice"`:
1. JavaScript allocates space in memory
2. Labels it with the name `userName`
3. Stores the value "Alice"

When you later use `userName`, JavaScript looks up that label and retrieves the value.

---

## Section 2: Data Types

### The Concept

Not all data is the same. A person's name is text. Their age is a number. Whether they are online is true or false. JavaScript needs to know what type of data it is working with.

### Primitive Types

JavaScript has 7 primitive types. You will use 5 constantly:

#### String - Text

```javascript
const name = "Alice";
const message = 'Hello, world';  // Single or double quotes work
const template = `Hello, ${name}`;  // Backticks allow embedding
```

Strings are sequences of characters. They are immutable - you cannot change a string, only create new ones.

#### Number - Numeric Values

```javascript
const age = 25;
const price = 19.99;
const negative = -10;
const big = 1_000_000;  // Underscores for readability
```

JavaScript has one number type for both integers and decimals. This is unusual - most languages separate them.

#### Boolean - True or False

```javascript
const isLoggedIn = true;
const hasError = false;
```

Only two possible values. Named after mathematician George Boole.

#### undefined - No Value Yet

```javascript
let something;
console.log(something);  // undefined

const obj = {};
console.log(obj.missingProperty);  // undefined
```

`undefined` means "this exists but has no value." JavaScript automatically sets this.

#### null - Intentionally Empty

```javascript
const noUser = null;
```

`null` means "I explicitly set this to nothing." You use it to indicate absence.

#### The Difference Between undefined and null

```javascript
let a;           // undefined - not assigned yet
let b = null;    // null - deliberately set to nothing
```

This confuses everyone. The rule of thumb:
- `undefined` = JavaScript did this
- `null` = You did this

### In The Codebase: Local Types

Open `lib/db/local.ts`:

```typescript
export interface LocalMove {
  id: string;
  cycleId: string;
  directionId?: string;     // The ? means optional - could be undefined
  userId: string;
  title: string;
  date: string;
  status: "pending" | "done";
  doneAt?: string;          // Optional - undefined if not done yet
  createdAt: string;
  updatedAt: string;
  _synced: 0 | 1;
}
```

Notice:
- `id`, `title`, `date` are strings
- `doneAt` is optional (`?`) - it is `undefined` until the move is marked done
- `_synced` is a number, but only 0 or 1 (more on this in TypeScript chapters)

### Checking Types: typeof

You can ask JavaScript what type something is:

```javascript
typeof "hello"     // "string"
typeof 42          // "number"
typeof true        // "boolean"
typeof undefined   // "undefined"
typeof null        // "object" (this is a famous bug from 1995)
```

The `null` returning "object" is a mistake in JavaScript that cannot be fixed because it would break old websites. Just remember it.

### What It Compiles To

When you write:

```javascript
const age = 25;
```

The JavaScript engine:
1. Allocates memory for a number (8 bytes in V8)
2. Stores the binary representation of 25
3. Creates an entry in the current scope linking "age" to that memory location

Numbers in JavaScript are "double-precision 64-bit floating point" (IEEE 754). This is why:

```javascript
0.1 + 0.2  // 0.30000000000000004 (not exactly 0.3)
```

The binary representation cannot exactly represent 0.1 or 0.2, so you get tiny rounding errors. This is not a JavaScript bug - it is how all floating-point math works.

---

## Section 3: Operators

### The Concept

Operators transform values. The `+` operator adds numbers. The `===` operator checks equality. Operators are verbs in the language of code.

### Arithmetic Operators

```javascript
10 + 3     // 13 (addition)
10 - 3     // 7  (subtraction)
10 * 3     // 30 (multiplication)
10 / 3     // 3.333... (division)
10 % 3     // 1  (remainder/modulo)
10 ** 3    // 1000 (exponent, 10 cubed)
```

### Comparison Operators

```javascript
5 === 5    // true (strict equality)
5 !== 3    // true (strict inequality)
5 > 3      // true
5 >= 5     // true
5 < 10     // true
5 <= 5     // true
```

#### The == vs === Problem

JavaScript has two equality operators:

```javascript
// == (loose equality) - converts types before comparing
5 == "5"     // true (string "5" becomes number 5)
0 == false   // true (false becomes 0)
null == undefined  // true (special case)

// === (strict equality) - no conversion, must be same type
5 === "5"    // false (number vs string)
0 === false  // false (number vs boolean)
null === undefined  // false (different types)
```

**Always use `===`**. The loose equality rules are confusing and cause bugs. The Align codebase uses `===` exclusively.

### Logical Operators

```javascript
true && true    // true (AND - both must be true)
true && false   // false
true || false   // true (OR - at least one must be true)
false || false  // false
!true           // false (NOT - inverts)
!false          // true
```

### In The Codebase: lib/utils/debug.ts

```typescript
export function debug(...args: unknown[]): void {
  if (process.env.NODE_ENV === "development") {
    console.log("[align]", ...args);
  }
}
```

Look at the comparison: `process.env.NODE_ENV === "development"`

This checks if we are in development mode using strict equality. If true, it logs. If false (production), it does nothing.

**Why?** In production, you do not want debug messages cluttering the console or leaking information. This function lets developers sprinkle `debug()` calls throughout the code without worrying about them appearing in production.

### String Concatenation

The `+` operator with strings joins them:

```javascript
"Hello" + " " + "World"  // "Hello World"
"Count: " + 42           // "Count: 42" (number becomes string)
```

But this gets messy with many values. See the next section.

---

## Section 4: Template Literals

### The Concept

Template literals are strings that can contain expressions. They use backticks instead of quotes.

```javascript
const name = "Alice";
const age = 30;

// Old way (concatenation)
const message1 = "Hello, " + name + "! You are " + age + " years old.";

// Template literal
const message2 = `Hello, ${name}! You are ${age} years old.`;
```

The `${...}` syntax lets you embed any expression:

```javascript
`Two plus two is ${2 + 2}`              // "Two plus two is 4"
`Is active: ${isLoggedIn && hasData}`   // "Is active: true" (or false)
`Uppercase: ${name.toUpperCase()}`      // "Uppercase: ALICE"
```

### Multi-line Strings

Template literals can span multiple lines:

```javascript
const html = `
  <div class="card">
    <h2>${title}</h2>
    <p>${description}</p>
  </div>
`;
```

With regular strings, you would need `\n` for newlines. Template literals preserve them.

### In The Codebase: Debug Output

Look at `lib/utils/debug.ts` again:

```typescript
console.log("[align]", ...args);
```

This uses string literal `"[align]"` as a prefix. But elsewhere in the codebase, you will see template literals for more complex messages:

```typescript
debug(`Syncing ${tableName}: ${records.length} records`);
```

This builds a message like "Syncing moves: 5 records" dynamically.

### Why Template Literals Over Concatenation

| Concatenation | Template Literal |
|---------------|------------------|
| Hard to read with many values | Easy to read |
| Easy to forget spaces | Spacing is visual |
| Cannot do multi-line easily | Multi-line works naturally |
| `"Hello " + name + "!"` | `` `Hello ${name}!` `` |

The Align codebase uses template literals whenever strings need embedded values.

---

## Section 5: How Memory Actually Works

### The Mental Model

When you create a variable, JavaScript stores it somewhere. But WHERE matters for understanding bugs.

### Primitive Values: Stored Directly

```javascript
let a = 5;
let b = a;  // Copies the value
b = 10;
console.log(a);  // Still 5!
```

Primitives (strings, numbers, booleans) are stored by VALUE. Assigning to `b` copies the number, not a reference to it.

```
Memory:
┌───────┐     ┌───────┐
│ a: 5  │     │ b: 10 │
└───────┘     └───────┘
(independent copies)
```

### Objects and Arrays: Stored by Reference

```javascript
let user1 = { name: "Alice" };
let user2 = user1;  // Copies the REFERENCE, not the object
user2.name = "Bob";
console.log(user1.name);  // "Bob" - both point to same object!
```

Objects are stored by REFERENCE. The variable holds a pointer to where the object lives.

```
Memory:
┌────────────────┐
│ user1          │────┐
└────────────────┘    │
                      ▼
                 ┌─────────────┐
                 │ { name:     │
                 │   "Bob" }   │
                 └─────────────┘
                      ▲
┌────────────────┐    │
│ user2          │────┘
└────────────────┘
(both point to same object)
```

### Why This Matters Enormously

This is one of the most common sources of bugs:

```javascript
// BUG: Accidentally mutating shared data
const original = { count: 0 };
const copy = original;  // Not a real copy!
copy.count = 99;        // Changes original too!
```

To actually copy an object:

```javascript
// Shallow copy
const copy = { ...original };

// Or for arrays
const arrCopy = [...originalArray];
```

This concept will return in Chapter 8 when we discuss React state. React requires immutability - you must create new objects instead of modifying existing ones.

### In The Codebase: Immutable Patterns

Throughout Align, you will see patterns like:

```typescript
// Creating a new object instead of modifying
setState(prev => ({ ...prev, isLoading: true }));

// Creating a new array with an item added
setItems(prev => [...prev, newItem]);

// Creating a new array with an item removed
setItems(prev => prev.filter(item => item.id !== idToRemove));
```

These all create NEW objects/arrays instead of modifying existing ones. This is intentional. You will learn why in the React chapters.

---

## Mistakes: What Breaks

### Mistake 1: Using var Instead of const/let

```javascript
// BUG: var has function scope, not block scope
if (true) {
  var leaked = "oops";
}
console.log(leaked);  // "oops" - variable escaped the block!

// With let/const, this correctly errors
if (true) {
  let contained = "safe";
}
console.log(contained);  // ReferenceError: contained is not defined
```

**Why it is hard to spot:** The code runs without error. The bug appears later when `leaked` shows up somewhere unexpected.

### Mistake 2: Confusing === and ==

```javascript
// BUG: Unexpected truthy comparisons
const input = "0";
if (input == 0) {
  // This runs! "0" loosely equals 0
}

if (input === 0) {
  // This does NOT run. String is not number.
}
```

**The error you will see:** No error. Just wrong behavior.

### Mistake 3: Assuming Strings Changed

```javascript
let name = "alice";
name.toUpperCase();
console.log(name);  // Still "alice"!
```

**Why:** Strings are immutable. `toUpperCase()` returns a NEW string, does not change the original.

```javascript
// Correct
let name = "alice";
name = name.toUpperCase();  // Reassign to the new value
console.log(name);  // "ALICE"
```

### Mistake 4: Floating Point Comparison

```javascript
// BUG: Fails due to floating point imprecision
if (0.1 + 0.2 === 0.3) {
  // Never runs! 0.1 + 0.2 = 0.30000000000000004
}

// Fix: Compare with tolerance
const almostEqual = Math.abs((0.1 + 0.2) - 0.3) < 0.0001;
```

### Mistake 5: The typeof null Bug

```javascript
const value = null;
if (typeof value === "object") {
  value.someMethod();  // CRASH! null.someMethod is not a function
}

// Fix: Check for null explicitly
if (value !== null && typeof value === "object") {
  value.someMethod();
}
```

---

## Mental Debugging

When a variable has the wrong value, ask yourself:

1. **Where was it assigned?** Search for `variableName =` to find all assignments.

2. **What type is it?** Add `console.log(typeof variableName, variableName)` to see both.

3. **Is it a copy or a reference?** If it is an object/array and changing one changes another, you have a reference issue.

4. **Did I use == instead of ===?** Check comparisons.

5. **Did I forget to reassign?** Methods like `toUpperCase()` return values; they do not modify in place.

**Where to look:**
- Browser Console: `console.log(variable)`
- Debugger: Set breakpoints, hover over variables
- VS Code: Hover shows type information in TypeScript files

---

## Connections

**From Chapter 0:** Variables live in memory. When the browser tab closes, they are gone. That is why Chapter 13 covers Dexie - storing data that survives.

**To Chapter 2:** Functions can receive variables as parameters and return new values. This is how data flows through your program.

**To Chapter 5:** TypeScript adds type annotations to variables, catching mistakes before the code runs.

**To Chapter 8:** React state uses variables with special rules. Understanding primitives vs references is critical there.

---

## Go Figure It Out

1. **What is "hoisting"?** Why can you use a `var` variable before its declaration but not a `let`? What actually happens during JavaScript execution?

2. **What is the difference between primitive and reference types in memory?** Draw diagrams. Understand why `===` works differently for objects.

3. **What is NaN?** What operations produce it? Why does `NaN === NaN` return `false`? How do you properly check for NaN?

4. **What are "truthy" and "falsy" values?** Which values are falsy in JavaScript? Why does this matter for `if` statements?

5. **What is type coercion?** How does JavaScript automatically convert types? Find the rules. This explains why `==` is unpredictable.

6. **Open the browser console and try:** 
   - `typeof []` - why is an array "object"?
   - `[] + []` - what happens?
   - `[] + {}` - what about this?
   - `{} + []` - and this? (Different!)
   
   These bizarre results come from coercion rules. Find out why.

---

## Chapter Exercise

### Part 1: In the Browser Console

Open your browser's console and experiment:

```javascript
// Try these and predict the results BEFORE pressing Enter
const a = 5;
const b = "5";
a === b
a == b
typeof a
typeof b

const obj1 = { x: 1 };
const obj2 = obj1;
obj2.x = 99;
obj1.x  // What is this?

const obj3 = { x: 1 };
const obj4 = { x: 1 };
obj3 === obj4  // Are they equal?
```

### Part 2: In the Codebase

1. Open `lib/db/local.ts`. Find all the different types used in `LocalMove`. List each property and its type.

2. Open `lib/utils/dates.ts`. Find `cycleDay()`. Identify:
   - What type does it take as a parameter?
   - What type does it return?
   - What operators does it use?

3. Create a new file `learn/exercises/sandbox/ch1-practice.ts`:
   - Declare a `const` for your name
   - Declare a `let` for a counter starting at 0
   - Write a template literal that says "Hello, [name]! Counter is [counter]."
   - Try to reassign the `const` - what error do you get?

---

**Previous: [Chapter 0 - How The Web Actually Works](../00-how-the-web-works.md)**

**Next: [Chapter 2 - Functions and Logic](./02-functions-and-logic.md)**
