import type { Metadata } from "next";

const FALLBACK_SITE_URL = "http://localhost:3000";

function normalizeUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getSiteUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;

  if (!envUrl) return FALLBACK_SITE_URL;

  if (envUrl.startsWith("http://") || envUrl.startsWith("https://")) {
    return normalizeUrl(envUrl);
  }

  return normalizeUrl(`https://${envUrl}`);
}

export const siteConfig = {
  name: "Align.",
  shortName: "Align",
  creator: "Sai Shankar",
  description:
    "Align is a 14-day commitment app that helps you follow through with 1-3 directions, up to 3 daily moves, and an honest nightly check-in.",
  keywords: [
    "Align",
    "Align app",
    "commitment app",
    "habit app",
    "focus app",
    "productivity app",
    "follow through",
    "14 day challenge app",
    "daily planning app",
  ],
};

export function absoluteUrl(path = "/") {
  const baseUrl = getSiteUrl();
  return path === "/" ? baseUrl : `${baseUrl}${path}`;
}

export function buildDefaultMetadata(): Metadata {
  const title = `${siteConfig.name} | 14-day commitment app for follow-through`;

  return {
    metadataBase: new URL(getSiteUrl()),
    applicationName: siteConfig.name,
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.creator }],
    creator: siteConfig.creator,
    publisher: siteConfig.creator,
    category: "productivity",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description: siteConfig.description,
      url: absoluteUrl("/"),
      images: [
        {
          url: absoluteUrl("/logo_secondary.png"),
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: siteConfig.description,
      images: [absoluteUrl("/logo_secondary.png")],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: siteConfig.name,
    },
    icons: {
      icon: [
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
      shortcut: "/favicon-32x32.png",
    },
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "apple-mobile-web-app-title": siteConfig.name,
      "theme-color": "#1A1A1A",
    },
  };
}
