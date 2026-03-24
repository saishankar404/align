"use client";

import { AnimatePresence, motion, useDragControls, type PanInfo } from "framer-motion";
import type { ReactNode } from "react";

interface SheetOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  preventClose?: boolean;
  sheetClassName?: string;
  handleClassName?: string;
  children: ReactNode;
}

const SHEET_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function SheetOverlay({
  isOpen,
  onClose,
  preventClose = false,
  sheetClassName,
  handleClassName,
  children,
}: SheetOverlayProps) {
  const dragControls = useDragControls();

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (preventClose) return;
    if (info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              if (!preventClose) onClose();
            }}
          />

          <motion.div
            className={`fixed left-0 right-0 bottom-0 z-[61] rounded-t-[28px] pb-[calc(24px+var(--sab))] ${sheetClassName ?? "bg-parchment"}`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.42, ease: SHEET_EASE }}
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
                className={`w-9 h-1 rounded-[2px] ${handleClassName ?? "bg-border"}`}
                onPointerDown={(event) => {
                  if (!preventClose) dragControls.start(event);
                }}
                aria-label="Drag handle"
              />
            </div>
            {children}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
