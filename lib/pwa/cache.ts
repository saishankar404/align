"use client";

const APP_RUNTIME_CACHE_NAMES = [
  "start-url",
  "next-static-js-assets",
  "pages",
  "pages-rsc",
  "pages-rsc-prefetch",
  "next-data",
  "static-js-assets",
  "static-style-assets",
  "static-image-assets",
  "cross-origin",
  "apis",
];

function shouldDeleteCache(cacheName: string): boolean {
  if (APP_RUNTIME_CACHE_NAMES.includes(cacheName)) return true;
  return cacheName.includes("precache");
}

export async function clearOutdatedPwaCaches(): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;

  const keys = await caches.keys();
  await Promise.all(keys.filter(shouldDeleteCache).map((key) => caches.delete(key)));
}

export async function recoverFromBadPwaUpdate(): Promise<void> {
  if (typeof window === "undefined") return;

  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
}
