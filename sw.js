// Service Worker - Auto-Bust Cache & Network Only
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.map((k) => caches.delete(k)));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    // Direct network request, no stale caching
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
