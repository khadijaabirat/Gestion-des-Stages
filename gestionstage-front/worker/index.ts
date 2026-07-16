/// <reference lib="webworker" />

export {};

declare const self: ServiceWorkerGlobalScope;

// To disable all workbox logging during development
(self as any).__WB_DISABLE_DEV_LOGS = true;

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Nouvelle notification NexusIntern';
  const options = {
    body: data.body || 'Vous avez reçu un nouveau message.',
    icon: '/logo.png',
    badge: '/logo.png',
    data: data.url || '/',
    vibrate: [100, 50, 100],
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data;
  
  if (url) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
    );
  }
});
