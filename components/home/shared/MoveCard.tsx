"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { LocalDirection, LocalMove } from "@/lib/db/local";
import { MOTION_DURATION, MOTION_EASE, MOTION_SPRING, TAP_SCALE } from "@/lib/motion/tokens";

interface MoveCardProps {
  move: LocalMove;
  direction?: LocalDirection;
  tone: "warm" | "sage";
  onCardTap: () => void;
  onCheckTap: () => void;
  onDelete: (id: string) => void;
}

type GestureState = "idle" | "holding" | "deleting";

const HOLD_MS = 600;
const QUICK_TAP_MS = 170;
const HOLD_START_DELAY_MS = 120;
const SCROLL_THRESHOLD = 8;
const EASE_OUT_CSS = "cubic-bezier(0.22,1,0.36,1)";
const EASE_IN_OUT_CSS = "cubic-bezier(0.4,0,0.2,1)";

export default function MoveCard({ move, direction, tone, onCardTap, onCheckTap, onDelete }: MoveCardProps) {
  const done = move.status === "done";
  const cardRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const holdDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdStartedAtRef = useRef<number>(0);
  const holdProgressedRef = useRef(false);
  const gestureStateRef = useRef<GestureState>("idle");
  const suppressTapAfterHoldRef = useRef(false);
  const touchTapHandledRef = useRef(false);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const fadeTimerRef = useRef<number | null>(null);
  const deleteTimerRef = useRef<number | null>(null);
  const [holding, setHolding] = useState(false);

  const stopFrame = () => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const recedeOverlay = () => {
    if (!overlayRef.current) return;
    overlayRef.current.style.transition = `transform ${MOTION_DURATION.smallState}s ${EASE_IN_OUT_CSS}, opacity ${MOTION_DURATION.smallState}s ${EASE_IN_OUT_CSS}`;
    overlayRef.current.style.transform = "scaleY(0)";
    overlayRef.current.style.opacity = "0";
  };

  const beginFillAnimation = (target: EventTarget | null): boolean => {
    if (gestureStateRef.current === "deleting") return false;

    const targetElement = target instanceof Element ? target : null;
    if (targetElement?.closest("[data-checkmark]")) return false;

    gestureStateRef.current = "holding";
    suppressTapAfterHoldRef.current = true;
    holdProgressedRef.current = false;
    setHolding(true);

    const overlay = overlayRef.current;
    if (overlay) {
      overlay.style.transition = "none";
      overlay.style.opacity = "0.22";
      overlay.style.transform = "scaleY(0)";
      overlay.style.transformOrigin = "bottom center";
    }

    holdStartedAtRef.current = performance.now();

    const step = (now: number) => {
      if (gestureStateRef.current !== "holding") return;

      const elapsed = now - holdStartedAtRef.current;
      const progress = Math.min(1, elapsed / HOLD_MS);

      if (progress > 0.06) {
        holdProgressedRef.current = true;
      }

      if (overlayRef.current) {
        overlayRef.current.style.transform = `scaleY(${progress})`;
      }

      if (progress >= 1) {
        stopFrame();
        setHolding(false);
        gestureStateRef.current = "deleting";

        const card = cardRef.current;
        if (!card) return;

        card.style.transition = `opacity ${MOTION_DURATION.smallState}s ${EASE_OUT_CSS}, transform ${MOTION_DURATION.smallState}s ${EASE_OUT_CSS}`;
        card.style.opacity = "0";
        card.style.transform = "scale(0.96)";

        fadeTimerRef.current = window.setTimeout(() => {
          const measuredHeight = card.offsetHeight;
          card.style.height = `${measuredHeight}px`;
          card.style.overflow = "hidden";

          const computed = window.getComputedStyle(card);
          card.style.paddingTop = computed.paddingTop;
          card.style.paddingBottom = computed.paddingBottom;
          card.style.marginBottom = computed.marginBottom;
          card.style.transition = `height ${MOTION_DURATION.view}s ${EASE_IN_OUT_CSS}, padding-top ${MOTION_DURATION.view}s ${EASE_IN_OUT_CSS}, padding-bottom ${MOTION_DURATION.view}s ${EASE_IN_OUT_CSS}, margin-bottom ${MOTION_DURATION.view}s ${EASE_IN_OUT_CSS}`;

          window.requestAnimationFrame(() => {
            card.style.height = "0px";
            card.style.paddingTop = "0px";
            card.style.paddingBottom = "0px";
            card.style.marginBottom = "0px";
          });
        }, 180);

        deleteTimerRef.current = window.setTimeout(() => {
          onDelete(move.id);
        }, 280);

        return;
      }

      rafRef.current = window.requestAnimationFrame(step);
    };

    rafRef.current = window.requestAnimationFrame(step);
    return true;
  };

  const startHold = (target: EventTarget | null) => {
    if (gestureStateRef.current === "deleting") return;

    if (holdDelayTimerRef.current) {
      clearTimeout(holdDelayTimerRef.current);
      holdDelayTimerRef.current = null;
    }

    holdDelayTimerRef.current = setTimeout(() => {
      holdDelayTimerRef.current = null;
      beginFillAnimation(target);
    }, HOLD_START_DELAY_MS);
  };

  const cancelHold = () => {
    if (holdDelayTimerRef.current) {
      clearTimeout(holdDelayTimerRef.current);
      holdDelayTimerRef.current = null;
    }

    if (gestureStateRef.current !== "holding") return;

    gestureStateRef.current = "idle";
    setHolding(false);
    stopFrame();
    recedeOverlay();
  };

  const releaseHold = (target: EventTarget | null, source: "mouse" | "touch") => {
    if (holdDelayTimerRef.current) {
      clearTimeout(holdDelayTimerRef.current);
      holdDelayTimerRef.current = null;
    }

    if (gestureStateRef.current === "deleting") return;
    if (gestureStateRef.current !== "holding") return;

    const elapsed = performance.now() - holdStartedAtRef.current;
    const targetElement = target instanceof Element ? target : null;
    const isCheckmark = Boolean(targetElement?.closest("[data-checkmark]"));
    const isQuickTap = elapsed < QUICK_TAP_MS && !holdProgressedRef.current && !isCheckmark;

    gestureStateRef.current = "idle";
    setHolding(false);
    stopFrame();
    recedeOverlay();

    if (isQuickTap) {
      if (source === "touch") {
        touchTapHandledRef.current = true;
        onCardTap();
      } else {
        suppressTapAfterHoldRef.current = false;
      }
      return;
    }

    suppressTapAfterHoldRef.current = true;
  };

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const onTouchStart = (event: TouchEvent) => {
      touchStartXRef.current = event.touches[0]?.clientX ?? 0;
      touchStartYRef.current = event.touches[0]?.clientY ?? 0;
      startHold(event.target);
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      const dx = Math.abs(touch.clientX - touchStartXRef.current);
      const dy = Math.abs(touch.clientY - touchStartYRef.current);

      if (dy > SCROLL_THRESHOLD && dy > dx) {
        cancelHold();
      }
    };

    card.addEventListener("touchstart", onTouchStart, { passive: false });
    card.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      card.removeEventListener("touchstart", onTouchStart);
      card.removeEventListener("touchmove", onTouchMove);
      stopFrame();
      if (holdDelayTimerRef.current !== null) {
        clearTimeout(holdDelayTimerRef.current);
        holdDelayTimerRef.current = null;
      }
      if (fadeTimerRef.current !== null) window.clearTimeout(fadeTimerRef.current);
      if (deleteTimerRef.current !== null) window.clearTimeout(deleteTimerRef.current);
    };
  }, [move.id, onDelete]);

  useEffect(() => {
    const scrollParent = cardRef.current?.closest("[data-scroll-container]");
    if (!scrollParent) return;

    const cancel = () => cancelHold();
    scrollParent.addEventListener("scroll", cancel, { passive: true });
    return () => scrollParent.removeEventListener("scroll", cancel);
  }, []);

  return (
    <motion.div
      ref={cardRef}
      whileTap={{ scale: TAP_SCALE.soft }}
      transition={MOTION_SPRING.press}
      role="button"
      tabIndex={0}
      onClick={() => {
        if (gestureStateRef.current === "deleting") return;
        if (touchTapHandledRef.current) {
          touchTapHandledRef.current = false;
          return;
        }
        if (suppressTapAfterHoldRef.current) {
          suppressTapAfterHoldRef.current = false;
          return;
        }
        onCardTap();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onCardTap();
      }}
      onMouseDown={(event) => {
        startHold(event.target);
      }}
      onMouseUp={(event) => {
        releaseHold(event.target, "mouse");
      }}
      onMouseLeave={cancelHold}
      onTouchEnd={(event) => {
        releaseHold(event.target, "touch");
      }}
      onTouchCancel={cancelHold}
      className={`relative overflow-hidden w-full rounded-[20px] px-[20px] pt-[22px] pb-[20px] text-left ${tone === "warm" ? "bg-[#EDE0C8]" : "bg-[#C8D9BE]"} ${done ? "opacity-[.42]" : "opacity-100"}`}
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 rounded-[inherit] z-0 pointer-events-none"
        style={{
          background: "#E8694A",
          opacity: 0,
          transform: "scaleY(0)",
          transformOrigin: "bottom center",
        }}
      />

      <motion.div
        initial={false}
        animate={{ opacity: holding ? 1 : 0, scale: holding ? 1 : 0.94, y: holding ? 0 : -2 }}
        transition={{ duration: MOTION_DURATION.feedback, ease: MOTION_EASE.easeOut }}
        className="absolute top-[12px] right-[12px] z-[2] pointer-events-none rounded-full px-[9px] py-[5px] font-body text-[9px] font-medium tracking-[0.09em] uppercase"
        style={{ background: "rgba(232,105,74,0.16)", color: "#E8694A" }}
      >
        Hold to delete
      </motion.div>

      <div className="relative z-[1]">
        <div className="flex items-center justify-between mb-[10px]">
          <div className="font-body text-[9px] font-medium tracking-[0.1em] uppercase text-dusk pr-2 truncate">{direction?.title ?? "Move"}</div>
          <motion.button
            type="button"
            data-checkmark
            whileTap={{ scale: TAP_SCALE.strong }}
            transition={MOTION_SPRING.press}
            onClick={(event) => {
              event.stopPropagation();
              onCheckTap();
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              event.stopPropagation();
              onCheckTap();
            }}
            className={`shrink-0 w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center min-hit-target touch-hit-area ${done ? "bg-ink border-ink" : "bg-transparent border-ink/20"}`}
          >
            <motion.svg
              width="10"
              height="8"
              viewBox="0 0 10 8"
              fill="none"
              initial={false}
              animate={{ scale: done ? [0, 1.15, 1] : 0, opacity: done ? 1 : 0 }}
              transition={MOTION_SPRING.press}
            >
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </motion.button>
        </div>
        <div className={`font-gtw text-[22px] tracking-[-0.025em] leading-[1.18] text-ink max-w-[92%] ${done ? "line-through opacity-50" : ""}`}>
          {move.title}
        </div>
      </div>
    </motion.div>
  );
}
