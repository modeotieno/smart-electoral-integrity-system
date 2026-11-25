const CACHE_NAME = 'seis-mobile-pwa-v3';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.png',
  './flutter_bootstrap.js',
  './flutter.js',
  './main.dart.js',
  './version.json',
  './icons/Icon-192.png',
  './icons/Icon-512.png',
  './icons/Icon-maskable-192.png',
  './icons/Icon-maskable-512.png'
];

const STATIC_ASSET = /\.(png|jpe?g|gif|ico|svg|woff2?|ttf|otf)$/i;

function assetUrl(path) {
  return new URL(path, self.registration.scope).href;
}

function storeResponse(request, response) {
  if (!response || response.status !== 200 || response.type !== 'basic') {
    return response;
  }
  const copy = response.clone();
  caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  return response;
}

function fetchAndStore(request) {
  return fetch(request).then((response) => storeResponse(request, response));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.all(
          CORE_ASSETS.map((path) => cache.add(assetUrl(path)).catch(() => null))
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return;
  if (url.pathname.endsWith('flutter_service_worker.js')) return;

  const isNavigation = request.mode === 'navigate' || url.pathname.endsWith('/index.html');

  if (isNavigation) {
    event.respondWith(
      fetchAndStore(request).catch(
        () =>
          caches.match(request) ||
          caches.match(assetUrl('./index.html'))
      )
    );
    return;
  }

  if (STATIC_ASSET.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetchAndStore(request))
    );
    return;
  }

  event.respondWith(
    fetchAndStore(request).catch(() => caches.match(request))
  );
});
