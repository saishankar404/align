"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnline } from "@/lib/hooks/useOnline";

export default function OfflineIndicator() {
  const online = useOnline();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!online);
  }, [online]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          className="fixed left-1/2 -translate-x-1/2 z-50 top-[calc(env(safe-area-inset-top,0px)+8px)] bg-ink text-parchment rounded-full px-4 py-2 text-xs"
        >
          No connection - changes saved locally
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
