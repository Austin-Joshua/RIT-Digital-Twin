const CACHE_NAME = 'rit-digital-twin-v2';
const STATIC_ASSETS = [
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

  // Skip WebSocket connections, API requests, and non-http schemes
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

        const contentType = response.headers.get('content-type') || '';

        // Never cache HTML responses when fetching dynamic script/style assets
        if (url.pathname.startsWith('/assets/') && contentType.includes('text/html')) {
          return response;
        }

        // Never cache navigation or HTML document responses so users always get the latest release index.html
        if (request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
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
          return new Response('Network error and asset not cached', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});
