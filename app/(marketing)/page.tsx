import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Align. commitment app",
  description:
    "Align is a 14-day commitment app for people who want fewer decisions, clearer daily priorities, and honest follow-through.",
  alternates: {
    canonical: "/",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web",
  description: siteConfig.description,
  url: absoluteUrl("/"),
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  creator: {
    "@type": "Person",
    name: siteConfig.creator,
  },
};

export default function MarketingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <LandingPage />
    </>
  );
}
