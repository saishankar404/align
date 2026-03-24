"use client";

import { useEffect, useRef, type RefObject } from "react";
import Lenis from "lenis";

export function useLenis(containerRef: RefObject<HTMLElement>) {
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const wrapper = containerRef.current;
    if (!(wrapper instanceof HTMLElement)) return;

    const content = wrapper.firstElementChild;
    if (!(content instanceof HTMLElement)) return;

    const lenis = new Lenis({
      wrapper,
      content,
      eventsTarget: wrapper,
      duration: 0.9,
      smoothWheel: true,
      touchMultiplier: 1.2,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };

    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      lenis.destroy();
    };
  }, [containerRef]);
}
