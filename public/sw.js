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
  // 只處理 GET 請求和 http/https 協定
  if (event.request.method === 'GET' && (event.request.url.startsWith('http://') || event.request.url.startsWith('https://'))) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(event.request)
            .then((response) => {
              // 檢查回應是否有效
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // 複製回應，因為回應流只能讀取一次
              const responseToCache = response.clone();

              caches.open('my-cache') // 將 'my-cache' 替換為你的快取名稱
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            });
        })
        .catch((error) => {
          console.error('Fetching failed:', error);
          // 你可以在這裡提供一個離線備用頁面
        })
    );
  } else {
    // 對於非 GET 或不支援協定的請求，直接執行網路請求
    event.respondWith(fetch(event.request));
  }
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
