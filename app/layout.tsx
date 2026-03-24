import type { Metadata, Viewport } from "next";
import "./globals.css";
import { buildDefaultMetadata } from "@/lib/site";

export const metadata: Metadata = buildDefaultMetadata();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1A1A1A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full w-full">
      <body className="h-full w-full bg-parchment">{children}</body>
    </html>
  );
}
