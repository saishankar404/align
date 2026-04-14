# Chapter 17: Progressive Web App Concepts

Progressive Web Apps bridge the gap between websites and native apps. They load like web pages but can work offline, receive push notifications, and be installed on home screens.

This chapter teaches you PWA fundamentals, how Align implements them, and the key tradeoffs between web and native approaches.

---

## 17.1 What is a PWA?

### THE VOCABULARY

**Progressive Web App (PWA)**: A web application that uses modern web capabilities to deliver app-like experiences. "Progressive" means it works for everyone, enhanced for capable browsers.

**Service Worker**: A JavaScript file that runs in the background, separate from your web page. Intercepts network requests, manages caching, and handles push notifications.

**Web App Manifest**: A JSON file describing your app - name, icons, display mode, colors. Tells the browser how to install your app.

**Installable**: A PWA that meets criteria to be added to the user's home screen, appearing alongside native apps.

**Offline-capable**: Able to function without network connectivity using cached assets and data.

### PWA vs Native vs Web

| Feature | Website | PWA | Native App |
|---------|---------|-----|------------|
| Installation | None | Optional home screen | App store required |
| Updates | Instant | Instant | Store review cycle |
| Offline | No | Yes (with SW) | Yes |
| Push notifications | No | Yes | Yes |
| Hardware access | Limited | Growing | Full |
| Distribution | URL | URL | App stores |
| Development cost | Low | Low | High (per platform) |

### WHY PWA for Align?

1. **Single codebase** - One app works on iOS, Android, and desktop
2. **Instant updates** - No app store review delays
3. **Offline-first fits** - Core functionality works without network
4. **Low friction** - Users can try before installing
5. **URL sharing** - Easy to share specific screens

### WHY NOT Y: Why Not Native?

Native apps have advantages:
- Better hardware access (NFC, Bluetooth, sensors)
- App store discovery
- More storage
- Background processing

But for Align:
- No special hardware needed
- Discovery isn't the growth vector
- IndexedDB provides sufficient storage
- Background processing limited to notifications

The tradeoff favors PWA for Align's use case.

---

## 17.2 The Web App Manifest

The manifest tells browsers how to display your app when installed.

### Align's Manifest

```json
// public/manifest.json
{
  "name": "Align. commitment app",
  "short_name": "Align",
  "description": "14-day commitment app for fewer decisions, clearer daily moves, and honest follow-through.",
  "start_url": "/app",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#1A1A1A",
  "background_color": "#F2EDE4",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Manifest Fields Explained

| Field | Purpose | Align's Value |
|-------|---------|---------------|
| `name` | Full app name (install dialogs) | "Align. commitment app" |
| `short_name` | Home screen label | "Align" |
| `start_url` | Page opened when launching | "/app" |
| `scope` | URL scope the PWA controls | "/" (entire site) |
| `display` | How the app appears | "standalone" (no browser UI) |
| `orientation` | Screen orientation lock | "portrait-primary" |
| `theme_color` | Browser/status bar color | "#1A1A1A" (ink) |
| `background_color` | Splash screen background | "#F2EDE4" (parchment) |
| `icons` | App icons at various sizes | 192px and 512px |

### Display Modes

```
┌─────────────────────────────────────────────────────────┐
│ browser          │ Standard browser with all UI        │
├─────────────────────────────────────────────────────────┤
│ minimal-ui       │ Minimal browser UI (back, reload)   │
├─────────────────────────────────────────────────────────┤
│ standalone       │ No browser UI - looks like native   │
├─────────────────────────────────────────────────────────┤
│ fullscreen       │ No browser UI, no status bar        │
└─────────────────────────────────────────────────────────┘
```

Align uses `standalone` for native feel while keeping the status bar visible.

### Maskable Icons

```json
"purpose": "any maskable"
```

Maskable icons have a "safe zone" that allows the OS to crop them into various shapes (circles, rounded squares, squircles):

```
┌───────────────────────────────────────────┐
│                                           │
│         ╭───────────────────╮            │
│         │                   │            │
│         │    Safe Zone      │            │
│         │    (icon content) │            │
│         │                   │            │
│         ╰───────────────────╯            │
│                                           │
│     (padding area - may be cropped)      │
│                                           │
└───────────────────────────────────────────┘
```

Design maskable icons with 10% padding around essential content.

---

## 17.3 Service Workers

Service workers are the core of PWA functionality - background scripts that intercept network requests.

### Registration

```javascript
// In your app (usually in _app.tsx or a layout)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('SW registered:', registration.scope)
    })
    .catch(error => {
      console.log('SW registration failed:', error)
    })
}
```

### Service Worker Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                        Installing                                │
│  • SW file downloaded                                           │
│  • install event fires                                          │
│  • Cache static assets                                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Waiting                                   │
│  • New SW installed but old SW still controls page              │
│  • Waits for all tabs using old SW to close                     │
│  • OR explicit skipWaiting() call                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Active                                    │
│  • SW controls the page                                         │
│  • Intercepts fetch requests                                    │
│  • Handles push notifications                                   │
└─────────────────────────────────────────────────────────────────┘
```

### next-pwa Integration

Align uses `@ducanh2912/next-pwa` to generate the service worker:

```javascript
// next.config.js:1-48
const nextPwa = require("@ducanh2912/next-pwa");

const withPWA = nextPwa.default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",  // Disable in dev
  register: true,
  reloadOnOnline: false,
  cacheStartUrl: false,
  customWorkerSrc: "public/sw-custom.js",  // Custom handler additions
  publicExcludes: [
    "!fonts/**/*",  // Don't precache fonts
    "!fonts/satoshi_fonts/**/*",
  ],
  extendDefaultRuntimeCaching: true,
  runtimeCaching: [
    {
      urlPattern: /\/_next\/static\/.+\.js$/i,
      handler: "NetworkFirst",  // Try network, fallback to cache
      options: {
        cacheName: "next-static-js-assets",
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 48,
          maxAgeSeconds: 60 * 60,  // 1 hour
        },
      },
    },
    {
      urlPattern: ({ url, sameOrigin }) => sameOrigin && !url.pathname.startsWith("/api/"),
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 24,
          maxAgeSeconds: 60 * 30,  // 30 minutes
        },
      },
    },
  ],
  workboxOptions: {
    skipWaiting: false,  // Don't auto-activate new SW
    clientsClaim: true,  // Take control of uncontrolled clients
    cleanupOutdatedCaches: true,
  },
});
```

### Caching Strategies

| Strategy | Behavior | Use For |
|----------|----------|---------|
| CacheFirst | Cache, fallback to network | Immutable assets (versioned JS) |
| NetworkFirst | Network, fallback to cache | Dynamic content, HTML |
| StaleWhileRevalidate | Cache immediately, update in background | Frequently changing assets |
| NetworkOnly | Always network | API calls that must be fresh |
| CacheOnly | Always cache | Offline-only assets |

Align uses **NetworkFirst** for most content - try to get fresh data, but serve cached if offline.

---

## 17.4 Detecting and Handling Updates

When a new version of your app deploys, users need to know and update.

### PWAUpdateController Component

```typescript
// components/pwa/PWAUpdateController.tsx:44-103 (key parts)
useEffect(() => {
  if (!shouldSupportSW()) return;

  // Listen for new service worker waiting
  const attachRegistrationListeners = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return;
    
    // Check if update already waiting
    if (registration.waiting) {
      setHasUpdate(true);
    }
    
    // Listen for future updates
    registration.addEventListener("updatefound", () => {
      const installing = registration.installing;
      if (!installing) return;
      
      installing.addEventListener("statechange", () => {
        // New SW installed and waiting
        if (installing.state === "installed" && navigator.serviceWorker.controller) {
          setHasUpdate(true);
        }
      });
    });
  };

  // Reload when controller changes (new SW activated)
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });

  void attachRegistrationListeners();
}, []);
```

### The Update Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ User visits app                                                  │
│ Browser checks for SW updates in background                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ New SW downloaded                                                │
│ Enters "waiting" state                                          │
│ PWAUpdateController detects this                                │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ UI shows "Update available" prompt                               │
│ User chooses "Hard reload now" or "Later"                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │ (if "Hard reload now")
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ App sends SKIP_WAITING message to waiting SW                    │
│ SW activates                                                    │
│ controllerchange event fires                                    │
│ Page reloads with new version                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Triggering the Update

```typescript
// components/pwa/PWAUpdateController.tsx:105-130
const applyUpdate = async () => {
  setIsApplying(true);

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration?.waiting) {
    setHasUpdate(false);
    return;
  }

  // Tell waiting SW to activate immediately
  registration.waiting.postMessage({ type: "SKIP_WAITING" });
  
  // Give it time to activate, then reload
  window.setTimeout(() => {
    window.location.reload();
  }, 2200);
};
```

### WHY Not Auto-Update?

```javascript
// next.config.js:44
skipWaiting: false,
```

Auto-updating (`skipWaiting: true`) can break the app mid-session:
- User is filling a form
- New SW activates
- Page reloads
- Form data lost

Manual update gives users control. They update when convenient.

---

## 17.5 Install Prompts

PWAs can prompt users to install them to the home screen.

### The beforeinstallprompt Event

```typescript
// components/pwa/PWAInstallPrompt.tsx:61-78
useEffect(() => {
  const onBeforeInstallPrompt = (event: Event) => {
    event.preventDefault();  // Prevent browser's default mini-infobar
    setPromptEvent(event as BeforeInstallPromptEvent);  // Save for later
  };
  
  const onInstalled = () => {
    setInstalled(true);
    setVisible(false);
  };

  window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  window.addEventListener("appinstalled", onInstalled);
  
  return () => {
    window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.removeEventListener("appinstalled", onInstalled);
  };
}, []);
```

### Triggering Installation

```typescript
// components/pwa/PWAInstallPrompt.tsx:87-103
const install = async () => {
  setIsInstalling(true);
  
  if (!promptEvent) {
    // Browser doesn't support prompt (Safari, Firefox)
    setShowHint(true);  // Show manual instructions
    return;
  }
  
  await promptEvent.prompt();  // Show native install dialog
  const result = await promptEvent.userChoice;
  
  if (result.outcome === "accepted") {
    setVisible(false);
  } else {
    setShowHint(true);  // User declined, show manual instructions
  }
};
```

### Browser Support Differences

| Browser | Install Support |
|---------|-----------------|
| Chrome (Android/Desktop) | Full - `beforeinstallprompt` works |
| Edge | Full - same as Chrome |
| Safari (iOS) | No API - must use Share > Add to Home Screen |
| Firefox | Limited - browser menu only |

### Fallback Instructions

```typescript
// components/pwa/PWAInstallPrompt.tsx:26-35
function getInstallHint(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("safari") && !ua.includes("chrome") && !ua.includes("android")) {
    return "Use Share > Add to Home Screen.";
  }
  if (ua.includes("firefox")) {
    return "Use browser menu > Install app.";
  }
  return "Use browser menu > Install app.";
}
```

### Detecting Standalone Mode

Check if already installed:

```typescript
// components/pwa/PWAInstallPrompt.tsx:20-24
function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true  // Safari-specific property
  );
}
```

---

## 17.6 Push Notifications

Push notifications let you reach users even when the app isn't open.

### The Push Architecture

```
┌─────────────┐      ┌───────────────┐      ┌─────────────┐
│   Server    │──────│  Push Service │──────│   Device    │
│  (Supabase) │      │  (FCM/APNs)   │      │  (Browser)  │
└─────────────┘      └───────────────┘      └─────────────┘
       │                     │                     │
       │ 1. Send push        │                     │
       │    with payload     │                     │
       │ ─────────────────> │                     │
       │                     │ 2. Route to device  │
       │                     │ ─────────────────> │
       │                     │                     │
       │                     │        3. Wake SW   │
       │                     │        Show notif   │
```

### VAPID Keys

VAPID (Voluntary Application Server Identification) proves your server is authorized to send notifications:

```bash
# Generate keys
npx web-push generate-vapid-keys

# Output:
# Public Key: BNx...
# Private Key: dKH...
```

- **Public key** - Sent to browser during subscription (safe to expose)
- **Private key** - Used to sign push messages (keep secret!)

### Registering for Push

```typescript
// lib/notifications/push.ts:6-42
export function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  return new Uint8Array([...atob(b64)].map((c) => c.charCodeAt(0)));
}

export async function registerPushSubscription(userId: string): Promise<boolean> {
  // Check support
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return false;
  }

  // Request permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return false;
  }

  try {
    // Get SW registration
    const registration = await navigator.serviceWorker.ready;
    
    // Get or create subscription
    const existing = await registration.pushManager.getSubscription();
    const subscription = existing ?? (
      await registration.pushManager.subscribe({
        userVisibleOnly: true,  // Required - promise to show notification
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""
        ),
      })
    );

    // Store subscription in database
    const json = JSON.stringify(subscription);
    localStorage.setItem("align_push_sub", json);
    await db.profiles.update(userId, { 
      pushSubscription: json, 
      notifEnabled: true 
    });
    requestSyncIfCloud(userId);
    return true;
  } catch {
    return false;
  }
}
```

### The Subscription Object

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "expirationTime": null,
  "keys": {
    "p256dh": "BNcR...",
    "auth": "tBHI..."
  }
}
```

- `endpoint` - URL to send push messages to
- `keys.p256dh` - Public key for message encryption
- `keys.auth` - Authentication secret

### Sending Push (Edge Function)

```typescript
// supabase/functions/send-notifications/index.ts:43-99
Deno.serve(async () => {
  // Initialize Supabase with service role (bypasses RLS)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Configure VAPID
  webpush.setVapidDetails(
    Deno.env.get("VAPID_SUBJECT") ?? "mailto:align@localhost.dev",
    Deno.env.get("VAPID_PUBLIC_KEY") ?? "",
    Deno.env.get("VAPID_PRIVATE_KEY") ?? ""
  );

  // Get all users with notifications enabled
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, timezone, notif_morning_time, notif_night_time, notif_enabled, push_subscription")
    .eq("notif_enabled", true)
    .not("push_subscription", "is", null);

  const nowUtc = new Date();
  let sent = 0;

  for (const profile of profiles) {
    const subscription = normalizeSubscription(profile.push_subscription);
    if (!subscription) continue;

    let payload: { title: string; body: string; url: string } | null = null;

    // Check if in morning notification window
    if (isInNotifWindow(nowUtc, profile.notif_morning_time, profile.timezone)) {
      payload = { 
        title: "Align.", 
        body: "What are you moving today?", 
        url: "/home" 
      };
    }
    // Check if in night notification window
    else if (isInNotifWindow(nowUtc, profile.notif_night_time, profile.timezone)) {
      payload = { 
        title: "Align.", 
        body: "Did you show up today?", 
        url: "/home?sheet=night-checkin" 
      };
    }

    if (!payload) continue;

    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      sent += 1;
    } catch (pushError) {
      // Handle expired/invalid subscriptions
      if (err.statusCode === 410) {
        await supabase
          .from("profiles")
          .update({ notif_enabled: false, push_subscription: null })
          .eq("id", profile.id);
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, sent }));
});
```

### Time Window Calculation

```typescript
// supabase/functions/send-notifications/index.ts:32-41
function isInNotifWindow(nowUtc: Date, targetTimeHHMM: string, timezone: string): boolean {
  // Convert UTC to user's local time
  const localTime = new Date(
    nowUtc.toLocaleString("en-US", { timeZone: timezone || "UTC" })
  );
  
  const [th, tm] = targetTimeHHMM.split(":").map(Number);
  const localH = localTime.getHours();
  const localM = localTime.getMinutes();
  
  const localTotalMins = localH * 60 + localM;
  const targetTotalMins = th * 60 + tm;
  
  // 5-minute window
  return localTotalMins >= targetTotalMins && localTotalMins < targetTotalMins + 5;
}
```

This runs every 5 minutes via cron, checking if any user's notification time falls in the current window.

### Handling Push in Service Worker

```javascript
// In sw-custom.js (conceptual)
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Align.', {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: { url: data.url ?? '/home' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url ?? '/home';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Otherwise open new window
      return clients.openWindow(url);
    })
  );
});
```

---

## 17.7 Offline Behavior

Align works offline because of the offline-first architecture (Chapter 13) plus service worker caching.

### Cache Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Action                               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    IndexedDB (Dexie)                             │
│  • User data (moves, cycles, etc.)                              │
│  • Always available                                             │
│  • Syncs to Supabase when online                                │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Service Worker Cache                           │
│  • HTML, JS, CSS assets                                         │
│  • Fonts, images                                                │
│  • NetworkFirst strategy with fallback                          │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Network                                   │
│  • Fresh assets when online                                     │
│  • API calls to Supabase                                        │
│  • Graceful degradation when offline                            │
└─────────────────────────────────────────────────────────────────┘
```

### Detecting Online Status

```typescript
// lib/hooks/useOnline.ts
export function useOnline(): boolean {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  
  return online;
}
```

### Offline UI Indicator

When offline, show users their changes are saved locally:

```tsx
function OfflineIndicator() {
  const online = useOnline();
  
  if (online) return null;
  
  return (
    <motion.div
      initial={{ y: -40 }}
      animate={{ y: 0 }}
      exit={{ y: -40 }}
      className="fixed top-safe-area left-1/2 -translate-x-1/2 z-50
                 bg-ink text-parchment px-4 py-2 rounded-full"
    >
      No connection - changes saved locally
    </motion.div>
  );
}
```

---

## 17.8 PWA Gotchas and Debugging

### MISTAKES: Common PWA Problems

**Problem 1: SW not updating**

```javascript
// User sees old version despite deploying new code
// Cause: SW still serving cached assets
// Fix: Implement update prompt (PWAUpdateController)
```

**Problem 2: Cache invalidation**

```javascript
// Old JS bundles served after deploy
// Cause: Cache-first strategy on versioned assets
// Fix: Use NetworkFirst or cache busting
```

**Problem 3: HTTPS requirement**

```
// SW won't register
// Cause: SW requires HTTPS (except localhost)
// Fix: Use HTTPS in production
```

**Problem 4: iOS limitations**

```
// Push notifications don't work
// Cause: iOS only supports PWA push in iOS 16.4+
// And only when added to home screen
// Fix: Detect iOS and show appropriate instructions
```

### Debugging Service Workers

Chrome DevTools > Application tab:

1. **Service Workers** - See registered SW, update status
2. **Cache Storage** - Inspect cached assets
3. **IndexedDB** - View local database
4. **Manifest** - Validate manifest parsing

### Useful Commands

```javascript
// Unregister all service workers (in console)
navigator.serviceWorker.getRegistrations().then(registrations => {
  for (const registration of registrations) {
    registration.unregister();
  }
});

// Clear all caches
caches.keys().then(names => {
  for (const name of names) {
    caches.delete(name);
  }
});
```

### Testing Offline

1. Chrome DevTools > Network tab > "Offline" checkbox
2. Or: Application tab > Service Workers > "Offline"

---

## 17.9 Mental Model: PWA Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Browser                                     │
│                                                                          │
│   ┌───────────────────────────────────────────────────────────────────┐ │
│   │                         Main Thread                                │ │
│   │                                                                    │ │
│   │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │ │
│   │   │   React     │    │   Dexie     │    │  Supabase   │          │ │
│   │   │   App       │───>│  (IndexedDB)│───>│   Client    │          │ │
│   │   └─────────────┘    └─────────────┘    └──────┬──────┘          │ │
│   │                                                 │                  │ │
│   └─────────────────────────────────────────────────┼──────────────────┘ │
│                                                     │                    │
│   ┌─────────────────────────────────────────────────┼──────────────────┐ │
│   │                    Service Worker               │                  │ │
│   │                                                 │                  │ │
│   │   ┌─────────────┐    ┌─────────────┐           │                  │ │
│   │   │   Cache     │    │    Push     │           │                  │ │
│   │   │   API       │    │   Handler   │           │                  │ │
│   │   └──────┬──────┘    └─────────────┘           │                  │ │
│   │          │                                      │                  │ │
│   └──────────┼──────────────────────────────────────┼──────────────────┘ │
│              │                                      │                    │
└──────────────┼──────────────────────────────────────┼────────────────────┘
               │                                      │
               ▼                                      ▼
        ┌─────────────┐                       ┌─────────────┐
        │   Network   │                       │  Supabase   │
        │  (Assets)   │                       │  (API/DB)   │
        └─────────────┘                       └─────────────┘
```

---

## 17.10 Practical Exercises

### Exercise 1: Inspect the Manifest

1. Open Chrome DevTools > Application > Manifest
2. What would happen if you changed `display` to `fullscreen`?
3. What happens if `start_url` doesn't exist?

### Exercise 2: Test the Update Flow

1. Make a visible change to the app
2. Build and deploy (or simulate with local build)
3. Observe the SW update lifecycle in DevTools
4. Trigger the update prompt

### Exercise 3: Debug Notification Flow

1. Enable notifications in Align
2. Find your push subscription in IndexedDB (profiles table)
3. Manually trigger the Edge Function
4. Verify notification received

### Exercise 4: Offline Testing

1. Load Align with network on
2. Go offline (DevTools > Network > Offline)
3. Create a move
4. Verify it's stored in IndexedDB
5. Go online
6. Verify sync happens

---

## 17.11 Go Figure It Out

1. **Workbox** - The library underlying next-pwa. What strategies does it provide beyond what we discussed?

2. **Background Sync** - How would you implement a retry queue for failed network requests using the Background Sync API?

3. **Web Share Target** - PWAs can receive shared content from other apps. How would you make Align accept shared URLs for the Later pile?

4. **Periodic Background Sync** - How could you use this API to update data in the background, even when the user hasn't opened the app?

5. **PWA Installation Criteria** - What are the exact requirements for a PWA to be "installable"? How do browsers differ?

---

## Summary

This chapter covered:

- **PWA benefits** - Single codebase, instant updates, offline support, easy distribution
- **Web App Manifest** - Describes your app for installation
- **Service Workers** - Background scripts for caching and push
- **Caching strategies** - NetworkFirst, CacheFirst, StaleWhileRevalidate
- **Update handling** - Detecting and prompting for new versions
- **Install prompts** - Native and fallback installation flows
- **Push notifications** - VAPID keys, subscriptions, Edge Function delivery
- **Offline behavior** - IndexedDB + SW cache layers

---

## Connections

- **Chapter 13** (Dexie) - Local data storage for offline-first
- **Chapter 14** (Supabase) - Cloud sync and Edge Functions
- **Chapter 12** (API Routes) - Server-side push notification logic
- **Chapter 9** (Effects) - useOnline hook pattern

---

## What's Next

You've completed the main chapters! The appendices provide:
- **Appendix A**: Glossary of all terms
- **Appendix B**: Pattern reference guide
- **Appendix C**: Complete file map
- **Appendix D**: Curated research topics for continued learning
