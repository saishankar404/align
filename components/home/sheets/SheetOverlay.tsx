"use client";

import { AnimatePresence, motion, useDragControls, useIsPresent, type PanInfo } from "framer-motion";
import type { ReactNode } from "react";
import {
  ENTRANCE_TRANSITION,
  EXIT_TRANSITION_STRICT,
} from "@/lib/motion/tokens";

interface SheetOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  preventClose?: boolean;
  sheetClassName?: string;
  handleClassName?: string;
  children: ReactNode;
}

function SheetLayer({
  onClose,
  preventClose,
  sheetClassName,
  handleClassName,
  children,
}: Omit<SheetOverlayProps, "isOpen">) {
  const dragControls = useDragControls();
  const isPresent = useIsPresent();

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (preventClose) return;
    if (info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <>
      <motion.div
        className={`fixed inset-0 z-[60] bg-black ${isPresent ? "pointer-events-auto" : "pointer-events-none"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35, transition: ENTRANCE_TRANSITION }}
        exit={{ opacity: 0, transition: EXIT_TRANSITION_STRICT }}
        onClick={() => {
          if (!preventClose && isPresent) onClose();
        }}
      />

      <motion.div
        className={`fixed left-0 right-0 bottom-0 z-[61] rounded-t-[28px] pb-[calc(24px+var(--sab))] ${sheetClassName ?? "bg-parchment"} ${isPresent ? "pointer-events-auto" : "pointer-events-none"}`}
        initial={{ y: "100%" }}
        animate={{ y: 0, transition: ENTRANCE_TRANSITION }}
        exit={{ y: "100%", transition: EXIT_TRANSITION_STRICT }}
        drag="y"
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.2 }}
        onDragEnd={handleDragEnd}
      >
        <div className="flex justify-center pt-3 pb-4">
          <button
            type="button"
            className={`touch-hit-area rounded-[2px] ${handleClassName ?? "bg-border"} w-9 h-1`}
            onPointerDown={(event) => {
              if (!preventClose) dragControls.start(event);
            }}
            disabled={!isPresent}
            aria-label="Drag handle"
          />
        </div>
        {children}
      </motion.div>
    </>
  );
}

export default function SheetOverlay({
  isOpen,
  onClose,
  preventClose = false,
  sheetClassName,
  handleClassName,
  children,
}: SheetOverlayProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <SheetLayer
          onClose={onClose}
          preventClose={preventClose}
          sheetClassName={sheetClassName}
          handleClassName={handleClassName}
        >
          {children}
        </SheetLayer>
      ) : null}
    </AnimatePresence>
  );
}
