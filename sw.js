const CACHE  = 'kanban-v1';
const ASSETS = ['/kanban/', '/kanban/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Navigation: network first, fall back to cached app shell
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('/kanban/index.html')));
    return;
  }
  // Everything else: cache first
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
