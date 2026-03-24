"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnline } from "@/lib/hooks/useOnline";
import { useAppContext } from "@/lib/context/AppContext";
import { syncAll } from "@/lib/db/sync";

export default function OfflineIndicator() {
  const online = useOnline();
  const { userId } = useAppContext();
  const [showSyncing, setShowSyncing] = useState(false);

  useEffect(() => {
    if (!online && !showSyncing) return;
    if (online && userId) {
      setShowSyncing(true);
      syncAll(userId).catch(() => undefined);
      const timer = window.setTimeout(() => setShowSyncing(false), 1500);
      return () => window.clearTimeout(timer);
    }
  }, [online, userId, showSyncing]);

  const visible = !online || showSyncing;
  const label = !online ? "No connection — changes saved locally" : "Syncing...";

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          className="fixed left-1/2 -translate-x-1/2 z-50 top-[calc(env(safe-area-inset-top,0px)+8px)] bg-ink text-parchment rounded-full px-4 py-2 text-xs"
        >
          {label}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
