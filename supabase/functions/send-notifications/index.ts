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

function isInNotifWindow(nowUtc: Date, targetTimeHHMM: string, timezone: string): boolean {
  const safeTimezone = timezone || "UTC";
  const localTime = new Date(nowUtc.toLocaleString("en-US", { timeZone: safeTimezone }));
  const [th, tm] = targetTimeHHMM.split(":").map(Number);
  const localH = localTime.getHours();
  const localM = localTime.getMinutes();
  const localTotalMins = localH * 60 + localM;
  const targetTotalMins = th * 60 + tm;
  return localTotalMins >= targetTotalMins && localTotalMins < targetTotalMins + 5;
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
  const nowUtc = new Date();
  let sent = 0;

  for (const profile of profiles) {
    const subscription = normalizeSubscription(profile.push_subscription);
    if (!subscription) continue;

    let payload: { title: string; body: string; url: string } | null = null;

    if (isInNotifWindow(nowUtc, profile.notif_morning_time || "08:00", profile.timezone || "UTC")) {
      payload = { title: "Align.", body: "What are you moving today?", url: "/home" };
    } else if (isInNotifWindow(nowUtc, profile.notif_night_time || "21:30", profile.timezone || "UTC")) {
      payload = { title: "Align.", body: "Did you show up today?", url: "/home?sheet=night-checkin" };
    }

    if (!payload) continue;

    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      sent += 1;
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

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { "Content-Type": "application/json" },
  });
});
