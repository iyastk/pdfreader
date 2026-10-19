// Basic service worker for SSLC Reader PWA
// Caches core assets for offline use

const CACHE_NAME = 'sslc-reader-v1';
const OFFLINE_URL = '/';

// Install: cache the start URL
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add(OFFLINE_URL);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first strategy, fall back to cache
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and same-origin or CDN assets
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('firebasestorage') || event.request.url.includes('googleapis')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful HTML navigations for offline fallback
        if (response.ok && event.request.mode === 'navigate') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline: serve cached page or the root
        return caches.match(event.request).then((cached) => {
          return cached || caches.match(OFFLINE_URL);
        });
      })
  );
});
