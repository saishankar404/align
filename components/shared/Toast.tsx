"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import { useToast } from "@/lib/hooks/useToast";
import { ENTRANCE_TRANSITION, EXIT_TRANSITION_STRICT } from "@/lib/motion/tokens";

function ToastLayer({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const isPresent = useIsPresent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: ENTRANCE_TRANSITION }}
      exit={{ opacity: 0, y: 20, transition: EXIT_TRANSITION_STRICT }}
      className={`fixed left-1/2 -translate-x-1/2 z-[60] bottom-[calc(env(safe-area-inset-bottom,0px)+80px)] ${isPresent ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      <div className="bg-ink text-parchment rounded-full px-4 py-2 text-sm flex items-center gap-3 shadow-lg">
        <span>{message}</span>
        {actionLabel ? (
          <button onClick={onAction} disabled={!isPresent} className="underline text-xs min-hit-target touch-hit-area">
            {actionLabel}
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}

export default function Toast() {
  const { toasts, dismissToast } = useToast();
  const toast = toasts[0];

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      dismissToast(toast.id);
    }, toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast, dismissToast]);

  return (
    <AnimatePresence initial={false}>
      {toast ? (
        <ToastLayer
          key={toast.id}
          message={toast.message}
          actionLabel={toast.action?.label}
          onAction={() => {
            toast.action?.fn();
            dismissToast(toast.id);
          }}
        />
      ) : null}
    </AnimatePresence>
  );
}
