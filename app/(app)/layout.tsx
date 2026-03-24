import type { Metadata } from "next";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import PWAUpdateController from "@/components/pwa/PWAUpdateController";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full overflow-hidden bg-parchment">
      {children}
      <PWAUpdateController />
      <PWAInstallPrompt />
    </div>
  );
}
