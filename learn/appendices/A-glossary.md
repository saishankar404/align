# Appendix A: Glossary

A comprehensive reference of all terms introduced throughout this book, organized alphabetically.

---

## A

**Access Token**: A short-lived JWT that authenticates API requests. Contains user claims and expires quickly (typically 1 hour).

**Aggregate Function**: SQL function that computes a single result from multiple rows. Examples: `COUNT()`, `SUM()`, `AVG()`, `MAX()`, `MIN()`.

**Animation**: Change in visual properties over time - position, opacity, scale, color.

**AnimatePresence**: Framer Motion component that enables exit animations for elements leaving the DOM.

**Anon Key**: Supabase public API key safe to expose in client code. All requests are subject to Row Level Security.

**API (Application Programming Interface)**: A contract defining how software components communicate. In web development, typically refers to HTTP endpoints.

**App Router**: Next.js 14+ routing system using the `app/` directory with file-based routing, layouts, and Server Components.

**Array**: Ordered collection of values accessed by numeric index. In JavaScript: `[1, 2, 3]`.

**Async/Await**: JavaScript syntax for working with Promises. `async` marks a function as asynchronous; `await` pauses execution until a Promise resolves.

**Authentication (AuthN)**: Verifying identity - proving you are who you claim to be.

**Authorization (AuthZ)**: Verifying permission - determining what actions a user is allowed to perform.

---

## B

**Boolean**: Data type with only two possible values: `true` or `false`.

**Build**: Process of transforming source code into optimized production assets (minified JS, CSS, etc.).

**Bundle**: Combined JavaScript file(s) produced by a bundler, containing all code needed for a page or feature.

---

## C

**Cache**: Storage layer for frequently accessed data to avoid repeated computation or network requests.

**Callback**: Function passed as an argument to another function, to be called later.

**Cascade (CSS)**: Rules determining which styles apply when multiple rules target the same element.

**Cascade (SQL)**: `ON DELETE CASCADE` - when a parent row is deleted, automatically delete related child rows.

**Check Constraint**: SQL rule that validates data before allowing insert or update. Example: `CHECK (age >= 13)`.

**Client Component**: React component that runs in the browser. In Next.js, marked with `"use client"` directive.

**Closure**: Function that remembers variables from its outer scope even after that scope has finished executing.

**Component**: Reusable UI building block in React. A function that returns JSX.

**Composite Index**: Database index on multiple columns for queries filtering on those columns together.

**Conditional Rendering**: Showing different UI based on conditions. Example: `{isLoading ? <Spinner /> : <Content />}`.

**const**: JavaScript keyword declaring a constant binding that cannot be reassigned.

**Context (React)**: Mechanism for passing data through the component tree without prop drilling.

**Controlled Component**: Form element whose value is controlled by React state.

**Cookie**: Small piece of data stored by the browser, sent with every request to the same domain.

**CORS (Cross-Origin Resource Sharing)**: Security mechanism controlling which domains can make requests to your API.

**CRUD**: Create, Read, Update, Delete - the four basic database operations.

**CSS (Cascading Style Sheets)**: Language for describing visual presentation of HTML documents.

---

## D

**Database**: Organized collection of data, typically with mechanisms for querying and modifying.

**Debouncing**: Delaying function execution until after a pause in repeated calls.

**Declarative**: Programming style describing what you want, not how to achieve it. React is declarative.

**Dependency Array**: Second argument to `useEffect` and other hooks, controlling when the effect runs.

**Destructuring**: JavaScript syntax for extracting values from objects or arrays. Example: `const { name } = user`.

**Dexie**: Library providing a friendly API over IndexedDB for client-side database storage.

**DOM (Document Object Model)**: Tree representation of HTML that JavaScript can manipulate.

**DRY (Don't Repeat Yourself)**: Principle of avoiding code duplication.

---

## E

**Easing**: Rate of change over time in an animation. Controls acceleration and deceleration.

**Edge Function**: Serverless function running on edge servers close to users. Supabase Edge Functions use Deno.

**Effect**: Side effect in React - operations like data fetching, subscriptions, or DOM manipulation.

**Enum**: Type with a fixed set of possible values. In TypeScript: `type Status = 'pending' | 'done'`.

**Environment Variable**: Configuration value set outside the code, often containing secrets.

**Event**: Something that happens in the browser (click, keypress, network response) that code can respond to.

**Event Loop**: JavaScript's mechanism for handling asynchronous operations while remaining single-threaded.

**Expression**: Code that produces a value. Example: `2 + 2`, `user.name`, `isValid ? 'yes' : 'no'`.

---

## F

**Falsy**: Values that evaluate to `false` in boolean context: `false`, `0`, `''`, `null`, `undefined`, `NaN`.

**Fetch**: Browser API for making HTTP requests. Returns a Promise.

**Foreign Key**: Database column that references the primary key of another table.

**Framer Motion**: React animation library providing declarative animations and gestures.

**Function**: Reusable block of code that performs a specific task.

---

## G

**Generic**: TypeScript feature allowing types that work with multiple data types. Example: `Array<T>`.

**Gesture**: User input like tap, drag, or hover that can trigger animations.

**Git**: Version control system for tracking changes to code.

---

## H

**Hook**: React function that lets you "hook into" React features like state and lifecycle. Always starts with `use`.

**Hot Module Replacement (HMR)**: Development feature that updates code without full page reload.

**HTTP (Hypertext Transfer Protocol)**: Protocol for transferring data on the web.

**Hydration**: Process of attaching event handlers to server-rendered HTML in React.

---

## I

**Immutability**: Not modifying existing data; instead creating new copies with changes.

**Import/Export**: JavaScript module system for sharing code between files.

**Index (Database)**: Data structure that speeds up queries by providing fast lookup.

**IndexedDB**: Browser API for client-side database storage. Low-level; Dexie provides a friendlier wrapper.

**Infer**: TypeScript automatically determining types from code without explicit annotations.

**Installable**: PWA capability allowing users to add the app to their home screen.

**Interface**: TypeScript construct defining the shape of an object.

---

## J

**JavaScript**: Programming language of the web, running in browsers and on servers (Node.js).

**JOIN**: SQL operation combining rows from multiple tables based on related columns.

**JSX**: JavaScript syntax extension for writing HTML-like code in React components.

**JWT (JSON Web Token)**: Token format containing encoded claims with cryptographic signature.

---

## K

**Key (React)**: Special prop helping React identify which items in a list have changed.

---

## L

**Layout**: Next.js component that wraps pages and persists across navigation.

**let**: JavaScript keyword declaring a variable that can be reassigned.

**Lifting State**: Moving state to a common ancestor component so siblings can share it.

**Literal Type**: TypeScript type representing a specific value. Example: `type Direction = 'left' | 'right'`.

**localStorage**: Browser API for storing key-value pairs that persist across sessions.

---

## M

**Magic Link**: Authentication method sending a login link via email instead of using passwords.

**Manifest (Web App)**: JSON file describing a PWA - name, icons, display mode, colors.

**Map**: JavaScript method transforming each array element. Also a key-value data structure.

**Memoization**: Caching expensive computation results to avoid recalculation.

**Migration**: Versioned SQL file that evolves database schema over time.

**Module**: Self-contained unit of code that can be imported/exported.

**Mutation**: Changing data in place rather than creating a new copy.

---

## N

**Narrowing**: TypeScript feature where type becomes more specific based on control flow.

**Next.js**: React framework providing routing, server rendering, and full-stack capabilities.

**Node.js**: JavaScript runtime for running JavaScript outside the browser.

**Null**: Intentional absence of any value.

**Nullable**: Type that can be the actual type or null. Example: `string | null`.

---

## O

**OAuth**: Protocol for delegated authentication - "Sign in with Google/GitHub/etc."

**Object**: Collection of key-value pairs in JavaScript.

**Offline-First**: Architecture prioritizing local storage with background sync to server.

**Optional Chaining**: Safe property access that short-circuits on null/undefined. Example: `user?.name`.

---

## P

**Parallel**: Multiple operations running simultaneously.

**Parameter**: Variable in a function definition that receives an argument.

**Partial**: TypeScript utility type making all properties optional.

**Pick**: TypeScript utility type selecting specific properties from another type.

**Policy (RLS)**: Rule defining which rows a user can access or modify in PostgreSQL.

**PostgreSQL**: Powerful open-source relational database. Often called "Postgres".

**Primary Key**: Column(s) uniquely identifying each row in a database table.

**Promise**: Object representing eventual completion (or failure) of an asynchronous operation.

**Prop**: Data passed from parent to child component in React.

**Provider**: React component that makes context available to its descendants.

**PWA (Progressive Web App)**: Web app using modern capabilities for app-like experience - offline, installable, push notifications.

---

## Q

**Query**: Request for data from a database or API.

---

## R

**React**: JavaScript library for building user interfaces with components.

**Reconciliation**: React's process of determining what changed and updating the DOM efficiently.

**Reducer**: Function that takes state and action, returns new state. Pattern for complex state logic.

**Ref**: React feature for accessing DOM elements or persisting values across renders.

**Refresh Token**: Long-lived token used to obtain new access tokens.

**Relational Database**: Database organizing data in tables with defined relationships.

**Render**: Process of React calling components to determine what to display.

**REST (Representational State Transfer)**: Architectural style for APIs using HTTP methods.

**RLS (Row Level Security)**: PostgreSQL feature filtering rows based on user identity.

**Route Handler**: Next.js file exporting HTTP method functions (GET, POST, etc.) for API endpoints.

---

## S

**Schema**: Structure definition for data - database tables or TypeScript types.

**Scope**: Region of code where a variable is accessible.

**Server Component**: React component that runs only on the server. Default in Next.js App Router.

**Service Role Key**: Supabase admin key that bypasses RLS. Never expose to clients.

**Service Worker**: Background script that intercepts network requests, manages caching, handles push notifications.

**Session**: Period of authenticated access, typically stored in cookies or tokens.

**Side Effect**: Operation that affects something outside the function's scope - network requests, DOM changes, timers.

**SQL (Structured Query Language)**: Standard language for querying relational databases.

**Spring Physics**: Animation driven by simulated spring forces rather than fixed duration.

**State**: Data that changes over time and affects what React renders.

**Stale-While-Revalidate**: Caching strategy serving cached data immediately while fetching fresh data in background.

**Static Typing**: Type checking at compile time rather than runtime. TypeScript is statically typed.

**Supabase**: Open-source Firebase alternative built on PostgreSQL.

**Sync**: Process of reconciling local and remote data.

---

## T

**Tailwind CSS**: Utility-first CSS framework using classes like `p-4`, `text-center`, `bg-blue-500`.

**Ternary Operator**: Shorthand for if/else. Example: `condition ? valueIfTrue : valueIfFalse`.

**this**: JavaScript keyword referring to the current execution context.

**Token**: String representing authenticated state or parsed unit of code.

**Tombstone**: Marker indicating a deleted record for sync purposes.

**Transaction**: Group of database operations that succeed or fail together.

**Transition**: Interpolation between animation states.

**Trigger**: Database function that automatically runs on INSERT, UPDATE, or DELETE.

**Truthy**: Values that evaluate to `true` in boolean context - everything except falsy values.

**Type**: Classification of data determining what operations are valid. Examples: `string`, `number`, `boolean`.

**Type Guard**: TypeScript pattern for narrowing types based on runtime checks.

**TypeScript**: JavaScript superset adding static types.

---

## U

**Undefined**: Variable that exists but has no assigned value.

**Union Type**: Type that can be one of several types. Example: `string | number`.

**Uncontrolled Component**: Form element managing its own state via DOM.

**URL (Uniform Resource Locator)**: Address identifying a web resource.

**useCallback**: React hook memoizing a function to prevent unnecessary re-creation.

**useContext**: React hook for consuming context values.

**useEffect**: React hook for performing side effects after render.

**useMemo**: React hook memoizing expensive computations.

**useReducer**: React hook for complex state logic using reducer pattern.

**useRef**: React hook for persisting mutable values across renders.

**useState**: React hook for adding state to function components.

**Utility Type**: TypeScript built-in types that transform other types. Examples: `Partial`, `Pick`, `Omit`.

**UUID (Universally Unique Identifier)**: 128-bit identifier virtually guaranteed to be unique.

---

## V

**Validation**: Checking that data meets requirements before processing.

**VAPID**: Voluntary Application Server Identification - keys proving your server is authorized to send push notifications.

**Variable**: Named container for storing data.

**Variant**: Named animation state in Framer Motion.

**Virtual DOM**: Lightweight copy of the actual DOM that React uses to determine efficient updates.

---

## W

**Web API**: Browser-provided functionality like `fetch`, `localStorage`, `navigator`.

**Webhook**: HTTP callback triggered by an event in another system.

**WebSocket**: Protocol for real-time bidirectional communication between client and server.

---

## X-Z

**XSS (Cross-Site Scripting)**: Security vulnerability where malicious scripts are injected into web pages.

---

## Numbers and Symbols

**`&&` (Logical AND)**: Returns first falsy value or last value if all truthy. Used for conditional rendering.

**`||` (Logical OR)**: Returns first truthy value or last value if all falsy.

**`??` (Nullish Coalescing)**: Returns right side only if left is null or undefined.

**`?.` (Optional Chaining)**: Safe property access, returns undefined instead of throwing on null/undefined.

**`...` (Spread/Rest)**: Spread: expand iterable. Rest: collect remaining elements.

**`=>` (Arrow Function)**: Concise function syntax. Example: `(x) => x * 2`.

**`===` (Strict Equality)**: Compares value and type without coercion.
