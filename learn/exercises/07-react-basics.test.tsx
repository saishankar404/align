/**
 * Chapter 7-8: React Basics - Exercises
 *
 * Run with: npm run test:exercises -- --grep "Chapter 7"
 *
 * These exercises reinforce:
 * - Components and JSX
 * - Props and children
 * - useState and events
 * - Controlled components
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React, { useState } from 'react'

// ============================================================================
// EXERCISE 1: Basic Components
// ============================================================================

describe('Chapter 7-8: React Basics', () => {
  /**
   * Exercise 7.1: Create basic components
   */

  // Create a Greeting component that displays "Hello, {name}!"
  function Greeting({ name }: { name: string }) {
    // TODO: implement
    return <div>Not implemented</div>
  }

  // Create a Button component with onClick handler
  function Button({
    onClick,
    children,
  }: {
    onClick: () => void
    children: React.ReactNode
  }) {
    // TODO: implement
    return <button>Not implemented</button>
  }

  // Create a Card component with title and children
  function Card({
    title,
    children,
  }: {
    title: string
    children: React.ReactNode
  }) {
    // TODO: implement with a div wrapper, h2 for title, and children
    return <div>Not implemented</div>
  }

  describe('Exercise 7.1: Basic components', () => {
    it('Greeting displays name', () => {
      render(<Greeting name="Alice" />)
      expect(screen.getByText('Hello, Alice!')).toBeInTheDocument()
    })

    it('Button calls onClick', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)

      fireEvent.click(screen.getByText('Click me'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('Card renders title and children', () => {
      render(
        <Card title="My Card">
          <p>Card content</p>
        </Card>
      )

      expect(screen.getByRole('heading', { name: 'My Card' })).toBeInTheDocument()
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // EXERCISE 2: useState
  // ============================================================================

  /**
   * Exercise 7.2: State management
   */

  // Counter component with increment and decrement buttons
  function Counter({ initial = 0 }: { initial?: number }) {
    // TODO: implement with useState
    // Should have buttons labeled "+" and "-"
    // Should display current count
    return <div>Not implemented</div>
  }

  // Toggle component that switches between "ON" and "OFF"
  function Toggle({ initialOn = false }: { initialOn?: boolean }) {
    // TODO: implement with useState
    // Should have a button that toggles the state
    // Display "ON" or "OFF" based on state
    return <div>Not implemented</div>
  }

  describe('Exercise 7.2: useState', () => {
    it('Counter increments and decrements', () => {
      render(<Counter initial={5} />)

      expect(screen.getByText('5')).toBeInTheDocument()

      fireEvent.click(screen.getByText('+'))
      expect(screen.getByText('6')).toBeInTheDocument()

      fireEvent.click(screen.getByText('-'))
      fireEvent.click(screen.getByText('-'))
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('Toggle switches state', () => {
      render(<Toggle initialOn={false} />)

      expect(screen.getByText('OFF')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button'))
      expect(screen.getByText('ON')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button'))
      expect(screen.getByText('OFF')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // EXERCISE 3: Controlled Inputs
  // ============================================================================

  /**
   * Exercise 7.3: Form handling
   */

  // Controlled text input that reports changes
  function TextInput({
    value,
    onChange,
    placeholder,
  }: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }) {
    // TODO: implement controlled input
    return <input />
  }

  // Search box with clear button (appears when text is entered)
  function SearchBox({ onSearch }: { onSearch: (query: string) => void }) {
    // TODO: implement with internal state
    // - Input field for search query
    // - Clear button (only visible when query is not empty)
    // - Search button that calls onSearch with current query
    return <div>Not implemented</div>
  }

  describe('Exercise 7.3: Controlled inputs', () => {
    it('TextInput is controlled', () => {
      const handleChange = vi.fn()
      render(<TextInput value="hello" onChange={handleChange} placeholder="Type here" />)

      const input = screen.getByPlaceholderText('Type here')
      expect(input).toHaveValue('hello')

      fireEvent.change(input, { target: { value: 'world' } })
      expect(handleChange).toHaveBeenCalledWith('world')
    })

    it('SearchBox has clear and search functionality', () => {
      const handleSearch = vi.fn()
      render(<SearchBox onSearch={handleSearch} />)

      const input = screen.getByRole('textbox')

      // Clear button not visible initially
      expect(screen.queryByText('Clear')).not.toBeInTheDocument()

      // Type something
      fireEvent.change(input, { target: { value: 'test query' } })

      // Clear button now visible
      expect(screen.getByText('Clear')).toBeInTheDocument()

      // Click search
      fireEvent.click(screen.getByText('Search'))
      expect(handleSearch).toHaveBeenCalledWith('test query')

      // Click clear
      fireEvent.click(screen.getByText('Clear'))
      expect(input).toHaveValue('')
    })
  })

  // ============================================================================
  // EXERCISE 4: Lists and Keys
  // ============================================================================

  /**
   * Exercise 7.4: Rendering lists
   */

  interface Item {
    id: string
    name: string
    completed: boolean
  }

  // Render a list of items with checkboxes
  function ItemList({
    items,
    onToggle,
  }: {
    items: Item[]
    onToggle: (id: string) => void
  }) {
    // TODO: implement
    // - Render each item with a checkbox and name
    // - Checkbox should reflect completed state
    // - Clicking checkbox calls onToggle with item id
    // - Use correct keys!
    return <ul>Not implemented</ul>
  }

  describe('Exercise 7.4: Lists and keys', () => {
    it('ItemList renders all items', () => {
      const items: Item[] = [
        { id: '1', name: 'Item 1', completed: false },
        { id: '2', name: 'Item 2', completed: true },
        { id: '3', name: 'Item 3', completed: false },
      ]

      render(<ItemList items={items} onToggle={() => {}} />)

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('ItemList shows correct checkbox state', () => {
      const items: Item[] = [
        { id: '1', name: 'Done', completed: true },
        { id: '2', name: 'Not done', completed: false },
      ]

      render(<ItemList items={items} onToggle={() => {}} />)

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]).toBeChecked()
      expect(checkboxes[1]).not.toBeChecked()
    })

    it('ItemList calls onToggle with correct id', () => {
      const items: Item[] = [
        { id: 'a', name: 'First', completed: false },
        { id: 'b', name: 'Second', completed: false },
      ]
      const handleToggle = vi.fn()

      render(<ItemList items={items} onToggle={handleToggle} />)

      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])

      expect(handleToggle).toHaveBeenCalledWith('b')
    })
  })

  // ============================================================================
  // CHALLENGE: Build a Move Card
  // ============================================================================

  /**
   * Challenge: Create a simplified version of Align's MoveCard
   */

  interface Move {
    id: string
    title: string
    status: 'pending' | 'done'
  }

  // MoveCard component
  // - Shows move title
  // - Shows checkmark icon when done (use "✓" text for simplicity)
  // - Clicking the card calls onToggle
  // - Has different styling based on status (add 'done' class when complete)
  function MoveCard({
    move,
    onToggle,
  }: {
    move: Move
    onToggle: (id: string) => void
  }) {
    // TODO: implement
    return <div>Not implemented</div>
  }

  // MoveList component that manages its own state
  // - Renders list of MoveCards
  // - Toggling a card updates its status
  // - Shows count of completed moves: "X of Y complete"
  function MoveList({ initialMoves }: { initialMoves: Move[] }) {
    // TODO: implement with useState
    return <div>Not implemented</div>
  }

  describe('Challenge: Move card component', () => {
    it('MoveCard displays title and status', () => {
      const move: Move = { id: '1', title: 'Morning run', status: 'done' }
      render(<MoveCard move={move} onToggle={() => {}} />)

      expect(screen.getByText('Morning run')).toBeInTheDocument()
      expect(screen.getByText('✓')).toBeInTheDocument()
    })

    it('MoveCard calls onToggle when clicked', () => {
      const move: Move = { id: '1', title: 'Read', status: 'pending' }
      const handleToggle = vi.fn()

      render(<MoveCard move={move} onToggle={handleToggle} />)
      fireEvent.click(screen.getByText('Read'))

      expect(handleToggle).toHaveBeenCalledWith('1')
    })

    it('MoveList manages state correctly', () => {
      const moves: Move[] = [
        { id: '1', title: 'Run', status: 'done' },
        { id: '2', title: 'Read', status: 'pending' },
        { id: '3', title: 'Code', status: 'pending' },
      ]

      render(<MoveList initialMoves={moves} />)

      // Initial state: 1 of 3 complete
      expect(screen.getByText('1 of 3 complete')).toBeInTheDocument()

      // Toggle second move to done
      fireEvent.click(screen.getByText('Read'))
      expect(screen.getByText('2 of 3 complete')).toBeInTheDocument()

      // Toggle first move to pending
      fireEvent.click(screen.getByText('Run'))
      expect(screen.getByText('1 of 3 complete')).toBeInTheDocument()
    })
  })
})
