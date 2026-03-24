"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/lib/hooks/useToast";

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
    <AnimatePresence>
      {toast ? (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className="fixed left-1/2 -translate-x-1/2 z-[60] bottom-[calc(env(safe-area-inset-bottom,0px)+80px)]"
        >
          <div className="bg-ink text-parchment rounded-full px-4 py-2 text-sm flex items-center gap-3 shadow-lg">
            <span>{toast.message}</span>
            {toast.action ? (
              <button
                onClick={() => {
                  toast.action?.fn();
                  dismissToast(toast.id);
                }}
                className="underline text-xs"
              >
                {toast.action.label}
              </button>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
