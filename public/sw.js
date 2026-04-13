const CACHE_NAME = 'ofz-workspace-v1';
const ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  // Skip authentication API calls to avoid CORS/Domain issues in PWA
  if (event.request.url.includes('/api/auth')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
