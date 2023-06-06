self.addEventListener('install', (e) => {
    console.log("Starting SW")
    // e.waitUntil(
    //   caches.open('toma-uma').then((cache) => cache.addAll([
    //     '/icon-192x192.png',
    //     'favicon.ico',
    //   ])),
    // );
  });

self.addEventListener('fetch', (e) => {
    // e.respondWith(
    //   caches.match(e.request).then((response) => response || fetch(e.request)),
    // );
  });