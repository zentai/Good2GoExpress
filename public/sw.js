// Basic service worker

const CACHE_NAME = 'good2go-express-cache-v1';
const urlsToCache = [
  '/',
  // Add other important assets here, e.g., CSS, JS bundles if known, key images
  // Next.js handles its own static asset versioning, so be careful with caching JS/CSS bundles directly
  // This SW is very basic, for more robust offline, consider workbox or more specific caching strategies
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // 如果網路請求成功，將回應存入快取並返回回應
        return caches.open(CACHE_NAME)
          .then((cache) => {
            // 重要：檢查回應是否有效，例如狀態碼為 200
            // 並且回應類型不是 opaque（不透明），因為不透明回應無法被快取
            if (networkResponse.ok && networkResponse.type === 'basic') {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
      })
      .catch(() => {
        // 如果網路請求失敗，則從快取中獲取資源
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
