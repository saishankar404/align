/**
 * Chapter 2: Functions and Logic - Exercises
 *
 * Run with: npm run test:exercises -- --grep "Chapter 2"
 *
 * These exercises reinforce:
 * - Function declarations and expressions
 * - Conditionals and control flow
 * - Closures and scope
 * - Higher-order functions
 */

import { describe, it, expect } from 'vitest'

// ============================================================================
// EXERCISE 1: Basic Functions
// ============================================================================

/**
 * Exercise 2.1: Function basics
 *
 * Implement these functions:
 */

// Return the larger of two numbers
function max(a: number, b: number): number {
  // TODO: implement without using Math.max
  throw new Error('Not implemented')
}

// Return the absolute value of a number
function abs(n: number): number {
  // TODO: implement without using Math.abs
  throw new Error('Not implemented')
}

// Return a greeting based on hour (0-23)
// 0-11: "Good morning"
// 12-17: "Good afternoon"
// 18-23: "Good evening"
function getGreeting(hour: number): string {
  // TODO: implement
  throw new Error('Not implemented')
}

describe('Chapter 2: Functions and Logic', () => {
  describe('Exercise 2.1: Basic functions', () => {
    it('max returns larger number', () => {
      expect(max(3, 5)).toBe(5)
      expect(max(10, 2)).toBe(10)
      expect(max(-1, -5)).toBe(-1)
      expect(max(7, 7)).toBe(7)
    })

    it('abs returns absolute value', () => {
      expect(abs(5)).toBe(5)
      expect(abs(-5)).toBe(5)
      expect(abs(0)).toBe(0)
      expect(abs(-0.5)).toBe(0.5)
    })

    it('getGreeting returns correct greeting', () => {
      expect(getGreeting(6)).toBe('Good morning')
      expect(getGreeting(0)).toBe('Good morning')
      expect(getGreeting(11)).toBe('Good morning')
      expect(getGreeting(12)).toBe('Good afternoon')
      expect(getGreeting(17)).toBe('Good afternoon')
      expect(getGreeting(18)).toBe('Good evening')
      expect(getGreeting(23)).toBe('Good evening')
    })
  })

  // ============================================================================
  // EXERCISE 2: Closures
  // ============================================================================

  /**
   * Exercise 2.2: Working with closures
   *
   * Implement these closure-based functions:
   */

  // Return a function that adds n to its argument
  // Example: const add5 = makeAdder(5); add5(3) returns 8
  function makeAdder(n: number): (x: number) => number {
    // TODO: implement using closure
    throw new Error('Not implemented')
  }

  // Return a counter object with increment(), decrement(), and getValue() methods
  // All methods should share the same internal count (starting at 0)
  function createCounter(): {
    increment: () => void
    decrement: () => void
    getValue: () => number
  } {
    // TODO: implement using closure
    throw new Error('Not implemented')
  }

  // Return a function that can only be called once
  // Subsequent calls return the same result without re-running fn
  function once<T>(fn: () => T): () => T {
    // TODO: implement (this is the memoization pattern!)
    throw new Error('Not implemented')
  }

  describe('Exercise 2.2: Closures', () => {
    it('makeAdder creates an adding function', () => {
      const add5 = makeAdder(5)
      const add10 = makeAdder(10)

      expect(add5(3)).toBe(8)
      expect(add5(0)).toBe(5)
      expect(add10(3)).toBe(13)
      // Each adder is independent
      expect(add5(1)).toBe(6)
    })

    it('createCounter maintains internal state', () => {
      const counter = createCounter()

      expect(counter.getValue()).toBe(0)
      counter.increment()
      expect(counter.getValue()).toBe(1)
      counter.increment()
      counter.increment()
      expect(counter.getValue()).toBe(3)
      counter.decrement()
      expect(counter.getValue()).toBe(2)
    })

    it('createCounter instances are independent', () => {
      const counter1 = createCounter()
      const counter2 = createCounter()

      counter1.increment()
      counter1.increment()
      counter2.increment()

      expect(counter1.getValue()).toBe(2)
      expect(counter2.getValue()).toBe(1)
    })

    it('once only calls function once', () => {
      let callCount = 0
      const expensive = once(() => {
        callCount++
        return 'result'
      })

      expect(expensive()).toBe('result')
      expect(callCount).toBe(1)
      expect(expensive()).toBe('result')
      expect(expensive()).toBe('result')
      expect(callCount).toBe(1) // Still only called once
    })
  })

  // ============================================================================
  // EXERCISE 3: Higher-Order Functions
  // ============================================================================

  /**
   * Exercise 2.3: Functions that take or return functions
   */

  // Apply a function n times to an initial value
  // Example: applyN(x => x * 2, 3, 1) returns 8 (1 * 2 * 2 * 2)
  function applyN<T>(fn: (x: T) => T, n: number, initial: T): T {
    // TODO: implement
    throw new Error('Not implemented')
  }

  // Return a function that calls fn1, then fn2 with the result
  // Example: const addThenDouble = compose(x => x * 2, x => x + 1)
  //          addThenDouble(3) returns 8 ((3 + 1) * 2)
  function compose<A, B, C>(fn2: (b: B) => C, fn1: (a: A) => B): (a: A) => C {
    // TODO: implement (note: fn1 runs first, fn2 runs second)
    throw new Error('Not implemented')
  }

  // Create a function that limits how often fn can be called
  // If called again within waitMs, return the previous result
  function throttle<T>(fn: () => T, waitMs: number): () => T {
    // TODO: implement (this is used in the sync engine!)
    throw new Error('Not implemented')
  }

  describe('Exercise 2.3: Higher-order functions', () => {
    it('applyN applies function n times', () => {
      expect(applyN((x) => x * 2, 3, 1)).toBe(8)
      expect(applyN((x) => x + 1, 5, 0)).toBe(5)
      expect(applyN((x) => x, 100, 'unchanged')).toBe('unchanged')
      expect(applyN((x) => x * 2, 0, 5)).toBe(5)
    })

    it('compose chains functions', () => {
      const addOne = (x: number) => x + 1
      const double = (x: number) => x * 2
      const toString = (x: number) => `value: ${x}`

      const addThenDouble = compose(double, addOne)
      expect(addThenDouble(3)).toBe(8)

      const doubleThenAdd = compose(addOne, double)
      expect(doubleThenAdd(3)).toBe(7)

      const addThenString = compose(toString, addOne)
      expect(addThenString(5)).toBe('value: 6')
    })

    it('throttle limits call frequency', async () => {
      let callCount = 0
      const fn = throttle(() => {
        callCount++
        return callCount
      }, 50)

      expect(fn()).toBe(1)
      expect(fn()).toBe(1) // Returns cached result
      expect(fn()).toBe(1)
      expect(callCount).toBe(1)

      await new Promise((r) => setTimeout(r, 60))

      expect(fn()).toBe(2) // Enough time passed, calls again
      expect(callCount).toBe(2)
    })
  })

  // ============================================================================
  // EXERCISE 4: Recursion
  // ============================================================================

  /**
   * Exercise 2.4: Recursive functions
   */

  // Calculate factorial: n! = n * (n-1) * ... * 1
  // factorial(0) = 1, factorial(5) = 120
  function factorial(n: number): number {
    // TODO: implement recursively
    throw new Error('Not implemented')
  }

  // Calculate fibonacci number at position n
  // fib(0) = 0, fib(1) = 1, fib(n) = fib(n-1) + fib(n-2)
  function fib(n: number): number {
    // TODO: implement recursively (don't worry about efficiency)
    throw new Error('Not implemented')
  }

  // Flatten a nested array to a single level
  // Example: flatten([1, [2, [3, 4]], 5]) returns [1, 2, 3, 4, 5]
  function flatten(arr: unknown[]): unknown[] {
    // TODO: implement recursively
    throw new Error('Not implemented')
  }

  describe('Exercise 2.4: Recursion', () => {
    it('factorial calculates correctly', () => {
      expect(factorial(0)).toBe(1)
      expect(factorial(1)).toBe(1)
      expect(factorial(5)).toBe(120)
      expect(factorial(10)).toBe(3628800)
    })

    it('fib returns correct fibonacci numbers', () => {
      expect(fib(0)).toBe(0)
      expect(fib(1)).toBe(1)
      expect(fib(2)).toBe(1)
      expect(fib(10)).toBe(55)
      expect(fib(15)).toBe(610)
    })

    it('flatten handles nested arrays', () => {
      expect(flatten([1, 2, 3])).toEqual([1, 2, 3])
      expect(flatten([1, [2, 3]])).toEqual([1, 2, 3])
      expect(flatten([1, [2, [3, 4]], 5])).toEqual([1, 2, 3, 4, 5])
      expect(flatten([[[[1]]]])).toEqual([1])
      expect(flatten([])).toEqual([])
    })
  })

  // ============================================================================
  // CHALLENGE: Build a Function Pipeline
  // ============================================================================

  /**
   * Challenge: Implement a pipe function
   *
   * pipe takes multiple functions and returns a new function that
   * applies them left-to-right.
   *
   * Example:
   * const process = pipe(
   *   (x: number) => x + 1,
   *   (x: number) => x * 2,
   *   (x: number) => `result: ${x}`
   * )
   * process(3) returns "result: 8"
   */

  // Start simple: pipe with exactly 2 functions
  function pipe2<A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C): (a: A) => C {
    // TODO: implement
    throw new Error('Not implemented')
  }

  // Now handle any number of functions
  // Hint: Use reduce
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function pipe(...fns: Array<(arg: any) => any>): (arg: unknown) => unknown {
    // TODO: implement
    throw new Error('Not implemented')
  }

  describe('Challenge: Function pipeline', () => {
    it('pipe2 chains two functions', () => {
      const addOne = (x: number) => x + 1
      const double = (x: number) => x * 2

      const addThenDouble = pipe2(addOne, double)
      expect(addThenDouble(3)).toBe(8) // (3 + 1) * 2

      const doubleThenAdd = pipe2(double, addOne)
      expect(doubleThenAdd(3)).toBe(7) // (3 * 2) + 1
    })

    it('pipe chains multiple functions', () => {
      const addOne = (x: number) => x + 1
      const double = (x: number) => x * 2
      const toString = (x: number) => `value: ${x}`

      const process = pipe(addOne, double, toString)
      expect(process(3)).toBe('value: 8')

      const process2 = pipe(double, addOne, double, addOne)
      expect(process2(2)).toBe(11) // ((2 * 2) + 1) * 2 + 1 = 11
    })

    it('pipe with single function', () => {
      const addOne = (x: number) => x + 1
      const single = pipe(addOne)
      expect(single(5)).toBe(6)
    })

    it('pipe with no functions returns identity', () => {
      const identity = pipe()
      expect(identity(5)).toBe(5)
      expect(identity('hello')).toBe('hello')
    })
  })
})
