"use client";

import { db } from "@/lib/db/local";
import { requestSyncIfCloud } from "@/lib/db/sync";

export function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  return new Uint8Array([...atob(b64)].map((c) => c.charCodeAt(0)));
}

export async function registerPushSubscription(userId: string): Promise<boolean> {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""
        ) as unknown as BufferSource,
      }));

    const json = JSON.stringify(subscription);
    localStorage.setItem("align_push_sub", json);
    await db.profiles.update(userId, { pushSubscription: json, notifEnabled: true });
    requestSyncIfCloud(userId);
    return true;
  } catch {
    return false;
  }
}
