/**
 * Chapter 4: Async JavaScript - Exercises
 *
 * Run with: npm run test:exercises -- --grep "Chapter 4"
 *
 * These exercises reinforce:
 * - Promises and Promise methods
 * - async/await syntax
 * - Error handling in async code
 * - Parallel vs sequential execution
 */

import { describe, it, expect, vi } from 'vitest'

// ============================================================================
// EXERCISE 1: Promise Basics
// ============================================================================

describe('Chapter 4: Async JavaScript', () => {
  /**
   * Exercise 4.1: Creating and using promises
   */

  // Create a promise that resolves after ms milliseconds with the given value
  function delay<T>(ms: number, value: T): Promise<T> {
    // TODO: implement using new Promise()
    throw new Error('Not implemented')
  }

  // Create a promise that rejects after ms milliseconds with the given error
  function delayReject(ms: number, error: string): Promise<never> {
    // TODO: implement using new Promise()
    throw new Error('Not implemented')
  }

  // Return a promise that resolves with value if condition is true,
  // otherwise rejects with error message
  function conditionalPromise<T>(
    condition: boolean,
    value: T,
    error: string
  ): Promise<T> {
    // TODO: implement
    throw new Error('Not implemented')
  }

  describe('Exercise 4.1: Promise basics', () => {
    it('delay resolves after time', async () => {
      const start = Date.now()
      const result = await delay(50, 'hello')
      const elapsed = Date.now() - start

      expect(result).toBe('hello')
      expect(elapsed).toBeGreaterThanOrEqual(45)
    })

    it('delayReject rejects after time', async () => {
      const start = Date.now()

      await expect(delayReject(50, 'oops')).rejects.toBe('oops')

      const elapsed = Date.now() - start
      expect(elapsed).toBeGreaterThanOrEqual(45)
    })

    it('conditionalPromise resolves when true', async () => {
      await expect(conditionalPromise(true, 'yes', 'no')).resolves.toBe('yes')
    })

    it('conditionalPromise rejects when false', async () => {
      await expect(conditionalPromise(false, 'yes', 'no')).rejects.toBe('no')
    })
  })

  // ============================================================================
  // EXERCISE 2: Promise Chaining
  // ============================================================================

  /**
   * Exercise 4.2: Chaining promises
   */

  // Fetch user, then fetch their posts (simulated)
  // Return { user, posts }
  async function fetchUserWithPosts(userId: string): Promise<{
    user: { id: string; name: string }
    posts: Array<{ id: string; title: string }>
  }> {
    // Simulated API functions
    const fetchUser = async (id: string) => {
      await delay(10, null)
      if (id === 'not-found') throw new Error('User not found')
      return { id, name: `User ${id}` }
    }

    const fetchPosts = async (userId: string) => {
      await delay(10, null)
      return [
        { id: '1', title: `Post 1 by ${userId}` },
        { id: '2', title: `Post 2 by ${userId}` },
      ]
    }

    // TODO: Use async/await to fetch user, then fetch their posts
    throw new Error('Not implemented')

    // Ignore the unused variables warning - use them!
    fetchUser
    fetchPosts
  }

  // Transform data through a chain of async operations
  async function processData(input: number): Promise<string> {
    const double = async (n: number): Promise<number> => {
      await delay(5, null)
      return n * 2
    }

    const addTen = async (n: number): Promise<number> => {
      await delay(5, null)
      return n + 10
    }

    const stringify = async (n: number): Promise<string> => {
      await delay(5, null)
      return `Result: ${n}`
    }

    // TODO: Chain double -> addTen -> stringify
    throw new Error('Not implemented')

    double
    addTen
    stringify
  }

  describe('Exercise 4.2: Promise chaining', () => {
    it('fetchUserWithPosts chains requests', async () => {
      const result = await fetchUserWithPosts('123')

      expect(result.user).toEqual({ id: '123', name: 'User 123' })
      expect(result.posts).toHaveLength(2)
    })

    it('fetchUserWithPosts propagates errors', async () => {
      await expect(fetchUserWithPosts('not-found')).rejects.toThrow(
        'User not found'
      )
    })

    it('processData chains transformations', async () => {
      // 5 -> 10 (double) -> 20 (addTen) -> "Result: 20"
      expect(await processData(5)).toBe('Result: 20')
      // 0 -> 0 -> 10 -> "Result: 10"
      expect(await processData(0)).toBe('Result: 10')
    })
  })

  // ============================================================================
  // EXERCISE 3: Promise.all, Promise.race
  // ============================================================================

  /**
   * Exercise 4.3: Parallel execution
   */

  // Fetch multiple users in parallel
  async function fetchUsers(
    ids: string[]
  ): Promise<Array<{ id: string; name: string }>> {
    const fetchUser = async (id: string) => {
      await delay(20, null)
      return { id, name: `User ${id}` }
    }

    // TODO: Fetch all users in parallel using Promise.all
    throw new Error('Not implemented')

    fetchUser
  }

  // Return the first promise to resolve, or throw if all reject
  async function fastest<T>(promises: Promise<T>[]): Promise<T> {
    // TODO: Use Promise.race (but handle all-reject case)
    throw new Error('Not implemented')
  }

  // Wait for all promises to settle, return { fulfilled: T[], rejected: Error[] }
  async function settleAll<T>(
    promises: Promise<T>[]
  ): Promise<{ fulfilled: T[]; rejected: Error[] }> {
    // TODO: Use Promise.allSettled
    throw new Error('Not implemented')
  }

  describe('Exercise 4.3: Parallel execution', () => {
    it('fetchUsers runs in parallel', async () => {
      const start = Date.now()
      const users = await fetchUsers(['1', '2', '3'])
      const elapsed = Date.now() - start

      expect(users).toHaveLength(3)
      // Should take ~20ms (parallel), not ~60ms (sequential)
      expect(elapsed).toBeLessThan(50)
    })

    it('fastest returns first to resolve', async () => {
      const result = await fastest([delay(50, 'slow'), delay(10, 'fast')])
      expect(result).toBe('fast')
    })

    it('settleAll collects all results', async () => {
      const results = await settleAll([
        Promise.resolve('a'),
        Promise.reject(new Error('b')),
        Promise.resolve('c'),
      ])

      expect(results.fulfilled).toEqual(['a', 'c'])
      expect(results.rejected).toHaveLength(1)
      expect(results.rejected[0].message).toBe('b')
    })
  })

  // ============================================================================
  // EXERCISE 4: Error Handling
  // ============================================================================

  /**
   * Exercise 4.4: Robust error handling
   */

  // Retry a function up to maxAttempts times
  // Wait delayMs between attempts
  async function retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number,
    delayMs: number
  ): Promise<T> {
    // TODO: implement retry logic
    throw new Error('Not implemented')
  }

  // Call fn, return default value if it rejects
  async function withDefault<T>(fn: () => Promise<T>, defaultValue: T): Promise<T> {
    // TODO: implement
    throw new Error('Not implemented')
  }

  // Call fn with a timeout - reject if it takes longer than timeoutMs
  async function withTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    // TODO: implement using Promise.race
    throw new Error('Not implemented')
  }

  describe('Exercise 4.4: Error handling', () => {
    it('retry succeeds on later attempt', async () => {
      let attempts = 0
      const flaky = async () => {
        attempts++
        if (attempts < 3) throw new Error('Not yet')
        return 'success'
      }

      const result = await retry(flaky, 5, 10)
      expect(result).toBe('success')
      expect(attempts).toBe(3)
    })

    it('retry throws after max attempts', async () => {
      let attempts = 0
      const alwaysFails = async () => {
        attempts++
        throw new Error('Nope')
      }

      await expect(retry(alwaysFails, 3, 10)).rejects.toThrow('Nope')
      expect(attempts).toBe(3)
    })

    it('withDefault returns value on success', async () => {
      const result = await withDefault(async () => 'real', 'default')
      expect(result).toBe('real')
    })

    it('withDefault returns default on failure', async () => {
      const result = await withDefault(async () => {
        throw new Error('Oops')
      }, 'default')
      expect(result).toBe('default')
    })

    it('withTimeout resolves if fast enough', async () => {
      const result = await withTimeout(() => delay(10, 'done'), 100)
      expect(result).toBe('done')
    })

    it('withTimeout rejects if too slow', async () => {
      await expect(withTimeout(() => delay(100, 'done'), 20)).rejects.toThrow(
        'Timeout'
      )
    })
  })

  // ============================================================================
  // CHALLENGE: Build a Request Queue
  // ============================================================================

  /**
   * Challenge: Implement a request queue with concurrency limit
   *
   * This is similar to how the Align sync engine batches requests.
   */

  // Process items with at most `concurrency` operations running at once
  async function processWithConcurrency<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    concurrency: number
  ): Promise<R[]> {
    // TODO: implement
    // - Process up to `concurrency` items in parallel
    // - When one finishes, start the next
    // - Maintain original order in results
    throw new Error('Not implemented')
  }

  describe('Challenge: Request queue', () => {
    it('processes all items', async () => {
      const items = [1, 2, 3, 4, 5]
      const results = await processWithConcurrency(
        items,
        async (n) => {
          await delay(10, null)
          return n * 2
        },
        2
      )

      expect(results).toEqual([2, 4, 6, 8, 10])
    })

    it('respects concurrency limit', async () => {
      let running = 0
      let maxRunning = 0

      const items = [1, 2, 3, 4, 5, 6]
      await processWithConcurrency(
        items,
        async (n) => {
          running++
          maxRunning = Math.max(maxRunning, running)
          await delay(20, null)
          running--
          return n
        },
        3
      )

      expect(maxRunning).toBe(3)
    })

    it('handles errors without stopping', async () => {
      const items = [1, 2, 3]

      await expect(
        processWithConcurrency(
          items,
          async (n) => {
            if (n === 2) throw new Error('Bad item')
            return n
          },
          2
        )
      ).rejects.toThrow('Bad item')
    })

    it('is faster than sequential', async () => {
      const items = [1, 2, 3, 4]

      const start = Date.now()
      await processWithConcurrency(
        items,
        async (n) => {
          await delay(25, null)
          return n
        },
        4
      )
      const elapsed = Date.now() - start

      // 4 items, 25ms each, parallel = ~25ms total
      // Sequential would be 100ms
      expect(elapsed).toBeLessThan(60)
    })
  })
})

// Helper for tests - redefining here to avoid circular issues
function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}
