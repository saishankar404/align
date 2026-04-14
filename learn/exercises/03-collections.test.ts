/**
 * Chapter 3: Collections - Exercises
 *
 * Run with: npm run test:exercises -- --grep "Chapter 3"
 *
 * These exercises reinforce:
 * - Arrays and array methods (map, filter, find, reduce)
 * - Objects and property access
 * - Destructuring
 * - Spread operator
 */

import { describe, it, expect } from 'vitest'

// ============================================================================
// EXERCISE 1: Array Basics
// ============================================================================

describe('Chapter 3: Collections', () => {
  /**
   * Exercise 3.1: Array operations
   */

  // Return the first element, or undefined if empty
  function first<T>(arr: T[]): T | undefined {
    // TODO: implement
    throw new Error('Not implemented')
  }

  // Return the last element, or undefined if empty
  function last<T>(arr: T[]): T | undefined {
    // TODO: implement
    throw new Error('Not implemented')
  }

  // Return true if array contains the value
  function contains<T>(arr: T[], value: T): boolean {
    // TODO: implement without using includes()
    throw new Error('Not implemented')
  }

  // Return array without duplicates
  function unique<T>(arr: T[]): T[] {
    // TODO: implement (hint: Set or filter)
    throw new Error('Not implemented')
  }

  describe('Exercise 3.1: Array basics', () => {
    it('first returns first element', () => {
      expect(first([1, 2, 3])).toBe(1)
      expect(first(['a'])).toBe('a')
      expect(first([])).toBeUndefined()
    })

    it('last returns last element', () => {
      expect(last([1, 2, 3])).toBe(3)
      expect(last(['only'])).toBe('only')
      expect(last([])).toBeUndefined()
    })

    it('contains checks for presence', () => {
      expect(contains([1, 2, 3], 2)).toBe(true)
      expect(contains([1, 2, 3], 5)).toBe(false)
      expect(contains([], 1)).toBe(false)
      expect(contains(['a', 'b'], 'b')).toBe(true)
    })

    it('unique removes duplicates', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
      expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b'])
      expect(unique([1])).toEqual([1])
      expect(unique([])).toEqual([])
    })
  })

  // ============================================================================
  // EXERCISE 2: Map, Filter, Find
  // ============================================================================

  /**
   * Exercise 3.2: Transformation methods
   */

  interface Move {
    id: string
    title: string
    status: 'pending' | 'done'
    date: string
  }

  const sampleMoves: Move[] = [
    { id: '1', title: 'Morning run', status: 'done', date: '2024-01-15' },
    { id: '2', title: 'Read chapter', status: 'pending', date: '2024-01-15' },
    { id: '3', title: 'Call mom', status: 'done', date: '2024-01-15' },
    { id: '4', title: 'Meditate', status: 'pending', date: '2024-01-16' },
  ]

  // Return array of just the titles
  function getTitles(moves: Move[]): string[] {
    // TODO: implement using map
    throw new Error('Not implemented')
  }

  // Return only completed moves
  function getCompleted(moves: Move[]): Move[] {
    // TODO: implement using filter
    throw new Error('Not implemented')
  }

  // Return the move with the given id, or undefined
  function findById(moves: Move[], id: string): Move | undefined {
    // TODO: implement using find
    throw new Error('Not implemented')
  }

  // Return moves for a specific date
  function getByDate(moves: Move[], date: string): Move[] {
    // TODO: implement using filter
    throw new Error('Not implemented')
  }

  // Return true if all moves are done
  function allDone(moves: Move[]): boolean {
    // TODO: implement using every
    throw new Error('Not implemented')
  }

  // Return true if any move is pending
  function anyPending(moves: Move[]): boolean {
    // TODO: implement using some
    throw new Error('Not implemented')
  }

  describe('Exercise 3.2: Map, filter, find', () => {
    it('getTitles extracts titles', () => {
      expect(getTitles(sampleMoves)).toEqual([
        'Morning run',
        'Read chapter',
        'Call mom',
        'Meditate',
      ])
      expect(getTitles([])).toEqual([])
    })

    it('getCompleted returns done moves', () => {
      const completed = getCompleted(sampleMoves)
      expect(completed).toHaveLength(2)
      expect(completed.every((m) => m.status === 'done')).toBe(true)
    })

    it('findById returns correct move', () => {
      expect(findById(sampleMoves, '2')?.title).toBe('Read chapter')
      expect(findById(sampleMoves, '999')).toBeUndefined()
    })

    it('getByDate filters by date', () => {
      const jan15 = getByDate(sampleMoves, '2024-01-15')
      expect(jan15).toHaveLength(3)
      const jan16 = getByDate(sampleMoves, '2024-01-16')
      expect(jan16).toHaveLength(1)
    })

    it('allDone checks completion', () => {
      expect(allDone(sampleMoves)).toBe(false)
      expect(allDone([sampleMoves[0], sampleMoves[2]])).toBe(true)
      expect(allDone([])).toBe(true) // vacuous truth
    })

    it('anyPending checks for pending', () => {
      expect(anyPending(sampleMoves)).toBe(true)
      expect(anyPending([sampleMoves[0], sampleMoves[2]])).toBe(false)
      expect(anyPending([])).toBe(false)
    })
  })

  // ============================================================================
  // EXERCISE 3: Reduce
  // ============================================================================

  /**
   * Exercise 3.3: The powerful reduce
   */

  // Sum all numbers in array
  function sum(nums: number[]): number {
    // TODO: implement using reduce
    throw new Error('Not implemented')
  }

  // Count occurrences of each value
  // Example: count(['a', 'b', 'a']) returns { a: 2, b: 1 }
  function count<T extends string | number>(arr: T[]): Record<T, number> {
    // TODO: implement using reduce
    throw new Error('Not implemented')
  }

  // Group moves by status
  // Returns { done: Move[], pending: Move[] }
  function groupByStatus(moves: Move[]): Record<'done' | 'pending', Move[]> {
    // TODO: implement using reduce
    throw new Error('Not implemented')
  }

  // Flatten array of arrays into single array
  function flatten<T>(arrays: T[][]): T[] {
    // TODO: implement using reduce
    throw new Error('Not implemented')
  }

  describe('Exercise 3.3: Reduce', () => {
    it('sum adds all numbers', () => {
      expect(sum([1, 2, 3, 4, 5])).toBe(15)
      expect(sum([-1, 1])).toBe(0)
      expect(sum([])).toBe(0)
    })

    it('count tallies occurrences', () => {
      expect(count(['a', 'b', 'a', 'c', 'b', 'a'])).toEqual({ a: 3, b: 2, c: 1 })
      expect(count([1, 2, 1, 1])).toEqual({ 1: 3, 2: 1 })
      expect(count([])).toEqual({})
    })

    it('groupByStatus organizes moves', () => {
      const grouped = groupByStatus(sampleMoves)
      expect(grouped.done).toHaveLength(2)
      expect(grouped.pending).toHaveLength(2)
      expect(grouped.done.every((m) => m.status === 'done')).toBe(true)
    })

    it('flatten combines arrays', () => {
      expect(
        flatten([
          [1, 2],
          [3, 4],
        ])
      ).toEqual([1, 2, 3, 4])
      expect(flatten([['a'], [], ['b', 'c']])).toEqual(['a', 'b', 'c'])
      expect(flatten([])).toEqual([])
    })
  })

  // ============================================================================
  // EXERCISE 4: Objects and Destructuring
  // ============================================================================

  /**
   * Exercise 3.4: Working with objects
   */

  interface Profile {
    id: string
    name: string
    age?: number
    settings: {
      notificationsEnabled: boolean
      morningTime: string
      eveningTime: string
    }
  }

  const sampleProfile: Profile = {
    id: 'user-1',
    name: 'Alice',
    age: 28,
    settings: {
      notificationsEnabled: true,
      morningTime: '08:00',
      eveningTime: '21:00',
    },
  }

  // Extract name and age using destructuring
  // Return { name, age } (age can be undefined)
  function getNameAndAge(profile: Profile): { name: string; age?: number } {
    // TODO: implement using destructuring
    throw new Error('Not implemented')
  }

  // Extract notification setting using nested destructuring
  function getNotificationSetting(profile: Profile): boolean {
    // TODO: implement using nested destructuring
    throw new Error('Not implemented')
  }

  // Create a new profile with updated settings (immutably)
  function updateSettings(
    profile: Profile,
    newSettings: Partial<Profile['settings']>
  ): Profile {
    // TODO: implement using spread operator
    throw new Error('Not implemented')
  }

  // Merge two objects, with second taking precedence
  function merge<T extends object>(a: T, b: Partial<T>): T {
    // TODO: implement using spread
    throw new Error('Not implemented')
  }

  describe('Exercise 3.4: Objects and destructuring', () => {
    it('getNameAndAge extracts correctly', () => {
      expect(getNameAndAge(sampleProfile)).toEqual({ name: 'Alice', age: 28 })

      const noAge: Profile = { ...sampleProfile, age: undefined }
      expect(getNameAndAge(noAge)).toEqual({ name: 'Alice', age: undefined })
    })

    it('getNotificationSetting uses nested destructuring', () => {
      expect(getNotificationSetting(sampleProfile)).toBe(true)

      const disabled: Profile = {
        ...sampleProfile,
        settings: { ...sampleProfile.settings, notificationsEnabled: false },
      }
      expect(getNotificationSetting(disabled)).toBe(false)
    })

    it('updateSettings creates new object immutably', () => {
      const updated = updateSettings(sampleProfile, { morningTime: '07:00' })

      // New object
      expect(updated).not.toBe(sampleProfile)
      // Updated value
      expect(updated.settings.morningTime).toBe('07:00')
      // Other values preserved
      expect(updated.settings.eveningTime).toBe('21:00')
      expect(updated.settings.notificationsEnabled).toBe(true)
      // Original unchanged
      expect(sampleProfile.settings.morningTime).toBe('08:00')
    })

    it('merge combines objects', () => {
      const result = merge({ a: 1, b: 2 }, { b: 3 })
      expect(result).toEqual({ a: 1, b: 3 })

      const profile = merge(sampleProfile, { name: 'Bob' })
      expect(profile.name).toBe('Bob')
      expect(profile.id).toBe('user-1')
    })
  })

  // ============================================================================
  // CHALLENGE: Build a Data Pipeline
  // ============================================================================

  /**
   * Challenge: Process moves like the Align app does
   *
   * Given an array of moves across multiple days, implement:
   */

  interface MoveWithDirection extends Move {
    directionId: string
  }

  const challengeMoves: MoveWithDirection[] = [
    {
      id: '1',
      title: 'Run',
      status: 'done',
      date: '2024-01-15',
      directionId: 'health',
    },
    {
      id: '2',
      title: 'Read',
      status: 'done',
      date: '2024-01-15',
      directionId: 'learning',
    },
    {
      id: '3',
      title: 'Gym',
      status: 'pending',
      date: '2024-01-15',
      directionId: 'health',
    },
    {
      id: '4',
      title: 'Yoga',
      status: 'done',
      date: '2024-01-16',
      directionId: 'health',
    },
    {
      id: '5',
      title: 'Write',
      status: 'done',
      date: '2024-01-16',
      directionId: 'learning',
    },
    {
      id: '6',
      title: 'Walk',
      status: 'done',
      date: '2024-01-17',
      directionId: 'health',
    },
  ]

  // Calculate completion rate as percentage (0-100)
  function getCompletionRate(moves: Move[]): number {
    // TODO: implement
    throw new Error('Not implemented')
  }

  // Group moves by date, return object with dates as keys
  function groupByDate(
    moves: MoveWithDirection[]
  ): Record<string, MoveWithDirection[]> {
    // TODO: implement
    throw new Error('Not implemented')
  }

  // Count completed moves per direction
  function getDirectionStats(
    moves: MoveWithDirection[]
  ): Record<string, number> {
    // TODO: implement - only count 'done' moves
    throw new Error('Not implemented')
  }

  // Get "streak" - consecutive days with at least one done move
  // Returns number of days
  function getStreak(moves: Move[]): number {
    // TODO: implement (challenging!)
    // Hint: sort by date, then walk through checking consecutive days
    throw new Error('Not implemented')
  }

  describe('Challenge: Data pipeline', () => {
    it('getCompletionRate calculates percentage', () => {
      expect(getCompletionRate(challengeMoves)).toBeCloseTo(83.33, 1)
      expect(getCompletionRate([])).toBe(0)
      expect(
        getCompletionRate([{ id: '1', title: 'x', status: 'done', date: '2024-01-01' }])
      ).toBe(100)
    })

    it('groupByDate organizes moves', () => {
      const grouped = groupByDate(challengeMoves)
      expect(Object.keys(grouped).sort()).toEqual([
        '2024-01-15',
        '2024-01-16',
        '2024-01-17',
      ])
      expect(grouped['2024-01-15']).toHaveLength(3)
      expect(grouped['2024-01-16']).toHaveLength(2)
      expect(grouped['2024-01-17']).toHaveLength(1)
    })

    it('getDirectionStats counts completed by direction', () => {
      const stats = getDirectionStats(challengeMoves)
      expect(stats).toEqual({
        health: 3, // Run, Yoga, Walk done; Gym pending
        learning: 2, // Read, Write done
      })
    })

    it('getStreak counts consecutive done days', () => {
      // All 3 days have at least one done move
      expect(getStreak(challengeMoves)).toBe(3)

      // Single day
      const oneDay = challengeMoves.filter((m) => m.date === '2024-01-15')
      expect(getStreak(oneDay)).toBe(1)

      // Gap in middle
      const withGap: Move[] = [
        { id: '1', title: 'x', status: 'done', date: '2024-01-15' },
        { id: '2', title: 'x', status: 'pending', date: '2024-01-16' }, // no done
        { id: '3', title: 'x', status: 'done', date: '2024-01-17' },
      ]
      expect(getStreak(withGap)).toBe(1) // Streak resets
    })
  })
})
