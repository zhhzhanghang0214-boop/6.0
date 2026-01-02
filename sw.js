
const CACHE_NAME = 'smartflora-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './index.tsx',
  './App.tsx',
  './types.ts',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 逐个添加以防某个文件缺失导致整个缓存失败
      return Promise.allSettled(ASSETS.map(url => cache.add(url)));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
