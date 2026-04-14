# Appendix B: Pattern Reference

Quick reference for common patterns used throughout the Align codebase. Each pattern includes the problem it solves, the solution, and where to find examples.

---

## React Patterns

### 1. Controlled Form Input

**Problem**: Need form input that React controls completely.

**Pattern**:
```tsx
const [value, setValue] = useState('')

<input
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

**Align Example**: `components/home/sheets/AddMoveSheet.tsx`

---

### 2. Conditional Rendering

**Problem**: Show different UI based on state.

**Pattern**:
```tsx
// Boolean condition
{isLoading && <Spinner />}

// Ternary for either/or
{error ? <Error /> : <Content />}

// Guard clause
if (!data) return <Loading />
return <Content data={data} />
```

**Align Example**: `components/home/views/TodayView.tsx`

---

### 3. List Rendering with Keys

**Problem**: Render arrays of items efficiently.

**Pattern**:
```tsx
{items.map(item => (
  <ListItem key={item.id} item={item} />
))}
```

**Align Example**: `components/home/views/WindowView.tsx`

---

### 4. Lifting State Up

**Problem**: Siblings need to share state.

**Pattern**:
```tsx
function Parent() {
  const [shared, setShared] = useState(initial)
  return (
    <>
      <ChildA value={shared} />
      <ChildB onChange={setShared} />
    </>
  )
}
```

**Align Example**: `components/home/HomeApp.tsx` (view state shared with navbar)

---

### 5. Context Provider

**Problem**: Pass data deeply without prop drilling.

**Pattern**:
```tsx
// Create context
const MyContext = createContext<ContextType | null>(null)

// Provider component
function MyProvider({ children }) {
  const [state, setState] = useState(initial)
  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  )
}

// Consumer hook
function useMyContext() {
  const ctx = useContext(MyContext)
  if (!ctx) throw new Error('Must use within Provider')
  return ctx
}
```

**Align Example**: `lib/context/AppContext.tsx`

---

### 6. Custom Hook Extraction

**Problem**: Reuse stateful logic across components.

**Pattern**:
```tsx
function useToggle(initial = false) {
  const [on, setOn] = useState(initial)
  const toggle = useCallback(() => setOn(prev => !prev), [])
  return [on, toggle] as const
}

// Usage
const [isOpen, toggleOpen] = useToggle()
```

**Align Example**: `lib/hooks/useOnline.ts`

---

### 7. Effect Cleanup

**Problem**: Clean up subscriptions/timers when component unmounts.

**Pattern**:
```tsx
useEffect(() => {
  const handler = () => { /* ... */ }
  window.addEventListener('event', handler)
  
  return () => {
    window.removeEventListener('event', handler)
  }
}, [])
```

**Align Example**: `components/pwa/PWAUpdateController.tsx`

---

### 8. Ref for DOM Access

**Problem**: Need direct DOM element access.

**Pattern**:
```tsx
const inputRef = useRef<HTMLInputElement>(null)

useEffect(() => {
  inputRef.current?.focus()
}, [])

<input ref={inputRef} />
```

**Align Example**: `components/home/shared/MoveCard.tsx`

---

## TypeScript Patterns

### 9. Interface for Props

**Problem**: Type component props.

**Pattern**:
```tsx
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean  // Optional
}

function Button({ children, onClick, disabled = false }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{children}</button>
}
```

**Align Example**: Every component file

---

### 10. Discriminated Union

**Problem**: Type that can be one of several shapes.

**Pattern**:
```tsx
type Result = 
  | { status: 'success'; data: Data }
  | { status: 'error'; error: Error }
  | { status: 'loading' }

function handle(result: Result) {
  if (result.status === 'success') {
    // TypeScript knows result.data exists here
  }
}
```

**Align Example**: `lib/identity/client.ts` (IdentityMode)

---

### 11. Type Guard Function

**Problem**: Narrow type based on runtime check.

**Pattern**:
```tsx
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

// Usage
if (isString(input)) {
  // input is string here
}
```

**Align Example**: `lib/db/sync.ts` (type narrowing for sync records)

---

### 12. Generic Function

**Problem**: Function that works with multiple types.

**Pattern**:
```tsx
function first<T>(arr: T[]): T | undefined {
  return arr[0]
}

const num = first([1, 2, 3])    // number | undefined
const str = first(['a', 'b'])   // string | undefined
```

**Align Example**: Dexie table methods

---

## Data Patterns

### 13. Offline-First Write

**Problem**: Immediate UI response with background sync.

**Pattern**:
```tsx
async function createMove(data: MoveData) {
  // 1. Write to local DB
  await db.moves.add({
    ...data,
    _synced: 0,  // Mark as unsynced
  })
  
  // 2. Update UI
  context.refresh()
  
  // 3. Sync in background (fire and forget)
  syncAllIfCloud(userId).catch(() => {})
}
```

**Align Example**: `components/home/sheets/AddMoveSheet.tsx`

---

### 14. Sync Flag Pattern

**Problem**: Track which records need syncing.

**Pattern**:
```tsx
// Local record schema
interface LocalMove {
  id: string
  title: string
  // ... other fields
  _synced: 0 | 1  // 0 = needs sync, 1 = synced
}

// Push unsynced
const unsynced = await db.moves.where('_synced').equals(0).toArray()
for (const record of unsynced) {
  await supabase.from('moves').upsert(mapToDb(record))
  await db.moves.update(record.id, { _synced: 1 })
}
```

**Align Example**: `lib/db/sync.ts`

---

### 15. Tombstone for Deletes

**Problem**: Sync deletions across devices.

**Pattern**:
```tsx
// Instead of deleting, mark as deleted
await db.items.update(id, { 
  _deleted: 1,
  _synced: 0 
})

// Sync process handles the actual delete
if (record._deleted) {
  await supabase.from('items').delete().eq('id', record.id)
}
```

**Align Example**: `lib/db/sync.ts` (for later items)

---

### 16. Debounced Sync

**Problem**: Don't sync on every keystroke.

**Pattern**:
```tsx
const syncDebounced = useMemo(
  () => debounce(() => syncAllIfCloud(userId), 1000),
  [userId]
)

// Call on each change
useEffect(() => {
  syncDebounced()
}, [value])
```

**Align Example**: `lib/db/sync.ts` (requestSyncIfCloud)

---

## Animation Patterns

### 17. Staggered Children

**Problem**: Elements animate in sequence.

**Pattern**:
```tsx
const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.div variants={container} initial="hidden" animate="show">
  {items.map(i => (
    <motion.div key={i} variants={item}>{i}</motion.div>
  ))}
</motion.div>
```

**Align Example**: `components/onboarding/screens/textVariants.ts`

---

### 18. Exit Animation

**Problem**: Animate element leaving DOM.

**Pattern**:
```tsx
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>
```

**Align Example**: `components/home/HomeApp.tsx` (view transitions)

---

### 19. Tap Feedback

**Problem**: Button should feel tappable.

**Pattern**:
```tsx
<motion.button
  whileTap={{ scale: 0.97 }}
  transition={{ type: 'spring', stiffness: 420, damping: 24 }}
>
  Tap me
</motion.button>
```

**Align Example**: All buttons throughout the app

---

### 20. Direction-Aware Transitions

**Problem**: Slide direction based on navigation direction.

**Pattern**:
```tsx
const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%' })
}

<AnimatePresence custom={direction}>
  <motion.div
    key={currentView}
    custom={direction}
    variants={variants}
    initial="enter"
    animate="center"
    exit="exit"
  />
</AnimatePresence>
```

**Align Example**: `components/home/HomeApp.tsx`

---

## Authentication Patterns

### 21. Auth Guard (Server)

**Problem**: Protect routes from unauthenticated access.

**Pattern**:
```tsx
export default async function AuthGuard({ children }) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }
  
  return <>{children}</>
}
```

**Align Example**: `components/auth/AuthGuard.tsx`

---

### 22. Auth State Listener

**Problem**: React to auth changes.

**Pattern**:
```tsx
useEffect(() => {
  const { data: listener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_IN') {
        // Handle sign in
      } else if (event === 'SIGNED_OUT') {
        // Handle sign out
      }
    }
  )
  
  return () => listener.subscription.unsubscribe()
}, [])
```

**Align Example**: `components/onboarding/OnboardingFlow.tsx`

---

### 23. Dual Identity Mode

**Problem**: Support both authenticated and anonymous users.

**Pattern**:
```tsx
async function getActiveUserId(): Promise<string | null> {
  if (isLocalMode()) {
    return getOrCreateLocalUserId()  // From localStorage
  }
  return getCloudUserId()  // From Supabase session
}
```

**Align Example**: `lib/identity/client.ts`

---

## Next.js Patterns

### 24. Route Group

**Problem**: Organize routes without affecting URL structure.

**Pattern**:
```
app/
  (marketing)/     # Doesn't appear in URL
    page.tsx       # /
    about/page.tsx # /about
  (app)/
    home/page.tsx  # /home
```

**Align Example**: `app/(app)/` and `app/(marketing)/`

---

### 25. Layout Composition

**Problem**: Share UI across multiple routes.

**Pattern**:
```tsx
// app/(app)/layout.tsx
export default function AppLayout({ children }) {
  return (
    <AuthGuard>
      <AppContextProvider>
        {children}
      </AppContextProvider>
    </AuthGuard>
  )
}
```

**Align Example**: `app/(app)/home/layout.tsx`

---

### 26. API Route Handler

**Problem**: Server-side API endpoint.

**Pattern**:
```tsx
// app/api/resource/route.ts
export async function GET(request: Request) {
  const data = await fetchData()
  return Response.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const result = await createResource(body)
  return Response.json(result, { status: 201 })
}
```

**Align Example**: `app/api/account/delete/route.ts`

---

## Database Patterns

### 27. Row Level Security Policy

**Problem**: Filter data by user automatically.

**Pattern**:
```sql
-- Enable RLS
ALTER TABLE moves ENABLE ROW LEVEL SECURITY;

-- Policy: users can only access their own rows
CREATE POLICY "moves own" ON moves
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Align Example**: `supabase/migrations/20260320091329_init.sql`

---

### 28. Trigger for Business Rules

**Problem**: Enforce rules at database level.

**Pattern**:
```sql
CREATE FUNCTION check_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM items WHERE user_id = NEW.user_id) >= 3 THEN
    RAISE EXCEPTION 'limit_exceeded';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_limit
  BEFORE INSERT ON items
  FOR EACH ROW
  EXECUTE FUNCTION check_limit();
```

**Align Example**: `supabase/migrations/20260320091329_init.sql` (max moves trigger)

---

### 29. Composite Index

**Problem**: Speed up queries on multiple columns.

**Pattern**:
```sql
-- Query: WHERE user_id = ? AND date = ?
CREATE INDEX idx_moves_user_date ON moves (user_id, date);
```

**Align Example**: `supabase/migrations/20260320091329_init.sql`

---

### 30. Upsert Pattern

**Problem**: Insert or update based on existence.

**Pattern**:
```tsx
await supabase
  .from('profiles')
  .upsert({
    id: userId,
    name: newName,
    updated_at: new Date().toISOString()
  })
```

**Align Example**: `lib/db/sync.ts`

---

## Error Handling Patterns

### 31. Error Boundary

**Problem**: Catch and handle React errors gracefully.

**Pattern**:
```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false }
  
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```

**Align Example**: Wrap HomeApp with error boundary

---

### 32. Try-Catch with User Feedback

**Problem**: Handle async errors and inform user.

**Pattern**:
```tsx
async function handleSubmit() {
  setLoading(true)
  setError(null)
  
  try {
    await saveData(formData)
    showToast('Saved!')
  } catch (e) {
    setError('Something went wrong')
  } finally {
    setLoading(false)
  }
}
```

**Align Example**: `components/onboarding/OnboardingFlow.tsx` (persistOnboarding)

---

## Utility Patterns

### 33. ID Generation

**Problem**: Create unique identifiers.

**Pattern**:
```tsx
export function newId(): string {
  return crypto.randomUUID()
}
```

**Align Example**: `lib/utils/ids.ts`

---

### 34. Debug Logging

**Problem**: Logging that only runs in development.

**Pattern**:
```tsx
export function debug(...args: unknown[]): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[align]', ...args)
  }
}
```

**Align Example**: `lib/utils/debug.ts`

---

### 35. Date Formatting

**Problem**: Consistent date handling.

**Pattern**:
```tsx
import { format, parseISO, differenceInDays } from 'date-fns'

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function cycleDay(startDate: string): number {
  return differenceInDays(new Date(), parseISO(startDate)) + 1
}
```

**Align Example**: `lib/utils/dates.ts`

---

## Index by Problem

| Problem | Pattern | Section |
|---------|---------|---------|
| Form input control | Controlled Form Input | React #1 |
| Show/hide UI | Conditional Rendering | React #2 |
| Render lists | List Rendering | React #3 |
| Share state between siblings | Lifting State | React #4 |
| Avoid prop drilling | Context Provider | React #5 |
| Reuse stateful logic | Custom Hook | React #6 |
| Clean up subscriptions | Effect Cleanup | React #7 |
| Access DOM directly | Ref for DOM | React #8 |
| Type component props | Interface for Props | TypeScript #9 |
| Multiple possible shapes | Discriminated Union | TypeScript #10 |
| Narrow types | Type Guard | TypeScript #11 |
| Generic logic | Generic Function | TypeScript #12 |
| Immediate UI response | Offline-First Write | Data #13 |
| Track sync status | Sync Flag Pattern | Data #14 |
| Sync deletions | Tombstone | Data #15 |
| Rate limit syncing | Debounced Sync | Data #16 |
| Sequential entrance | Staggered Children | Animation #17 |
| Animate removal | Exit Animation | Animation #18 |
| Button feedback | Tap Feedback | Animation #19 |
| Directional slides | Direction-Aware | Animation #20 |
| Protect routes | Auth Guard | Auth #21 |
| React to auth | Auth State Listener | Auth #22 |
| Support anonymous | Dual Identity | Auth #23 |
| Organize routes | Route Group | Next.js #24 |
| Shared layout UI | Layout Composition | Next.js #25 |
| API endpoints | Route Handler | Next.js #26 |
| Filter by user | RLS Policy | Database #27 |
| Business rules | Trigger | Database #28 |
| Speed up queries | Composite Index | Database #29 |
| Insert or update | Upsert | Database #30 |
| Catch React errors | Error Boundary | Error #31 |
| Handle async errors | Try-Catch Feedback | Error #32 |
| Unique IDs | ID Generation | Utility #33 |
| Dev-only logging | Debug Logging | Utility #34 |
| Date handling | Date Formatting | Utility #35 |
