import type { Transition } from "framer-motion";

export const MOTION_DURATION = {
  press: 0.16,
  hover: 0.15,
  feedback: 0.18,
  smallState: 0.22,
  view: 0.26,
  enter: 0.24,
  exit: 0.2,
} as const;

export const MOTION_EASE = {
  easeOut: [0.22, 1, 0.36, 1] as const,
  easeIn: [0.32, 0, 0.67, 0] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
  linear: "linear" as const,
} as const;

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

export const TAP_SCALE = {
  soft: 0.98,
  default: 0.97,
  strong: 0.95,
} as const;

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

export const STATE_TRANSITION: Transition = {
  duration: MOTION_DURATION.smallState,
  ease: MOTION_EASE.easeInOut,
};

export const ENTRANCE_TRANSITION: Transition = {
  duration: MOTION_DURATION.enter,
  ease: MOTION_EASE.easeOut,
};

export const EXIT_TRANSITION_STRICT: Transition = {
  duration: MOTION_DURATION.exit,
  ease: MOTION_EASE.easeIn,
};
