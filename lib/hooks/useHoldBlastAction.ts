"use client";

import { useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";

type HoldState = "idle" | "holding" | "blasting" | "done";

interface UseHoldBlastActionOptions {
  durationMs: number;
  onComplete: () => void;
}

interface UseHoldBlastActionReturn {
  isHolding: boolean;
  isCompleted: boolean;
  progress: number;
  state: HoldState;
  suppressClickRef: MutableRefObject<boolean>;
  onPressStart: (target: EventTarget | null, preventScroll?: () => void) => void;
  onPressEnd: () => void;
  onPressCancel: () => void;
}

export function useHoldBlastAction({ durationMs, onComplete }: UseHoldBlastActionOptions): UseHoldBlastActionReturn {
  const [state, setState] = useState<HoldState>("idle");
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const suppressClickRef = useRef(false);
  const blastTimerRef = useRef<number | null>(null);

  const stopFrame = () => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const finishBlast = () => {
    setState("done");
    setProgress(1);
    onComplete();
    window.setTimeout(() => {
      setState("idle");
      setProgress(0);
      suppressClickRef.current = false;
    }, 180);
  };

  const onPressStart = (target: EventTarget | null, preventScroll?: () => void) => {
    if (state === "blasting") return;
    const targetElement = target instanceof Element ? target : null;
    if (targetElement?.closest("button:disabled")) return;

    suppressClickRef.current = true;
    setState("holding");
    setProgress(0);
    preventScroll?.();
    startedAtRef.current = performance.now();

    const step = (now: number) => {
      const elapsed = now - startedAtRef.current;
      const nextProgress = Math.min(1, elapsed / durationMs);
      setProgress(nextProgress);

      if (nextProgress >= 1) {
        stopFrame();
        setState("blasting");
        blastTimerRef.current = window.setTimeout(finishBlast, 140);
        return;
      }

      rafRef.current = window.requestAnimationFrame(step);
    };

    rafRef.current = window.requestAnimationFrame(step);
  };

  const onPressEnd = () => {
    if (state !== "holding") return;
    stopFrame();
    setState("idle");
    setProgress(0);
  };

  const onPressCancel = () => {
    if (state !== "holding") return;
    stopFrame();
    setState("idle");
    setProgress(0);
  };

  useEffect(
    () => () => {
      stopFrame();
      if (blastTimerRef.current !== null) {
        window.clearTimeout(blastTimerRef.current);
      }
    },
    []
  );

  return {
    isHolding: state === "holding",
    isCompleted: state === "done",
    progress,
    state,
    suppressClickRef,
    onPressStart,
    onPressEnd,
    onPressCancel,
  };
}
