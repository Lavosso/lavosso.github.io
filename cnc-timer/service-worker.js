const CACHE_NAME = 'cnc-timer-v3';
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

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const appClient = clientList.find((client) => client.url.includes('/cnc-timer/'));
      if (appClient && 'focus' in appClient) {
        return appClient.focus();
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
      return null;
    })
  );
});

self.addEventListener('push', function(event) {
    // Extract the data sent by the backend, or use fallbacks
    const data = event.data ? event.data.json() : { title: "Timer Finished!", body: "Your CNC machine is ready." };
    
    const options = {
        body: data.body,
        icon: '/icon.png', // Change this to match your PWA's actual icon filename
        requireInteraction: true, // Keeps the notification on screen until the user taps it
        vibrate: [200, 100, 200, 100, 200, 100, 200]
    };

    // This is what actually triggers the system notification
    event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Close the notification on tap
    
    // Focus the app if it's already open, or open a new window if it's closed
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            for (let client of windowClients) {
                if (client.url.includes('/cnc-timer') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/cnc-timer'); // Adjust path based on your GH Pages URL
            }
        })
    );
});
