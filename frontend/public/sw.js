const CACHE_NAME = 'rit-digital-twin-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/images/digital-twin-tree.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip WebSocket connections, API requests, and Chrome extensions
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/ws') ||
    !url.protocol.startsWith('http')
  ) {
    return;
  }

  // Network-first for dynamic navigation, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Network error and asset not cached', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});
