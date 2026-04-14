'use client'

import { useState, useCallback, useEffect } from 'react'

type Tab = 'javascript' | 'react' | 'database' | 'animation'

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<Tab>('javascript')

  return (
    <div className="min-h-screen bg-parchment p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="font-display text-3xl text-ink mb-2">Playground</h1>
          <p className="text-ink/70 font-body">
            Experiment with concepts from the learning book
          </p>
        </header>

        {/* Tab Navigation */}
        <nav className="flex gap-2 mb-6 border-b border-ink/10 pb-2">
          {(['javascript', 'react', 'database', 'animation'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t font-body text-sm transition-colors ${
                activeTab === tab
                  ? 'bg-ink text-parchment'
                  : 'text-ink/60 hover:text-ink hover:bg-ink/5'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="bg-white/50 rounded-lg border border-ink/10 p-6">
          {activeTab === 'javascript' && <JavaScriptPlayground />}
          {activeTab === 'react' && <ReactPlayground />}
          {activeTab === 'database' && <DatabasePlayground />}
          {activeTab === 'animation' && <AnimationPlayground />}
        </div>

        {/* Tips */}
        <aside className="mt-8 p-4 bg-ink/5 rounded-lg">
          <h3 className="font-display text-lg text-ink mb-2">Tips</h3>
          <ul className="text-sm text-ink/70 font-body space-y-1">
            <li>Open browser DevTools (F12) to see console output</li>
            <li>Edit the code and click Run to see results</li>
            <li>Use the book chapters as reference</li>
          </ul>
        </aside>
      </div>
    </div>
  )
}

// ============================================================================
// JavaScript Playground
// ============================================================================

function JavaScriptPlayground() {
  const [code, setCode] = useState(`// Try JavaScript here!
// Results will appear in the console (F12)

const greeting = "Hello, Align!"
console.log(greeting)

// Try array methods
const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.map(n => n * 2)
console.log("Doubled:", doubled)

// Try async/await
async function fetchData() {
  await new Promise(r => setTimeout(r, 1000))
  return { message: "Data loaded!" }
}

fetchData().then(data => console.log(data))
`)

  const [output, setOutput] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const runCode = useCallback(() => {
    setOutput([])
    setError(null)

    // Capture console.log
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args) => {
      logs.push(args.map((a) => JSON.stringify(a, null, 2)).join(' '))
      setOutput([...logs])
      originalLog(...args)
    }

    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(code)
      fn()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      // Restore console.log after a delay (for async code)
      setTimeout(() => {
        console.log = originalLog
      }, 2000)
    }
  }, [code])

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl text-ink">JavaScript Console</h2>
      <p className="text-ink/70 text-sm font-body">
        Write JavaScript and see the results. Covers Chapters 1-4.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-body text-ink/70 mb-2">Code</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-80 font-mono text-sm p-4 bg-ink/5 rounded border border-ink/10 focus:outline-none focus:border-ink/30"
            spellCheck={false}
          />
          <button
            onClick={runCode}
            className="mt-2 px-4 py-2 bg-ink text-parchment rounded font-body text-sm hover:bg-ink/80 transition-colors"
          >
            Run Code
          </button>
        </div>

        <div>
          <label className="block text-sm font-body text-ink/70 mb-2">Output</label>
          <div className="w-full h-80 font-mono text-sm p-4 bg-ink/5 rounded border border-ink/10 overflow-auto">
            {error && <div className="text-red-600 mb-2">Error: {error}</div>}
            {output.map((line, i) => (
              <div key={i} className="text-ink/80">
                {line}
              </div>
            ))}
            {output.length === 0 && !error && (
              <div className="text-ink/40">Output will appear here...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// React Playground
// ============================================================================

function ReactPlayground() {
  const [count, setCount] = useState(0)
  const [items, setItems] = useState<string[]>(['Item 1', 'Item 2'])
  const [newItem, setNewItem] = useState('')

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl text-ink">React Sandbox</h2>
      <p className="text-ink/70 text-sm font-body">
        Interactive examples from Chapters 7-10. Modify the code in your editor to experiment.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Counter Example */}
        <div className="p-4 bg-ink/5 rounded-lg">
          <h3 className="font-display text-lg text-ink mb-4">useState: Counter</h3>
          <p className="text-sm text-ink/60 mb-4 font-body">
            Click the buttons to change the count. This demonstrates useState.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCount((c) => c - 1)}
              className="w-10 h-10 rounded-full bg-ink text-parchment font-display text-xl"
            >
              -
            </button>
            <span className="font-display text-3xl text-ink w-16 text-center">{count}</span>
            <button
              onClick={() => setCount((c) => c + 1)}
              className="w-10 h-10 rounded-full bg-ink text-parchment font-display text-xl"
            >
              +
            </button>
          </div>
          <button
            onClick={() => setCount(0)}
            className="mt-4 text-sm text-ink/60 hover:text-ink font-body"
          >
            Reset
          </button>
        </div>

        {/* List Example */}
        <div className="p-4 bg-ink/5 rounded-lg">
          <h3 className="font-display text-lg text-ink mb-4">Lists and Keys</h3>
          <p className="text-sm text-ink/60 mb-4 font-body">
            Add and remove items. Each item needs a unique key.
          </p>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="New item..."
              className="flex-1 px-3 py-2 border border-ink/20 rounded font-body text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newItem.trim()) {
                  setItems([...items, newItem.trim()])
                  setNewItem('')
                }
              }}
            />
            <button
              onClick={() => {
                if (newItem.trim()) {
                  setItems([...items, newItem.trim()])
                  setNewItem('')
                }
              }}
              className="px-4 py-2 bg-ink text-parchment rounded font-body text-sm"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 bg-white rounded"
              >
                <span className="font-body text-sm">{item}</span>
                <button
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Controlled Input Example */}
      <div className="p-4 bg-ink/5 rounded-lg">
        <h3 className="font-display text-lg text-ink mb-4">Controlled Components</h3>
        <ControlledFormExample />
      </div>
    </div>
  )
}

function ControlledFormExample() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [submitted, setSubmitted] = useState<{ name: string; age: string } | null>(null)

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <p className="text-sm text-ink/60 font-body">
          Form inputs are controlled by React state. Changes flow through onChange handlers.
        </p>
        <div>
          <label className="block text-sm font-body text-ink/70 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-ink/20 rounded font-body"
            placeholder="Enter name..."
          />
        </div>
        <div>
          <label className="block text-sm font-body text-ink/70 mb-1">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-3 py-2 border border-ink/20 rounded font-body"
            placeholder="Enter age..."
          />
        </div>
        <button
          onClick={() => setSubmitted({ name, age })}
          className="px-4 py-2 bg-ink text-parchment rounded font-body text-sm"
        >
          Submit
        </button>
      </div>
      <div className="p-4 bg-white rounded">
        <h4 className="font-display text-sm text-ink/70 mb-2">Current State:</h4>
        <pre className="font-mono text-sm text-ink/80">
          {JSON.stringify({ name, age }, null, 2)}
        </pre>
        {submitted && (
          <>
            <h4 className="font-display text-sm text-ink/70 mb-2 mt-4">Submitted:</h4>
            <pre className="font-mono text-sm text-ink/80">
              {JSON.stringify(submitted, null, 2)}
            </pre>
          </>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Database Playground
// ============================================================================

function DatabasePlayground() {
  const [dbStatus, setDbStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [moves, setMoves] = useState<Array<{ id: string; title: string; status: string }>>([])
  const [newMoveTitle, setNewMoveTitle] = useState('')

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    const initDb = async () => {
      setDbStatus('loading')
      try {
        const { db } = await import('@/lib/db/local')
        const existingMoves = await db.moves.limit(10).toArray()
        setMoves(
          existingMoves.map((m) => ({
            id: m.id,
            title: m.title,
            status: m.status,
          }))
        )
        setDbStatus('ready')
      } catch (e) {
        console.error('DB init error:', e)
        setDbStatus('error')
      }
    }
    initDb()
  }, [])

  const addMove = async () => {
    if (!newMoveTitle.trim()) return

    try {
      const { db } = await import('@/lib/db/local')
      const { newId } = await import('@/lib/utils/ids')
      const { todayStr } = await import('@/lib/utils/dates')

      const move = {
        id: newId(),
        title: newMoveTitle.trim(),
        status: 'pending' as const,
        date: todayStr(),
        userId: 'playground-user',
        cycleId: 'playground-cycle',
        directionId: 'playground-direction',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _synced: 0 as 0 | 1,
      }

      await db.moves.add(move)
      setMoves([...moves, { id: move.id, title: move.title, status: move.status }])
      setNewMoveTitle('')
    } catch (e) {
      console.error('Add move error:', e)
    }
  }

  const deleteMove = async (id: string) => {
    try {
      const { db } = await import('@/lib/db/local')
      await db.moves.delete(id)
      setMoves(moves.filter((m) => m.id !== id))
    } catch (e) {
      console.error('Delete move error:', e)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl text-ink">Database Explorer</h2>
      <p className="text-ink/70 text-sm font-body">
        Interact with the local Dexie database. Covers Chapter 13.
      </p>

      <div className="p-4 bg-ink/5 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-body text-sm">Status:</span>
          <span
            className={`px-2 py-1 rounded text-xs font-body ${
              dbStatus === 'ready'
                ? 'bg-green-100 text-green-800'
                : dbStatus === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {dbStatus}
          </span>
        </div>

        {dbStatus === 'ready' && (
          <>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newMoveTitle}
                onChange={(e) => setNewMoveTitle(e.target.value)}
                placeholder="New move title..."
                className="flex-1 px-3 py-2 border border-ink/20 rounded font-body text-sm"
                onKeyDown={(e) => e.key === 'Enter' && addMove()}
              />
              <button
                onClick={addMove}
                className="px-4 py-2 bg-ink text-parchment rounded font-body text-sm"
              >
                Add Move
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="font-display text-sm text-ink/70">Moves in Database:</h4>
              {moves.length === 0 ? (
                <p className="text-ink/40 text-sm font-body">No moves yet. Add one above!</p>
              ) : (
                <ul className="space-y-1">
                  {moves.map((move) => (
                    <li
                      key={move.id}
                      className="flex items-center justify-between p-2 bg-white rounded text-sm"
                    >
                      <span className="font-body">
                        {move.title}{' '}
                        <span className="text-ink/40">({move.status})</span>
                      </span>
                      <button
                        onClick={() => deleteMove(move.id)}
                        className="text-red-500 text-xs hover:text-red-700"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {dbStatus === 'error' && (
          <p className="text-red-600 text-sm font-body">
            Failed to connect to database. Check the console for details.
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Animation Playground
// ============================================================================

function AnimationPlayground() {
  const [isVisible, setIsVisible] = useState(true)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl text-ink">Animation Lab</h2>
      <p className="text-ink/70 text-sm font-body">
        Experiment with Framer Motion animations. Covers Chapter 16.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Presence Animation */}
        <div className="p-4 bg-ink/5 rounded-lg">
          <h3 className="font-display text-lg text-ink mb-4">Enter/Exit Animation</h3>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="px-4 py-2 bg-ink text-parchment rounded font-body text-sm mb-4"
          >
            {isVisible ? 'Hide' : 'Show'}
          </button>
          <div className="h-32 flex items-center justify-center">
            {isVisible && (
              <div
                className="w-20 h-20 bg-ink rounded-lg animate-fade-in"
                style={{
                  animation: 'fadeIn 0.3s ease-out',
                }}
              />
            )}
          </div>
          <p className="text-xs text-ink/50 font-body mt-2">
            In real code, use Framer Motion&apos;s AnimatePresence for exit animations.
          </p>
        </div>

        {/* Drag Animation */}
        <div className="p-4 bg-ink/5 rounded-lg">
          <h3 className="font-display text-lg text-ink mb-4">Drag Interaction</h3>
          <p className="text-sm text-ink/60 mb-4 font-body">
            Drag the square around. This uses mouse events.
          </p>
          <div
            className="h-40 bg-white rounded relative overflow-hidden"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setPosition({
                x: e.clientX - rect.left - 25,
                y: e.clientY - rect.top - 25,
              })
            }}
          >
            <div
              className="w-12 h-12 bg-ink rounded-lg absolute transition-transform duration-75"
              style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Spring Physics */}
      <div className="p-4 bg-ink/5 rounded-lg">
        <h3 className="font-display text-lg text-ink mb-4">CSS Transitions vs Springs</h3>
        <p className="text-sm text-ink/60 mb-4 font-body">
          Compare different easing functions. In Framer Motion, springs feel more natural.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Linear', timing: 'linear' },
            { name: 'Ease Out', timing: 'ease-out' },
            { name: 'Ease In Out', timing: 'ease-in-out' },
          ].map((easing) => (
            <div key={easing.name} className="text-center">
              <div className="h-24 bg-white rounded relative overflow-hidden">
                <div
                  className="w-8 h-8 bg-ink rounded absolute left-2"
                  style={{
                    animation: `bounce-${easing.timing.replace(' ', '-')} 2s ${easing.timing} infinite`,
                  }}
                />
              </div>
              <span className="text-xs font-body text-ink/70">{easing.name}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes bounce-linear {
          0%,
          100% {
            top: 8px;
          }
          50% {
            top: calc(100% - 40px);
          }
        }
        @keyframes bounce-ease-out {
          0%,
          100% {
            top: 8px;
          }
          50% {
            top: calc(100% - 40px);
          }
        }
        @keyframes bounce-ease-in-out {
          0%,
          100% {
            top: 8px;
          }
          50% {
            top: calc(100% - 40px);
          }
        }
      `}</style>
    </div>
  )
}
