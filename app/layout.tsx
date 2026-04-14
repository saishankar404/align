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
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Align" />
      </head>
      <body className="h-full w-full bg-parchment">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var hash = window.location.hash || "";
                  if (hash.indexOf("figmacapture=") !== -1) {
                    document.documentElement.setAttribute("data-figma-capture", "1");
                    var params = new URLSearchParams(window.location.search);
                    var scrollY = Number(params.get("captureScroll") || "0");
                    if (Number.isFinite(scrollY) && scrollY > 0) {
                      window.addEventListener("load", function () {
                        window.setTimeout(function () {
                          window.scrollTo({ top: scrollY, behavior: "auto" });
                        }, 120);
                      });
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async />
      </body>
    </html>
  );
}
