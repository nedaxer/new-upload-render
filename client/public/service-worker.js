// Service worker for Nedaxer PWA

const CACHE_NAME = 'nedaxer-cache-v1';

// Add cache bust parameter to URLs to prevent caching issues
function addCacheBuster(url) {
  const cacheBuster = `cache-bust=${Date.now()}`;
  const hasParams = url.includes('?');
  return `${url}${hasParams ? '&' : '?'}${cacheBuster}`;
}

// Assets to cache immediately on service worker install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/manifest.json'
];

// Install event - precache key assets
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Pre-caching assets');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );

  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('[ServiceWorker] Removing old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );

  // Take control of all clients immediately
  return self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests and non-GET requests
  if (!event.request.url.startsWith(self.location.origin) || 
      event.request.method !== 'GET') {
    return;
  }
  
  // For API requests, always go to network first
  if (event.request.url.includes('/api/')) {
    // Always add cache buster to API requests
    const bustUrl = addCacheBuster(event.request.url);
    const bustRequest = new Request(bustUrl, {
      method: event.request.method,
      headers: event.request.headers,
      mode: event.request.mode,
      credentials: event.request.credentials,
      redirect: event.request.redirect
    });
    
    event.respondWith(
      fetch(bustRequest).catch(error => {
        console.log('[ServiceWorker] API fetch failed, serving offline page');
        return caches.match('/');
      })
    );
    return;
  }

  // For page navigations, use a network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(error => {
        console.log('[ServiceWorker] Navigation fetch failed, serving from cache');
        return caches.match(event.request) || caches.match('/');
      })
    );
    return;
  }
  
  // For all other requests, use a cache-first strategy
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        console.log('[ServiceWorker] Serving from cache:', event.request.url);
        return response;
      }
      
      console.log('[ServiceWorker] Fetching from network:', event.request.url);
      return fetch(event.request).then(networkResponse => {
        // Don't cache responses that aren't successful
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        // Cache the new response
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        
        return networkResponse;
      });
    })
  );
});

// Handle messages sent to the service worker
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[ServiceWorker] Clearing cache by request');
    caches.delete(CACHE_NAME).then(() => {
      console.log('[ServiceWorker] Cache cleared successfully');
    });
  }
});