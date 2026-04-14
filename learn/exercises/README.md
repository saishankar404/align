# Exercise Sandbox

This folder contains hands-on exercises to reinforce concepts from each chapter. There are two ways to practice:

## 1. Test-Based Exercises

Each exercise file has failing tests. Your job is to make them pass.

### Running Tests

```bash
# Run all exercises
npm run test:exercises

# Run specific chapter
npm run test:exercises -- --grep "Chapter 1"

# Watch mode (re-runs on save)
npm run test:exercises -- --watch
```

### Exercise Files

| Chapter | File | Topics |
|---------|------|--------|
| 1 | `01-building-blocks.test.ts` | Variables, types, operators |
| 2 | `02-functions.test.ts` | Functions, closures, scope |
| 3 | `03-collections.test.ts` | Arrays, objects, map/filter |
| 4 | `04-async.test.ts` | Promises, async/await |
| 5-6 | `05-typescript.test.ts` | Types, interfaces, generics |
| 7-8 | `07-react-basics.test.tsx` | Components, state, props |
| 9 | `09-effects.test.tsx` | useEffect, custom hooks |
| 10 | `10-context.test.tsx` | Context, providers |
| 13 | `13-dexie.test.ts` | IndexedDB, Dexie queries |

### How It Works

Each test file has:
- A description of what you need to implement
- Failing tests that define the expected behavior
- Hints in comments when you get stuck

Example:
```typescript
// Exercise: Implement a function that doubles a number
// Your code here:
function double(n: number): number {
  // TODO: implement this
  throw new Error('Not implemented')
}

// Tests (do not modify):
describe('double', () => {
  it('doubles positive numbers', () => {
    expect(double(5)).toBe(10)
  })
  it('doubles negative numbers', () => {
    expect(double(-3)).toBe(-6)
  })
  it('returns 0 for 0', () => {
    expect(double(0)).toBe(0)
  })
})
```

## 2. Interactive Playground

Visit `/playground` in the dev server to experiment with concepts in real-time.

```bash
npm run dev
# Open http://localhost:3000/playground
```

The playground includes:
- JavaScript console with syntax highlighting
- React component sandbox
- Database (Dexie) explorer
- Animation previewer

## Tips

1. **Do not look at solutions first** - Struggle is where learning happens
2. **Use the book** - Each exercise maps to a chapter
3. **Break things** - Modify tests to understand what they check
4. **Ask why** - When a test passes, understand why it works

## Solutions

Solutions are in `learn/exercises/solutions/`. But seriously, try first.
