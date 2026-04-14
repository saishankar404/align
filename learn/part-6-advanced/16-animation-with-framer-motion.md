# Chapter 16: Animation with Framer Motion

Animation transforms a functional app into an experience that feels alive. Done well, animation guides attention, provides feedback, and makes interactions feel natural. Done poorly, it's distracting and slow.

This chapter teaches you animation principles, how Framer Motion implements them, and how Align uses animation to create a polished, responsive interface.

---

## 16.1 Why Animation Matters

### THE VOCABULARY

**Animation**: Change in visual properties over time. Position, opacity, scale, color.

**Transition**: The interpolation between two states. How you get from A to B.

**Easing**: The rate of change over time. Linear is constant speed; eased animations accelerate and decelerate.

**Spring physics**: Animation driven by simulated spring forces rather than duration. More natural-feeling.

**Gesture**: User input that triggers animation. Tap, drag, hover.

### The Purpose of UI Animation

Animation isn't decoration. It serves specific functions:

| Purpose | Example in Align |
|---------|-----------------|
| **Feedback** | Button scales down on tap |
| **Continuity** | Views slide in from the direction of navigation |
| **Orientation** | Sheet slides up, indicating it's a layer on top |
| **Attention** | Night check-in CTA fades in at 6 PM |
| **Delight** | Checkmark draws itself when marking done |

### WHY NOT Y: Why Not CSS Animations?

CSS can animate. Why use a library?

```css
/* CSS approach */
.button:active {
  transform: scale(0.97);
  transition: transform 0.15s ease-out;
}
```

Limitations:
1. **No spring physics** - CSS can't simulate springs without JavaScript
2. **No gesture coordination** - Can't interrupt mid-animation smoothly
3. **No AnimatePresence** - Can't animate elements leaving the DOM
4. **Verbose variants** - Complex state machines require lots of classes

Framer Motion handles all of this declaratively.

---

## 16.2 Framer Motion Fundamentals

### motion Components

Import `motion` and prefix any HTML element:

```tsx
import { motion } from "framer-motion"

// Regular div
<div className="box">Hello</div>

// Animated div
<motion.div className="box">Hello</motion.div>
```

The `motion.div` is identical to `div` but gains animation superpowers.

### Animating Properties

The `animate` prop defines the target state:

```tsx
// Fade in on mount
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
/>

// Slide in from right
<motion.div
  initial={{ x: 100 }}
  animate={{ x: 0 }}
/>

// Scale up
<motion.div
  initial={{ scale: 0.8 }}
  animate={{ scale: 1 }}
/>
```

### Transition Configuration

Control how the animation happens:

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{
    duration: 0.3,
    ease: "easeOut"
  }}
/>
```

Transition options:
- `duration` - Time in seconds
- `ease` - Easing function (string or cubic bezier array)
- `delay` - Wait before starting
- `type` - "tween" (default) or "spring"

---

## 16.3 Easing Functions

Easing controls the feel of animation. Linear is robotic; eased is natural.

### Common Easing Curves

```
Linear:    ────────────────────
           Start              End
           (constant speed)

Ease Out:  ╭──────────────────
           Start              End
           (fast start, slow end)

Ease In:   ──────────────────╮
           Start              End
           (slow start, fast end)

Ease In Out: ╭────────────────╮
             Start           End
             (slow both ends)
```

### Align's Easing Tokens

```typescript
// lib/motion/tokens.ts:13-18
export const MOTION_EASE = {
  easeOut: [0.22, 1, 0.36, 1] as const,    // For entering elements
  easeIn: [0.32, 0, 0.67, 0] as const,     // For exiting elements
  easeInOut: [0.4, 0, 0.2, 1] as const,    // For state changes
  linear: "linear" as const,
} as const;
```

The arrays are cubic bezier coordinates: `[x1, y1, x2, y2]`.

### WHEN to Use Each

| Easing | Use When |
|--------|----------|
| Ease Out | Elements entering - fast start grabs attention |
| Ease In | Elements leaving - slow start, fast exit |
| Ease In Out | State changes within view - smooth both ends |
| Linear | Progress bars, continuous motion |

### MISTAKES: Wrong Easing Choice

```tsx
// WRONG - ease-in for entrance feels sluggish
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ ease: "easeIn" }}  // Slow to start!
/>

// RIGHT - ease-out for entrance
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ ease: [0.22, 1, 0.36, 1] }}
/>
```

---

## 16.4 Spring Animations

Springs feel more natural than duration-based animations because they simulate physics.

### Spring Parameters

```typescript
// lib/motion/tokens.ts:20-45
export const MOTION_SPRING = {
  press: {
    type: "spring",
    stiffness: 420,
    damping: 24,
    mass: 0.72,
  } satisfies Transition,
  icon: {
    type: "spring",
    stiffness: 440,
    damping: 28,
    mass: 0.7,
  } satisfies Transition,
  gesture: {
    type: "spring",
    stiffness: 360,
    damping: 34,
    mass: 0.86,
  } satisfies Transition,
  interruptible: {
    type: "spring",
    stiffness: 320,
    damping: 30,
    mass: 0.9,
  } satisfies Transition,
} as const;
```

### Spring Parameters Explained

| Parameter | Effect | Typical Range |
|-----------|--------|---------------|
| `stiffness` | How forcefully spring pulls to target | 100-500 |
| `damping` | How quickly oscillation settles | 10-50 |
| `mass` | Weight of the animated element | 0.5-2 |

High stiffness + high damping = snappy, no bounce
High stiffness + low damping = bouncy
Low stiffness = slow, floaty

### WHY Springs for Interactions

Duration-based animations have a fixed length. If interrupted mid-animation, they jump or look broken.

Springs naturally handle interruption:

```tsx
// User rapidly taps button
// Spring smoothly adjusts to new target each time
<motion.button
  whileTap={{ scale: 0.97 }}
  transition={MOTION_SPRING.press}
>
  Tap me
</motion.button>
```

The spring simulation continues from wherever it is, creating smooth transitions even when interrupted.

---

## 16.5 Variants Pattern

Variants define named animation states, making complex animations manageable.

### Basic Variants

```tsx
const boxVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

<motion.div
  variants={boxVariants}
  initial="hidden"
  animate="visible"
/>
```

### Staggered Children

Align uses variants for staggered text entrance:

```typescript
// components/onboarding/screens/textVariants.ts:1-21
export const textContainerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.03,
    },
  },
};

export const textItemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.24,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};
```

Usage in Welcome screen:

```tsx
// components/onboarding/screens/Welcome.tsx:12-27
<motion.div 
  className="..." 
  variants={textContainerVariants} 
  initial="hidden" 
  animate="show"
>
  <motion.div variants={textItemVariants}>
    {/* Logo */}
  </motion.div>
  
  <motion.div variants={textItemVariants}>
    {/* Illustration */}
  </motion.div>
  
  <motion.div variants={textItemVariants}>
    {/* Headline */}
  </motion.div>
  
  <motion.div variants={textItemVariants}>
    {/* Subtext */}
  </motion.div>
</motion.div>
```

### HOW Stagger Works

1. Parent animates to "show"
2. First child starts after `delayChildren` (0.03s)
3. Each subsequent child starts `staggerChildren` (0.03s) after previous
4. All children share the same animation (textItemVariants)

Result: Elements cascade in smoothly, creating visual flow.

---

## 16.6 View Transitions with AnimatePresence

AnimatePresence enables exit animations - normally impossible because React removes elements immediately.

### The Problem

```tsx
// Without AnimatePresence
{showModal && <Modal />}
// When showModal becomes false, Modal vanishes instantly
```

### The Solution

```tsx
import { AnimatePresence, motion } from "framer-motion"

<AnimatePresence>
  {showModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}  // This runs when element leaves!
    >
      <Modal />
    </motion.div>
  )}
</AnimatePresence>
```

### View Transitions in Align

```tsx
// components/home/HomeApp.tsx:44-48
const viewVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-35%", transition: ENTER_TRANSITION }),
  center: { x: 0, transition: VIEW_TRANSITION },
  exit: (dir: number) => ({ x: dir > 0 ? "-12%" : "100%", transition: EXIT_TRANSITION }),
};

// components/home/HomeApp.tsx:151-155
<AnimatePresence initial={false} custom={direction} mode="popLayout">
  <motion.div 
    key={view} 
    custom={direction} 
    variants={viewVariants} 
    initial="enter" 
    animate="center" 
    exit="exit" 
    className={`absolute inset-0 overflow-hidden ${VIEW_BACKGROUNDS[view]}`}
  >
    {renderView(view)}
  </motion.div>
</AnimatePresence>
```

### Dynamic Variants with custom

The `custom` prop passes data to variant functions:

```tsx
// Direction is 1 (forward) or -1 (backward)
const direction = VIEW_ORDER.indexOf(next) > VIEW_ORDER.indexOf(current) ? 1 : -1

// Variants receive direction as argument
enter: (dir: number) => ({ 
  x: dir > 0 ? "100%" : "-35%",  // From right or left
  transition: ENTER_TRANSITION 
})
```

This creates iOS-style navigation: new view slides from the direction of movement.

### AnimatePresence Props

| Prop | Purpose |
|------|---------|
| `mode="wait"` | Wait for exit before entering |
| `mode="popLayout"` | Enter immediately, exits animate out |
| `initial={false}` | Skip initial animation on first render |
| `custom` | Pass data to variant functions |

---

## 16.7 Gesture Animations

Framer Motion handles tap, hover, drag, and more.

### Tap Feedback

```tsx
// lib/motion/tokens.ts:47-51
export const TAP_SCALE = {
  soft: 0.98,
  default: 0.97,
  strong: 0.95,
} as const;

// Usage in components/home/HomeApp.tsx:163
<motion.button 
  whileTap={{ scale: TAP_SCALE.default }} 
  transition={MOTION_SPRING.press}
>
```

### WHY Scale on Tap?

Physical buttons depress when pressed. Digital buttons should provide similar feedback:
1. **Confirms input** - User knows their tap registered
2. **Feels tactile** - Simulates physical response
3. **Prevents double-taps** - Visual change indicates processing

### Scale Amount Guidelines

| Scale | Feel | Use For |
|-------|------|---------|
| 0.98 | Subtle | Cards, large touch targets |
| 0.97 | Standard | Buttons, nav items |
| 0.95 | Pronounced | Primary CTAs, emphasis |

### Hover States

```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
>
```

Note: Hover doesn't make sense on touch devices. Framer Motion automatically disables `whileHover` on touch.

---

## 16.8 Complex Animation: Hold to Delete

MoveCard demonstrates sophisticated animation coordination:

```typescript
// components/home/shared/MoveCard.tsx:58-137 (simplified)
const beginFillAnimation = useCallback((target: EventTarget | null): boolean => {
  // Set state
  gestureStateRef.current = "holding";
  setHolding(true);

  // Initialize overlay
  const overlay = overlayRef.current;
  overlay.style.transition = "none";
  overlay.style.opacity = "0.22";
  overlay.style.transform = "scaleY(0)";
  overlay.style.transformOrigin = "bottom center";

  holdStartedAtRef.current = performance.now();

  // Animation loop
  const step = (now: number) => {
    if (gestureStateRef.current !== "holding") return;

    const elapsed = now - holdStartedAtRef.current;
    const progress = Math.min(1, elapsed / HOLD_MS);

    // Update fill height
    overlayRef.current.style.transform = `scaleY(${progress})`;

    if (progress >= 1) {
      // Hold complete - trigger delete animation
      stopFrame();
      gestureStateRef.current = "deleting";
      
      // Fade and shrink card
      card.style.transition = `opacity 0.22s ease-out, transform 0.22s ease-out`;
      card.style.opacity = "0";
      card.style.transform = "scale(0.96)";
      
      // Collapse height
      setTimeout(() => {
        card.style.height = "0px";
        card.style.paddingTop = "0px";
      }, 180);
      
      // Fire delete callback
      setTimeout(() => onDelete(move.id), 280);
      return;
    }

    rafRef.current = requestAnimationFrame(step);
  };

  rafRef.current = requestAnimationFrame(step);
}, [canDelete, move.id, onDelete]);
```

### The Animation Sequence

1. **Hold starts** - Red overlay begins filling from bottom
2. **Progress** - Fill height tracks hold duration (600ms total)
3. **Hold complete** - Card fades and shrinks
4. **Collapse** - Card height animates to 0
5. **Remove** - Callback fires, React removes element

### WHY requestAnimationFrame?

```typescript
const step = (now: number) => {
  // Update visuals
  rafRef.current = requestAnimationFrame(step);
};
rafRef.current = requestAnimationFrame(step);
```

`requestAnimationFrame`:
1. Syncs with display refresh rate (usually 60fps)
2. Pauses when tab is hidden (saves resources)
3. Provides high-resolution timestamp
4. Batches with other visual updates

### MISTAKES: Animation Without Cleanup

```tsx
// WRONG - animation continues after unmount
useEffect(() => {
  const step = () => {
    // ...
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}, []);  // No cleanup!

// RIGHT - cancel on unmount
useEffect(() => {
  let rafId: number;
  const step = () => {
    // ...
    rafId = requestAnimationFrame(step);
  };
  rafId = requestAnimationFrame(step);
  
  return () => cancelAnimationFrame(rafId);
}, []);
```

---

## 16.9 Animation Timing Tokens

Align centralizes all animation timing:

```typescript
// lib/motion/tokens.ts:3-11
export const MOTION_DURATION = {
  press: 0.16,        // Button feedback
  hover: 0.15,        // Hover state changes
  feedback: 0.18,     // Visual feedback
  smallState: 0.22,   // Small state changes
  view: 0.26,         // View transitions
  enter: 0.24,        // Elements entering
  exit: 0.2,          // Elements leaving
} as const;
```

### WHY Centralized Tokens?

1. **Consistency** - Same feel across the app
2. **Easy tuning** - Change one value, affects everywhere
3. **Team alignment** - Everyone uses the same vocabulary
4. **Intentional design** - Forces thinking about animation purpose

### Composing Transitions

```typescript
// lib/motion/tokens.ts:53-66
export const VIEW_TRANSITION: Transition = {
  duration: MOTION_DURATION.view,
  ease: MOTION_EASE.easeInOut,
};

export const ENTER_TRANSITION: Transition = {
  duration: MOTION_DURATION.enter,
  ease: MOTION_EASE.easeOut,
};

export const EXIT_TRANSITION: Transition = {
  duration: MOTION_DURATION.exit,
  ease: MOTION_EASE.easeIn,
};
```

---

## 16.10 Performance Considerations

### Animatable Properties

GPU-accelerated (fast):
- `transform` (translate, scale, rotate)
- `opacity`

CPU-intensive (avoid animating):
- `width`, `height`
- `margin`, `padding`
- `border-radius`
- `box-shadow`

### WHAT IT COMPILES TO

```tsx
<motion.div animate={{ x: 100 }} />
```

Framer Motion applies:
```css
transform: translateX(100px);
```

Not `left: 100px` - transform is GPU-accelerated.

### The will-change Hint

For complex animations, hint the browser:

```tsx
<motion.div
  style={{ willChange: "transform" }}
  animate={{ x: [0, 100, 0] }}
/>
```

Caution: Overusing `will-change` consumes memory. Only use for heavy animations.

### Reducing Motion

Some users have vestibular disorders. Respect their preferences:

```tsx
import { useReducedMotion } from "framer-motion"

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion()
  
  return (
    <motion.div
      animate={{ x: shouldReduceMotion ? 0 : 100 }}
    />
  )
}
```

Or at the component level:

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ 
    duration: shouldReduceMotion ? 0 : 0.3 
  }}
/>
```

---

## 16.11 Animation Patterns in Align

### Pattern 1: Staggered List Entry

```tsx
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.03 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.24, ease: MOTION_EASE.easeOut }
  }
};

<motion.ul variants={containerVariants} initial="hidden" animate="show">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### Pattern 2: Sheet Entrance

```tsx
// Slide up with spring physics
<motion.div
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "100%" }}
  transition={MOTION_SPRING.gesture}
>
  <SheetContent />
</motion.div>
```

### Pattern 3: Button Press Feedback

```tsx
<motion.button
  whileTap={{ scale: TAP_SCALE.default }}
  transition={MOTION_SPRING.press}
  className="..."
>
  {children}
</motion.button>
```

### Pattern 4: SVG Path Drawing

```tsx
// components/onboarding/screens/DoneScreen.tsx:20-24
<motion.circle 
  cx="100" cy="60" r="46" 
  stroke="rgba(26,26,26,.12)" 
  strokeWidth="1.5" 
  initial={{ pathLength: 0 }} 
  animate={{ pathLength: 1 }} 
  transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} 
/>
<motion.path 
  d="M82 60 L96 74 L124 47"  // Checkmark
  stroke="#1A1A1A" 
  strokeWidth="3" 
  strokeLinecap="round"
  initial={{ pathLength: 0 }} 
  animate={{ pathLength: 1 }} 
  transition={{ duration: 1.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }} 
/>
```

The `pathLength` property animates SVG stroke drawing from 0% to 100%.

---

## 16.12 Debugging Animations

### Slow Motion

Temporarily slow down animations to inspect them:

```tsx
<motion.div
  animate={{ x: 100 }}
  transition={{ duration: 3 }}  // Slow for debugging
/>
```

### Animation DevTools

Framer Motion provides a devtools package:

```bash
npm install @framer/motion-devtools
```

### Console Logging

```tsx
<motion.div
  onAnimationStart={() => console.log("Animation started")}
  onAnimationComplete={() => console.log("Animation complete")}
/>
```

### Common Issues

**Issue: Animation doesn't play**
- Check that `initial` and `animate` have different values
- Verify the element is actually rendering
- Check for CSS that might override transforms

**Issue: Animation is janky**
- Are you animating CPU-heavy properties?
- Is the component re-rendering during animation?
- Try adding `layoutId` for layout animations

**Issue: Exit animation doesn't play**
- Is the element wrapped in `AnimatePresence`?
- Does the element have a unique `key`?
- Is `exit` defined on the motion component?

---

## 16.13 Practical Exercises

### Exercise 1: Analyze Existing Animations

Open `components/onboarding/screens/Welcome.tsx` and:

1. Identify all animated elements
2. Trace the variant definitions
3. Calculate total animation duration (including staggers)
4. Modify `staggerChildren` and observe the difference

### Exercise 2: Build a Toast Animation

Create a toast notification that:
1. Slides up from bottom
2. Fades in
3. Auto-dismisses with fade out after 3 seconds
4. Can be dismissed early with slide down

### Exercise 3: Improve the Delete Animation

The current hold-to-delete in MoveCard uses manual `requestAnimationFrame`. Refactor it to use Framer Motion's `useAnimation` hook:

```tsx
const controls = useAnimation()

async function handleHoldComplete() {
  await controls.start({ opacity: 0, scale: 0.96 })
  await controls.start({ height: 0, padding: 0 })
  onDelete(id)
}
```

### Exercise 4: Add Reduced Motion Support

Audit `lib/motion/tokens.ts` and create a `useReducedMotionTokens` hook that returns instant transitions when reduced motion is preferred.

---

## 16.14 Go Figure It Out

1. **Layout animations** - Framer Motion can animate layout changes with `layout` prop. When would you use this vs manual position animations?

2. **Shared element transitions** - What is `layoutId` and how does it enable animations between different components?

3. **Drag constraints** - How would you implement a draggable element that snaps back if not dragged far enough?

4. **Animation sequences** - Research `useAnimation` and `animate.sequence` for orchestrating multi-step animations.

5. **Performance profiling** - How would you use Chrome DevTools Performance panel to identify animation jank?

---

## Summary

This chapter covered:

- **Animation purpose** - Feedback, continuity, orientation, attention, delight
- **Framer Motion basics** - motion components, animate prop, transitions
- **Easing functions** - Ease out for enter, ease in for exit, ease in-out for state changes
- **Spring physics** - Natural feel, handles interruption gracefully
- **Variants** - Named states with stagger and orchestration
- **AnimatePresence** - Exit animations for leaving elements
- **Gesture animations** - whileTap, whileHover for interactive feedback
- **Performance** - Animate transforms and opacity, avoid layout properties
- **Tokens** - Centralized timing and easing for consistency

---

## Connections

- **Chapter 9** (Effects) - useEffect cleanup for animation cleanup
- **Chapter 7** (Components) - Animation as component concern
- **Chapter 8** (State) - State changes trigger animations
- **Chapter 11** (Next.js) - Client components for interactive animations

---

## What's Next

Chapter 17 explores Progressive Web App concepts - how Align works offline, installs on home screens, and sends push notifications.
