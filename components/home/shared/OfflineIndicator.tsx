"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import { useOnline } from "@/lib/hooks/useOnline";
import { ENTRANCE_TRANSITION, EXIT_TRANSITION_STRICT } from "@/lib/motion/tokens";

function OfflineLayer() {
  const isPresent = useIsPresent();

  return (
    <motion.div
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0, transition: ENTRANCE_TRANSITION }}
      exit={{ opacity: 0, y: -24, transition: EXIT_TRANSITION_STRICT }}
      className={`fixed left-1/2 -translate-x-1/2 z-50 top-[calc(env(safe-area-inset-top,0px)+8px)] bg-ink text-parchment rounded-full px-4 py-2 text-xs ${isPresent ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      No connection - changes saved locally
    </motion.div>
  );
}

export default function OfflineIndicator() {
  const online = useOnline();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!online);
  }, [online]);

  return (
    <AnimatePresence initial={false}>
      {visible ? <OfflineLayer /> : null}
    </AnimatePresence>
  );
}
