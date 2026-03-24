"use client";

import { useEffect } from "react";
import { animate, useMotionValue } from "framer-motion";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function useThreadDraw(values: [string, string, string]) {
  const dashOffset = useMotionValue(600);

  useEffect(() => {
    const totalChars = values.reduce((sum, value) => sum + value.trim().length, 0);
    const progress = clamp(totalChars / 60, 0, 1);
    const target = 600 * (1 - progress);

    const controls = animate(dashOffset, target, {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    });

    return () => controls.stop();
  }, [dashOffset, values]);

  return dashOffset;
}
