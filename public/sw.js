/**
 * MindTrace Offline-First Service Worker
 * Version: mindtrace-v1.2
 * Ensures reliable caching, motion lesson playback, and zero-bandwidth execution for secondary school learners.
 */

const CACHE_NAME = 'mindtrace-v1.3';

// Core assets to pre-cache immediately
const PRE_CACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-512.jpg',
];

// Patterns for assets that should be cached on-the-fly and served cache-first
const ASSET_PATTERNS = [
  /\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|otf|json)$/,
  /\/assets\//
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching core shell');
      return cache.addAll(PRE_CACHE_ASSETS);
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
            console.log('[SW] Removing old cache:', key);
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

  // Skip non-GET and external requests (except CDNs if any)
  if (request.method !== 'GET') return;
  
  // API requests: Network-First (with no cache for now to ensure data freshness)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return a custom offline JSON response for APIs if needed
        return new Response(JSON.stringify({ 
          error: 'Offline', 
          message: 'You are currently offline. This action will be queued.' 
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Static Assets: Cache-First, then Network (and update cache)
  const isAsset = ASSET_PATTERNS.some(pattern => pattern.test(url.pathname));
  
  if (isAsset || url.pathname === '/') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached but update in background
          fetch(request).then(response => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
            }
          }).catch(() => {}); // Ignore network errors in background update
          
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => {
          // Final fallback for missing assets
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
    );
    return;
  }

  // Default: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
