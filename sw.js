const CACHE_NAME = 'keuangansyariah-v2';
const DYNAMIC_CACHE = 'keuangansyariah-dynamic-v2';

// Daftar aset untuk app shell (Cache-First)
const ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/transaksi.html',
  '/zakat.html',
  '/goals.html',
  '/investasi.html',
  '/edukasi.html',
  '/css/custom.css',
  '/js/storage.js',
  '/js/api.js',
  '/js/app.js',
  '/js/charts.js',
  '/js/transaksi.js',
  '/js/zakat.js',
  '/js/goals.js',
  '/js/investasi.js',
  '/js/data/saham-syariah.js',
  '/manifest.json',
  '/icons/icon.svg'
];

// Install Event: Precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Precaching app shell');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Force activate new SW immediately
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
            .map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event: Strategies based on request type
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 0. API Internal Vercel (/api/*): Network-Only (JANGAN CACHE!)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Biarkan frontend API fallback yang menangani jika offline
        return new Response(JSON.stringify({ error: 'Offline' }), { status: 503 });
      })
    );
    return;
  }

  // 1. API Calls Eksternal: Network-First
  if (url.hostname.includes('corsproxy.io') || url.hostname.includes('yahoo.com')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone response and cache it
          const resClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, resClone));
          return response;
        })
        .catch(() => caches.match(event.request)) // Fallback to cache if offline
    );
    return;
  }

  // 2. CDN Assets (Tailwind, Chart.js): Stale-While-Revalidate
  if (url.hostname.includes('cdn.tailwindcss.com') || url.hostname.includes('cdn.jsdelivr.net')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const networkFetch = fetch(event.request).then((response) => {
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, response.clone()));
          return response;
        }).catch(() => {});
        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  // 3. Local App Assets: Cache-First
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((response) => {
        // Cache new local assets dynamically if they aren't precached
        if (url.origin === location.origin) {
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, response.clone()));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback for navigation requests
      if (event.request.mode === 'navigate') {
        return caches.match('/dashboard.html');
      }
    })
  );
});
