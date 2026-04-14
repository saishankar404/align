self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Align.", {
      body: data.body,
      icon: "/icons/icon-192.png",
      data: { url: data.url ?? "/home" },
      vibrate: [100, 50, 100],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/home") && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data?.url ?? "/home");
    })
  );
});