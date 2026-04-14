# Learn JavaScript, TypeScript, and React Through the Align Codebase

This is not a typical tutorial. This is a comprehensive learning book that teaches you web development by studying a real, production-quality codebase.

## What Makes This Different

Most tutorials teach syntax. This book teaches understanding.

For every concept, you will learn:

| Aspect | What You'll Get |
|--------|-----------------|
| **WHAT** | Definition, mental model, analogy |
| **WHY** | The problem it solves, historical context, design reasoning |
| **HOW** | Under-the-hood mechanics, how the computer actually executes it |
| **WHEN** | Decision criteria, when to use it vs when not to |
| **WHERE** | Exact file paths in Align, why code lives where it does |
| **WHY NOT Y** | Alternatives that exist, trade-offs, when the alternative is better |
| **MISTAKES** | What breaks when you misuse it, actual error messages, subtle bugs |
| **MENTAL DEBUGGING** | How to think through problems, what questions to ask yourself |
| **THE VOCABULARY** | Precise definitions, why using the right word matters |
| **CONNECTIONS** | How concepts link to each other, the web of dependencies |
| **WHAT IT COMPILES TO** | The transformed output the browser actually sees |
| **GO FIGURE IT OUT** | Questions you must research because you need the answers |

## Prerequisites

You should know:
- HTML basics (tags, attributes, nesting)
- CSS basics (selectors, properties, Tailwind is a plus)
- How to use a code editor (VS Code recommended)
- How to use a terminal (basic commands like `cd`, `ls`)

You do NOT need to know:
- JavaScript (we start from zero)
- React, TypeScript, or any framework
- How servers or databases work (Chapter 0 covers this)

## How to Use This Book

### Reading Order

The chapters are designed to be read in order. Each chapter builds on previous ones. Do not skip ahead.

```
Chapter 0: How The Web Works (no code, pure concepts)
    |
    v
Part 1: JavaScript Foundations (Chapters 1-4)
    |
    v
Part 2: TypeScript (Chapters 5-6)
    |
    v
Part 3: React (Chapters 7-10)
    |
    v
Part 4: Next.js (Chapters 11-12)
    |
    v
Part 5: Data Layer (Chapters 13-14)
    |
    v
Part 6: Advanced Topics (Chapters 15-17)
```

### Active Learning

This book requires active participation:

1. **Read the code examples** - Do not skim. Read every line.
2. **Open the actual files** - When I reference `lib/hooks/useOnline.ts`, open it.
3. **Run the code** - Use the browser console, modify files, see what happens.
4. **Do the "Go Figure It Out" sections** - These are not optional. They fill critical gaps.
5. **Break things on purpose** - The best way to understand why something works is to see it fail.

### The Align Codebase

This book uses the Align app as its teaching material. Align is a 14-day commitment app with:

- Offline-first architecture (works without internet)
- Cloud sync with Supabase (PostgreSQL database)
- Authentication (magic link login)
- Push notifications
- Progressive Web App (installable on phones)
- Animations with Framer Motion

It is a real app with real complexity. By the end of this book, you will understand every line of it.

## Chapter Overview

### Chapter 0: How The Web Actually Works
Pure concepts. No code. What happens when you visit a website, what browsers and servers do, why databases exist.

### Part 1: JavaScript Foundations
- **Chapter 1: The Building Blocks** - Variables, data types, operators, memory
- **Chapter 2: Functions and Logic** - Functions, conditionals, execution context, closures
- **Chapter 3: Collections and Iteration** - Arrays, objects, map/filter/find, destructuring
- **Chapter 4: Async JavaScript** - Event loop, promises, async/await, error handling

### Part 2: TypeScript
- **Chapter 5: Types That Protect You** - Type systems, interfaces, annotations, why types matter
- **Chapter 6: Advanced TypeScript** - Union types, generics, type guards, inference

### Part 3: React
- **Chapter 7: Components and JSX** - What React is, components, props, the virtual DOM
- **Chapter 8: State and Interactivity** - useState, events, forms, re-rendering
- **Chapter 9: Side Effects and Lifecycle** - useEffect, cleanup, dependencies, data fetching
- **Chapter 10: Context and Global State** - useContext, providers, when to use what

### Part 4: Next.js
- **Chapter 11: Next.js Architecture** - App Router, layouts, server vs client components
- **Chapter 12: API Routes and Server Logic** - Route handlers, environment variables, middleware

### Part 5: Data Layer
- **Chapter 13: Offline-First with Dexie** - IndexedDB, local databases, sync strategies
- **Chapter 14: Supabase and PostgreSQL** - SQL, relational data, Row Level Security

### Part 6: Advanced Topics
- **Chapter 15: Authentication and Security** - Auth flows, sessions, protecting data, common attacks
- **Chapter 16: Animation with Framer Motion** - Transitions, spring physics, gestures
- **Chapter 17: PWA Concepts** - Service workers, caching, push notifications

### Appendices
- **Appendix A: Glossary** - Every term defined
- **Appendix B: Pattern Quick Reference** - Common patterns at a glance
- **Appendix C: File Map** - Where everything lives and why
- **Appendix D: Research Topics** - Deep-dive topics for continued learning

### Hands-On Practice
- **[Exercise Sandbox](./exercises/README.md)** - Test-based exercises for each chapter
- **[Interactive Playground](/playground)** - Live experimentation at `/playground`

## A Note on Struggle

Learning to code is hard. There will be moments where nothing makes sense.

This is normal. This is the process.

When you hit a wall:
1. Re-read the previous section slowly
2. Open the actual code file and trace through it
3. Use the Mental Debugging sections
4. Search using the exact vocabulary from the book
5. Take a break. Seriously. Your brain processes while you rest.

The goal is not to memorize syntax. The goal is to build mental models that let you reason about code. That takes time and repetition.

Let's begin.

---

**Next: [Chapter 0 - How The Web Actually Works](./00-how-the-web-works.md)**
