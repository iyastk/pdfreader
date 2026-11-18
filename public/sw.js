// Enhanced Service Worker for SSLC Reader (v3)
// Network-First for HTML navigation to prevent stale CSS hash mismatches
// Cache-First for versioned immutable static assets (_next/static)

const CACHE_NAME = 'sslc-reader-v3';
const STATIC_CACHE_NAME = 'sslc-reader-static-v3';

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

// Activate: purge all old caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== STATIC_CACHE_NAME) {
            console.log('[SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Listen for skip waiting messages from the UI
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
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
    url.hostname.includes('firebaseapp.com') ||
    url.hostname.includes('googleapis.com')
  ) {
    return;
  }

  // Next.js hashed static assets (_next/static): Cache-First
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const res = await fetch(req);
          if (res.ok) cache.put(req, res.clone());
          return res;
        } catch {
          return new Response('', { status: 404 });
        }
      })
    );
    return;
  }

  // HTML page navigations: Network-First with Cache Fallback
  // This guarantees phones always receive the matching CSS hash when online!
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(async (networkRes) => {
          if (networkRes.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(req, networkRes.clone());
          }
          return networkRes;
        })
        .catch(async () => {
          // Offline fallback
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(req);
          return cached || cache.match('/') || Response.error();
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
