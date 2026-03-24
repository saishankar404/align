self.addEventListener("push", (event: Event) => {
  const pushEvent = event as Event & {
    data?: { json: () => { title?: string; body?: string; url?: string } };
    waitUntil: (promise: Promise<unknown>) => void;
  };
  const data = pushEvent.data?.json() ?? {};
  pushEvent.waitUntil(
    self.registration.showNotification(data.title ?? "Align.", {
      body: data.body,
      icon: "/icons/icon-192.png",
      data: { url: data.url ?? "/home" },
      vibrate: [100, 50, 100],
    })
  );
});

self.addEventListener("notificationclick", (event: Event) => {
  const clickEvent = event as Event & {
    notification: { close: () => void; data?: { url?: string } };
    waitUntil: (promise: Promise<unknown>) => void;
  };
  clickEvent.notification.close();
  clickEvent.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/home") && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(clickEvent.notification.data?.url ?? "/home");
    })
  );
});
