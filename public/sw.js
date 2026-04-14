const CACHE_NAME = 'ofz-workspace-v4'; // Bumped for RSC strategy
const ASSETS_TO_CACHE = [
  '/manifest.webmanifest',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only process standard GET requests to avoid breaking actions
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Bypass Service Worker strictly for Next.js Router, RSC, and API
  if (
    url.pathname.startsWith('/api') ||
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.pathname.includes('_next') ||
    url.search.includes('_rsc') || 
    url.pathname.includes('favicon.ico')
  ) {
    return;
  }


  // 2. Navigation requests: Network First, falling back to cache
  if (event.request.mode === 'navigate' || url.pathname === '/') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clonedResponse));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 3. Static Assets: Cache First
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
