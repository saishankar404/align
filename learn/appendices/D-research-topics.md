# Appendix D: Research Topics

This appendix provides curated research topics for continued learning. Each topic includes starting questions, recommended resources, and connections to what you have learned. These are not tutorials - they are invitations to explore deeply and form your own understanding.

---

## How to Use This Appendix

1. **Pick one topic** that interests you or connects to something you found confusing
2. **Start with the questions** - try to answer them before reading anything
3. **Use the resources** as starting points, not destinations
4. **Build something small** that exercises the concept
5. **Write down what you learned** in your own words

The best learning happens when you struggle productively with hard questions.

---

## Part 1: JavaScript Deep Dives

### Topic 1.1: The Event Loop Internals

You learned that JavaScript is single-threaded and uses an event loop. But how does it actually work at the engine level?

**Research Questions:**
- What is the difference between the call stack, task queue, and microtask queue?
- Why do Promises resolve before setTimeout callbacks, even with setTimeout(fn, 0)?
- What is "starving the task queue" and how can it happen?
- How does requestAnimationFrame fit into the event loop?
- What happens when you have nested Promise.then() calls?

**Starting Resources:**
- Jake Archibald's "In The Loop" talk (JSConf.Asia 2018)
- MDN: "Concurrency model and the Event Loop"
- Philip Roberts' "What the heck is the event loop anyway?" (JSConf EU 2014)

**Experiment:**
```javascript
console.log('1')
setTimeout(() => console.log('2'), 0)
Promise.resolve().then(() => console.log('3'))
console.log('4')
// Predict the output, then run it. Explain why.
```

**Connection to Align:**
The sync engine in `lib/db/sync.ts` uses debouncing and setTimeout. Understanding the event loop helps you reason about when sync actually fires.

---

### Topic 1.2: Prototype Chain and Inheritance

JavaScript's inheritance model is different from class-based languages. The `class` syntax is sugar over prototypes.

**Research Questions:**
- What is the `[[Prototype]]` internal slot and how does it differ from `.prototype`?
- How does property lookup work through the prototype chain?
- What does `Object.create(null)` do and why would you use it?
- How do ES6 classes compile to prototype-based code?
- What is the difference between `__proto__` and `Object.getPrototypeOf()`?

**Starting Resources:**
- MDN: "Inheritance and the prototype chain"
- Kyle Simpson's "You Don't Know JS: this & Object Prototypes"
- JavaScript.info: "Prototypal inheritance"

**Experiment:**
```javascript
function Animal(name) { this.name = name }
Animal.prototype.speak = function() { console.log(this.name + ' makes a sound') }

function Dog(name) { Animal.call(this, name) }
Dog.prototype = Object.create(Animal.prototype)
Dog.prototype.constructor = Dog

// Rewrite using class syntax. What changes? What stays the same?
```

**Connection to Align:**
Dexie uses classes extensively. Understanding prototypes helps you read library source code and debug inheritance issues.

---

### Topic 1.3: Memory Management and Garbage Collection

JavaScript manages memory automatically, but memory leaks still happen.

**Research Questions:**
- What is the mark-and-sweep algorithm?
- What are the common causes of memory leaks in JavaScript?
- How do closures affect garbage collection?
- What are WeakMap and WeakSet, and when would you use them?
- How can you profile memory usage in Chrome DevTools?

**Starting Resources:**
- Chrome DevTools documentation: "Fix memory problems"
- MDN: "Memory Management"
- Addy Osmani's "JavaScript Memory Profiling"

**Experiment:**
```javascript
// This leaks memory. Why?
const cache = {}
function process(id, data) {
  cache[id] = { data, timestamp: Date.now() }
  return cache[id]
}
// How would you fix it?
```

**Connection to Align:**
The offline-first architecture caches data in IndexedDB and memory. Understanding GC helps you avoid leaks in long-running PWAs.

---

## Part 2: TypeScript Advanced Topics

### Topic 2.1: The Type System as a Language

TypeScript's type system is Turing complete. You can compute at the type level.

**Research Questions:**
- What are template literal types and how do they work?
- How do conditional types enable type-level programming?
- What is the `infer` keyword and when would you use it?
- How can you extract types from functions, arrays, and Promises?
- What are mapped types with key remapping?

**Starting Resources:**
- TypeScript Handbook: "Template Literal Types"
- Matt Pocock's "Total TypeScript" tutorials
- Type Challenges repository on GitHub

**Experiment:**
```typescript
// Make this work:
type PathParams<T extends string> = // your implementation
type Result = PathParams<'/users/:userId/posts/:postId'>
// Result should be { userId: string, postId: string }
```

**Connection to Align:**
Supabase generates types from your database schema. Understanding advanced types helps you work with generated types and create your own utilities.

---

### Topic 2.2: Variance and Subtyping

Understanding variance explains why some assignments work and others fail.

**Research Questions:**
- What is covariance, contravariance, and invariance?
- Why are function parameters contravariant but return types covariant?
- What does `strictFunctionTypes` do and why does it matter?
- How does variance affect generic types?
- What is bivariance and when does TypeScript use it?

**Starting Resources:**
- TypeScript Handbook: "Type Compatibility"
- Stephan Boyer's "What is covariance and contravariance?"
- Microsoft's TypeScript FAQ on variance

**Experiment:**
```typescript
type Animal = { name: string }
type Dog = { name: string; breed: string }

let animals: Animal[] = []
let dogs: Dog[] = [{ name: 'Rex', breed: 'German Shepherd' }]

animals = dogs  // Does this work? Should it?
animals.push({ name: 'Cat' })  // What happens to dogs?
```

**Connection to Align:**
The Database type from Supabase uses complex generics. Variance explains why some type assignments work in query builders.

---

### Topic 2.3: Declaration Files and Module Augmentation

How do you add types to untyped libraries or extend existing types?

**Research Questions:**
- What is the difference between `.d.ts` and `.ts` files?
- How does TypeScript resolve types from node_modules?
- What is module augmentation and declaration merging?
- How do you type a JavaScript library that has no types?
- What is the `declare` keyword and when do you use it?

**Starting Resources:**
- TypeScript Handbook: "Declaration Files"
- DefinitelyTyped contribution guidelines
- TypeScript Deep Dive: "Declaration Spaces"

**Experiment:**
```typescript
// Extend the Window interface to add a custom property
// that your app uses for feature flags
declare global {
  interface Window {
    // your code
  }
}
```

**Connection to Align:**
The service worker types and PWA APIs often need augmentation. Understanding declaration files helps you work with browser APIs that TypeScript does not fully type.

---

## Part 3: React Internals

### Topic 3.1: Reconciliation and the Fiber Architecture

React's diffing algorithm is why it is fast. Fiber is how it is implemented.

**Research Questions:**
- What is reconciliation and how does the diffing algorithm work?
- Why do keys matter for list rendering performance?
- What is the Fiber architecture and how does it enable concurrent rendering?
- What are render phases vs commit phases?
- How does React decide when to re-render a component?

**Starting Resources:**
- React documentation: "Reconciliation"
- Andrew Clark's "React Fiber Architecture" document
- Dan Abramov's "A Cartoon Intro to Fiber"

**Experiment:**
```jsx
// Profile this with React DevTools.
// Why is one faster than the other?

// Version A
items.map((item, index) => <Item key={index} data={item} />)

// Version B
items.map(item => <Item key={item.id} data={item} />)

// When would Version A actually be correct?
```

**Connection to Align:**
The move list in TodayView uses keys. Understanding reconciliation helps you debug re-render issues and optimize list performance.

---

### Topic 3.2: Hooks Implementation

Hooks seem magical. Understanding how they work removes the magic.

**Research Questions:**
- How does React know which component is calling a hook?
- Why must hooks be called in the same order every render?
- How does useState store state between renders?
- What is the "fiber" and how does it store hook state?
- How does useEffect track dependencies?

**Starting Resources:**
- React documentation: "Hooks FAQ"
- Shawn Wang's "Getting Closure on React Hooks"
- Rodrigo Pombo's "Build your own React"

**Experiment:**
```javascript
// Implement a simple useState
let state = []
let index = 0

function useState(initial) {
  // your implementation
}

// What breaks when you call hooks conditionally?
```

**Connection to Align:**
Custom hooks like `useOnline` and `useToast` build on primitive hooks. Understanding the implementation helps you debug hook-related errors.

---

### Topic 3.3: Server Components and Streaming

React Server Components are a fundamental shift in how React apps work.

**Research Questions:**
- What is the difference between SSR and Server Components?
- What can Server Components do that Client Components cannot?
- How does the "use client" boundary work?
- What is streaming and how does Suspense enable it?
- What are the serialization rules for Server Component props?

**Starting Resources:**
- React documentation: "React Server Components"
- Next.js documentation: "Server and Client Components"
- Dan Abramov's RFC for Server Components

**Experiment:**
```tsx
// Which of these can be a Server Component?
// Which must be a Client Component? Why?

function A() { return <div>{Date.now()}</div> }
function B() { const [x, setX] = useState(0); return <div>{x}</div> }
function C() { return <div>{await db.query()}</div> }
function D({ onClick }) { return <button onClick={onClick}>Click</button> }
```

**Connection to Align:**
AuthGuard is a Server Component that does auth checks. Understanding the boundary helps you architect data loading and authentication.

---

## Part 4: Next.js Deep Dives

### Topic 4.1: Caching and Revalidation

Next.js has multiple caching layers that can be confusing.

**Research Questions:**
- What are the four caching layers in Next.js (Request Memoization, Data Cache, Full Route Cache, Router Cache)?
- What is the difference between `revalidate`, `revalidatePath`, and `revalidateTag`?
- How does `cache: 'no-store'` affect each cache layer?
- What is ISR (Incremental Static Regeneration) and when would you use it?
- How does the Router Cache affect client-side navigation?

**Starting Resources:**
- Next.js documentation: "Caching"
- Lee Robinson's "Understanding Next.js Caching"
- Vercel blog posts on caching strategies

**Experiment:**
```typescript
// What gets cached? When does it revalidate?
async function Page() {
  const data1 = await fetch('https://api.example.com/data')
  const data2 = await fetch('https://api.example.com/data', { cache: 'no-store' })
  const data3 = await fetch('https://api.example.com/data', { next: { revalidate: 60 } })
  // ...
}
```

**Connection to Align:**
Align uses client-side data loading with Dexie, but understanding caching helps you add server-rendered pages or API responses.

---

### Topic 4.2: Middleware and Edge Runtime

Middleware runs before every request. Edge runtime is a different execution environment.

**Research Questions:**
- What can middleware do and what are its limitations?
- What is the Edge runtime and how does it differ from Node.js?
- What APIs are available in Edge vs Node.js?
- When would you use middleware vs route handlers vs server actions?
- How does middleware affect caching?

**Starting Resources:**
- Next.js documentation: "Middleware"
- Vercel documentation: "Edge Runtime"
- Cloudflare Workers documentation (same runtime)

**Experiment:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Implement rate limiting that allows 10 requests per minute per IP
  // What state management challenges do you encounter?
}
```

**Connection to Align:**
The auth callback uses route handlers. Understanding middleware helps you add features like bot protection or geo-routing.

---

### Topic 4.3: Build Output and Deployment

Understanding what Next.js produces helps you debug production issues.

**Research Questions:**
- What files does `next build` produce and what are they for?
- What is the difference between static, dynamic, and streaming routes?
- How does Next.js decide what to pre-render?
- What is the standalone output mode and when would you use it?
- How do environment variables work at build time vs runtime?

**Starting Resources:**
- Next.js documentation: "Deploying"
- Vercel documentation: "Build Output API"
- Next.js GitHub: build output structure

**Experiment:**
```bash
# Run these and examine the output
npm run build
ls -la .next/
cat .next/BUILD_ID
cat .next/routes-manifest.json
# What do you learn about your app's structure?
```

**Connection to Align:**
Understanding build output helps you optimize bundle size and debug deployment issues. The PWA service worker interacts with build output.

---

## Part 5: Database and Backend

### Topic 5.1: PostgreSQL Query Optimization

SQL can be fast or slow depending on how you write it.

**Research Questions:**
- What is an execution plan and how do you read EXPLAIN ANALYZE output?
- What are the different types of indexes and when would you use each?
- What is the difference between a sequential scan and an index scan?
- How do JOINs affect performance and when should you denormalize?
- What is connection pooling and why does it matter?

**Starting Resources:**
- PostgreSQL documentation: "Performance Tips"
- "Use The Index, Luke" (use-the-index-luke.com)
- Postgres Weekly newsletter archives

**Experiment:**
```sql
-- Add EXPLAIN ANALYZE before each query and compare:
SELECT * FROM moves WHERE user_id = 'abc';
SELECT * FROM moves WHERE user_id = 'abc' AND date = '2024-01-15';
SELECT * FROM moves WHERE title LIKE '%morning%';
-- Which uses an index? Which does a sequential scan?
```

**Connection to Align:**
The sync engine queries by user_id and date. Understanding query performance helps you optimize sync speed as data grows.

---

### Topic 5.2: Row Level Security Patterns

RLS is powerful but has subtleties that can create security holes.

**Research Questions:**
- How does RLS interact with different PostgreSQL roles?
- What is the difference between USING and WITH CHECK?
- How do you handle admin access that bypasses RLS?
- What are the performance implications of complex RLS policies?
- How do you test RLS policies to ensure they work correctly?

**Starting Resources:**
- Supabase documentation: "Row Level Security"
- PostgreSQL documentation: "CREATE POLICY"
- Supabase community guides on RLS patterns

**Experiment:**
```sql
-- This policy has a bug. Can you find it?
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Hint: What about the WITH CHECK clause?
-- When would this matter?
```

**Connection to Align:**
Every table in Align has RLS policies. Understanding RLS deeply helps you add new tables securely and debug permission errors.

---

### Topic 5.3: Real-time and Subscriptions

Supabase Realtime enables live updates. Understanding the protocol helps you use it effectively.

**Research Questions:**
- How does Supabase Realtime work under the hood (Postgres replication)?
- What is the difference between Broadcast, Presence, and Postgres Changes?
- How do you handle reconnection and missed events?
- What are the performance implications of many subscriptions?
- How does RLS affect what events you receive?

**Starting Resources:**
- Supabase documentation: "Realtime"
- Phoenix Channels documentation (underlying technology)
- Supabase Realtime GitHub repository

**Experiment:**
```typescript
// Set up a subscription and test these scenarios:
// 1. What happens when you go offline and come back?
// 2. What happens when another user modifies data you can't see (RLS)?
// 3. What happens when you have 100 active subscriptions?
```

**Connection to Align:**
Align uses polling-based sync, not realtime subscriptions. Understanding realtime helps you decide if and when to add live updates.

---

## Part 6: Web Platform

### Topic 6.1: Service Worker Lifecycle

Service workers have a complex lifecycle that causes confusion.

**Research Questions:**
- What are the states a service worker goes through (installing, waiting, active)?
- Why does a new service worker wait instead of activating immediately?
- What is skipWaiting and when should you use it?
- How do you handle the "two tabs open" problem?
- What is the difference between cache-first and network-first strategies?

**Starting Resources:**
- Google Developers: "Service Worker Lifecycle"
- Workbox documentation
- Jake Archibald's "The Service Worker Lifecycle"

**Experiment:**
```javascript
// In your service worker:
self.addEventListener('install', event => {
  console.log('Installing', event)
  // What happens if you call self.skipWaiting() here?
})

self.addEventListener('activate', event => {
  console.log('Activating', event)
  // What happens if you call clients.claim() here?
})

// Open two tabs and update the service worker. What happens?
```

**Connection to Align:**
PWAUpdateController handles service worker updates. Understanding the lifecycle helps you debug update prompts and caching issues.

---

### Topic 6.2: Web Push Protocol

Push notifications involve multiple parties and protocols.

**Research Questions:**
- What is the Web Push Protocol and how does it work?
- What are VAPID keys and why are they needed?
- How does the Push Service (FCM, Mozilla Push, etc.) fit in?
- What is the difference between the Push API and Notifications API?
- How do you handle push when the app is closed vs open?

**Starting Resources:**
- Web Push Protocol RFC (RFC 8030)
- Google Developers: "Web Push Notifications"
- Mozilla documentation: "Push API"

**Experiment:**
```javascript
// Trace a push notification from server to client:
// 1. Server sends to push service
// 2. Push service delivers to browser
// 3. Service worker receives push event
// 4. Service worker shows notification
// What can go wrong at each step?
```

**Connection to Align:**
The send-notifications Edge Function sends pushes. Understanding the protocol helps you debug delivery issues and optimize timing.

---

### Topic 6.3: IndexedDB Internals

IndexedDB is complex. Understanding its design helps you use it effectively.

**Research Questions:**
- What is the difference between object stores and relational tables?
- How do transactions work and why does auto-commit happen?
- What are the performance characteristics of different operations?
- How does IndexedDB handle storage limits and eviction?
- What is the structured clone algorithm and what can it not serialize?

**Starting Resources:**
- MDN: "IndexedDB API"
- "Offline Cookbook" by Jake Archibald
- Dexie.js documentation and internals

**Experiment:**
```javascript
// Time these operations with different data sizes:
// 1. Write 1000 records in one transaction vs 1000 transactions
// 2. Read by primary key vs read by index vs read all and filter
// 3. Cursor iteration vs getAll()
// What patterns emerge?
```

**Connection to Align:**
Dexie abstracts IndexedDB but understanding the underlying database helps you optimize queries and debug storage issues.

---

## Part 7: Architecture and Patterns

### Topic 7.1: Offline-First Architecture

Building truly offline-first apps requires rethinking many assumptions.

**Research Questions:**
- What is the difference between offline-capable and offline-first?
- How do you handle conflicts when syncing offline changes?
- What is CRDTs and when would you use them?
- How do you handle migrations in offline data?
- What UX patterns work well for offline states?

**Starting Resources:**
- "Offline First" community website
- Martin Kleppmann's talks on CRDTs
- Local-first software research papers

**Experiment:**
```
Scenario: User A and User B both edit the same move title offline.
They both come online.

Design three different conflict resolution strategies:
1. Last-write-wins
2. User-chooses
3. Auto-merge

What are the tradeoffs of each?
```

**Connection to Align:**
Align uses last-write-wins with updated_at timestamps. Understanding conflict resolution helps you handle edge cases and design better sync.

---

### Topic 7.2: State Machine Patterns

Complex UI flows can be modeled as state machines.

**Research Questions:**
- What is a finite state machine and how does it differ from just using state?
- What is XState and how does it implement statecharts?
- When is a state machine overkill vs necessary?
- How do you handle side effects in state machines?
- What is the actor model and how does it relate to state machines?

**Starting Resources:**
- XState documentation
- "Statecharts" paper by David Harel
- Kent C. Dodds' articles on state machines in React

**Experiment:**
```typescript
// Model the onboarding flow as a state machine:
// States: name, directions, cycle, notifications, done
// Events: NEXT, BACK, SKIP
// Guards: hasName, hasDirections, etc.

// What edge cases does the state machine reveal
// that imperative code might miss?
```

**Connection to Align:**
OnboardingFlow and WindowClosedFlow are multi-step processes. State machines could make their logic more explicit and testable.

---

### Topic 7.3: Testing Strategies

Different types of tests serve different purposes.

**Research Questions:**
- What is the testing pyramid and is it still relevant?
- What is the difference between unit, integration, and end-to-end tests?
- How do you test React components effectively?
- How do you test offline functionality?
- What is snapshot testing and when is it useful vs harmful?

**Starting Resources:**
- Kent C. Dodds' "Testing JavaScript" course
- Testing Library documentation
- Martin Fowler's "TestPyramid"

**Experiment:**
```typescript
// Write tests for the sync engine at three levels:
// 1. Unit: Test pullFromSupabase mapping in isolation
// 2. Integration: Test syncAll with a mock Supabase client
// 3. E2E: Test sync behavior with real Supabase (local)

// Which tests give you the most confidence?
// Which are the most brittle?
```

**Connection to Align:**
Align has no tests yet. Understanding testing strategies helps you add tests that provide confidence without slowing development.

---

## Part 8: Career and Growth

### Topic 8.1: Reading Source Code

The ability to read and understand unfamiliar code is a superpower.

**Research Questions:**
- How do you approach a new codebase systematically?
- What are the signs of well-structured vs poorly-structured code?
- How do you trace execution flow through async code?
- When should you read source code vs documentation vs asking?
- How do you contribute to open source projects?

**Practice:**
1. Read the Dexie.js source code. How does it wrap IndexedDB?
2. Read the Framer Motion source code. How does it animate?
3. Read the Supabase auth-helpers source code. How does it manage sessions?

---

### Topic 8.2: Debugging Systematically

Good debugging is a skill that can be learned.

**Research Questions:**
- What is the scientific method applied to debugging?
- How do you isolate variables when reproducing bugs?
- What are the most useful Chrome DevTools features you are not using?
- How do you debug issues that only happen in production?
- How do you debug issues that only happen intermittently?

**Practice:**
1. Intentionally break the sync engine and debug it without looking at your change
2. Use the Performance tab to find a render bottleneck
3. Use the Network tab to debug a failed API call
4. Use breakpoints to trace a state update through React

---

### Topic 8.3: Learning How to Learn

Meta-learning is the most valuable skill.

**Research Questions:**
- What is the spacing effect and how can you use it?
- What is the testing effect (retrieval practice)?
- How does interleaving help vs massed practice?
- What is elaborative interrogation?
- How do you balance breadth vs depth of knowledge?

**Resources:**
- "Make It Stick" by Brown, Roediger, and McDaniel
- "A Mind for Numbers" by Barbara Oakley
- Coursera: "Learning How to Learn"

**Practice:**
1. Teach a concept from this book to someone else
2. Write an explanation of a concept without looking at notes
3. Connect two concepts that seem unrelated
4. Find and correct a mistake in your mental model

---

## Creating Your Own Research Topics

After working through some of these topics, you will develop the ability to create your own. Here is the template:

```markdown
### Topic: [Name]

**What I currently understand:**
[Write what you think you know]

**What confuses me:**
[Write specific questions]

**How I will investigate:**
[List resources, experiments, people to ask]

**What I learned:**
[Fill in after research]

**What I still do not understand:**
[Often research reveals new questions]
```

The best developers are perpetually curious. They do not just learn enough to complete a task - they dig until they truly understand. This appendix is an invitation to join that way of thinking.

---

## Final Note

You have now completed a comprehensive learning journey through the Align codebase. You understand JavaScript, TypeScript, React, Next.js, databases, authentication, animation, and PWAs - not just as abstract concepts, but as tools that work together to build a real application.

The research topics in this appendix are the next step. They take you from "knowing how to use" to "understanding how it works" to "being able to build it yourself."

Pick one topic. Start today. The path from beginner to expert is walked one question at a time.

---

[Back to Appendices](./A-glossary.md) | [Back to README](../README.md)
