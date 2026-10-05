// Avora Library Production-Grade Service Worker
// Offline Reading, Network-First for dynamic data & Strict API exclusions
const CACHE_NAME = 'avora-library-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/browse'
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
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only process http/https requests
  if (!url.protocol.startsWith('http')) return;

  // 2. Strict Bypass: Non-GET requests (POST, PUT, DELETE, PATCH) must never be intercepted
  if (request.method !== 'GET') return;

  // 3. Strict Bypass: Dynamic API routes & Auth endpoints MUST ALWAYS go straight to network
  if (url.pathname.startsWith('/api/')) return;

  // 4. Strict Bypass: Next.js dev server HMR & internal telemetry
  if (url.pathname.includes('/_next/webpack-hmr') || url.pathname.includes('__nextjs_')) return;

  const acceptHeader = request.headers.get('accept') || '';
  const isHtmlNavigation = request.mode === 'navigate' || acceptHeader.includes('text/html');

  if (isHtmlNavigation) {
    // Strategy: Network-First for HTML pages (Ensures fresh stories, feeds, and profiles)
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // Offline fallback
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallbackHome = await caches.match('/');
          if (fallbackHome) return fallbackHome;
          return new Response('<h1>Avora Library - Offline</h1><p>Please check your internet connection.</p>', {
            headers: { 'Content-Type': 'text/html' }
          });
        })
    );
    return;
  }

  // Strategy: Stale-While-Revalidate for static assets (images, styles, scripts)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
