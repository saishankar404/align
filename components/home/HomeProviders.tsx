"use client";

import { AppProvider } from "@/lib/context/AppContext";
import { ToastProvider } from "@/lib/hooks/useToast";
import OfflineIndicator from "@/components/home/shared/OfflineIndicator";
import Toast from "@/components/shared/Toast";

export default function HomeProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppProvider>
        <OfflineIndicator />
        <Toast />
        {children}
      </AppProvider>
    </ToastProvider>
  );
}
