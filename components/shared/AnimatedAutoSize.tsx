"use client";

import { motion, useReducedMotion, type Transition } from "framer-motion";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion/tokens";

export interface AnimatedAutoSizeProps {
  children: ReactNode;
  axis?: "height" | "width" | "both";
  className?: string;
  innerClassName?: string;
  transition?: Transition;
  delayMs?: number;
}

export default function AnimatedAutoSize({
  children,
  axis = "height",
  className,
  innerClassName,
  transition,
  delayMs = 50,
}: AnimatedAutoSizeProps) {
  const reducedMotion = useReducedMotion();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const ref = useCallback((node: HTMLDivElement | null) => {
    setContainer(node);
  }, []);

  useEffect(() => {
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [container]);

  const hasHeight = size.height > 0;
  const hasWidth = size.width > 0;

  const animateTarget: Record<string, number | string> = {};
  if (axis === "height" || axis === "both") {
    animateTarget.height = hasHeight ? size.height : "auto";
  }
  if (axis === "width" || axis === "both") {
    animateTarget.width = hasWidth ? size.width : "auto";
  }

  const defaultTransitionByAxis: Record<"height" | "width" | "both", Transition> = {
    height: {
      duration: MOTION_DURATION.smallState,
      ease: MOTION_EASE.easeInOut,
      delay: delayMs / 1000,
    },
    width: {
      duration: MOTION_DURATION.smallState,
      ease: MOTION_EASE.easeInOut,
      delay: delayMs / 1000,
    },
    both: {
      duration: MOTION_DURATION.view,
      ease: MOTION_EASE.easeInOut,
      delay: delayMs / 1000,
    },
  };

  return (
    <motion.div
      className={className}
      style={{ overflow: "hidden" }}
      animate={animateTarget}
      transition={
        reducedMotion
          ? { duration: 0 }
          : transition ?? defaultTransitionByAxis[axis]
      }
    >
      <div ref={ref} className={innerClassName}>
        {children}
      </div>
    </motion.div>
  );
}
