// Enhanced Service Worker for SSLC Reader
// Fast stale-while-revalidate for pages + cache-first for static immutable assets

const CACHE_NAME = 'sslc-reader-v2';
const STATIC_CACHE_NAME = 'sslc-reader-static-v2';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

// Install: precache essential shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache failed', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean up older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== STATIC_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: Strategy router
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // Skip Firebase backend and external APIs from SW cache
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit') ||
    url.hostname.includes('firebaseapp.com')
  ) {
    return;
  }

  // Next.js hashed static assets (_next/static): Cache-First
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  // HTML page navigations: Stale-While-Revalidate with network fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);

        const networkFetch = fetch(req)
          .then((networkRes) => {
            if (networkRes.ok) {
              cache.put(req, networkRes.clone());
            }
            return networkRes;
          })
          .catch(() => {
            // If offline and page not cached, fallback to root page
            return cached || cache.match('/');
          });

        // If we have cached version, return immediately while revalidating
        return cached || networkFetch;
      })
    );
    return;
  }

  // All other same-origin requests
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        return (
          cached ||
          fetch(req).then((res) => {
            if (res.ok && res.status === 200) {
              const resClone = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
            }
            return res;
          })
        );
      })
    );
  }
});