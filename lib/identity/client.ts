"use client";

import { supabase } from "@/lib/supabase/client";
import { newId } from "@/lib/utils/ids";

export type IdentityMode = "cloud" | "local";

const MODE_KEY = "align_identity_mode";
const LOCAL_USER_ID_KEY = "align_local_user_id";
const CLOUD_USER_ID_KEY = "align_cloud_user_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function setCookie(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

function getCookie(name: string): string | null {
  const parts = document.cookie.split(";").map((part) => part.trim());
  const hit = parts.find((part) => part.startsWith(`${name}=`));
  if (!hit) return null;
  return decodeURIComponent(hit.slice(name.length + 1));
}

export function getIdentityMode(): IdentityMode {
  const mode = localStorage.getItem(MODE_KEY);
  if (mode === "cloud" || mode === "local") {
    return mode;
  }
  const cookieMode = getCookie(MODE_KEY);
  if (cookieMode === "cloud" || cookieMode === "local") {
    localStorage.setItem(MODE_KEY, cookieMode);
    return cookieMode;
  }
  return "cloud";
}

export function getOrCreateLocalUserId(): string {
  const existing = localStorage.getItem(LOCAL_USER_ID_KEY) ?? getCookie(LOCAL_USER_ID_KEY);
  if (existing) {
    localStorage.setItem(LOCAL_USER_ID_KEY, existing);
    setCookie(LOCAL_USER_ID_KEY, existing);
    return existing;
  }
  const id = newId();
  localStorage.setItem(LOCAL_USER_ID_KEY, id);
  setCookie(LOCAL_USER_ID_KEY, id);
  return id;
}

export function setModeLocal(): string {
  const localUserId = getOrCreateLocalUserId();
  localStorage.setItem(MODE_KEY, "local");
  setCookie(MODE_KEY, "local");
  setCookie(LOCAL_USER_ID_KEY, localUserId);
  return localUserId;
}

export function setModeCloud(userId: string): void {
  localStorage.setItem(MODE_KEY, "cloud");
  localStorage.setItem(CLOUD_USER_ID_KEY, userId);
  setCookie(MODE_KEY, "cloud");
}

export function isCloudMode(): boolean {
  return getIdentityMode() === "cloud";
}

export function isLocalMode(): boolean {
  return getIdentityMode() === "local";
}

export async function getCloudUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user?.id) {
    setModeCloud(session.user.id);
    return session.user.id;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.id) {
    setModeCloud(user.id);
    return user.id;
  }
  return null;
}

export async function getActiveUserId(): Promise<string | null> {
  if (isLocalMode()) {
    return getOrCreateLocalUserId();
  }
  return getCloudUserId();
}

export const identityKeys = {
  MODE_KEY,
  LOCAL_USER_ID_KEY,
  CLOUD_USER_ID_KEY,
};
