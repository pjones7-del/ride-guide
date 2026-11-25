/* Ride guide service worker: fresh page when online, cached copy when not. */
const C = 'rg-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (/\/(img|fonts|vendor)\//.test(u.pathname)) {
    e.respondWith(caches.open(C).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(res => { if (res.ok) c.put(e.request, res.clone()); return res; }))));
  } else {
    e.respondWith(fetch(e.request).then(res => { if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return res; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || caches.match('./'))));
  }
});
