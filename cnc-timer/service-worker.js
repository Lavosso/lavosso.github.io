const CACHE_NAME = 'cnc-timer-v4';

const OFFLINE_FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((oldKey) => caches.delete(oldKey))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return networkResponse;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data
    ? event.data.json()
    : {
        title: 'CNC Timer',
        body: 'Powiadomienie z CNC Timera.'
      };

  const options = {
    body: data.body || '',
    icon: '/cnc-timer/icons/icon-192.png',
    badge: '/cnc-timer/icons/icon-192.png',
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    tag: data.tag || undefined,
    renotify: false
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'CNC Timer',
      options
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then((clientList) => {
        const appClient = clientList.find((client) =>
          client.url.includes('/cnc-timer/')
        );

        if (appClient && 'focus' in appClient) {
          return appClient.focus();
        }

        if (clients.openWindow) {
          return clients.openWindow('/cnc-timer/');
        }

        return null;
      })
  );
});
