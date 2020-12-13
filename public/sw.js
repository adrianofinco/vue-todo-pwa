const cacheName = 'vue-todo-pwa-v1';

const cacheAssets = [
  './',
  './index.html',
  './app.css',
  './favicon.ico',
  './manifest.json',
  './sw.js',
  './app.js',
  './img/icons/icon-16x16.png',
  './img/icons/icon-32x32.png',
  './img/icons/icon-60x60.png',
  './img/icons/icon-76x76.png',
  './img/icons/icon-120x120.png',
  './img/icons/icon-144x144.png',
  './img/icons/icon-152x152.png',
  './img/icons/icon-180x180.png',
  './img/icons/icon-192x192.png',
  './img/icons/icon-270x270.png',
  './img/icons/icon-512x512.png',
  'https://unpkg.com/vue@2.6.12/dist/vue.min.js',
  'https://unpkg.com/vuex@3.6.0/dist/vuex.min.js',
];

// call install event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => cache.addAll(cacheAssets))
      .then(() => self.skipWaiting()),
  );
});

// call activate event
self.addEventListener('activate', (e) => {
  // remove old caches
  e.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cache) => {
        if (cache !== cacheName) return caches.delete(cache);
        return Promise.resolve(true);
      }),
    )),
    self.clients.claim(),
  );
});

// call fetch event
self.addEventListener('fetch', (e) => {
  if (e.request.url.startsWith('http')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          // Make copy/clone of response
          const resClone = res.clone();
          // open cacheName
          caches
            .open(cacheName)
            .then((cache) => {
              // add response to cache
              cache.put(e.request, resClone);
            });
          return res;
        })
        .catch(() => caches.match(e.request).then((res) => res)),
    );
  } else {
    e.respondWith(fetch(e.request).then((res) => res));
  }
});
