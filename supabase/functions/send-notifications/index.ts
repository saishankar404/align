import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push";

interface ProfileRow {
  id: string;
  timezone: string;
  notif_morning_time: string;
  notif_night_time: string;
  notif_enabled: boolean;
  push_subscription: string | Record<string, unknown> | null;
}

function getLocalMinutes(timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date());

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((value) => Number(value));
  return (h * 60) + m;
}

function inWindow(nowMinutes: number, targetMinutes: number): boolean {
  return Math.abs(nowMinutes - targetMinutes) <= 2;
}

function normalizeSubscription(
  value: string | Record<string, unknown> | null
): Record<string, unknown> | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") {
        return parsed as Record<string, unknown>;
      }
      return null;
    } catch {
      return null;
    }
  }
  return value;
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
  const subject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:align@localhost.dev";

  webpush.setVapidDetails(subject, publicKey, privateKey);

  const { data, error } = await supabase
    .from("profiles")
    .select("id, timezone, notif_morning_time, notif_night_time, notif_enabled, push_subscription")
    .eq("notif_enabled", true)
    .not("push_subscription", "is", null);

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
  }

  const profiles = (data ?? []) as ProfileRow[];

  for (const profile of profiles) {
    const subscription = normalizeSubscription(profile.push_subscription);
    if (!subscription) continue;

    const nowMinutes = getLocalMinutes(profile.timezone || "UTC");
    const morningMinutes = toMinutes(profile.notif_morning_time || "08:00");
    const nightMinutes = toMinutes(profile.notif_night_time || "21:30");

    let payload: { title: string; body: string; url: string } | null = null;

    if (inWindow(nowMinutes, morningMinutes)) {
      payload = { title: "Align.", body: "What are you moving today?", url: "/home" };
    } else if (inWindow(nowMinutes, nightMinutes)) {
      payload = { title: "Align.", body: "Did you show up today?", url: "/home?sheet=night-checkin" };
    }

    if (!payload) continue;

    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (pushError) {
      const err = pushError as { statusCode?: number };
      if (err.statusCode === 410) {
        await supabase
          .from("profiles")
          .update({ notif_enabled: false, push_subscription: null })
          .eq("id", profile.id);
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, sent: profiles.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
