/**
 * Chapter 1: Building Blocks - Exercises
 *
 * Run with: npm run test:exercises -- --grep "Chapter 1"
 *
 * These exercises reinforce:
 * - Variable declarations (let, const)
 * - Primitive types (string, number, boolean, null, undefined)
 * - Operators (arithmetic, comparison, logical)
 * - Type coercion and equality
 */

import { describe, it, expect } from 'vitest'

// ============================================================================
// EXERCISE 1: Variable Declarations
// ============================================================================

/**
 * Exercise 1.1: Create variables
 *
 * Create the following variables:
 * - `userName` (string): your name
 * - `userAge` (number): your age
 * - `isLearning` (boolean): true
 */

// YOUR CODE HERE:
// const userName = ...
// const userAge = ...
// const isLearning = ...

describe('Chapter 1: Building Blocks', () => {
  describe('Exercise 1.1: Variable declarations', () => {
    it.skip('userName should be a non-empty string', () => {
      // @ts-expect-error - Remove .skip and implement the variables above
      expect(typeof userName).toBe('string')
      // @ts-expect-error
      expect(userName.length).toBeGreaterThan(0)
    })

    it.skip('userAge should be a positive number', () => {
      // @ts-expect-error
      expect(typeof userAge).toBe('number')
      // @ts-expect-error
      expect(userAge).toBeGreaterThan(0)
    })

    it.skip('isLearning should be true', () => {
      // @ts-expect-error
      expect(isLearning).toBe(true)
    })
  })

  // ============================================================================
  // EXERCISE 2: Working with Strings
  // ============================================================================

  /**
   * Exercise 1.2: String manipulation
   *
   * Implement these functions:
   */

  // Return the greeting "Hello, {name}!"
  function greet(name: string): string {
    // TODO: implement using template literals
    throw new Error('Not implemented')
  }

  // Return the first character of a string, or empty string if input is empty
  function firstChar(str: string): string {
    // TODO: implement
    throw new Error('Not implemented')
  }

  // Return true if the string contains the word "align" (case-insensitive)
  function containsAlign(str: string): boolean {
    // TODO: implement
    throw new Error('Not implemented')
  }

  describe('Exercise 1.2: String manipulation', () => {
    it('greet returns proper greeting', () => {
      expect(greet('Alice')).toBe('Hello, Alice!')
      expect(greet('Bob')).toBe('Hello, Bob!')
      expect(greet('')).toBe('Hello, !')
    })

    it('firstChar returns first character', () => {
      expect(firstChar('hello')).toBe('h')
      expect(firstChar('A')).toBe('A')
      expect(firstChar('')).toBe('')
    })

    it('containsAlign finds align case-insensitively', () => {
      expect(containsAlign('I use Align daily')).toBe(true)
      expect(containsAlign('ALIGN is great')).toBe(true)
      expect(containsAlign('alignment')).toBe(true)
      expect(containsAlign('nothing here')).toBe(false)
    })
  })

  // ============================================================================
  // EXERCISE 3: Working with Numbers
  // ============================================================================

  /**
   * Exercise 1.3: Number operations
   *
   * Implement these functions:
   */

  // Return the sum of two numbers
  function add(a: number, b: number): number {
    // TODO: implement
    throw new Error('Not implemented')
  }

  // Return true if n is even, false if odd
  function isEven(n: number): boolean {
    // TODO: implement using the modulo operator
    throw new Error('Not implemented')
  }

  // Clamp a number between min and max (inclusive)
  // If n < min, return min. If n > max, return max. Otherwise return n.
  function clamp(n: number, min: number, max: number): number {
    // TODO: implement
    throw new Error('Not implemented')
  }

  // Round a number to specified decimal places
  function roundTo(n: number, decimals: number): number {
    // TODO: implement (hint: use Math.round and powers of 10)
    throw new Error('Not implemented')
  }

  describe('Exercise 1.3: Number operations', () => {
    it('add sums two numbers', () => {
      expect(add(2, 3)).toBe(5)
      expect(add(-1, 1)).toBe(0)
      expect(add(0.1, 0.2)).toBeCloseTo(0.3)
    })

    it('isEven correctly identifies even numbers', () => {
      expect(isEven(2)).toBe(true)
      expect(isEven(3)).toBe(false)
      expect(isEven(0)).toBe(true)
      expect(isEven(-4)).toBe(true)
    })

    it('clamp constrains numbers to range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
      expect(clamp(0, 0, 10)).toBe(0)
      expect(clamp(10, 0, 10)).toBe(10)
    })

    it('roundTo rounds to decimal places', () => {
      expect(roundTo(3.14159, 2)).toBe(3.14)
      expect(roundTo(3.14159, 4)).toBe(3.1416)
      expect(roundTo(3.5, 0)).toBe(4)
      expect(roundTo(100, 2)).toBe(100)
    })
  })

  // ============================================================================
  // EXERCISE 4: Boolean Logic
  // ============================================================================

  /**
   * Exercise 1.4: Boolean expressions
   *
   * Implement these functions:
   */

  // Return true if age is 18 or older
  function isAdult(age: number): boolean {
    // TODO: implement
    throw new Error('Not implemented')
  }

  // Return true if the value is null OR undefined
  function isNullish(value: unknown): boolean {
    // TODO: implement (hint: there's a simple way with == and a strict way)
    throw new Error('Not implemented')
  }

  // Return true if at least one of the three booleans is true
  function anyTrue(a: boolean, b: boolean, c: boolean): boolean {
    // TODO: implement
    throw new Error('Not implemented')
  }

  // Return true only if all three booleans are true
  function allTrue(a: boolean, b: boolean, c: boolean): boolean {
    // TODO: implement
    throw new Error('Not implemented')
  }

  describe('Exercise 1.4: Boolean logic', () => {
    it('isAdult checks age >= 18', () => {
      expect(isAdult(18)).toBe(true)
      expect(isAdult(21)).toBe(true)
      expect(isAdult(17)).toBe(false)
      expect(isAdult(0)).toBe(false)
    })

    it('isNullish identifies null and undefined', () => {
      expect(isNullish(null)).toBe(true)
      expect(isNullish(undefined)).toBe(true)
      expect(isNullish(0)).toBe(false)
      expect(isNullish('')).toBe(false)
      expect(isNullish(false)).toBe(false)
    })

    it('anyTrue returns true if any argument is true', () => {
      expect(anyTrue(true, false, false)).toBe(true)
      expect(anyTrue(false, true, false)).toBe(true)
      expect(anyTrue(false, false, true)).toBe(true)
      expect(anyTrue(false, false, false)).toBe(false)
      expect(anyTrue(true, true, true)).toBe(true)
    })

    it('allTrue returns true only if all arguments are true', () => {
      expect(allTrue(true, true, true)).toBe(true)
      expect(allTrue(true, true, false)).toBe(false)
      expect(allTrue(false, false, false)).toBe(false)
    })
  })

  // ============================================================================
  // EXERCISE 5: Type Coercion
  // ============================================================================

  /**
   * Exercise 1.5: Understanding coercion
   *
   * These tests check your understanding of JavaScript's type coercion.
   * Fill in the expected values.
   */

  describe('Exercise 1.5: Type coercion predictions', () => {
    // Replace the ANSWER values with what you think the actual result is

    it('string + number coercion', () => {
      const result = '5' + 3
      // @ts-expect-error - ANSWER: What type and value is result?
      const ANSWER: unknown = 'REPLACE_ME'
      expect(result).toBe(ANSWER)
    })

    it('number - string coercion', () => {
      // @ts-expect-error - JavaScript allows this at runtime
      const result = ('5' as string) - (3 as number)
      // @ts-expect-error - ANSWER: What is the result?
      const ANSWER: unknown = 'REPLACE_ME'
      expect(result).toBe(ANSWER)
    })

    it('loose equality with type coercion', () => {
      // eslint-disable-next-line eqeqeq
      const result = '5' == (5 as unknown)
      // @ts-expect-error - ANSWER: true or false?
      const ANSWER: unknown = 'REPLACE_ME'
      expect(result).toBe(ANSWER)
    })

    it('strict equality without coercion', () => {
      const result = '5' === (5 as unknown)
      // @ts-expect-error - ANSWER: true or false?
      const ANSWER: unknown = 'REPLACE_ME'
      expect(result).toBe(ANSWER)
    })

    it('falsy value check', () => {
      const values = [0, '', null, undefined, false, NaN]
      // ANSWER: How many of these are falsy? (coerce to false in boolean context)
      const ANSWER = -1 // Replace with a number
      expect(values.filter((v) => !v).length).toBe(ANSWER)
    })

    it('truthy string', () => {
      const result = Boolean('false')
      // @ts-expect-error - ANSWER: true or false? (tricky!)
      const ANSWER: unknown = 'REPLACE_ME'
      expect(result).toBe(ANSWER)
    })
  })

  // ============================================================================
  // CHALLENGE: Put It Together
  // ============================================================================

  /**
   * Challenge: Build a simple validation function
   *
   * This combines multiple concepts from the chapter.
   */

  interface ValidationResult {
    valid: boolean
    errors: string[]
  }

  /**
   * Validate user input for onboarding
   *
   * Rules:
   * - name must be a non-empty string (after trimming whitespace)
   * - age must be a number between 13 and 120 (inclusive) or undefined/null
   * - directions must be a non-empty array of non-empty strings
   *
   * Return { valid: true, errors: [] } if all pass
   * Return { valid: false, errors: [...] } with descriptive error messages if any fail
   */
  function validateOnboarding(
    name: string,
    age: number | null | undefined,
    directions: string[]
  ): ValidationResult {
    // TODO: implement
    throw new Error('Not implemented')
  }

  describe('Challenge: Validation function', () => {
    it('accepts valid input', () => {
      const result = validateOnboarding('Alice', 25, ['Health', 'Career'])
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('accepts null age', () => {
      const result = validateOnboarding('Bob', null, ['Learning'])
      expect(result.valid).toBe(true)
    })

    it('accepts undefined age', () => {
      const result = validateOnboarding('Carol', undefined, ['Fitness'])
      expect(result.valid).toBe(true)
    })

    it('rejects empty name', () => {
      const result = validateOnboarding('', 25, ['Health'])
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('rejects whitespace-only name', () => {
      const result = validateOnboarding('   ', 25, ['Health'])
      expect(result.valid).toBe(false)
    })

    it('rejects age under 13', () => {
      const result = validateOnboarding('Young', 12, ['School'])
      expect(result.valid).toBe(false)
    })

    it('rejects age over 120', () => {
      const result = validateOnboarding('Ancient', 121, ['Immortality'])
      expect(result.valid).toBe(false)
    })

    it('rejects empty directions array', () => {
      const result = validateOnboarding('Dave', 30, [])
      expect(result.valid).toBe(false)
    })

    it('rejects directions with empty strings', () => {
      const result = validateOnboarding('Eve', 28, ['Health', '', 'Career'])
      expect(result.valid).toBe(false)
    })

    it('collects multiple errors', () => {
      const result = validateOnboarding('', 10, [])
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(3)
    })
  })
})
