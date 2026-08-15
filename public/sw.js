const CACHE_NAME = 'haitham-lab-cache-v1';

// Assets to cache immediately on service worker installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching core application shell');
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn('[Service Worker] Failed to precache some assets, will cache dynamically:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip caching for non-GET requests (e.g., POST reports or mutations) and API calls
  if (request.method !== 'GET' || url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // If an API request fails due to offline, return a friendly JSON error
        if (url.pathname.includes('/api/')) {
          return new Response(
            JSON.stringify({ error: 'أنت غير متصل بالإنترنت حالياً. يرجى التحقق من اتصالك.' }),
            { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
          );
        }
      })
    );
    return;
  }

  // 2. Navigation requests (e.g., index.html routing for single-page app)
  // Network First with Cache Fallback for SPA routing
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Keep a copy in the cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Offline fallback: try to serve the cached page or '/'
          return caches.match('/')
            .then((cachedResponse) => {
              if (cachedResponse) return cachedResponse;
              return caches.match('/index.html');
            });
        })
    );
    return;
  }

  // 3. Static assets (JS, CSS, images, fonts)
  // Cache First, fallback to Network (with dynamic caching)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset, but fetch a fresh version in the background (Stale-While-Revalidate)
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, networkResponse);
              });
            }
          })
          .catch(() => { /* Ignore background fetch failures while offline */ });
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache for next time
      return fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // If offline and request is an image, we can return a fallback icon
          if (request.headers.get('accept')?.includes('image')) {
            return caches.match('/icon.svg');
          }
        });
    })
  );
});
