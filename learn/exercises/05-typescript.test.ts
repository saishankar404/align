/**
 * Chapter 5-6: TypeScript - Exercises
 *
 * Run with: npm run test:exercises -- --grep "Chapter 5"
 *
 * These exercises reinforce:
 * - Basic types and interfaces
 * - Generics
 * - Union types and type guards
 * - Utility types
 */

import { describe, it, expect } from 'vitest'

// ============================================================================
// EXERCISE 1: Basic Types and Interfaces
// ============================================================================

describe('Chapter 5-6: TypeScript', () => {
  /**
   * Exercise 5.1: Define interfaces
   *
   * Define the following interfaces to make the tests pass.
   * Look at how they're used in the tests to understand the required shape.
   */

  // TODO: Define Move interface
  // - id: string
  // - title: string
  // - status: 'pending' | 'done'
  // - date: string
  // - doneAt?: string (optional)

  interface Move {
    // YOUR CODE HERE
    id: string
    title: string
    status: 'pending' | 'done'
    date: string
    doneAt?: string
  }

  // TODO: Define Direction interface
  // - id: string
  // - name: string
  // - color: string
  // - position: number

  interface Direction {
    // YOUR CODE HERE
    id: string
    name: string
    color: string
    position: number
  }

  // TODO: Define Cycle interface
  // - id: string
  // - startDate: string
  // - endDate: string
  // - lengthDays: 7 | 14
  // - status: 'active' | 'closed'
  // - directions: Direction[]

  interface Cycle {
    // YOUR CODE HERE
    id: string
    startDate: string
    endDate: string
    lengthDays: 7 | 14
    status: 'active' | 'closed'
    directions: Direction[]
  }

  describe('Exercise 5.1: Basic interfaces', () => {
    it('Move interface is correctly defined', () => {
      const move: Move = {
        id: '1',
        title: 'Morning run',
        status: 'done',
        date: '2024-01-15',
        doneAt: '2024-01-15T08:00:00Z',
      }

      expect(move.id).toBe('1')
      expect(move.status).toBe('done')
    })

    it('Move allows optional doneAt', () => {
      const move: Move = {
        id: '2',
        title: 'Read',
        status: 'pending',
        date: '2024-01-15',
      }

      expect(move.doneAt).toBeUndefined()
    })

    it('Cycle contains directions', () => {
      const cycle: Cycle = {
        id: 'c1',
        startDate: '2024-01-15',
        endDate: '2024-01-28',
        lengthDays: 14,
        status: 'active',
        directions: [
          { id: 'd1', name: 'Health', color: '#ff0000', position: 0 },
          { id: 'd2', name: 'Career', color: '#00ff00', position: 1 },
        ],
      }

      expect(cycle.directions).toHaveLength(2)
      expect(cycle.lengthDays).toBe(14)
    })
  })

  // ============================================================================
  // EXERCISE 2: Generics
  // ============================================================================

  /**
   * Exercise 5.2: Generic functions
   */

  // Return the first element of an array, or undefined if empty
  // This should work for any array type
  function first<T>(arr: T[]): T | undefined {
    // TODO: implement
    throw new Error('Not implemented')
  }

  // Create a result wrapper - either success with data or failure with error
  type Result<T, E = string> =
    | { success: true; data: T }
    | { success: false; error: E }

  function success<T>(data: T): Result<T> {
    // TODO: implement
    throw new Error('Not implemented')
  }

  function failure<E>(error: E): Result<never, E> {
    // TODO: implement
    throw new Error('Not implemented')
  }

  // Map over a Result - if success, apply fn to data; if failure, pass through
  function mapResult<T, U, E>(
    result: Result<T, E>,
    fn: (data: T) => U
  ): Result<U, E> {
    // TODO: implement
    throw new Error('Not implemented')
  }

  describe('Exercise 5.2: Generics', () => {
    it('first works with any array type', () => {
      expect(first([1, 2, 3])).toBe(1)
      expect(first(['a', 'b'])).toBe('a')
      expect(first([])).toBeUndefined()

      const moves: Move[] = [
        { id: '1', title: 'Run', status: 'done', date: '2024-01-15' },
      ]
      expect(first(moves)?.title).toBe('Run')
    })

    it('Result type represents success or failure', () => {
      const good = success(42)
      expect(good.success).toBe(true)
      if (good.success) {
        expect(good.data).toBe(42)
      }

      const bad = failure('Something went wrong')
      expect(bad.success).toBe(false)
      if (!bad.success) {
        expect(bad.error).toBe('Something went wrong')
      }
    })

    it('mapResult transforms success values', () => {
      const result = success(5)
      const doubled = mapResult(result, (n) => n * 2)

      expect(doubled.success).toBe(true)
      if (doubled.success) {
        expect(doubled.data).toBe(10)
      }
    })

    it('mapResult passes through failures', () => {
      const result = failure('oops')
      const mapped = mapResult(result, (n: number) => n * 2)

      expect(mapped.success).toBe(false)
      if (!mapped.success) {
        expect(mapped.error).toBe('oops')
      }
    })
  })

  // ============================================================================
  // EXERCISE 3: Union Types and Type Guards
  // ============================================================================

  /**
   * Exercise 5.3: Working with unions
   */

  // API response can be loading, success, or error
  type ApiState<T> =
    | { status: 'loading' }
    | { status: 'success'; data: T }
    | { status: 'error'; message: string }

  // Type guard: check if state is success
  function isSuccess<T>(state: ApiState<T>): state is { status: 'success'; data: T } {
    // TODO: implement
    throw new Error('Not implemented')
  }

  // Type guard: check if state is error
  function isError<T>(state: ApiState<T>): state is { status: 'error'; message: string } {
    // TODO: implement
    throw new Error('Not implemented')
  }

  // Extract data from ApiState, throw if not success
  function unwrap<T>(state: ApiState<T>): T {
    // TODO: implement using type guards
    throw new Error('Not implemented')
  }

  // Get display text for any ApiState
  function getDisplayText<T>(state: ApiState<T>, formatData: (d: T) => string): string {
    // TODO: implement - return "Loading...", formatted data, or error message
    throw new Error('Not implemented')
  }

  describe('Exercise 5.3: Union types and type guards', () => {
    it('isSuccess correctly identifies success state', () => {
      const loading: ApiState<number> = { status: 'loading' }
      const success: ApiState<number> = { status: 'success', data: 42 }
      const error: ApiState<number> = { status: 'error', message: 'Oops' }

      expect(isSuccess(loading)).toBe(false)
      expect(isSuccess(success)).toBe(true)
      expect(isSuccess(error)).toBe(false)
    })

    it('isError correctly identifies error state', () => {
      const loading: ApiState<number> = { status: 'loading' }
      const success: ApiState<number> = { status: 'success', data: 42 }
      const error: ApiState<number> = { status: 'error', message: 'Oops' }

      expect(isError(loading)).toBe(false)
      expect(isError(success)).toBe(false)
      expect(isError(error)).toBe(true)
    })

    it('unwrap extracts data from success', () => {
      const state: ApiState<string> = { status: 'success', data: 'hello' }
      expect(unwrap(state)).toBe('hello')
    })

    it('unwrap throws on non-success', () => {
      const loading: ApiState<string> = { status: 'loading' }
      const error: ApiState<string> = { status: 'error', message: 'Oops' }

      expect(() => unwrap(loading)).toThrow()
      expect(() => unwrap(error)).toThrow()
    })

    it('getDisplayText handles all states', () => {
      const format = (n: number) => `Value: ${n}`

      expect(getDisplayText({ status: 'loading' }, format)).toBe('Loading...')
      expect(getDisplayText({ status: 'success', data: 42 }, format)).toBe('Value: 42')
      expect(getDisplayText({ status: 'error', message: 'Oops' }, format)).toBe('Oops')
    })
  })

  // ============================================================================
  // EXERCISE 4: Utility Types
  // ============================================================================

  /**
   * Exercise 5.4: Using built-in utility types
   */

  interface User {
    id: string
    name: string
    email: string
    createdAt: string
    updatedAt: string
  }

  // Create a type for creating a new user (without id and timestamps)
  // Use Omit<T, K> utility type
  type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>

  // Create a type for updating a user (all fields optional except id)
  // Use Partial<T> and Pick<T, K> utility types
  type UpdateUserInput = Pick<User, 'id'> & Partial<Omit<User, 'id'>>

  // Implement a function that validates CreateUserInput
  function validateCreateUser(input: unknown): input is CreateUserInput {
    // TODO: implement runtime validation
    // Check that input is object with name and email strings
    throw new Error('Not implemented')
  }

  // Implement a function that merges a user with an update
  function applyUpdate(user: User, update: UpdateUserInput): User {
    // TODO: implement (spread operator)
    throw new Error('Not implemented')
  }

  describe('Exercise 5.4: Utility types', () => {
    it('CreateUserInput has correct shape', () => {
      const input: CreateUserInput = {
        name: 'Alice',
        email: 'alice@example.com',
      }

      // TypeScript would error if we tried to add id, createdAt, or updatedAt
      expect(input.name).toBe('Alice')
      expect(input.email).toBe('alice@example.com')
    })

    it('UpdateUserInput requires id but other fields optional', () => {
      const update1: UpdateUserInput = { id: '1' }
      const update2: UpdateUserInput = { id: '1', name: 'Bob' }
      const update3: UpdateUserInput = { id: '1', name: 'Bob', email: 'bob@example.com' }

      expect(update1.id).toBe('1')
      expect(update2.name).toBe('Bob')
      expect(update3.email).toBe('bob@example.com')
    })

    it('validateCreateUser checks runtime values', () => {
      expect(validateCreateUser({ name: 'Alice', email: 'a@b.com' })).toBe(true)
      expect(validateCreateUser({ name: 'Alice' })).toBe(false)
      expect(validateCreateUser({ name: 123, email: 'a@b.com' })).toBe(false)
      expect(validateCreateUser(null)).toBe(false)
      expect(validateCreateUser('string')).toBe(false)
    })

    it('applyUpdate merges user with update', () => {
      const user: User = {
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      }

      const updated = applyUpdate(user, { id: '1', name: 'Alicia' })

      expect(updated.name).toBe('Alicia')
      expect(updated.email).toBe('alice@example.com')
      expect(updated.id).toBe('1')
    })
  })

  // ============================================================================
  // CHALLENGE: Type-Safe Event System
  // ============================================================================

  /**
   * Challenge: Build a type-safe event emitter
   *
   * The event system should:
   * - Allow defining event names and their payload types
   * - Provide type checking for emit() and on()
   * - Support multiple listeners per event
   */

  // Define the events and their payloads
  interface AppEvents {
    'move:created': { move: Move }
    'move:completed': { moveId: string; completedAt: string }
    'cycle:started': { cycle: Cycle }
    'sync:complete': { recordCount: number }
  }

  // Implement a type-safe event emitter
  class TypedEventEmitter<Events extends Record<string, unknown>> {
    private listeners: Map<keyof Events, Set<(payload: unknown) => void>> = new Map()

    on<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void {
      // TODO: implement - add handler to listeners
      throw new Error('Not implemented')
    }

    off<K extends keyof Events>(event: K, handler: (payload: Events[K]) => void): void {
      // TODO: implement - remove handler from listeners
      throw new Error('Not implemented')
    }

    emit<K extends keyof Events>(event: K, payload: Events[K]): void {
      // TODO: implement - call all handlers for event
      throw new Error('Not implemented')
    }
  }

  describe('Challenge: Type-safe event system', () => {
    it('emitter calls registered handlers', () => {
      const emitter = new TypedEventEmitter<AppEvents>()
      const received: string[] = []

      emitter.on('move:completed', (payload) => {
        received.push(payload.moveId)
      })

      emitter.emit('move:completed', {
        moveId: '123',
        completedAt: '2024-01-15T10:00:00Z',
      })

      expect(received).toEqual(['123'])
    })

    it('emitter supports multiple handlers', () => {
      const emitter = new TypedEventEmitter<AppEvents>()
      let count = 0

      emitter.on('sync:complete', () => count++)
      emitter.on('sync:complete', () => count++)

      emitter.emit('sync:complete', { recordCount: 5 })

      expect(count).toBe(2)
    })

    it('emitter can remove handlers', () => {
      const emitter = new TypedEventEmitter<AppEvents>()
      let count = 0

      const handler = () => count++
      emitter.on('sync:complete', handler)
      emitter.emit('sync:complete', { recordCount: 1 })
      expect(count).toBe(1)

      emitter.off('sync:complete', handler)
      emitter.emit('sync:complete', { recordCount: 1 })
      expect(count).toBe(1) // Handler not called
    })

    it('emitter provides correct payload types', () => {
      const emitter = new TypedEventEmitter<AppEvents>()

      // These should all type-check correctly
      emitter.on('move:created', (payload) => {
        // TypeScript knows payload.move exists and is a Move
        expect(payload.move.title).toBeDefined()
      })

      emitter.emit('move:created', {
        move: { id: '1', title: 'Run', status: 'pending', date: '2024-01-15' },
      })
    })
  })
})
