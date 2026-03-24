"use client";

import { useEffect } from "react";
import { AppProvider, useAppContext } from "@/lib/context/AppContext";
import { ToastProvider } from "@/lib/hooks/useToast";
import { startAutoSync } from "@/lib/db/sync";
import OfflineIndicator from "@/components/home/shared/OfflineIndicator";
import Toast from "@/components/shared/Toast";

function SyncBootstrap() {
  const { userId } = useAppContext();

  useEffect(() => {
    if (!userId) return;
    return startAutoSync(userId);
  }, [userId]);

  return null;
}

export default function HomeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppProvider>
        <SyncBootstrap />
        <OfflineIndicator />
        <Toast />
        {children}
      </AppProvider>
    </ToastProvider>
  );
}
